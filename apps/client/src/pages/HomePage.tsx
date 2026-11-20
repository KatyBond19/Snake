import { Link } from 'react-router-dom'
import { Button } from '@snake/shared-ui'

export function HomePage(): JSX.Element {
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
