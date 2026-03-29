interface TimePickerProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export default function TimePicker({ label, name, value, onChange, error, required }: TimePickerProps) {
  const errorId = `${name}-error`

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required || undefined}
        className={`mt-1 block w-full px-3 py-2 text-sm bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
          error ? 'border-red-500' : 'border-stone-300'
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
