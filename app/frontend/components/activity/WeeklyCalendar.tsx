import ActivityCard from './ActivityCard'
import type { Activity } from '../../types'

interface WeeklyCalendarProps {
  activities: Activity[]
  weekStart: string
  onActivityClick: (activity: Activity) => void
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getWeekDates(weekStart: string): Date[] {
  const start = new Date(`${weekStart}T00:00:00`)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
}

export default function WeeklyCalendar({ activities, weekStart, onActivityClick }: WeeklyCalendarProps) {
  const weekDates = getWeekDates(weekStart)

  return (
    <div>
      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {weekDates.map((date, i) => {
          const dayOfWeek = date.getDay()
          const dayActivities = activities
            .filter((a) => a.day_of_week === dayOfWeek)
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
          const today = isToday(date)

          return (
            <ul
              key={i}
              aria-label={`${DAY_NAMES[dayOfWeek]} activities`}
              className={`min-h-[120px] rounded-lg p-2 ${today ? 'bg-amber-50 border border-amber-200' : 'bg-stone-50 border border-stone-200'}`}
            >
              <div className="text-center mb-2">
                <p className={`text-xs font-medium ${today ? 'text-amber-700' : 'text-stone-500'}`}>
                  {DAY_NAMES[dayOfWeek].slice(0, 3)}
                </p>
                <p
                  aria-current={today ? 'date' : undefined}
                  className={`text-sm font-semibold ${today ? 'text-amber-800' : 'text-stone-800'}`}
                >
                  {formatDate(date)}
                </p>
              </div>
              <div className="space-y-1.5">
                {dayActivities.map((activity) => (
                  <li key={activity.id}>
                    <ActivityCard activity={activity} onClick={() => onActivityClick(activity)} />
                  </li>
                ))}
              </div>
            </ul>
          )
        })}
      </div>

      {/* Mobile: stacked list */}
      <div className="md:hidden space-y-4">
        {weekDates.map((date, i) => {
          const dayOfWeek = date.getDay()
          const dayActivities = activities
            .filter((a) => a.day_of_week === dayOfWeek)
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
          const today = isToday(date)

          return (
            <div key={i}>
              <h3
                aria-current={today ? 'date' : undefined}
                className={`text-sm font-semibold mb-2 ${today ? 'text-amber-700' : 'text-stone-700'}`}
              >
                {DAY_NAMES[dayOfWeek]} &middot; {formatDate(date)}
                {today && <span className="ml-2 text-xs font-normal text-amber-600">(Today)</span>}
              </h3>
              {dayActivities.length > 0 ? (
                <ul className="space-y-2">
                  {dayActivities.map((activity) => (
                    <li key={activity.id}>
                      <ActivityCard activity={activity} onClick={() => onActivityClick(activity)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-stone-400 pl-2">No activities</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
