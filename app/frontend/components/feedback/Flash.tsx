import { useState, useEffect } from 'react'

interface FlashProps {
  notice?: string
  alert?: string
}

export default function Flash({ notice, alert }: FlashProps) {
  const [visibleNotice, setVisibleNotice] = useState(notice)
  const [visibleAlert, setVisibleAlert] = useState(alert)

  useEffect(() => {
    setVisibleNotice(notice)
    if (notice) {
      const timer = setTimeout(() => setVisibleNotice(undefined), 5000)
      return () => clearTimeout(timer)
    }
  }, [notice])

  useEffect(() => {
    setVisibleAlert(alert)
    if (alert) {
      const timer = setTimeout(() => setVisibleAlert(undefined), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  return (
    <>
      {visibleNotice && (
        <div role="status" aria-live="polite" className="flex items-center justify-between bg-green-50 border-b border-green-200 px-4 sm:px-6 py-3 text-sm text-green-800 motion-safe:transition-opacity">
          <span>{visibleNotice}</span>
          <button onClick={() => setVisibleNotice(undefined)} className="ml-4 flex-shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-green-600 hover:text-green-800 rounded focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Dismiss notice">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
      {visibleAlert && (
        <div role="alert" aria-live="assertive" className="flex items-center justify-between bg-red-50 border-b border-red-200 px-4 sm:px-6 py-3 text-sm text-red-800 motion-safe:transition-opacity">
          <span>{visibleAlert}</span>
          <button onClick={() => setVisibleAlert(undefined)} className="ml-4 flex-shrink-0 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-red-600 hover:text-red-800 rounded focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Dismiss alert">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </>
  )
}
