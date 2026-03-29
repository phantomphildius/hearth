interface InputProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean
}

export default function Input({ label, name, type = 'text', value, onChange, error, placeholder, required, disabled, autoFocus }: InputProps) {
  const errorId = `${name}-error`

  return (
    <div>
      <div className="flex items-baseline gap-0.5">
        <label htmlFor={name} className="block text-sm font-medium text-stone-700">
          {label}
        </label>
        {required && <span className="text-red-600 text-sm" aria-hidden="true">*</span>}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required || undefined}
        className={`mt-1 block w-full px-3 py-2 text-sm bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 ${
          error ? 'border-red-500' : 'border-stone-300'
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
