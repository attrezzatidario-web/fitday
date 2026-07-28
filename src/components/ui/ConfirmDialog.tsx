import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Conferma',
  cancelLabel = 'Annulla',
  danger = true,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="fd-card w-full max-w-sm animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {danger && (
            <div className="w-9 h-9 rounded-full bg-move/15 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-move" />
            </div>
          )}
          <div>
            <h3 id="confirm-title" className="font-semibold text-[15px]">{title}</h3>
            {description && <p className="text-sm text-base-muted mt-1">{description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="fd-btn-ghost flex-1">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            className={danger
              ? 'flex-1 bg-move text-white font-semibold rounded-full py-3.5 text-[15px] active:scale-[0.98] transition'
              : 'fd-btn-primary flex-1'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
