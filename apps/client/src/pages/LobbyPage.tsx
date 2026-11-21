import { Button } from '@snake/shared-ui'
import type { ReactElement } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function LobbyPage(): ReactElement {
  const [roomId] = useState('room-1')

  return (
    <div style={{ padding: 24 }}>
      <h1>Лобби</h1>
      <p>Ожидание игроков (заглушка).</p>
      <Link to={`/game/${roomId}`}>
        <Button>Начать игру</Button>
      </Link>
    </div>
  )
}
