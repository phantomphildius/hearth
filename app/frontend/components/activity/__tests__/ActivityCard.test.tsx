import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityCard from '../ActivityCard'
import type { SessionCalendarEntry } from '../../../types'

const baseEntry: SessionCalendarEntry = {
  kind: 'session',
  activity_id: 1,
  session_id: 1,
  name: 'Soccer Practice',
  scheduled_date: '2024-01-01',
  start_time: '09:00',
  end_time: '10:30',
  notes: null,
  children: [],
}

describe('ActivityCard', () => {
  it('renders the activity name', () => {
    render(<ActivityCard entry={baseEntry} onClick={vi.fn()} />)
    expect(screen.getByText('Soccer Practice')).toBeInTheDocument()
  })

  it('renders the start and end times', () => {
    render(<ActivityCard entry={baseEntry} onClick={vi.fn()} />)
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
    expect(screen.getByText(/10:30/)).toBeInTheDocument()
  })

  it('renders child names when children are present', () => {
    const entryWithChildren: SessionCalendarEntry = {
      ...baseEntry,
      children: [
        { id: 10, first_name: 'Alice', age: 7 },
        { id: 11, first_name: 'Bob', age: 5 },
      ],
    }
    render(<ActivityCard entry={entryWithChildren} onClick={vi.fn()} />)
    expect(screen.getByText('Alice, Bob')).toBeInTheDocument()
  })

  it('does not render child names when there are no children', () => {
    render(<ActivityCard entry={baseEntry} onClick={vi.fn()} />)
    expect(screen.queryByText(/Alice/)).not.toBeInTheDocument()
  })

  it('calls onClick when the card is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<ActivityCard entry={baseEntry} onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is rendered as a button element', () => {
    render(<ActivityCard entry={baseEntry} onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('projected entries render with dashed style', () => {
    const projectedEntry = {
      kind: 'projected' as const,
      activity_id: 1,
      session_id: null,
      name: 'Projected Practice',
      scheduled_date: '2024-01-01',
      start_time: '09:00',
      end_time: '10:30',
      notes: null,
      children: [],
    }
    render(<ActivityCard entry={projectedEntry} onClick={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/border-dashed/)
    expect(button.className).toMatch(/opacity-60/)
  })
})
