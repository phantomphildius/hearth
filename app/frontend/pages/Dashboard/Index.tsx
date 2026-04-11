import { Link } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import type { SharedProps } from '../../types'

interface DashboardIndexProps extends SharedProps {
  household: { id: number; name: string }
}

export default function Index({ household }: DashboardIndexProps) {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-stone-800">Today</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/households/${household.id}/activities`}
            className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 motion-safe:transition-shadow"
          >
            <h2 className="text-lg font-semibold text-stone-800">Activities</h2>
            <p className="mt-1 text-sm text-stone-500">View the weekly schedule</p>
          </Link>

          <div className="bg-white rounded-xl border border-stone-200 border-dashed p-6 opacity-50">
            <h2 className="text-lg font-semibold text-stone-800">Meals</h2>
            <p className="mt-1 text-sm text-stone-500">Menu planning &amp; shopping — coming soon</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
