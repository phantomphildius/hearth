import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import Input from '../form/Input'
import Select from '../form/Select'
import TimePicker from '../form/TimePicker'
import Button from '../form/Button'
import type { Activity, Child, ActivityFormData } from '../../types'

interface ActivityFormProps {
  activity?: Activity | null
  householdId: number
  children: Child[]
  errors?: Record<string, string[]>
  onCancel: () => void
}

const DAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
]

const RECURRENCE_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one_time', label: 'One time' },
]

export default function ActivityForm({ activity, householdId, children, errors: serverErrors, onCancel }: ActivityFormProps) {
  const isEdit = !!activity
  const today = new Date().toISOString().split('T')[0]
  const { data, setData, post, patch, processing, errors } = useForm<ActivityFormData>({
    name: activity?.name || '',
    day_of_week: activity?.day_of_week ?? null,
    start_time: activity?.start_time || '',
    end_time: activity?.end_time || '',
    recurrence: activity?.recurrence || 'weekly',
    starts_on: activity?.starts_on || '',
    biweekly_anchor_date: activity?.biweekly_anchor_date || today,
    notes: activity?.notes || '',
    child_ids: activity?.children?.map((c) => c.id) || [],
  })

  const [clientError, setClientError] = useState<string | null>(null)

  const allErrors = { ...errors, ...serverErrors }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setClientError(null)

    if (!data.name.trim()) {
      setClientError('Activity name is required')
      return
    }
    if (!data.start_time) {
      setClientError('Start time is required')
      return
    }
    if (!data.end_time) {
      setClientError('End time is required')
      return
    }
    if (data.recurrence !== 'one_time' && data.recurrence !== 'monthly' && data.day_of_week === null) {
      setClientError('Day of week is required for recurring activities')
      return
    }
    if (data.recurrence === 'one_time' && !data.starts_on) {
      setClientError('Date is required for one-time activities')
      return
    }
    if (data.recurrence === 'monthly' && !data.starts_on) {
      setClientError('Starting date is required for monthly activities')
      return
    }
    if (data.recurrence === 'biweekly' && !data.biweekly_anchor_date) {
      setClientError('Starting week is required for biweekly activities')
      return
    }
    if (data.start_time && data.end_time && data.end_time <= data.start_time) {
      setClientError('End time must be after start time')
      return
    }

    if (isEdit) {
      patch(`/households/${householdId}/activities/${activity!.id}`)
    } else {
      post(`/households/${householdId}/activities`)
    }
  }

  const toggleChild = (childId: number) => {
    setData('child_ids', data.child_ids.includes(childId)
      ? data.child_ids.filter((id) => id !== childId)
      : [...data.child_ids, childId]
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Input
        label="Activity Name"
        name="activity[name]"
        value={data.name}
        onChange={(value) => setData('name', value)}
        error={allErrors.name?.[0]}
        required
        autoFocus
        placeholder="e.g. Soccer Practice"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.recurrence !== 'one_time' && data.recurrence !== 'monthly' && (
          <Select
            label="Day of Week"
            name="activity[day_of_week]"
            value={data.day_of_week?.toString() || ''}
            onChange={(value) => setData('day_of_week', value ? parseInt(value) : null)}
            options={DAY_OPTIONS}
            error={allErrors.day_of_week?.[0]}
            placeholder="Select day..."
            required
          />
        )}
        <Select
          label="Recurrence"
          name="activity[recurrence]"
          value={data.recurrence}
          onChange={(value) => setData('recurrence', value)}
          options={RECURRENCE_OPTIONS}
          error={allErrors.recurrence?.[0]}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TimePicker
          label="Start Time"
          name="activity[start_time]"
          value={data.start_time}
          onChange={(value) => setData('start_time', value)}
          error={allErrors.start_time?.[0]}
          required
        />
        <TimePicker
          label="End Time"
          name="activity[end_time]"
          value={data.end_time}
          onChange={(value) => setData('end_time', value)}
          error={allErrors.end_time?.[0]}
          required
        />
      </div>

      {(data.recurrence === 'one_time' || data.recurrence === 'monthly') && (
        <Input
          label={data.recurrence === 'monthly' ? 'Starting from (sets the day pattern)' : 'Date'}
          name="activity[starts_on]"
          type="date"
          value={data.starts_on}
          onChange={(value) => setData('starts_on', value)}
          error={allErrors.starts_on?.[0]}
          required
        />
      )}

      {data.recurrence === 'biweekly' && (
        <Input
          label="Starting week of"
          name="activity[biweekly_anchor_date]"
          type="date"
          value={data.biweekly_anchor_date}
          onChange={(value) => setData('biweekly_anchor_date', value)}
          error={allErrors.biweekly_anchor_date?.[0]}
          required
        />
      )}

      {children.length > 0 && (
        <fieldset>
          <legend className="block text-sm font-medium text-stone-700 mb-2">Assign Children</legend>
          <div className="space-y-2">
            {children.map((child) => (
              <label key={child.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.child_ids.includes(child.id)}
                  onChange={() => toggleChild(child.id)}
                  className="rounded border-stone-300 text-amber-700 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-700">{child.first_name}</span>
                <span className="text-xs text-stone-500">(age {child.age})</span>
              </label>
            ))}
          </div>
          {allErrors.child_ids && (
            <p className="mt-1 text-sm text-red-600">{allErrors.child_ids[0]}</p>
          )}
        </fieldset>
      )}

      <div>
        <label htmlFor="activity[notes]" className="block text-sm font-medium text-stone-700">Notes</label>
        <textarea
          id="activity[notes]"
          name="activity[notes]"
          value={data.notes}
          onChange={(e) => setData('notes', e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          placeholder="Optional notes..."
        />
        {allErrors.notes && (
          <p className="mt-1 text-sm text-red-600">{allErrors.notes[0]}</p>
        )}
      </div>

      {clientError && (
        <p role="alert" className="text-sm text-red-600">{clientError}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={processing}>
          {isEdit ? 'Update Activity' : 'Create Activity'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
