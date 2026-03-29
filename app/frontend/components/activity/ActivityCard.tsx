import type { Activity } from '../../types'

interface ActivityCardProps {
  activity: Activity
  onClick: () => void
}

export default function ActivityCard({ activity, onClick }: ActivityCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border border-stone-200 border-l-4 border-l-amber-500 p-3 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 motion-safe:transition-shadow"
    >
      <p className="text-sm font-medium text-stone-800 truncate">{activity.name}</p>
      <p className="text-xs text-stone-500 mt-0.5">
        {activity.start_time} &ndash; {activity.end_time}
      </p>
      {activity.location_name && (
        <p className="text-xs text-stone-500 truncate mt-0.5">{activity.location_name}</p>
      )}
      {activity.children.length > 0 && (
        <p className="text-xs text-stone-500 mt-1">
          {activity.children.map((c) => c.first_name).join(', ')}
        </p>
      )}
    </button>
  )
}
