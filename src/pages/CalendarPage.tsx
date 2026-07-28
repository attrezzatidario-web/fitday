import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Dumbbell, Utensils, Moon, Scale } from 'lucide-react'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
  const navigate = useNavigate()
  const [monthDate, setMonthDate] = useState(new Date())
  const { summaries, loading } = useCalendarMonth(monthDate)
  const [selected, setSelected] = useState<Date | null>(null)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [monthDate])

  const selectedSummary = selected ? summaries[format(selected, 'yyyy-MM-dd')] : null

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-2xl font-bold">Calendario</h1>

      <div className="fd-card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonthDate((d) => subMonths(d, 1))} aria-label="Mese precedente" className="w-8 h-8 rounded-full bg-base-card2 flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-semibold text-[15px] capitalize">{format(monthDate, 'MMMM yyyy', { locale: it })}</h2>
          <button onClick={() => setMonthDate((d) => addMonths(d, 1))} aria-label="Mese successivo" className="w-8 h-8 rounded-full bg-base-card2 flex items-center justify-center">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center text-[11px] text-base-muted font-medium">{d}</div>
          ))}
        </div>

        <div className={cn('grid grid-cols-7 gap-1', loading && 'opacity-50')}>
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const summary = summaries[dateKey]
            const inMonth = isSameMonth(day, monthDate)
            const isSelected = selected && isSameDay(day, selected)
            const avgPct = summary ? Math.round((summary.movePct + summary.exercisePct + summary.standPct) / 3) : 0

            return (
              <button
                key={dateKey}
                onClick={() => setSelected(day)}
                onDoubleClick={() => navigate('/', { state: { date: dateKey } })}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs relative',
                  inMonth ? 'text-base-text' : 'text-base-muted/40',
                  isSelected ? 'bg-base-invert text-base-invertfg font-bold' : 'bg-base-card2/60',
                  isToday(day) && !isSelected && 'ring-1 ring-stand'
                )}
              >
                <span>{format(day, 'd')}</span>
                {summary && avgPct > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? '#000' : avgPct >= 100 ? '#A6FF00' : avgPct >= 50 ? '#FF9F0A' : '#FA114F' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <div className="fd-card animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[15px] capitalize">{format(selected, "EEEE d MMMM", { locale: it })}</h3>
            <button onClick={() => navigate('/', { state: { date: format(selected, 'yyyy-MM-dd') } })} className="text-xs font-semibold text-stand">
              Apri giornata →
            </button>
          </div>
          {!selectedSummary ? (
            <p className="text-sm text-base-muted">Nessun dato registrato in questo giorno.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <SummaryStat icon={Dumbbell} label="Allenamenti" value={selectedSummary.workoutsCount} color="#A6FF00" />
              <SummaryStat icon={Utensils} label="Pasti registrati" value={selectedSummary.mealsCount} color="#FF9F0A" />
              <SummaryStat icon={Scale} label="Peso registrato" value={selectedSummary.weightLogged ? 'Sì' : 'No'} color="#B983FF" />
              <SummaryStat icon={Moon} label="Sonno registrato" value={selectedSummary.sleepLogged ? 'Sì' : 'No'} color="#0AF1F2" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryStat({ icon: Icon, label, value, color }: { icon: typeof Dumbbell; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}26` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <p className="text-[11px] text-base-muted">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}
