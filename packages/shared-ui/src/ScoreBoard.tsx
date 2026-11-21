import type { ReactElement } from 'react'

export interface PlayerScore {
  id: string
  name: string
  score: number
}

interface ScoreBoardProps {
  players: PlayerScore[]
}

export function ScoreBoard({ players }: ScoreBoardProps): ReactElement {
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="snake-scoreboard">
      <h3>Таблица лидеров</h3>
      <ol>
        {sorted.map(p => (
          <li key={p.id}>
            {p.name} — {p.score}
          </li>
        ))}
      </ol>
    </div>
  )
}
