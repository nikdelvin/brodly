/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import './page.css'
import { useState, useEffect, useRef, use } from 'react';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

export default function Home() {
    const [messages, setMessages] = useState<{message: string, from: string}[]>([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [recorder, setRecorder] = useState<{ recorder: any, stream: any } | undefined>(undefined)

    const [socket, setSocket] = useState<Socket | undefined>(undefined)
    const [stream, setStream] = useState<any | undefined>(undefined)
    const [shareScreen, setShareScreen] = useState<any | undefined>(undefined)
    const [broadcast, setBroadcast] = useState<{id: string, signal: any, new: boolean} | undefined>(undefined)
    const [newUser, setNewUser] = useState<string | undefined>(undefined)
    const [broadcastID, setBroadcastID] = useState('')

    const video = useRef<HTMLVideoElement>(null)
    const display = useRef<HTMLVideoElement>(null)
    const connections = useRef<Record<string, { peer: any, peerTo: any, signal: any }>>({})

    async function socketInitializer() {
        const socketIO = io({ path: '/api/ws' })
        socketIO.on('message', ({message, from}) => {
            setMessages((prevMessages) => [...prevMessages, {message, from}])
        })
        socketIO.on('videostream', ({signal, from}) => {
            if (connections.current[from]?.signal != null) {
                connections.current[from].signal = signal
                setBroadcast({id: from, signal, new: false})
            } else {
                if (connections.current[from] != null) {
                    connections.current[from].signal = signal
                } else {
                    connections.current[from] = { peer: null, peerTo: null, signal: signal }
                }
                setBroadcast({id: from, signal, new: true})
            }
        })
        socketIO.on('videostream-start', ({signal, from}) => {
            connections.current[from].peer.signal(signal)
        })
        socketIO.on('videostream-end', ({from}) => {
            video!.current!.srcObject = null
            display!.current!.srcObject = null
            setBroadcast(undefined)
            socketIO.disconnect();
            socketInitializer();
        })
        socketIO.on('new-user', ({id}) => {
            setNewUser(id)
        })
        socketIO.on('connect', () => {
            connections.current = {}
            connections.current[socketIO.id as string] = { peer: null, peerTo: null, signal: null }
            setSocket(socketIO)
        })
    }

    function startBroadcast() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(async function(streamData) {
            const peer = new Peer({ initiator: true, trickle: false, stream: streamData })
            peer.on('signal', (data: any) => {
                socket?.emit('videostream', { signal: data, from: socket?.id, to: socket?.id })
            })
            connections.current[socket?.id as string].peer = peer
            setStream(streamData)
        })
    }

    function startShareScreen() {
        if (shareScreen != null) {
            stopShareScreen()
        } else {
            navigator.mediaDevices.getDisplayMedia({ audio: true  }).then(async function(displayStream) {
                connections.current[socket?.id as string].peer.addStream(displayStream)
                setShareScreen(displayStream)
            })
        }
    }

    function stopShareScreen() {
        connections.current[socket?.id as string].peer.removeStream(shareScreen)
        shareScreen.getTracks().forEach(function(track: any) {
            track.stop();
        })
        display!.current!.srcObject = null
        setShareScreen(undefined)
    }

    function stopBroadcast() {
        Object.entries(connections.current).forEach((connection) => {
            socket?.emit('videostream-end', { from: broadcast!.id, to: connection[0] })
            connection[1].peer.destroy()
        })
        video!.current!.srcObject = null
        display!.current!.srcObject = null
        stream.getTracks().forEach(function(track: any) {
            track.stop();
        })
        if (shareScreen) stopShareScreen()
        setBroadcast(undefined)
        socket?.disconnect();
        socketInitializer();
    }

    function sendMessage() {
        if (currentMessage.length > 0) {
            socket?.emit('message', {message: currentMessage, from: socket?.id, to: broadcast!.id})
            setCurrentMessage('')
        }
    }

    function blobToBase64(blob: Blob) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split('base64,')[1]);
            reader.readAsDataURL(blob);
        })
    }

    async function startRecording() {
        if (recorder != null) {
            setTimeout(() => {
                recorder.recorder.stop()
                recorder.stream.getTracks().forEach(function(track: any) {
                    track.stop();
                })
                setRecorder(undefined)
            }, 2000)
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(async function(stream) {
                const mediaRecorder = new MediaRecorder(stream, {
                    audioBitsPerSecond: 16000,
                    mimeType: "audio/webm"
                })
                mediaRecorder.start()
                mediaRecorder.ondataavailable = (e) => {
                    blobToBase64(e.data).then((data) => {
                        socket?.emit('voice', {data, from: socket?.id, to: broadcast!.id})
                    })
                }
                setRecorder({ recorder: mediaRecorder, stream })
            })
        }
    }

    useEffect(() => {
        socketInitializer()
    }, [])

    useEffect(() => {
        if (broadcast != null) {
            if (broadcast.new) {
                const peer = new Peer({ initiator: false, trickle: false })
                peer.on('signal', (data: any) => {
                    socket?.emit('videostream-start', { signal: data, from: socket?.id, to: broadcast.id})
                })
                peer.on('stream', (currentStream: any) => {
                    const deviceID = currentStream.getVideoTracks()[0].getSettings().deviceId
                    if (video!.current!.getAttribute('data-device') != null && video!.current!.getAttribute('data-device') !== deviceID) {
                        display!.current!.setAttribute('data-device', deviceID)
                        display!.current!.srcObject = currentStream
                        display!.current!.play()
                    } else {
                        video!.current!.setAttribute('data-device', deviceID)
                        video!.current!.srcObject = currentStream
                        video!.current!.play()
                    }
                })
                peer.signal(connections.current[broadcast.id].signal)
                connections.current[broadcast.id].peerTo = peer
            } else {
                connections.current[broadcast.id].peerTo.signal(connections.current[broadcast.id].signal)
            }
        }
    }, [broadcast])

    useEffect(() => {
        if ((socket?.id === broadcast?.id) && (newUser != null)) {
            const peer = new Peer({ initiator: true, trickle: false, stream })
            peer.on('signal', (data: any) => {
                socket?.emit('videostream', { signal: data, from: socket?.id, to: newUser })
            })
            connections.current[newUser] = { peer, peerTo: null, signal: null }
        }
    }, [newUser])

    return (
        <main>
            {broadcast && (
                <>  
                    <div className='flex flex-row w-[80%] ms-auto'>
                        {(socket?.id === broadcast?.id) ? (
                            <button className='cg-button' onClick={stopBroadcast}>Stop video broadcast</button>
                        ) : (
                            <button className='cg-button' onClick={() => {
                                video!.current!.srcObject = null; setBroadcast(undefined); socket?.disconnect(); socketInitializer();
                            }}>Leave broadcast</button>
                        )}
                        <p className="cg-message">Broadcast ID:</p>
                        <input
                            className='cg-input'
                            type="text"
                            value={broadcast.id}
                            placeholder="Broadcast ID"
                            disabled={true}
                        />
                        {(socket?.id === broadcast?.id) && (
                            <button className={`cg-button ${shareScreen != null ? 'record' : ''}`} onClick={startShareScreen}>Screen share</button>
                        )}
                    </div>
                    <video playsInline ref={display} autoPlay className='ms-auto w-[80%] h-auto' />
                    <div className='absolute top-0 left-0 w-[20%] flex flex-col'>
                        <video playsInline ref={video} autoPlay className='w-full h-auto'/>
                        <div className="flex flex-col w-full overflow-y-scroll">
                            {messages.slice(-4).map((message, index) => (
                                <div key={index} className="flex flex-row w-full">
                                    <p className="cg-message break-words break-all">{`${message.from}: ${message.message}`}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            <div className='absolute bottom-0 left-0 w-full z-10'>
                <div className='flex flex-row w-full'>
                    {!broadcast && (
                        <>
                            <button id="start_broadcast" className='cg-button' onClick={startBroadcast}>Start video broadcast</button>
                            <input
                                className='cg-input'
                                type="text"
                                value={broadcastID}
                                placeholder="Broadcast ID"
                                onChange={(e) => setBroadcastID(e.target.value)}
                            />
                            <button className='cg-button' onClick={() => {
                                if (broadcastID.length > 0) socket?.emit('new-user', { id: socket?.id, to: broadcastID })
                            }}>Connect to broadcast</button>
                        </>
                    )}
                </div>
                {broadcast && (
                    <div className="flex flex-row w-full">
                        <input
                            className='cg-input'
                            type="text"
                            value={currentMessage}
                            placeholder="Write a message"
                            onChange={(e) => setCurrentMessage(e.target.value)}
                        />
                        <button className='cg-button' onClick={sendMessage}>Send message</button>
                        <button className={`cg-button ${recorder != null ? 'record' : ''}`} onClick={startRecording}>{recorder != null ? 'Send recorded message' : 'Record voice message'}</button>
                    </div>
                )}
            </div>
        </main>
    )
}
