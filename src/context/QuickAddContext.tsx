import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { todayISO } from '@/lib/utils'

interface QuickAddContextValue {
  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  lastAddedAt: number
  notifyAdded: () => void
  /** Data (YYYY-MM-DD) a cui il pulsante rapido "+" aggiunge i nuovi elementi. Di norma oggi, ma segue il giorno selezionato nella Home se diverso. */
  targetDate: string
  setTargetDate: (date: string) => void
}

const QuickAddContext = createContext<QuickAddContextValue | undefined>(undefined)

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lastAddedAt, setLastAddedAt] = useState(0)
  const [targetDate, setTargetDate] = useState(todayISO())

  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const notifyAdded = useCallback(() => setLastAddedAt(Date.now()), [])

  return (
    <QuickAddContext.Provider value={{ menuOpen, openMenu, closeMenu, lastAddedAt, notifyAdded, targetDate, setTargetDate }}>
      {children}
    </QuickAddContext.Provider>
  )
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext)
  if (!ctx) throw new Error('useQuickAdd deve essere usato dentro QuickAddProvider')
  return ctx
}
