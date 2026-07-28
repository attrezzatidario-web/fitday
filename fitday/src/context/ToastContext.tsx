import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'info'
interface ToastItem { id: number; kind: ToastKind; message: string }

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, kind, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm px-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'fd-card !p-3 flex items-center gap-2.5 animate-fade-up shadow-glow',
              t.kind === 'error' && 'border-move/40'
            )}
          >
            {t.kind === 'success' && <CheckCircle2 size={18} className="text-exercise shrink-0" />}
            {t.kind === 'error' && <XCircle size={18} className="text-move shrink-0" />}
            {t.kind === 'info' && <Info size={18} className="text-stand shrink-0" />}
            <p className="text-[13px] text-base-text/90 flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-base-muted hover:text-base-text shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve essere usato dentro ToastProvider')
  return ctx
}
