import { useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import Input from '../../components/form/Input'
import Button from '../../components/form/Button'
import MemberList from '../../components/household/MemberList'
import MemberInviteForm from '../../components/household/MemberInviteForm'
import ChildList from '../../components/household/ChildList'
import ChildForm from '../../components/household/ChildForm'
import type { HouseholdSettingsPageProps, Child } from '../../types'

export default function Settings({ household, members, children, errors }: HouseholdSettingsPageProps) {
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [showAddChild, setShowAddChild] = useState(false)

  const nameForm = useForm({ name: household.name })

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nameForm.patch(`/households/${household.id}`, { preserveScroll: true })
  }

  const handleRemoveMember = (userId: number) => {
    router.delete(`/households/${household.id}/household_members/${userId}`, { preserveScroll: true })
  }

  const handleRemoveChild = (childId: number) => {
    router.delete(`/households/${household.id}/children/${childId}`, { preserveScroll: true })
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-stone-800">Settings</h1>

        {/* Household Name */}
        <section className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Household Name</h2>
          <form onSubmit={handleNameSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Name"
                name="household[name]"
                value={nameForm.data.name}
                onChange={(value) => nameForm.setData('name', value)}
                error={errors?.name?.[0]}
                required
              />
            </div>
            <Button type="submit" loading={nameForm.processing}>
              Save
            </Button>
          </form>
        </section>

        {/* Members */}
        <section className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Members</h2>
          <MemberList
            members={members}
            householdId={household.id}
            onRemove={handleRemoveMember}
          />
          <div className="mt-4 pt-4 border-t border-stone-200">
            <MemberInviteForm householdId={household.id} />
          </div>
        </section>

        {/* Children */}
        <section className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Children</h2>
            {!showAddChild && !editingChild && (
              <Button size="sm" onClick={() => setShowAddChild(true)}>
                Add Child
              </Button>
            )}
          </div>

          <ChildList
            children={children}
            householdId={household.id}
            onEdit={(child) => {
              setEditingChild(child)
              setShowAddChild(false)
            }}
            onRemove={handleRemoveChild}
          />

          {(showAddChild || editingChild) && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <h3 className="text-base font-medium text-stone-700 mb-3">
                {editingChild ? `Edit ${editingChild.first_name}` : 'Add Child'}
              </h3>
              <ChildForm
                householdId={household.id}
                child={editingChild}
                onCancel={() => {
                  setEditingChild(null)
                  setShowAddChild(false)
                }}
              />
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
