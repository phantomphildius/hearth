import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import WeeklyCalendar from '../../components/activity/WeeklyCalendar'
import Modal from '../../components/feedback/Modal'
import type { ActivitiesIndexPageProps, Activity } from '../../types'

function getMonday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default function Index({ household, activities }: ActivitiesIndexPageProps) {
  const [weekStart, setWeekStart] = useState(getMonday())
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const navigateWeek = (offset: number) => {
    const d = new Date(`${weekStart}T00:00:00`)
    d.setDate(d.getDate() + offset * 7)
    const newWeekStart = d.toISOString().split('T')[0]
    setWeekStart(newWeekStart)
    router.get(`/households/${household.id}/activities`, { week_start: newWeekStart }, { preserveState: true })
  }

  const goToday = () => {
    const today = getMonday()
    setWeekStart(today)
    router.get(`/households/${household.id}/activities`, {}, { preserveState: true })
  }

  const handleDelete = (activity: Activity) => {
    if (confirm(`Delete "${activity.name}"?`)) {
      router.delete(`/households/${household.id}/activities/${activity.id}`)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
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
            onClick={() => navigateWeek(-1)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            aria-label="Previous week"
          >
            &larr;
          </button>
          <button
            onClick={goToday}
            className="min-h-[44px] px-4 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            aria-label="Next week"
          >
            &rarr;
          </button>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Week of {new Date(`${weekStart}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <WeeklyCalendar
          activities={activities}
          weekStart={weekStart}
          onActivityClick={(activity) => setSelectedActivity(activity)}
        />

        {/* Activity detail modal */}
        <Modal
          open={selectedActivity !== null}
          onClose={() => setSelectedActivity(null)}
          title={selectedActivity?.name || ''}
          size="md"
        >
          {selectedActivity && (
            <div className="space-y-3">
              <div className="text-sm text-stone-600">
                <p>{selectedActivity.day_of_week_name} &middot; {selectedActivity.start_time} &ndash; {selectedActivity.end_time}</p>
                {selectedActivity.location_name && <p>{selectedActivity.location_name}</p>}
                {selectedActivity.address && <p className="text-stone-500">{selectedActivity.address}</p>}
                {selectedActivity.notes && <p className="mt-2 text-stone-500">{selectedActivity.notes}</p>}
              </div>
              {selectedActivity.children.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-1">Children</p>
                  <p className="text-sm text-stone-700">{selectedActivity.children.map((c) => c.first_name).join(', ')}</p>
                </div>
              )}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-200">
                <Link
                  href={`/households/${household.id}/activities/${selectedActivity.id}/edit`}
                  className="text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => { handleDelete(selectedActivity); setSelectedActivity(null) }}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  )
}
