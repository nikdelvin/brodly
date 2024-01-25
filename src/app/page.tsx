/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import './page.css'
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

export default function Home() {
    const [messages, setMessages] = useState<{message: string, from: string}[]>([])
    const [currentMessage, setCurrentMessage] = useState('')

    const [socket, setSocket] = useState<Socket | undefined>(undefined)
    const [stream, setStream] = useState<any | undefined>(undefined)
    const [shareScreen, setShareScreen] = useState<any | undefined>(undefined)
    const [broadcast, setBroadcast] = useState<{id: string, signal: any, new: boolean} | undefined>(undefined)
    const [newUser, setNewUser] = useState<string | undefined>(undefined)
    const [webcam, setWebcam] = useState(true)
    const [broadcastID, setBroadcastID] = useState('')

    const video = useRef<HTMLVideoElement>(null)
    const display = useRef<HTMLVideoElement>(null)
    const connections = useRef<Record<string, { peer: any, peerTo: any, signal: any }>>({})

    async function socketInitializer() {
        const socketIO = io({ path: '/api/ws' })
        socketIO.on('message', ({message, from}) => {
            const utterance = new SpeechSynthesisUtterance(message);
            speechSynthesis.speak(utterance)
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
        setCurrentMessage('')
        setMessages([])
        setShareScreen(undefined)
        setWebcam(true)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(async function(streamData) {
            const context = new AudioContext();
            const source = context.createMediaStreamSource(streamData);
            const analyzer = context.createAnalyser();
            source.connect(analyzer);
            const array = new Uint8Array(analyzer.fftSize);
            function getPeakLevel() {
                analyzer.getByteTimeDomainData(array);
                return array.reduce((max, current) => Math.max(max, Math.abs(current - 127)), 0) / 128;
            }
            function tick() {
                getPeakLevel()
                requestAnimationFrame(tick)
            }
            tick()
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
            {broadcast ? (
                <div className='flex flex-row p-2'>
                    <div className='flex flex-col w-[80%] relative'>
                        <video playsInline ref={display} autoPlay className='w-full aspect-video rounded-xl border border-gray-300 dark:border-neutral-800 z-20'/>
                        <div className='cg-block aspect-video absolute top-0 right-0 w-full rounded-xl z-10'></div>
                        <video playsInline src='/placeholder.mp4' autoPlay muted loop className='absolute top-0 right-0 opacity-50 w-full h-full rounded-xl border border-gray-300 dark:border-neutral-800 z-0'/>
                        <div className={`cg-block absolute bottom-0 left-0 w-[200px] h-auto backdrop-blur-2xl rounded-tr-xl rounded-bl-xl z-30 ${!webcam ? 'opacity-0' : ''}`}>
                            <video playsInline ref={video} autoPlay className='w-[200px] h-auto camera rounded-tl-xl rounded-br-xl'/>
                        </div>
                        {(socket?.id === broadcast?.id) ? (
                            <div className='absolute top-0 right-0 cg-block w-full border border-b-0 rounded-t-xl z-40'>
                                <div className='flex flex-row w-full'>
                                    <div className='flex flex-row me-auto'>
                                        <div className='cg-icon flex-row'>
                                            <span className="material-symbols-outlined me-2">fingerprint</span>
                                            <p>{broadcast?.id}</p>
                                        </div>
                                    </div>
                                    <div className='flex flex-row'>
                                        <button className={`cg-icon ${webcam ? 'record' : ''}`} onClick={() => {setWebcam(!webcam)}}>
                                            <span className="material-symbols-outlined">camera_video</span>
                                        </button>
                                        <button className={`cg-icon ${shareScreen != null ? 'record' : ''}`} onClick={startShareScreen}>
                                            <span className="material-symbols-outlined">screen_record</span>
                                        </button>
                                        <button className='cg-icon' onClick={stopBroadcast}>
                                            <span className="material-symbols-outlined">stop_circle</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='absolute top-0 right-0 flex flex-row cg-block w-full border border-b-0'>
                                <div className='flex flex-row ms-auto'>
                                    <button className='cg-icon' onClick={() => {
                                        video!.current!.srcObject = null; setBroadcast(undefined); socket?.disconnect(); socketInitializer();
                                    }}>
                                        <span className="material-symbols-outlined">logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col w-[20%] h-screen absolute top-0 right-0 p-2 pl-1'>
                        <div className='cg-block flex flex-col h-full border rounded-xl'>
                            <div className='flex flex-col mt-auto overflow-y-scroll'>
                                {messages.slice(-4).map((message, index) => (
                                    <div key={index} className="flex flex-row w-full">
                                        <p className="cg-message break-words break-all">{`${message.from}: ${message.message}`}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="cg-block flex flex-row w-full border-t rounded-b-xl">
                                <div className="flex flex-row w-full">
                                    <input
                                        className='cg-input broadcast'
                                        type="text"
                                        value={currentMessage}
                                        placeholder="Write a message"
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-row">
                                    <button className='cg-icon' onClick={sendMessage}>
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col h-screen w-screen items-center justify-center text-center'>
                    <video playsInline src='/placeholder.mp4' autoPlay muted loop className='absolute top-0 right-0 w-full h-full z-0'/>
                    <div className='absolute flex flex-col items-center justify-center bg-black backdrop-blur-2xl top-0 right-0 w-full h-full z-10 logo'>
                        <h1 className='text-8xl font-extrabold my-8'>BRODLY</h1>
                        <div className='flex flex-col w-[300px]'>
                            <button id="start_broadcast" className='cg-button mx-auto' onClick={startBroadcast}>Start video broadcast</button>
                            <p className='my-2'>OR</p>
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
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
