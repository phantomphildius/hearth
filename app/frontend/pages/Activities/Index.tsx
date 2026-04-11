import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import WeeklyCalendar from '../../components/activity/WeeklyCalendar'
import Modal from '../../components/feedback/Modal'
import ConfirmDialog from '../../components/feedback/ConfirmDialog'
import type { ActivitiesIndexPageProps, Activity, CalendarEntry } from '../../types'

const RECURRENCE_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  one_time: 'One time',
}

function activityScheduleLabel(activity: Activity): string {
  const recurrence = RECURRENCE_LABELS[activity.recurrence] ?? activity.recurrence
  if (activity.recurrence === 'one_time') {
    return activity.starts_on ? `One time · ${activity.starts_on}` : 'One time'
  }
  return activity.day_of_week_name ? `${recurrence} · ${activity.day_of_week_name}s` : recurrence
}

export default function Index({ household, activities, calendar_entries, week_start }: ActivitiesIndexPageProps) {
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null)
  const [pendingDeleteSession, setPendingDeleteSession] = useState<CalendarEntry | null>(null)
  const [pendingDeleteActivity, setPendingDeleteActivity] = useState<Activity | null>(null)

  const navigateWeek = (offset: number) => {
    const d = new Date(`${week_start}T00:00:00`)
    d.setDate(d.getDate() + offset * 7)
    const newWeekStart = d.toISOString().split('T')[0]
    router.get(`/households/${household.id}/activities`, { week_start: newWeekStart }, { preserveState: false })
  }

  const goToday = () => {
    router.get(`/households/${household.id}/activities`, {}, { preserveState: false })
  }

  const sessionsPath = (activityId: number) =>
    `/households/${household.id}/activities/${activityId}/sessions`

  const handleConfirmSession = (entry: CalendarEntry) => {
    if (entry.kind !== 'projected') return
    router.post(sessionsPath(entry.activity_id), { scheduled_date: entry.scheduled_date, week_start })
  }

  const handleCancelOccurrence = (entry: CalendarEntry) => {
    if (entry.kind !== 'projected') return
    router.post(sessionsPath(entry.activity_id), { scheduled_date: entry.scheduled_date, status: 'cancelled', week_start })
  }

  const confirmDeleteSession = () => {
    if (!pendingDeleteSession || pendingDeleteSession.kind !== 'session') return
    const entry = pendingDeleteSession
    setPendingDeleteSession(null)
    router.delete(`${sessionsPath(entry.activity_id)}/${entry.session_id}`, { data: { week_start } })
  }

  const confirmDeleteActivity = () => {
    if (!pendingDeleteActivity) return
    const activity = pendingDeleteActivity
    setPendingDeleteActivity(null)
    router.delete(`/households/${household.id}/activities/${activity.id}`)
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-stone-800">Activities</h1>
          <Link
            href={`/households/${household.id}/activities/new`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 w-full sm:w-auto text-center"
          >
            Add Activity
          </Link>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigateWeek(-1)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            aria-label="Previous week"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={goToday}
            className="min-h-[44px] px-4 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => navigateWeek(1)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            aria-label="Next week"
          >
            &rarr;
          </button>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Week of {new Date(`${week_start}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <WeeklyCalendar
          entries={calendar_entries}
          weekStart={week_start}
          onEntryClick={(entry) => setSelectedEntry(entry)}
        />

        {/* Activity list */}
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">Recurring Activities</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-stone-500">No activities yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
              {activities.map((activity) => (
                <li key={activity.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-white hover:bg-stone-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{activity.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {activityScheduleLabel(activity)} &middot; {activity.start_time} &ndash; {activity.end_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      href={`/households/${household.id}/activities/${activity.id}/edit`}
                      className="text-sm font-medium text-amber-700 hover:text-amber-800"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteActivity(activity)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Entry detail modal */}
        <Modal
          open={selectedEntry !== null}
          onClose={() => setSelectedEntry(null)}
          title={selectedEntry?.name || ''}
          size="md"
        >
          {selectedEntry && (
            <div className="space-y-3">
              <div className="text-sm text-stone-600">
                <p>{selectedEntry.scheduled_date} &middot; {selectedEntry.start_time} &ndash; {selectedEntry.end_time}</p>
                {selectedEntry.kind === 'projected' && (
                  <p className="mt-1 text-xs text-stone-400 italic">Projected — not yet scheduled</p>
                )}
                {selectedEntry.kind === 'cancelled' && (
                  <p className="mt-1 text-xs text-red-400 italic">Cancelled</p>
                )}
                {selectedEntry.notes && <p className="mt-2 text-stone-500">{selectedEntry.notes}</p>}
              </div>
              {selectedEntry.children.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-1">Children</p>
                  <p className="text-sm text-stone-700">{selectedEntry.children.map((c) => c.first_name).join(', ')}</p>
                </div>
              )}
              {(selectedEntry.kind === 'projected' || selectedEntry.kind === 'session') && (
                <div className="flex items-center gap-3 pt-3 border-t border-stone-200">
                  {selectedEntry.kind === 'projected' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleConfirmSession(selectedEntry)}
                        className="text-sm font-medium text-amber-700 hover:text-amber-800"
                      >
                        Confirm session
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelOccurrence(selectedEntry)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Cancel occurrence
                      </button>
                    </>
                  )}
                  {selectedEntry.kind === 'session' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEntry(null)
                        setPendingDeleteSession(selectedEntry)
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Remove session
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        <ConfirmDialog
          open={pendingDeleteSession !== null}
          onConfirm={confirmDeleteSession}
          onCancel={() => setPendingDeleteSession(null)}
          title="Remove Session"
          message={`Remove this session of "${pendingDeleteSession?.name}"?`}
          confirmLabel="Remove"
          variant="danger"
        />

        <ConfirmDialog
          open={pendingDeleteActivity !== null}
          onConfirm={confirmDeleteActivity}
          onCancel={() => setPendingDeleteActivity(null)}
          title="Delete Activity"
          message={`Delete "${pendingDeleteActivity?.name}"? Future occurrences will stop. Past sessions are preserved.`}
          confirmLabel="Delete"
          variant="danger"
        />
      </div>
    </AppLayout>
  )
}
