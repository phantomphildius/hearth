import type { CalendarEntry } from '../../types'

interface ActivityCardProps {
  entry: CalendarEntry
  onClick: () => void
}

export default function ActivityCard({ entry, onClick }: ActivityCardProps) {
  const cardClass =
    entry.kind === 'projected'
      ? 'border-stone-200 border-dashed border-l-amber-300 opacity-60 hover:opacity-80'
      : entry.kind === 'cancelled'
        ? 'border-stone-200 border-l-stone-300 opacity-50 hover:opacity-70'
        : 'border-stone-200 border-l-amber-500 hover:shadow-sm'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white rounded-lg border border-l-4 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 motion-safe:transition-shadow ${cardClass}`}
    >
      <p className={`text-sm font-medium truncate ${entry.kind === 'cancelled' ? 'line-through text-stone-400' : 'text-stone-800'}`}>
        {entry.name}
      </p>
      <p className="text-xs text-stone-500 mt-0.5">
        {entry.start_time} &ndash; {entry.end_time}
      </p>
      {entry.children.length > 0 && (
        <p className="text-xs text-stone-500 mt-1">
          {entry.children.map((c) => c.first_name).join(', ')}
        </p>
      )}
    </button>
  )
}
