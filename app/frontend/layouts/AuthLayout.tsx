import { usePage } from '@inertiajs/react'
import type { SharedProps } from '../types'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { flash } = usePage<SharedProps>().props

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 px-4">
      {flash.alert && (
        <div role="alert" aria-live="assertive" className="w-full max-w-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
          {flash.alert}
        </div>
      )}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-stone-800">Hearth</h1>
          <p className="mt-2 text-sm text-stone-500">Your family's home base</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
