import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { App, AppRoutes } from './App'

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

describe('application navigation', () => {
  it('navigates from the home page through the lobby to a game room', async () => {
    render(
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('link', { name: 'Войти в лобби' }))
    expect(await screen.findByRole('heading', { name: 'Лобби' })).toBeDefined()

    fireEvent.click(screen.getByRole('link', { name: 'Начать игру' }))
    expect(await screen.findByRole('heading', { name: 'Игра: room-1' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Таблица лидеров' })).toBeDefined()
  })

  it('renders the not found page for an unknown browser route', () => {
    window.history.replaceState({}, '', '/unknown')
    render(<App />)

    expect(screen.getByRole('heading', { name: '404 — страница не найдена' })).toBeDefined()
  })
})
