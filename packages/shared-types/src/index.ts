export const BOARD_SIZE = 20
export const MAX_PLAYERS_PER_ROOM = 8
export const MIN_PLAYERS_TO_START = 2

export type Direction = 'up' | 'down' | 'left' | 'right'
export type RoomStatus = 'waiting' | 'playing' | 'finished'

export interface Position {
  x: number
  y: number
}

export interface RoomPlayer {
  id: string
  name: string
}

export interface RoomState {
  roomId: string
  status: RoomStatus
  players: RoomPlayer[]
}

export interface SnakeState {
  playerId: string
  segments: Position[]
  direction: Direction
  alive: boolean
  score: number
}

export interface GameState {
  roomId: string
  tick: number
  status: 'playing' | 'finished'
  snakes: SnakeState[]
  food: Position | null
}

export type ClientMessage =
  | { type: 'room:join'; playerName: string; roomId?: string }
  | { type: 'room:leave' }
  | { type: 'game:start' }
  | { type: 'game:turn'; direction: Direction }

export type ServerMessage =
  | { type: 'room:joined'; roomId: string; playerId: string }
  | { type: 'room:state'; room: RoomState }
  | { type: 'game:state'; game: GameState }
  | { type: 'error'; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function isDirection(value: unknown): value is Direction {
  return value === 'up' || value === 'down' || value === 'left' || value === 'right'
}

function isPosition(value: unknown): value is Position {
  return isRecord(value)
    && Number.isInteger(value.x)
    && Number.isInteger(value.y)
    && Number(value.x) >= 0
    && Number(value.x) < BOARD_SIZE
    && Number(value.y) >= 0
    && Number(value.y) < BOARD_SIZE
}

function isRoomPlayer(value: unknown): value is RoomPlayer {
  return isRecord(value)
    && isNonEmptyString(value.id, 64)
    && isNonEmptyString(value.name, 24)
}

function isRoomState(value: unknown): value is RoomState {
  return isRecord(value)
    && isNonEmptyString(value.roomId, 64)
    && (value.status === 'waiting' || value.status === 'playing' || value.status === 'finished')
    && Array.isArray(value.players)
    && value.players.every(isRoomPlayer)
}

function isSnakeState(value: unknown): value is SnakeState {
  return isRecord(value)
    && isNonEmptyString(value.playerId, 64)
    && Array.isArray(value.segments)
    && value.segments.every(isPosition)
    && isDirection(value.direction)
    && typeof value.alive === 'boolean'
    && Number.isInteger(value.score)
    && Number(value.score) >= 0
}

function isGameState(value: unknown): value is GameState {
  return isRecord(value)
    && isNonEmptyString(value.roomId, 64)
    && Number.isInteger(value.tick)
    && Number(value.tick) >= 0
    && (value.status === 'playing' || value.status === 'finished')
    && Array.isArray(value.snakes)
    && value.snakes.every(isSnakeState)
    && (value.food === null || isPosition(value.food))
}

function parseJson(raw: string): unknown {
  try {
    const value: unknown = JSON.parse(raw)

    return value
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null
    }

    throw error
  }
}

export function parseClientMessage(raw: string): ClientMessage | null {
  const value = parseJson(raw)

  if (!isRecord(value) || typeof value.type !== 'string') {
    return null
  }

  switch (value.type) {
  case 'room:join':
    if (
      !isNonEmptyString(value.playerName, 24)
        || (value.roomId !== undefined && !isNonEmptyString(value.roomId, 64))
    ) {
      return null
    }

    return value.roomId === undefined
      ? { type: 'room:join', playerName: value.playerName.trim() }
      : {
        type: 'room:join',
        playerName: value.playerName.trim(),
        roomId: value.roomId
      }
  case 'room:leave':
  case 'game:start':
    return { type: value.type }
  case 'game:turn':
    return isDirection(value.direction)
      ? { type: 'game:turn', direction: value.direction }
      : null
  default:
    return null
  }
}

export function parseServerMessage(raw: string): ServerMessage | null {
  const value = parseJson(raw)

  if (!isRecord(value) || typeof value.type !== 'string') {
    return null
  }

  switch (value.type) {
  case 'room:joined':
    return isNonEmptyString(value.roomId, 64) && isNonEmptyString(value.playerId, 64)
      ? { type: 'room:joined', roomId: value.roomId, playerId: value.playerId }
      : null
  case 'room:state':
    return isRoomState(value.room) ? { type: 'room:state', room: value.room } : null
  case 'game:state':
    return isGameState(value.game) ? { type: 'game:state', game: value.game } : null
  case 'error':
    return isNonEmptyString(value.message, 256)
      ? { type: 'error', message: value.message }
      : null
  default:
    return null
  }
}
