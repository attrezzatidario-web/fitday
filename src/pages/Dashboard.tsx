import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Bell, Scale, Droplets, Dumbbell, Utensils, Beef, Wheat, Flame } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useQuickAdd } from '@/context/QuickAddContext'
import { useFoodEntries } from '@/hooks/useFoodEntries'
import { useWaterEntries } from '@/hooks/useWaterEntries'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { MetricCard } from '@/components/MetricCard'
import { DateSelector } from '@/components/DateSelector'
import { DailyTimeline } from '@/components/DailyTimeline'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatNumber, greetingForHour, todayISO } from '@/lib/utils'

const CALORIES_GOAL = 2200
const WATER_GOAL_ML = 2000

export default function Dashboard() {
  const { profile } = useAuth()
  const { lastAddedAt } = useQuickAdd()
  const location = useLocation()
  const navigate = useNavigate()
  const initialDate = (location.state as { date?: string } | null)?.date
  const [selectedDate, setSelectedDate] = useState(() => (initialDate ? new Date(`${initialDate}T00:00:00`) : new Date()))
  const dateISO = format(selectedDate, 'yyyy-MM-dd')
  const isToday = dateISO === todayISO()

  const { entries: foodEntries, totals: foodTotals, loading: foodLoading, reload: reloadFood } = useFoodEntries(dateISO)
  const { entries: waterEntries, totalMl: waterTotal, loading: waterLoading, reload: reloadWater } = useWaterEntries(dateISO)
  const { workouts, loading: workoutsLoading, reload: reloadWorkouts } = useWorkouts(dateISO)
  const { measurements, reload: reloadMeasurements } = useBodyMeasurements(60)

  // Ricarica i dati quando viene aggiunto qualcosa tramite il pulsante rapido globale (riferito a "oggi")
  useEffect(() => {
    if (lastAddedAt > 0 && isToday) {
      reloadFood()
      reloadWater()
      reloadWorkouts()
      reloadMeasurements()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAddedAt])

  const latestWeight = useMemo(() => {
    const forDate = measurements.find((m) => m.measured_date === dateISO && m.weight_kg)
    if (forDate?.weight_kg) return forDate.weight_kg
    const mostRecent = measurements.find((m) => m.weight_kg)
    return mostRecent?.weight_kg ?? null
  }, [measurements, dateISO])

  const isLoading = foodLoading || waterLoading || workoutsLoading

  return (
    <div className="space-y-6 pb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-base-text">
            {greetingForHour(new Date().getHours())}
            {profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </p>
          <p className="text-sm text-base-muted capitalize">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Notifiche" className="w-9 h-9 rounded-full bg-base-card2 flex items-center justify-center">
            <Bell size={16} />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-steps to-stand flex items-center justify-center text-xs font-bold text-base-invertfg">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </div>

      <DateSelector date={selectedDate} onChange={setSelectedDate} />

      {/* PESO */}
      <button onClick={() => navigate('/body')} className="fd-card w-full flex items-center justify-between active:scale-[0.99] transition">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-steps/15 flex items-center justify-center">
            <Scale size={18} className="text-steps" />
          </div>
          <div className="text-left">
            <p className="fd-label">Peso</p>
            <p className="text-xl font-bold tabular-nums text-base-text">
              {latestWeight != null ? formatNumber(latestWeight, 1) : '—'}
              <span className="text-sm font-medium text-base-muted ml-1">kg</span>
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-base-muted">Registra →</span>
      </button>

      {/* ALIMENTAZIONE */}
      {foodLoading ? (
        <CardSkeleton />
      ) : (
        <button onClick={() => navigate('/nutrition')} className="fd-card w-full text-left active:scale-[0.99] transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Utensils size={15} className="text-accent-yellow" />
              <p className="font-semibold text-[15px] text-base-text">Alimentazione</p>
            </div>
            <span className="text-sm font-bold tabular-nums text-base-text">
              {formatNumber(foodTotals.calories)} <span className="text-base-muted font-medium">/ {formatNumber(CALORIES_GOAL)} kcal</span>
            </span>
          </div>
          <div className="h-1.5 bg-base-card2 rounded-pill overflow-hidden mb-4">
            <div
              className="h-full rounded-pill bg-accent-yellow transition-all duration-700 ease-out"
              style={{ width: `${Math.min((foodTotals.calories / CALORIES_GOAL) * 100, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroStat icon={Beef} label="Proteine" value={foodTotals.protein} color="#FF375F" />
            <MacroStat icon={Wheat} label="Carboidrati" value={foodTotals.carbs} color="#FF9F0A" />
            <MacroStat icon={Flame} label="Grassi" value={foodTotals.fat} color="#B983FF" />
          </div>
        </button>
      )}

      {/* ACQUA + ALLENAMENTO */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Droplets} label="Acqua" value={waterTotal} unit="ml" color="#0AF1F2" onClick={() => navigate('/water')} />
        <MetricCard icon={Dumbbell} label="Allenamento" value={workouts.length} unit={workouts.length === 1 ? 'sessione' : 'sessioni'} color="#A6FF00" onClick={() => navigate('/workouts')} />
      </div>
      {waterTotal < WATER_GOAL_ML && !waterLoading && (
        <p className="text-xs text-base-muted -mt-3 px-1">Obiettivo acqua: {formatNumber(WATER_GOAL_ML)} ml</p>
      )}

      {/* TIMELINE */}
      <div>
        <h2 className="font-semibold text-[15px] mb-3 text-base-text">Cronologia giornaliera</h2>
        {isLoading ? (
          <div className="space-y-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <DailyTimeline foodEntries={foodEntries} workouts={workouts} waterEntries={waterEntries} />
        )}
      </div>
    </div>
  )
}

function MacroStat({ icon: Icon, label, value, color }: { icon: typeof Beef; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} style={{ color }} />
      <div>
        <p className="text-[10px] text-base-muted leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-base-text">{formatNumber(value)}g</p>
      </div>
    </div>
  )
}
