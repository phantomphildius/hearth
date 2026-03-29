import { render, screen } from '@testing-library/react'
import WeeklyCalendar from '../WeeklyCalendar'
import type { Activity } from '../../../types'

// weekStart = "2024-01-01" is a Monday
// Resulting week: Mon Jan 1 (day 1), Tue Jan 2 (day 2), Wed Jan 3 (day 3),
//                 Thu Jan 4 (day 4), Fri Jan 5 (day 5), Sat Jan 6 (day 6), Sun Jan 7 (day 0)
const WEEK_START = '2024-01-01'

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 1,
    name: 'Soccer Practice',
    location_name: null,
    address: null,
    latitude: null,
    longitude: null,
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
    ...overrides,
  }
}

describe('WeeklyCalendar', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders 7 day columns on desktop (aria-label "<Day> activities")', () => {
    render(
      <WeeklyCalendar
        activities={[]}
        weekStart={WEEK_START}
        onActivityClick={vi.fn()}
      />
    )

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    for (const day of dayNames) {
      expect(screen.getByRole('list', { name: `${day} activities` })).toBeInTheDocument()
    }
  })

  it('renders an activity in the correct day column (day_of_week=1 → Monday)', () => {
    const mondayActivity = makeActivity({ id: 42, name: 'Monday Swim', day_of_week: 1 })

    render(
      <WeeklyCalendar
        activities={[mondayActivity]}
        weekStart={WEEK_START}
        onActivityClick={vi.fn()}
      />
    )

    const mondayColumn = screen.getByRole('list', { name: 'Monday activities' })
    expect(mondayColumn).toHaveTextContent('Monday Swim')

    // Should NOT appear in another column
    const tuesdayColumn = screen.getByRole('list', { name: 'Tuesday activities' })
    expect(tuesdayColumn).not.toHaveTextContent('Monday Swim')
  })

  it("marks today's column with aria-current=\"date\"", () => {
    // Fix "today" to Monday 2024-01-01
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00'))

    render(
      <WeeklyCalendar
        activities={[]}
        weekStart={WEEK_START}
        onActivityClick={vi.fn()}
      />
    )

    // The date number element for today should have aria-current="date"
    const currentDateEl = document.querySelector('[aria-current="date"]')
    expect(currentDateEl).not.toBeNull()
    // In the desktop column the element is a <p>, in mobile it's an <h3>; both should appear
    const allCurrentDate = document.querySelectorAll('[aria-current="date"]')
    expect(allCurrentDate.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "No activities" text for days without activities in mobile view', () => {
    // Activity only on Monday (day_of_week=1); all other days should show "No activities"
    const mondayActivity = makeActivity({ day_of_week: 1 })

    render(
      <WeeklyCalendar
        activities={[mondayActivity]}
        weekStart={WEEK_START}
        onActivityClick={vi.fn()}
      />
    )

    // The mobile view renders "No activities" for each empty day.
    // There are 6 days without the activity (all except Monday).
    const noActivitiesItems = screen.getAllByText('No activities')
    expect(noActivitiesItems.length).toBe(6)
  })
})
