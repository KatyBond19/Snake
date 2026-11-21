import { parseServerMessage } from '@snake/shared-types'
import type { ServerMessage } from '@snake/shared-types'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { WebSocket } from 'ws'

import { createGameServer } from './server.ts'

const app = createGameServer()
let httpUrl = ''
let webSocketUrl = ''

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl)
    socket.once('open', () => resolve(socket))
    socket.once('error', reject)
  })
}

function createMessageQueue(socket: WebSocket): { next: () => Promise<ServerMessage> } {
  const messages: ServerMessage[] = []
  const waiters: Array<{
    resolve: (message: ServerMessage) => void
    reject: (error: Error) => void
  }> = []

  socket.on('message', data => {
    const message = parseServerMessage(data.toString())
    const waiter = waiters.shift()
    if (!message) {
      waiter?.reject(new Error('Received an invalid server protocol message'))

      return
    }

    if (waiter) {
      waiter.resolve(message)
    } else {
      messages.push(message)
    }
  })

  socket.on('error', error => {
    for (const waiter of waiters.splice(0)) {
      waiter.reject(error)
    }
  })

  return {
    next: () => {
      const message = messages.shift()
      if (message) {
        return Promise.resolve(message)
      }

      return new Promise((resolve, reject) => waiters.push({ resolve, reject }))
    }
  }
}

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    app.httpServer.once('error', reject)
    app.httpServer.listen(0, '127.0.0.1', resolve)
  })

  const address = app.httpServer.address()
  if (!address || typeof address === 'string') {
    throw new Error('Expected the server to listen on a TCP port')
  }

  httpUrl = `http://127.0.0.1:${address.port}`
  webSocketUrl = `ws://127.0.0.1:${address.port}/ws`
})

afterAll(async () => {
  for (const socket of app.webSocketServer.clients) {
    socket.terminate()
  }

  if (app.httpServer.listening) {
    await new Promise<void>(resolve => {
      app.httpServer.close(() => resolve())
    })
  }
})

describe('game server', () => {
  it('serves a health check', async () => {
    const response = await fetch(`${httpUrl}/health`)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })

  it('creates rooms, starts games, and broadcasts shared protocol messages', async () => {
    const first = await openSocket()
    const firstMessages = createMessageQueue(first)
    first.send(JSON.stringify({ type: 'room:join', playerName: 'Player One' }))

    const joinedMessage = await firstMessages.next()
    const firstRoomMessage = await firstMessages.next()
    expect(joinedMessage.type).toBe('room:joined')
    if (joinedMessage.type !== 'room:joined') {
      throw new Error('Expected the server to assign the first player to a room')
    }

    const second = await openSocket()
    const secondMessages = createMessageQueue(second)
    second.send(JSON.stringify({
      type: 'room:join',
      playerName: 'Player Two',
      roomId: joinedMessage.roomId
    }))

    const updatedRoom = await firstMessages.next()
    const secondJoinedMessage = await secondMessages.next()
    const secondRoomMessage = await secondMessages.next()
    expect(firstRoomMessage.type).toBe('room:state')
    expect(updatedRoom.type).toBe('room:state')
    expect(secondJoinedMessage.type).toBe('room:joined')
    expect(secondRoomMessage.type).toBe('room:state')

    const firstStartMessages = [firstMessages.next(), firstMessages.next()]
    const secondStartMessages = [secondMessages.next(), secondMessages.next()]
    first.send(JSON.stringify({ type: 'game:start' }))
    const startMessages = await Promise.all([...firstStartMessages, ...secondStartMessages])
    expect(startMessages.some(message =>
      message.type === 'game:state' && message.game.status === 'playing'
    )).toBe(true)

    first.close()
    second.close()
  })

  it('rejects malformed WebSocket commands with a protocol error', async () => {
    const socket = await openSocket()
    const messages = createMessageQueue(socket)
    socket.send('{')
    expect(await messages.next()).toEqual({ type: 'error', message: 'Invalid client message' })
    socket.close()
  })
})
