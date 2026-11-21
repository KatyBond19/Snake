import { parseServerMessage } from '@snake/shared-types'
import type { ClientMessage, ServerMessage } from '@snake/shared-types'

export function openGameSocket(): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.hostname}:3000/ws`

  return new WebSocket(url)
}

export function sendClientMessage(socket: WebSocket, message: ClientMessage): void {
  if (socket.readyState !== WebSocket.OPEN) {
    throw new Error('The game server connection is not open')
  }

  socket.send(JSON.stringify(message))
}

export function parseGameServerMessage(raw: string): ServerMessage | null {
  return parseServerMessage(raw)
}
