import { Server, ServerOptions } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import cors from "cors"

interface IOSocket {
    server: Partial<ServerOptions> & { io: Server }
}

const corsMiddleware = cors()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        socket.on('message', ({message, from, to, emoji}) => {
            io.to(to).emit('message', {message, from, emoji})
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
        socket.on('webcam-off', ({from, to}) => {
            io.to(to).emit("webcam-off", {from})
        })
        socket.on('webcam-on', ({from, to}) => {
            io.to(to).emit("webcam-on", {from})
        })
        socket.on('mic-off', ({from, to}) => {
            io.to(to).emit("mic-off", {from})
        })
        socket.on('mic-on', ({from, to}) => {
            io.to(to).emit("mic-on", {from})
        })
        socket.on('share-off', ({from, to}) => {
            io.to(to).emit("share-off", {from})
        })
        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected.`)
        })
    })
    corsMiddleware(req, res, () => {
        (res.socket as never as IOSocket).server.io = io
        res.end()
        return
    })
}