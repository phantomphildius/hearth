import { router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import ActivityForm from '../../components/activity/ActivityForm'
import Button from '../../components/form/Button'
import ConfirmDialog from '../../components/feedback/ConfirmDialog'
import { useState } from 'react'
import type { ActivityEditPageProps } from '../../types'

export default function Edit({ household, activity, children, errors }: ActivityEditPageProps) {
  const [showDelete, setShowDelete] = useState(false)

  const handleDelete = () => {
    router.delete(`/households/${household.id}/activities/${activity.id}`)
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-800">Edit Activity</h1>
          <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
            Delete
          </Button>
        </div>

        <ActivityForm
          activity={activity}
          householdId={household.id}
          children={children}
          errors={errors}
          onCancel={() => router.get(`/households/${household.id}/activities`)}
        />

        <ConfirmDialog
          open={showDelete}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          title="Delete Activity"
          message={`Are you sure you want to delete "${activity.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      </div>
    </AppLayout>
  )
}
