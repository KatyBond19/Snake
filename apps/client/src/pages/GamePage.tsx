import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { ScoreBoard } from '@snake/shared-ui'
import type { PlayerScore } from '@snake/shared-ui'
import { GameCanvas } from '../components/GameCanvas'

const DEMO_PLAYERS: PlayerScore[] = [
  { id: '1', name: 'Вы', score: 3 },
  { id: '2', name: 'Соперник', score: 2 }
]

export function GamePage(): ReactElement {
  const { roomId } = useParams<{ roomId: string }>()

  return (
    <div style={{ padding: 24 }}>
      <h1>Игра: {roomId}</h1>
      <GameCanvas width={400} height={400} />
      <ScoreBoard players={DEMO_PLAYERS} />
    </div>
  )
}
