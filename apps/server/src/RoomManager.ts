import type {
  ClientMessage,
  Direction,
  GameState,
  RoomPlayer,
  ServerMessage
} from '@snake/shared-types'
import { randomUUID } from 'node:crypto'

import { GameRoom } from './GameRoom.ts'

export type MessageSender = (message: ServerMessage) => void

export type JoinResult =
  | { ok: true; playerId: string; roomId: string }
  | { ok: false; error: string }

export type ActionResult = { ok: true } | { ok: false; error: string }

export class RoomManager {
  private readonly rooms = new Map<string, GameRoom>()
  private readonly playerRooms = new Map<string, string>()
  private readonly senders = new Map<string, MessageSender>()
  private readonly createId: () => string
  private readonly random: () => number

  constructor(createId: () => string = randomUUID, random: () => number = Math.random) {
    this.createId = createId
    this.random = random
  }

  join(
    playerName: string,
    requestedRoomId: string | undefined,
    send: MessageSender
  ): JoinResult {
    let room: GameRoom

    if (requestedRoomId) {
      const existingRoom = this.rooms.get(requestedRoomId)
      if (!existingRoom) {
        return { ok: false, error: 'Room not found' }
      }
      room = existingRoom
    } else {
      room = new GameRoom(this.createId().slice(0, 8), this.random)
      this.rooms.set(room.id, room)
    }

    const player: RoomPlayer = { id: this.createId(), name: playerName }
    const error = room.addPlayer(player)
    if (error) {
      if (room.playerCount === 0) {
        this.rooms.delete(room.id)
      }

      return { ok: false, error }
    }

    this.playerRooms.set(player.id, room.id)
    this.senders.set(player.id, send)
    send({ type: 'room:joined', roomId: room.id, playerId: player.id })
    this.broadcastRoom(room)

    return { ok: true, playerId: player.id, roomId: room.id }
  }

  leave(playerId: string): ActionResult {
    const roomId = this.playerRooms.get(playerId)
    const room = roomId ? this.rooms.get(roomId) : undefined
    if (!room || !room.removePlayer(playerId)) {
      return { ok: false, error: 'Player is not in a room' }
    }

    this.playerRooms.delete(playerId)
    this.senders.delete(playerId)

    if (room.playerCount === 0) {
      this.rooms.delete(room.id)

      return { ok: true }
    }

    this.broadcastRoom(room)
    this.broadcastGame(room)

    return { ok: true }
  }

  startGame(playerId: string): ActionResult {
    const room = this.getPlayerRoom(playerId)
    if (!room) {
      return { ok: false, error: 'Join a room before starting a game' }
    }

    const error = room.start()
    if (error) {
      return { ok: false, error }
    }

    this.broadcastRoom(room)
    this.broadcastGame(room)

    return { ok: true }
  }

  setDirection(playerId: string, direction: Direction): ActionResult {
    const room = this.getPlayerRoom(playerId)
    if (!room) {
      return { ok: false, error: 'Join a room before changing direction' }
    }

    const error = room.setDirection(playerId, direction)

    return error ? { ok: false, error } : { ok: true }
  }

  handle(playerId: string, message: ClientMessage): ActionResult {
    if (message.type === 'game:start') {
      return this.startGame(playerId)
    }

    if (message.type === 'game:turn') {
      return this.setDirection(playerId, message.direction)
    }

    return { ok: false, error: 'This message is not valid in the current room state' }
  }

  tick(): void {
    for (const room of this.rooms.values()) {
      const game = room.tick()
      if (!game) {
        continue
      }

      this.broadcastGame(room)
      if (game.status === 'finished') {
        this.broadcastRoom(room)
      }
    }
  }

  private getPlayerRoom(playerId: string): GameRoom | undefined {
    const roomId = this.playerRooms.get(playerId)

    return roomId ? this.rooms.get(roomId) : undefined
  }

  private broadcastRoom(room: GameRoom): void {
    this.broadcast({ type: 'room:state', room: room.getRoomState() }, room)
  }

  private broadcastGame(room: GameRoom): void {
    const game: GameState | null = room.getGameState()
    if (game) {
      this.broadcast({ type: 'game:state', game }, room)
    }
  }

  private broadcast(message: ServerMessage, room: GameRoom): void {
    for (const player of room.getRoomState().players) {
      this.senders.get(player.id)?.(message)
    }
  }
}
