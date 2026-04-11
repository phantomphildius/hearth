import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<Element | null>(null)
  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      triggerRef.current = document.activeElement
      dialog.showModal()
    } else {
      dialog.close()
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
      triggerRef.current = null
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      onClick={(e) => { if (e.target === dialogRef.current) onClose() }}
      // Keyboard (Escape) is handled natively by the <dialog> cancel event above
      className="backdrop:bg-black/50 bg-transparent p-0 m-auto"
    >
      <div className={`w-full ${sizeClasses[size]} bg-white rounded-xl shadow-xl p-4 sm:p-6 motion-safe:transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <h2 id={titleId} className="text-lg font-semibold text-stone-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 rounded focus:outline-none focus:ring-2 focus:ring-stone-400"
            aria-label="Close dialog"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
