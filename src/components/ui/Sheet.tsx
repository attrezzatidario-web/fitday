import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full md:max-w-md bg-base-surface md:bg-base-card rounded-t-[28px] md:rounded-card mt-auto md:mt-0 max-h-[88vh] md:max-h-[85vh] overflow-y-auto animate-sheet-up md:animate-pop border border-white/[0.06]"
      >
        <div className="sticky top-0 bg-base-surface md:bg-base-card px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.06] z-10">
          <div className="w-8 h-1 rounded-full bg-base-border absolute left-1/2 -translate-x-1/2 top-2 md:hidden" />
          <h2 className="font-semibold text-[16px] mt-2 md:mt-0 text-base-text">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="w-8 h-8 rounded-full bg-base-card2 flex items-center justify-center mt-2 md:mt-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
