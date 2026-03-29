import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityCard from '../ActivityCard'
import type { Activity } from '../../../types'

const baseActivity: Activity = {
  id: 1,
  name: 'Soccer Practice',
  location_name: 'Lincoln Park Field #3',
  address: '123 Main St, Springfield, IL',
  latitude: 39.7817,
  longitude: -89.6501,
  day_of_week: 1,
  day_of_week_name: 'Monday',
  start_time: '09:00',
  end_time: '10:30',
  duration_minutes: 90,
  recurrence: 'weekly',
  starts_on: null,
  notes: null,
  children: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('ActivityCard', () => {
  it('renders the activity name', () => {
    render(<ActivityCard activity={baseActivity} onClick={vi.fn()} />)
    expect(screen.getByText('Soccer Practice')).toBeInTheDocument()
  })

  it('renders the start and end times', () => {
    render(<ActivityCard activity={baseActivity} onClick={vi.fn()} />)
    // The component renders "09:00 – 10:30" with an ndash entity
    expect(screen.getByText(/09:00/)).toBeInTheDocument()
    expect(screen.getByText(/10:30/)).toBeInTheDocument()
  })

  it('renders child names when children are present', () => {
    const activityWithChildren: Activity = {
      ...baseActivity,
      children: [
        { id: 10, first_name: 'Alice', age: 7 },
        { id: 11, first_name: 'Bob', age: 5 },
      ],
    }
    render(<ActivityCard activity={activityWithChildren} onClick={vi.fn()} />)
    expect(screen.getByText('Alice, Bob')).toBeInTheDocument()
  })

  it('does not render child names when there are no children', () => {
    render(<ActivityCard activity={baseActivity} onClick={vi.fn()} />)
    // No child name text should appear
    expect(screen.queryByText(/Alice/)).not.toBeInTheDocument()
  })

  it('calls onClick when the card is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<ActivityCard activity={baseActivity} onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is rendered as a button element', () => {
    render(<ActivityCard activity={baseActivity} onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
