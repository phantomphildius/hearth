import { render, screen } from '@testing-library/react'
import WeeklyCalendar from '../WeeklyCalendar'
import type { SessionCalendarEntry } from '../../../types'

// weekStart = "2024-01-01" is a Monday
// Resulting week: Mon Jan 1, Tue Jan 2, Wed Jan 3, Thu Jan 4, Fri Jan 5, Sat Jan 6, Sun Jan 7
const WEEK_START = '2024-01-01'

function makeEntry(overrides: Partial<SessionCalendarEntry> = {}): SessionCalendarEntry {
  return {
    kind: 'session',
    activity_id: 1,
    session_id: 1,
    name: 'Soccer Practice',
    scheduled_date: '2024-01-01', // Monday
    start_time: '09:00',
    end_time: '10:30',
    notes: null,
    children: [],
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
        entries={[]}
        weekStart={WEEK_START}
        onEntryClick={vi.fn()}
      />
    )

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    for (const day of dayNames) {
      expect(screen.getByRole('list', { name: `${day} activities` })).toBeInTheDocument()
    }
  })

  it('renders an entry in the correct day column (scheduled_date = Monday)', () => {
    const mondayEntry = makeEntry({ activity_id: 42, name: 'Monday Swim', scheduled_date: '2024-01-01' })

    render(
      <WeeklyCalendar
        entries={[mondayEntry]}
        weekStart={WEEK_START}
        onEntryClick={vi.fn()}
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
        entries={[]}
        weekStart={WEEK_START}
        onEntryClick={vi.fn()}
      />
    )

    // The date number element for today should have aria-current="date"
    const currentDateEl = document.querySelector('[aria-current="date"]')
    expect(currentDateEl).not.toBeNull()
    // In the desktop column the element is a <p>, in mobile it's an <h3>; both should appear
    const allCurrentDate = document.querySelectorAll('[aria-current="date"]')
    expect(allCurrentDate.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "No activities" text for days without entries in mobile view', () => {
    // Entry only on Monday; all other days should show "No activities"
    const mondayEntry = makeEntry({ scheduled_date: '2024-01-01' })

    render(
      <WeeklyCalendar
        entries={[mondayEntry]}
        weekStart={WEEK_START}
        onEntryClick={vi.fn()}
      />
    )

    // The mobile view renders "No activities" for each empty day.
    // There are 6 days without the entry (all except Monday).
    const noActivitiesItems = screen.getAllByText('No activities')
    expect(noActivitiesItems.length).toBe(6)
  })

  it('renders projected entries with kind "projected"', () => {
    const projectedEntry = {
      kind: 'projected' as const,
      activity_id: 1,
      session_id: null,
      name: 'Projected Swim',
      scheduled_date: '2024-01-02', // Tuesday
      start_time: '10:00',
      end_time: '11:00',
      notes: null,
      children: [],
    }

    render(
      <WeeklyCalendar
        entries={[projectedEntry]}
        weekStart={WEEK_START}
        onEntryClick={vi.fn()}
      />
    )

    const tuesdayColumn = screen.getByRole('list', { name: 'Tuesday activities' })
    expect(tuesdayColumn).toHaveTextContent('Projected Swim')
  })
})
