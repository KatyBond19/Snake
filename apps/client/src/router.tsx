import type { RouteObject } from 'react-router-dom'

import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'
import { LobbyPage } from './pages/LobbyPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/lobby', element: <LobbyPage /> },
  { path: '/game/:roomId', element: <GamePage /> },
  { path: '*', element: <NotFoundPage /> }
]
