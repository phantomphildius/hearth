import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import ConfirmDialog from '../feedback/ConfirmDialog'
import type { Member, SharedProps } from '../../types'

interface MemberListProps {
  members: Member[]
  householdId: number
  onRemove: (userId: number) => void
}

export default function MemberList({ members, onRemove }: MemberListProps) {
  const { auth } = usePage<SharedProps>().props
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null)

  return (
    <div>
      <ul className="divide-y divide-stone-200">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium text-stone-600">
                  {member.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-stone-800">{member.name}</p>
                <p className="text-xs text-stone-500">{member.email}</p>
              </div>
            </div>
            {member.id !== auth.user?.id && (
              <button
                onClick={() => setConfirmRemove(member)}
                className="text-sm text-red-600 hover:text-red-800 min-h-[44px] px-3 flex items-center"
              >
                Remove
              </button>
            )}
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
        title="Remove Member"
        message={`Are you sure you want to remove ${confirmRemove?.name} from this household?`}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  )
}
