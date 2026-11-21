import type { ReactElement } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'

import { routes } from './router'

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export function AppRoutes(): ReactElement | null {
  return useRoutes(routes)
}
