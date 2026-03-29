import { Link } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import type { HouseholdShowPageProps } from '../../types'

export default function Show({ household, members, children }: HouseholdShowPageProps) {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-stone-800">{household.name}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-1">Members</h2>
            <p className="text-3xl font-bold text-amber-700">{members.length}</p>
            <ul className="mt-4 space-y-3">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium text-stone-600">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-stone-700">{member.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-1">Children</h2>
            <p className="text-3xl font-bold text-amber-700">{children.length}</p>
            {children.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {children.map((child) => (
                  <li key={child.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-700">{child.first_name}</span>
                    <span className="text-stone-500">age {child.age}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-stone-500">No children added yet</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/households/${household.id}/activities`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-700 rounded-lg hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 w-full sm:w-auto"
          >
            Activities
          </Link>
          <Link
            href={`/households/${household.id}/settings`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 w-full sm:w-auto"
          >
            Settings
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
