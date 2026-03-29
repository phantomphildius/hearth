import { router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import ActivityForm from '../../components/activity/ActivityForm'
import type { ActivityNewPageProps } from '../../types'

export default function New({ household, children, errors }: ActivityNewPageProps) {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-stone-800">New Activity</h1>
        <ActivityForm
          householdId={household.id}
          children={children}
          errors={errors}
          onCancel={() => router.get(`/households/${household.id}/activities`)}
        />
      </div>
    </AppLayout>
  )
}
