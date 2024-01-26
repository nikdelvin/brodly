/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import './page.css'
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

export default function Home() {
    const [messages, setMessages] = useState<{message: string, from: string, emoji?: string}[]>([])
    const [currentMessage, setCurrentMessage] = useState('')

    const [socket, setSocket] = useState<Socket | undefined>(undefined)
    const [stream, setStream] = useState<any | undefined>(undefined)
    const [shareScreen, setShareScreen] = useState<any | undefined>(undefined)
    const [broadcast, setBroadcast] = useState<{id: string, signal: any, new: boolean} | undefined>(undefined)
    const [newUser, setNewUser] = useState<string | undefined>(undefined)
    const [webcam, setWebcam] = useState(true)
    const [mic, setMic] = useState(true)
    const [mute, setMute] = useState(false)
    const [broadcastID, setBroadcastID] = useState('')

    const video = useRef<HTMLVideoElement>(null)
    const audio = useRef<HTMLAudioElement>(null)
    const display = useRef<HTMLVideoElement>(null)
    const connections = useRef<Record<string, { peer: any, peerTo: any, signal: any, emoji?: string }>>({})

    const emojiList = ['face', 'face_2', 'face_3', 'face_4', 'face_5', 'face_6', 
    'raven', 'mood', 'mood_bad', 'sick', 'sentiment_calm', 'sentiment_excited',
    'sentiment_satisfied', 'sentiment_dissatisfied', 'sentiment_very_satisfied', 
    'sentiment_neutral', 'sentiment_very_dissatisfied', 'sentiment_extremely_dissatisfied', 'sentiment_sad', 
    'sentiment_stressed', 'sentiment_content', 'sentiment_frustrated', 'sentiment_worried',
    'skull', 'flutter_dash', 'panorama_photosphere', 'domino_mask', 'smart_outlet', 'outlet', 'cruelty_free']
    const freeEmoji = useRef<Set<string>>(new Set(emojiList))

    async function socketInitializer() {
        const socketIO = io({ path: '/api/ws' })
        socketIO.on('message', ({message, from, emoji}) => {
            if (emoji == null) {
                Object.entries(connections.current).forEach((connection) => {
                    if (connection[0] !== socketIO!.id) {
                        socketIO.emit('message', {message, from: socketIO!.id, to: connection[0], emoji: connections.current[from].emoji ?? 'support_agent'})
                    }
                })
            }
            const utterance = new SpeechSynthesisUtterance(message);
            speechSynthesis.speak(utterance)
            setMessages((prevMessages) => [...prevMessages, {message, from, emoji: emoji ?? connections.current[from].emoji}])
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
            if (socketIO.id !== from) {
                video!.current!.srcObject = null
                display!.current!.srcObject = null
                setBroadcast(undefined)
                socketIO.disconnect();
                socketInitializer();
            }
        })
        socketIO.on('new-user', ({id}) => {
            setNewUser(id)
        })
        socketIO.on('webcam-on', ({from}) => {
            if (socketIO.id !== from) setWebcam(true)
        })
        socketIO.on('webcam-off', ({from}) => {
            if (socketIO.id !== from) setWebcam(false)
        })
        socketIO.on('mic-on', ({from}) => {
            if (socketIO.id !== from) setMic(true)
        })
        socketIO.on('mic-off', ({from}) => {
            if (socketIO.id !== from) setMic(false)
        })
        socketIO.on('share-off', ({from}) => {
            if (socketIO.id !== from) display!.current!.srcObject = null;
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
        const prepateStream = (streamData: MediaStream) => {
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
        }
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function(streamData) {
            prepateStream(streamData)
        }).catch(function() {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(function(streamData) {
                prepateStream(streamData)
            })
        })
    }

    function startShareScreen() {
        if (shareScreen != null) {
            stopShareScreen()
        } else {
            navigator.mediaDevices.getDisplayMedia({ audio: true  }).then(async function(displayStream) {
                Object.entries(connections.current).forEach((connection) => {
                    connection[1].peer.addStream(displayStream)
                })
                setShareScreen(displayStream)
            })
        }
    }

    function stopShareScreen() {
        Object.entries(connections.current).forEach((connection) => {
            socket?.emit('share-off', { from: broadcast!.id, to: connection[0] })
        })
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
            socket?.emit('message', {message: currentMessage, from: socket?.id, to: broadcast!.id, emoji: null})
            setCurrentMessage('')
        }
    }

    useEffect(() => {
        socketInitializer()
    }, [])

    useEffect(() => {
        if (broadcast != null) {
            if (!webcam) {
                video!.current!.srcObject = null
                if (stream != null) {
                    audio!.current!.srcObject = stream
                    audio!.current!.play()
                    audio!.current!.muted = !mic
                }
            } else {
                audio!.current!.srcObject = null
                if (stream != null) {
                    video!.current!.srcObject = stream
                    video!.current!.play()
                    video!.current!.muted = !mic
                }
            }
        }
    }, [webcam])

    useEffect(() => {
        if (broadcast != null) {
            if (!webcam) {
                audio!.current!.muted = !mic
            } else {
                video!.current!.muted = !mic
            }
        }
    }, [mic])

    useEffect(() => {
        if (broadcast != null) {
            audio!.current!.muted = !mute
            video!.current!.muted = !mute
            display!.current!.muted = !mute
        }
    }, [mute])

    useEffect(() => {
        if (broadcast != null) {
            if (broadcast.new) {
                const peer = new Peer({ initiator: false, trickle: false })
                peer.on('signal', (data: any) => {
                    socket?.emit('videostream-start', { signal: data, from: socket?.id, to: broadcast.id})
                })
                peer.on('stream', (currentStream: any) => {
                    if (currentStream.getVideoTracks()[0] != null) {
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
                    } else {
                        audio!.current!.srcObject = currentStream
                        audio!.current!.play()
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
            const emojis = Array.from(freeEmoji.current.values())
            const emoji = emojis[Math.floor(Math.random()*emojis.length)]
            freeEmoji.current.delete(emoji)
            connections.current[newUser] = { peer, peerTo: null, signal: null, emoji }
            if (shareScreen) {
                connections.current[newUser].peer.addStream(shareScreen)
            }
        }
    }, [newUser])

    return (
        <main>
            {broadcast ? (
                <div className='flex flex-row'>
                    <video playsInline src='/placeholder2.mp4' autoPlay muted loop className='fixed bottom-0 right-0 min-w-max min-h-screen blur-2xl brightness-200 z-[-1]'/>
                    <div className='w-[80%] h-screen bg-black p-2'>
                        <div className='flex flex-col relative'>
                            <video playsInline ref={display} autoPlay className='w-full aspect-video rounded-xl z-40'/>
                            <div className='cg-block aspect-video absolute top-0 right-0 w-full rounded-xl z-30'></div>
                            <video playsInline src='/placeholder2.mp4' autoPlay muted loop className='absolute top-0 right-0 w-full h-full rounded-xl z-20'/>
                            <div id="webcam" className={`cg-block absolute bottom-0 left-0 w-[200px] h-auto backdrop-blur-2xl rounded-tr-xl rounded-bl-xl z-50 ${!webcam ? 'opacity-0' : ''}`}>
                                <video playsInline ref={video} autoPlay className='w-[200px] h-auto camera rounded-tl-xl rounded-br-xl'/>
                                <audio playsInline ref={audio} autoPlay className='!w-0 !h-0 !m-0 !p-0'/>
                            </div>
                            {(socket?.id === broadcast?.id) ? (
                                <div className='absolute top-0 right-0 cg-block w-full rounded-t-xl z-[60]'>
                                    <div className='flex flex-row w-full'>
                                        <div className='flex flex-row me-auto'>
                                            <div className='cg-icon flex-row'>
                                                <span className="material-symbols-outlined me-2">fingerprint</span>
                                                <p>{broadcast?.id}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-row'>
                                            <button className={`cg-icon ${webcam ? 'record' : ''}`} onClick={() => {
                                                Object.entries(connections.current).forEach((connection) => {
                                                    socket?.emit(!webcam ? 'webcam-on' : 'webcam-off', {from: socket?.id, to: connection[0]})
                                                })
                                                setWebcam(!webcam)
                                            }}>
                                                <span className="material-symbols-outlined">camera_video</span>
                                            </button>
                                            <button className={`cg-icon ${mic ? 'record' : ''}`} onClick={() => {
                                                Object.entries(connections.current).forEach((connection) => {
                                                    socket?.emit(!mic ? 'mic-on' : 'mic-off', {from: socket?.id, to: connection[0]})
                                                })
                                                setMic(!mic)
                                            }}>
                                                <span className="material-symbols-outlined">mic</span>
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
                                <div className='absolute top-0 right-0 cg-block w-full rounded-t-xl z-[60]'>
                                    <div className='flex flex-row w-full'>
                                        <div className='flex flex-row ms-auto'>
                                            <button className='cg-icon' onClick={() => {setMute(!mute)}}>
                                                <span className="material-symbols-outlined">{mute ? 'volume_off' : 'volume_up'}</span>
                                            </button>
                                            <button className='cg-icon' onClick={() => {
                                                video!.current!.srcObject = null; setBroadcast(undefined); socket?.disconnect(); socketInitializer();
                                            }}>
                                                <span className="material-symbols-outlined">logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='flex flex-col w-[20%] h-screen absolute top-0 right-0 p-2 pl-0 bg-black logo'>
                        <div className='flex flex-col h-full pt-2 border-2 rounded-xl overflow-y-scroll'>
                            <div className='flex flex-col mt-auto'>
                                {messages.map((message, index) => (
                                    <div key={index} className="flex flex-row w-full">
                                        <span className="material-symbols-outlined mb-auto mt-2 ml-2">{message.emoji ?? 'support_agent'}</span>
                                        <p className="cg-message !p-2 !px-3 !mt-0 !text-sm break-words break-all">{message.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-row w-full rounded-b-xl">
                            <div className="flex flex-row w-full">
                                <input
                                    className='cg-input !mx-0 !p-2 !px-3 !text-sm !border-white'
                                    type="text"
                                    value={currentMessage}
                                    placeholder="Write a message"
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-row">
                                <button className='cg-icon !p-2 !pr-0 !my-auto' onClick={sendMessage}>
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col h-screen w-screen items-center justify-center text-center'>
                    <video playsInline src='/placeholder2.mp4' autoPlay muted loop className='fixed bottom-0 right-0 blur-2xl min-w-max min-h-screen z-0'/>
                    <div className='absolute flex flex-col items-center justify-center bg-black top-0 right-0 w-full h-full z-10 logo'>
                        <h1 className='text-8xl font-extrabold my-8'>BRODLY</h1>
                        <div className='flex flex-col w-[300px]'>
                            <button id="start_broadcast" className='cg-button !justify-center mx-auto' onClick={startBroadcast}>Start video broadcast</button>
                            <p className='my-2'>OR</p>
                            <input
                                className='cg-input'
                                type="text"
                                value={broadcastID}
                                placeholder="Set Broadcast ID"
                                onChange={(e) => setBroadcastID(e.target.value)}
                            />
                            <button className='cg-button !justify-center' onClick={() => {
                                if (broadcastID.length > 0) socket?.emit('new-user', { id: socket?.id, to: broadcastID })
                            }}>Connect to broadcast</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
