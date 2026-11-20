import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScoreBoard } from './ScoreBoard'

describe('ScoreBoard', () => {
  it('renders players sorted by score', () => {
    render(<ScoreBoard players={[
      { id: '1', name: 'Alice', score: 5 },
      { id: '2', name: 'Bob', score: 10 }
    ]} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0].textContent).toContain('Bob')
    expect(items[1].textContent).toContain('Alice')
  })

  it('renders empty list', () => {
    render(<ScoreBoard players={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
