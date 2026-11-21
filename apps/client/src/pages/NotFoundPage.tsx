import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@snake/shared-ui'

export function NotFoundPage(): ReactElement {
  return (
    <div style={{ padding: 24 }}>
      <h1>404 — страница не найдена</h1>
      <Link to="/">
        <Button>На главную</Button>
      </Link>
    </div>
  )
}
