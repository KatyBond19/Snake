
import { parseClientMessage } from '@snake/shared-types'
import type { ServerMessage } from '@snake/shared-types'
import { createServer } from 'node:http'
import { WebSocket, WebSocketServer } from 'ws'

import { RoomManager } from './RoomManager.ts'

function sendError(socket: WebSocket, message: string): void {
  if (socket.readyState === WebSocket.OPEN) {
    const response: ServerMessage = { type: 'error', message }
    socket.send(JSON.stringify(response))
  }
}

export function createGameServer(roomManager = new RoomManager()) {
  const httpServer = createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ status: 'ok' }))

      return
    }

    response.writeHead(404, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Not found' }))
  })

  const webSocketServer = new WebSocketServer({
    server: httpServer,
    path: '/ws',
    maxPayload: 16 * 1024
  })

  webSocketServer.on('connection', socket => {
    let playerId: string | null = null
    const send = (message: ServerMessage) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message))
      }
    }

    socket.on('message', (data, isBinary) => {
      if (isBinary) {
        sendError(socket, 'Only JSON text messages are supported')

        return
      }

      const payload = Array.isArray(data)
        ? Buffer.concat(data).toString('utf8')
        : Buffer.isBuffer(data)
          ? data.toString('utf8')
          : Buffer.from(data).toString('utf8')
      const message = parseClientMessage(payload)
      if (!message) {
        sendError(socket, 'Invalid client message')

        return
      }

      if (message.type === 'room:join') {
        if (playerId) {
          sendError(socket, 'This connection has already joined a room')

          return
        }

        const result = roomManager.join(message.playerName, message.roomId, send)
        if (result.ok) {
          playerId = result.playerId
        } else {
          sendError(socket, result.error)
        }

        return
      }

      if (message.type === 'room:leave') {
        if (!playerId) {
          sendError(socket, 'Join a room before leaving')

          return
        }

        const result = roomManager.leave(playerId)
        playerId = null
        if (!result.ok) {
          sendError(socket, result.error)
        }

        return
      }

      if (!playerId) {
        sendError(socket, 'Join a room before sending game commands')

        return
      }

      const result = roomManager.handle(playerId, message)
      if (!result.ok) {
        sendError(socket, result.error)
      }
    })

    socket.on('close', () => {
      if (playerId) {
        roomManager.leave(playerId)
      }
    })

    socket.on('error', error => {
      console.error('WebSocket connection error:', error)
    })
  })

  const tickTimer = setInterval(() => roomManager.tick(), 150)
  tickTimer.unref()
  httpServer.on('close', () => clearInterval(tickTimer))

  return { httpServer, webSocketServer }
}
