import { describe, expect, it } from 'vitest'

import { GameRoom } from './GameRoom.ts'

describe('GameRoom', () => {
  it('requires two players and enforces the room capacity', () => {
    const room = new GameRoom('room-1')
    expect(room.start()).toBe('At least 2 players are required to start')

    for (let index = 0; index < 8; index += 1) {
      expect(room.addPlayer({ id: `player-${index}`, name: `Player ${index}` })).toBeNull()
    }

    expect(room.addPlayer({ id: 'player-9', name: 'Player 9' })).toBe('This room is full')
  })

  it('moves snakes, accepts safe turns, and rejects reversing into itself', () => {
    const room = new GameRoom('room-1', () => 0)
    room.addPlayer({ id: 'player-1', name: 'One' })
    room.addPlayer({ id: 'player-2', name: 'Two' })

    expect(room.start()).toBeNull()
    expect(room.setDirection('player-1', 'up')).toBeNull()
    expect(room.setDirection('player-1', 'down')).toBe('A snake cannot turn directly backwards')

    const game = room.tick()
    expect(game?.tick).toBe(1)
    expect(game?.snakes[0].segments[0].y).toBe(4)
  })

  it('starts eight non-overlapping snakes that survive the first tick', () => {
    const room = new GameRoom('room-1', () => 0)
    for (let index = 0; index < 8; index += 1) {
      room.addPlayer({ id: `player-${index}`, name: `Player ${index}` })
    }

    expect(room.start()).toBeNull()
    const initialGame = room.getGameState()
    const occupiedCells = initialGame?.snakes.flatMap(snake =>
      snake.segments.map(segment => `${segment.x},${segment.y}`)
    )
    expect(new Set(occupiedCells).size).toBe(24)

    const nextGame = room.tick()
    expect(nextGame?.snakes.every(snake => snake.alive)).toBe(true)
  })

  it('removes disconnected players and finishes when one snake remains', () => {
    const room = new GameRoom('room-1')
    room.addPlayer({ id: 'player-1', name: 'One' })
    room.addPlayer({ id: 'player-2', name: 'Two' })
    room.start()

    expect(room.removePlayer('player-1')).toBe(true)
    expect(room.getRoomState().status).toBe('finished')
    expect(room.getGameState()?.snakes.map(snake => snake.playerId)).toEqual(['player-2'])
    expect(room.removePlayer('unknown')).toBe(false)
  })
})
