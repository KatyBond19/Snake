import {
  BOARD_SIZE,
  MAX_PLAYERS_PER_ROOM,
  MIN_PLAYERS_TO_START
} from '@snake/shared-types'
import type {
  Direction,
  GameState,
  Position,
  RoomPlayer,
  RoomState,
  SnakeState
} from '@snake/shared-types'

const INITIAL_SNAKE_LENGTH = 3
const HEAD_X_POSITIONS = [2, 7, 17, 12]
const HEAD_DIRECTIONS = ['right', 'right', 'left', 'left'] as const

function isOpposite(first: Direction, second: Direction): boolean {
  return (first === 'up' && second === 'down')
    || (first === 'down' && second === 'up')
    || (first === 'left' && second === 'right')
    || (first === 'right' && second === 'left')
}

function samePosition(first: Position, second: Position): boolean {
  return first.x === second.x && first.y === second.y
}

function nextPosition(position: Position, direction: Direction): Position {
  switch (direction) {
  case 'up':
    return { x: position.x, y: position.y - 1 }
  case 'down':
    return { x: position.x, y: position.y + 1 }
  case 'left':
    return { x: position.x - 1, y: position.y }
  case 'right':
    return { x: position.x + 1, y: position.y }
  }
}

interface Move {
  snake: SnakeState
  head: Position
  eatsFood: boolean
  collides: boolean
}

export class GameRoom {
  readonly id: string
  private readonly players = new Map<string, RoomPlayer>()
  private readonly random: () => number
  private status: RoomState['status'] = 'waiting'
  private game: GameState | null = null

  constructor(id: string, random: () => number = Math.random) {
    this.id = id
    this.random = random
  }

  get playerCount(): number {
    return this.players.size
  }

  addPlayer(player: RoomPlayer): string | null {
    if (this.status !== 'waiting') {
      return 'This room is not accepting players'
    }

    if (this.players.size >= MAX_PLAYERS_PER_ROOM) {
      return 'This room is full'
    }

    this.players.set(player.id, player)

    return null
  }

  removePlayer(playerId: string): boolean {
    if (!this.players.delete(playerId)) {
      return false
    }

    if (this.game) {
      this.game.snakes = this.game.snakes.filter(snake => snake.playerId !== playerId)
      if (this.game.status === 'playing' && this.aliveSnakeCount() <= 1) {
        this.finishGame()
      }
    }

    return true
  }

  start(): string | null {
    if (this.status !== 'waiting') {
      return 'This room has already started'
    }

    if (this.players.size < MIN_PLAYERS_TO_START) {
      return `At least ${MIN_PLAYERS_TO_START} players are required to start`
    }

    const snakes = Array.from(this.players.keys(), (playerId, index) => {
      const column = index % HEAD_X_POSITIONS.length
      const row = Math.floor(index / HEAD_X_POSITIONS.length)
      const direction = HEAD_DIRECTIONS[column]
      const headX = HEAD_X_POSITIONS[column]
      const y = row === 0 ? 5 : BOARD_SIZE - 6
      const segmentOffset = direction === 'right' ? -1 : 1

      return {
        playerId,
        segments: Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, segmentIndex) => ({
          x: headX + segmentOffset * segmentIndex,
          y
        })),
        direction,
        alive: true,
        score: 0
      }
    })

    this.status = 'playing'
    this.game = {
      roomId: this.id,
      tick: 0,
      status: 'playing',
      snakes,
      food: this.spawnFood(snakes)
    }

    return null
  }

  setDirection(playerId: string, direction: Direction): string | null {
    if (this.status !== 'playing' || !this.game) {
      return 'The game is not running'
    }

    const snake = this.game.snakes.find(item => item.playerId === playerId)
    if (!snake || !snake.alive) {
      return 'Player is not active in this game'
    }

    if (isOpposite(snake.direction, direction)) {
      return 'A snake cannot turn directly backwards'
    }

    snake.direction = direction

    return null
  }

  tick(): GameState | null {
    if (this.status !== 'playing' || !this.game) {
      return null
    }

    const food = this.game.food
    const moves: Move[] = this.game.snakes
      .filter(snake => snake.alive)
      .map(snake => {
        const head = nextPosition(snake.segments[0], snake.direction)
        const eatsFood = food !== null && samePosition(head, food)

        return {
          snake,
          head,
          eatsFood,
          collides: head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE
        }
      })

    for (const move of moves) {
      const ownBody = move.snake.segments.slice(0, move.eatsFood ? undefined : -1)
      if (ownBody.some(segment => samePosition(segment, move.head))) {
        move.collides = true
      }

      for (const other of moves) {
        if (other.snake.playerId === move.snake.playerId) {
          continue
        }

        const otherBody = other.snake.segments.slice(0, other.eatsFood ? undefined : -1)
        if (
          otherBody.some(segment => samePosition(segment, move.head))
          || samePosition(other.head, move.head)
        ) {
          move.collides = true
        }
      }
    }

    const moveByPlayer = new Map(moves.map(move => [move.snake.playerId, move]))
    this.game.snakes = this.game.snakes.map(snake => {
      const move = moveByPlayer.get(snake.playerId)
      if (!move || move.collides) {
        return move ? { ...snake, alive: false } : snake
      }

      return {
        ...snake,
        score: snake.score + Number(move.eatsFood),
        segments: [
          move.head,
          ...snake.segments.slice(0, move.eatsFood ? undefined : -1)
        ]
      }
    })
    this.game.tick += 1

    if (food && moves.some(move => move.eatsFood && !move.collides)) {
      this.game.food = this.spawnFood(this.game.snakes)
    }

    if (this.aliveSnakeCount() <= 1) {
      this.finishGame()
    }

    return this.getGameState()
  }

  getRoomState(): RoomState {
    return {
      roomId: this.id,
      status: this.status,
      players: Array.from(this.players.values(), player => ({ ...player }))
    }
  }

  getGameState(): GameState | null {
    return this.game ? structuredClone(this.game) : null
  }

  private aliveSnakeCount(): number {
    return this.game?.snakes.filter(snake => snake.alive).length ?? 0
  }

  private finishGame(): void {
    this.status = 'finished'
    if (this.game) {
      this.game.status = 'finished'
    }
  }

  private spawnFood(snakes: SnakeState[]): Position | null {
    const occupied = new Set(
      snakes.flatMap(snake => snake.alive
        ? snake.segments.map(segment => `${segment.x},${segment.y}`)
        : [])
    )
    const emptyPositions: Position[] = []

    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        if (!occupied.has(`${x},${y}`)) {
          emptyPositions.push({ x, y })
        }
      }
    }

    if (emptyPositions.length === 0) {
      return null
    }

    const index = Math.min(
      emptyPositions.length - 1,
      Math.max(0, Math.floor(this.random() * emptyPositions.length))
    )

    return emptyPositions[index]
  }
}
