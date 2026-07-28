import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { addDays, format, isToday, isSameDay, subDays } from 'date-fns'
import { it } from 'date-fns/locale'

interface DateSelectorProps {
  date: Date
  onChange: (date: Date) => void
}

export function DateSelector({ date, onChange }: DateSelectorProps) {
  const label = isToday(date) ? 'Oggi' : format(date, "EEEE d MMMM", { locale: it })
  const canGoForward = !isSameDay(date, new Date()) && date < new Date()

  return (
    <div className="flex items-center gap-1.5">
      <button
        aria-label="Giorno precedente"
        onClick={() => onChange(subDays(date, 1))}
        className="w-8 h-8 rounded-full bg-base-card2 flex items-center justify-center active:scale-90 transition"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-card2 min-w-[140px] justify-center">
        <Calendar size={13} className="text-base-muted" />
        <span className="text-sm font-medium capitalize text-base-text">{label}</span>
      </div>
      <button
        aria-label="Giorno successivo"
        disabled={!canGoForward && !isToday(date)}
        onClick={() => onChange(addDays(date, 1))}
        className="w-8 h-8 rounded-full bg-base-card2 flex items-center justify-center active:scale-90 transition disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
