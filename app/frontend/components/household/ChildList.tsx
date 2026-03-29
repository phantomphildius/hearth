import { useState } from 'react'
import ConfirmDialog from '../feedback/ConfirmDialog'
import type { Child } from '../../types'

interface ChildListProps {
  children: Child[]
  householdId: number
  onEdit: (child: Child) => void
  onRemove: (childId: number) => void
}

export default function ChildList({ children, onEdit, onRemove }: ChildListProps) {
  const [confirmRemove, setConfirmRemove] = useState<Child | null>(null)

  if (children.length === 0) {
    return <p className="text-sm text-stone-500">No children added yet</p>
  }

  return (
    <div>
      <ul className="divide-y divide-stone-200">
        {children.map((child) => (
          <li key={child.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-stone-800">{child.first_name}</p>
              <p className="text-xs text-stone-500">Age {child.age} &middot; Born {child.date_of_birth}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(child)}
                className="text-sm text-stone-600 hover:text-stone-800 min-h-[44px] px-3 flex items-center"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmRemove(child)}
                className="text-sm text-red-600 hover:text-red-800 min-h-[44px] px-3 flex items-center"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmRemove !== null}
        onConfirm={() => {
          if (confirmRemove) onRemove(confirmRemove.id)
          setConfirmRemove(null)
        }}
        onCancel={() => setConfirmRemove(null)}
        title="Remove Child"
        message={`Are you sure you want to remove ${confirmRemove?.first_name}?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  )
}
