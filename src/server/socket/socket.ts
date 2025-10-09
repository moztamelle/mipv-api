import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { userSocketMap } from './store'

const app = express()

const server = http.createServer(app)

const io = new Server(server, {})

export const getReceiverSocket = (userId: any) => {
  return userSocketMap[userId]
}

// Listen incomming connection
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId
})

export { app, io, server }

export const IOEvents = {
  notification: 'Notification',
  joinEventRoom: 'joinEventRoom',
  leaveEventRoom: 'leaveEventRoom',
  requestRoomInfo: 'requestRoomInfo',
  roomInfo: 'roomInfo',
  guestConfirmed: 'guestConfirmed',
  guestExiting: 'guestExiting',
  invitesServices: 'invitesServices',
}
