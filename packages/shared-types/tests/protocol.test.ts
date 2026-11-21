import { describe, expect, it } from 'vitest'

import { parseClientMessage, parseServerMessage } from '../src/index'

describe('shared WebSocket protocol', () => {
  it('parses valid client commands and trims player names', () => {
    expect(parseClientMessage('{"type":"room:join","playerName":"  Sam  "}')).toEqual({
      type: 'room:join',
      playerName: 'Sam'
    })
    expect(parseClientMessage('{"type":"game:turn","direction":"left"}')).toEqual({
      type: 'game:turn',
      direction: 'left'
    })
  })

  it('rejects malformed or out-of-range client commands', () => {
    expect(parseClientMessage('{')).toBeNull()
    expect(parseClientMessage('{"type":"game:turn","direction":"diagonal"}')).toBeNull()
    expect(parseClientMessage('{"type":"room:join","playerName":"   "}')).toBeNull()
  })

  it('validates server game-state messages before accepting them', () => {
    expect(parseServerMessage(JSON.stringify({
      type: 'game:state',
      game: {
        roomId: 'room-1',
        tick: 2,
        status: 'playing',
        snakes: [{
          playerId: 'player-1',
          segments: [{ x: 1, y: 1 }],
          direction: 'right',
          alive: true,
          score: 0
        }],
        food: { x: 10, y: 10 }
      }
    }))?.type).toBe('game:state')
    expect(parseServerMessage('{"type":"game:state","game":{}}')).toBeNull()
  })
})
