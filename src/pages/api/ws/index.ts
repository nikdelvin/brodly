import { Server, ServerOptions } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import speech from '@google-cloud/speech'
import cors from "cors"
import credentials from '../../../../credentials.json' assert { type: "json" }

interface IOSocket {
    server: Partial<ServerOptions> & { io: Server }
}

const corsMiddleware = cors()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const parentName = 'projects/cybergelion/locations/global'
    const recognizerName = `${parentName}/recognizers/rclatest`
    const client = new speech.v2.SpeechClient({ credentials })
    client.getRecognizer({ name: recognizerName }).catch(async () => {
        const [operation] = await client.createRecognizer({
            parent: 'projects/cybergelion/locations/global',
            recognizerId: "rclatest",
            recognizer: {
                languageCodes: ['en-US'],
                model: 'latest_short',
            }
        })
        await operation.promise()
    })
    if ((res.socket as never as IOSocket).server.io) {
        res.end()
        return
    }
    const io = new Server((res.socket as never as IOSocket).server, {
        path: "/api/ws",
        addTrailingSlash: false
    })
    io.on('connection', (socket) => {
        console.log(`Socket ${socket.id} connected.`)
        socket.on('message', ({message, from, to}) => {
            io.to(to).emit('message', {message, from})
        })
        socket.on('videostream', ({signal, from, to}) => {
            io.to(to).emit("videostream", {signal, from})
        })
        socket.on('videostream-start', ({signal, from, to}) => {
            io.to(to).emit("videostream-start", {signal, from})
        })
        socket.on('videostream-end', ({ from, to}) => {
            io.to(to).emit("videostream-end", {from})
        })
        socket.on('new-user', ({id, to}) => {
            io.to(to).emit("new-user", {id})
        })
        socket.on('voice', ({data, from, to}) => {
            const request = {
                recognizer: recognizerName,
                config: {
                    languageCodes: ['en-US'],
                    autoDecodingConfig: {}
                },
                content: data
            }
            client.recognize(request).then(([data]) => {
                const transcript = data.results?.[0]?.alternatives?.[0]?.transcript
                if (transcript != null && transcript !== '') {
                    io.to(to).emit('message', {message: transcript, from})
                }
            })
        })
        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected.`)
        })
    })
    corsMiddleware(req, res, () => {
        (res.socket as never as IOSocket).server.io = io
        res.end()
    })
}