import { useForm } from '@inertiajs/react'
import { useEffect } from 'react'
import Input from '../form/Input'
import DatePicker from '../form/DatePicker'
import Button from '../form/Button'
import type { Child } from '../../types'

interface ChildFormProps {
  householdId: number
  child?: Child | null
  onCancel: () => void
}

export default function ChildForm({ householdId, child, onCancel }: ChildFormProps) {
  const isEdit = !!child
  const { data, setData, post, patch, processing, errors, wasSuccessful } = useForm({
    first_name: child?.first_name || '',
    date_of_birth: child?.date_of_birth || '',
  })

  useEffect(() => {
    if (wasSuccessful) onCancel()
  }, [wasSuccessful, onCancel])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const options = { preserveScroll: true }

    if (isEdit) {
      patch(`/households/${householdId}/children/${child!.id}`, options)
    } else {
      post(`/households/${householdId}/children`, options)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="First Name"
        name="child[first_name]"
        value={data.first_name}
        onChange={(value) => setData('first_name', value)}
        error={errors.first_name}
        required
        autoFocus
      />
      <DatePicker
        label="Date of Birth"
        name="child[date_of_birth]"
        value={data.date_of_birth}
        onChange={(value) => setData('date_of_birth', value)}
        error={errors.date_of_birth}
        max={today}
        required
      />
      <div className="flex items-center gap-3">
        <Button type="submit" loading={processing}>
          {isEdit ? 'Update' : 'Add Child'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
