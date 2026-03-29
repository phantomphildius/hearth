import { useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import Input from '../../components/form/Input'
import Button from '../../components/form/Button'
import type { HouseholdNewPageProps } from '../../types'

export default function New({ errors }: HouseholdNewPageProps) {
  const { data, setData, post, processing } = useForm({ name: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/households')
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-stone-800">Create Your Household</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Household Name"
            name="household[name]"
            value={data.name}
            onChange={(value) => setData('name', value)}
            error={errors?.name?.[0]}
            required
            autoFocus
            placeholder="e.g. The Smith Family"
          />
          <Button type="submit" loading={processing} fullWidth>
            Create Household
          </Button>
        </form>
      </div>
    </AppLayout>
  )
}
