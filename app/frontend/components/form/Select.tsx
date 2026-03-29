interface SelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export default function Select({ label, name, value, onChange, options, error, placeholder, required, disabled }: SelectProps) {
  const errorId = `${name}-error`

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required || undefined}
        className={`mt-1 block w-full px-3 py-2 text-sm bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 ${
          error ? 'border-red-500' : 'border-stone-300'
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
