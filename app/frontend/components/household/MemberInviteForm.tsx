import { useForm } from '@inertiajs/react'
import { useEffect } from 'react'
import Input from '../form/Input'
import Button from '../form/Button'

interface MemberInviteFormProps {
  householdId: number
}

export default function MemberInviteForm({ householdId }: MemberInviteFormProps) {
  const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({ email: '' })

  useEffect(() => {
    if (wasSuccessful) reset()
  }, [wasSuccessful, reset])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(`/households/${householdId}/household_members`, { preserveScroll: true })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <Input
          label="Invite by email"
          name="email"
          type="email"
          value={data.email}
          onChange={(value) => setData('email', value)}
          error={errors.email}
          placeholder="member@example.com"
          required
        />
      </div>
      <Button type="submit" loading={processing} size="md">
        Invite
      </Button>
    </form>
  )
}
