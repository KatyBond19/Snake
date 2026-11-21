import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Нажми</Button>)
    expect(screen.getByText('Нажми')).toBeDefined()
  })

  it('applies primary class by default', () => {
    render(<Button>OK</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('snake-btn--primary')
  })

  it('applies secondary class', () => {
    render(<Button variant="secondary">OK</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('snake-btn--secondary')
  })

  it('calls onClick', () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Click</Button>)
    screen.getByRole('button').click()
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
