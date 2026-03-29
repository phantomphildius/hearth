import { useEffect, useRef } from 'react'
import Modal from './Modal'
import Button from '../form/Button'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
}

export default function ConfirmDialog({ open, onConfirm, onCancel, title, message, confirmLabel = 'Confirm', variant = 'default' }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 0)
    }
  }, [open])

  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-stone-600 mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
        >
          Cancel
        </button>
        <Button
          onClick={onConfirm}
          variant={variant === 'danger' ? 'danger' : 'primary'}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
