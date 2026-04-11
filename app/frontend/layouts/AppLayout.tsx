import { useState } from 'react'
import { usePage, Link, router } from '@inertiajs/react'
import Flash from '../components/feedback/Flash'
import ErrorBoundary from '../components/feedback/ErrorBoundary'
import type { SharedProps } from '../types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { auth, flash } = usePage<SharedProps>().props
  const householdId = auth.current_household_id
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    router.delete('/sign_out')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <nav aria-label="Main navigation" className="bg-white border-b border-stone-200">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-semibold text-stone-800">
                Hearth
              </Link>
              {/* Desktop nav links */}
              {householdId && (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    href={`/households/${householdId}/activities`}
                    className="text-sm font-medium text-stone-600 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-1 py-1"
                  >
                    Activities
                  </Link>
                  <Link
                    href={`/households/${householdId}/settings`}
                    className="text-sm font-medium text-stone-600 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded px-1 py-1"
                  >
                    Settings
                  </Link>
                </div>
              )}
            </div>

            {/* Right side: avatar + sign out (desktop) + hamburger (mobile) */}
            {auth.user && (
              <div className="flex items-center gap-3">
                {auth.user.avatar_url && (
                  <img
                    src={auth.user.avatar_url}
                    alt=""
                    aria-hidden="true"
                    className="w-8 h-8 rounded-full hidden sm:block"
                  />
                )}
                <span className="text-sm text-stone-600 hidden sm:block">{auth.user.name ?? auth.user.email}</span>
                {/* Desktop sign out */}
                <button
                  onClick={handleSignOut}
                  className="hidden sm:block text-sm text-stone-500 hover:text-stone-700 min-h-[44px] px-2 focus:outline-none focus:ring-2 focus:ring-stone-400 rounded"
                >
                  Sign out
                </button>
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-600 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && auth.user && (
          <div id="mobile-menu" className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
              {auth.user.avatar_url && (
                <img src={auth.user.avatar_url} alt="" aria-hidden="true" className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm font-medium text-stone-700">{auth.user.name ?? auth.user.email}</span>
            </div>
            {householdId && (
              <>
                <Link
                  href={`/households/${householdId}/activities`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-2 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Activities
                </Link>
                <Link
                  href={`/households/${householdId}/settings`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-2 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Settings
                </Link>
              </>
            )}
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-2 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg min-h-[44px] focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>

      <Flash notice={flash.notice} alert={flash.alert} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
}
