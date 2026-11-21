import { Button } from '@snake/shared-ui'
import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

export function HomePage(): ReactElement {
  return (
    <div style={{ padding: 24 }}>
      <h1>Multiplayer Snake</h1>
      <p>Сетевая «Змейка» на 2–8 игроков.</p>
      <Link to="/lobby">
        <Button>Войти в лобби</Button>
      </Link>
    </div>
  )
}
