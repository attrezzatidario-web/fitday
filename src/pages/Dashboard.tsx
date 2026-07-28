import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  Footprints, MapPin, Flame, Dumbbell, Droplets, Beef, Wheat,
  CircleDot, Scale, Wallet, Bell, Moon, ListChecks
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useQuickAdd } from '@/context/QuickAddContext'
import { useDailyActivity } from '@/hooks/useDailyActivity'
import { useFoodEntries } from '@/hooks/useFoodEntries'
import { useWaterEntries } from '@/hooks/useWaterEntries'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { useSleepEntries } from '@/hooks/useSleepEntries'
import { useHabits } from '@/hooks/useHabits'
import { ActivityRings } from '@/components/ActivityRings'
import { MetricCard } from '@/components/MetricCard'
import { DateSelector } from '@/components/DateSelector'
import { DailyTimeline } from '@/components/DailyTimeline'
import { InsightPanel } from '@/components/InsightCard'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import { generateDailyInsights } from '@/lib/insights'
import { formatNumber, greetingForHour, todayISO } from '@/lib/utils'

export default function Dashboard() {
  const { profile } = useAuth()
  const { lastAddedAt } = useQuickAdd()
  const location = useLocation()
  const navigate = useNavigate()
  const initialDate = (location.state as { date?: string } | null)?.date
  const [selectedDate, setSelectedDate] = useState(() => (initialDate ? new Date(`${initialDate}T00:00:00`) : new Date()))
  const dateISO = format(selectedDate, 'yyyy-MM-dd')
  const isToday = dateISO === todayISO()

  const { data: activity, loading: activityLoading, reload: reloadActivity } = useDailyActivity(dateISO)
  const { entries: foodEntries, totals: foodTotals, loading: foodLoading, reload: reloadFood } = useFoodEntries(dateISO)
  const { entries: waterEntries, totalMl: waterTotal, loading: waterLoading, reload: reloadWater } = useWaterEntries(dateISO)
  const { workouts, loading: workoutsLoading, reload: reloadWorkouts } = useWorkouts(dateISO)
  const { measurements, reload: reloadMeasurements } = useBodyMeasurements(60)
  const { entries: sleepEntries, avgHours: avgSleepHours } = useSleepEntries(14)
  const { habits, isCompletedToday } = useHabits()

  const sleepForDay = sleepEntries.find((s) => s.sleep_date === dateISO)
  const habitsCompletedToday = habits.filter((h) => isCompletedToday(h.id)).length

  // Ricarica i dati quando viene aggiunto qualcosa tramite il pulsante rapido globale (riferito a "oggi")
  useEffect(() => {
    if (lastAddedAt > 0 && isToday) {
      reloadActivity()
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

  const workoutCalories = workouts.reduce((sum, w) => sum + (w.calories ?? 0), 0)
  const totalCaloriesOut = activity.active_calories + activity.resting_calories + workoutCalories
  const calorieBalance = foodTotals.calories - totalCaloriesOut

  const insights = useMemo(
    () =>
      generateDailyInsights({
        moveValue: activity.active_calories,
        moveGoal: activity.move_goal,
        exerciseValue: activity.exercise_minutes,
        exerciseGoal: activity.exercise_goal,
        standValue: activity.stand_hours,
        standGoal: activity.stand_goal,
        steps: activity.steps,
        stepsGoal: activity.steps_goal,
        waterMl: waterTotal,
        waterGoalMl: 2000,
        caloriesIn: foodTotals.calories,
        caloriesOut: totalCaloriesOut,
        proteinG: foodTotals.protein,
        proteinGoalG: 120,
        sleepHours: sleepForDay ? sleepForDay.duration_minutes / 60 : null,
        avgSleepHours: avgSleepHours > 0 ? avgSleepHours : null,
        habitsCompleted: habitsCompletedToday,
        habitsTotal: habits.length
      }),
    [activity, waterTotal, foodTotals, totalCaloriesOut, sleepForDay, avgSleepHours, habitsCompletedToday, habits.length]
  )

  const isLoading = activityLoading || foodLoading || waterLoading || workoutsLoading

  return (
    <div className="space-y-6 pb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">
            {greetingForHour(new Date().getHours())}
            {profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </p>
          <p className="text-sm text-base-muted capitalize">{format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Notifiche" className="w-9 h-9 rounded-full bg-base-card2 flex items-center justify-center">
            <Bell size={16} />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-move via-exercise to-stand flex items-center justify-center text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </div>

      <DateSelector date={selectedDate} onChange={setSelectedDate} />

      {/* ACTIVITY RINGS */}
      {activityLoading ? (
        <CardSkeleton />
      ) : (
        <div className="fd-card flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <ActivityRings
            move={{ value: activity.active_calories, goal: activity.move_goal }}
            exercise={{ value: activity.exercise_minutes, goal: activity.exercise_goal }}
            stand={{ value: activity.stand_hours, goal: activity.stand_goal }}
            size={180}
            onRingClick={() => navigate('/activity')}
          />
          <div className="flex-1 w-full space-y-3">
            <RingRow label="Movimento" color="#FA114F" value={activity.active_calories} goal={activity.move_goal} unit="KCAL" />
            <RingRow label="Esercizio" color="#A6FF00" value={activity.exercise_minutes} goal={activity.exercise_goal} unit="MIN" />
            <RingRow label="In piedi" color="#0AF1F2" value={activity.stand_hours} goal={activity.stand_goal} unit="ORE" />
          </div>
        </div>
      )}

      {/* METRIC GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Footprints} label="Passi" value={activity.steps} color="#B983FF" onClick={() => navigate('/activity')} />
        <MetricCard icon={MapPin} label="Distanza" value={activity.distance_km} unit="km" decimals={2} color="#0A84FF" onClick={() => navigate('/activity')} />
        <MetricCard icon={Flame} label="Calorie attive" value={activity.active_calories} unit="kcal" color="#FA114F" onClick={() => navigate('/activity')} />
        <MetricCard icon={Flame} label="Calorie totali" value={totalCaloriesOut} unit="kcal" color="#FF9F0A" onClick={() => navigate('/activity')} />
        <MetricCard icon={Dumbbell} label="Allenamento" value={workouts.length} unit={workouts.length === 1 ? 'sessione' : 'sessioni'} color="#A6FF00" onClick={() => navigate('/workouts')} />
        <MetricCard icon={Droplets} label="Acqua" value={waterTotal} unit="ml" color="#0AF1F2" onClick={() => navigate('/water')} />
        <MetricCard icon={CircleDot} label="Calorie assunte" value={foodTotals.calories} unit="kcal" color="#FFD60A" onClick={() => navigate('/nutrition')} />
        <MetricCard icon={Beef} label="Proteine" value={foodTotals.protein} unit="g" color="#FF375F" onClick={() => navigate('/nutrition')} />
        <MetricCard icon={Wheat} label="Carboidrati" value={foodTotals.carbs} unit="g" color="#FF9F0A" onClick={() => navigate('/nutrition')} />
        <MetricCard icon={Flame} label="Grassi" value={foodTotals.fat} unit="g" color="#B983FF" onClick={() => navigate('/nutrition')} />
        <MetricCard icon={Scale} label="Peso" value={latestWeight ?? 0} unit="kg" decimals={1} color="#B983FF" onClick={() => navigate('/body')} />
        <MetricCard icon={Wallet} label="Bilancio calorico" value={calorieBalance} unit="kcal" color={calorieBalance > 0 ? '#FA114F' : '#A6FF00'} />
        <MetricCard icon={Moon} label="Sonno" value={sleepForDay ? sleepForDay.duration_minutes / 60 : 0} unit="h" decimals={1} color="#64D2FF" onClick={() => navigate('/sleep')} />
        <MetricCard icon={ListChecks} label="Abitudini" value={habitsCompletedToday} unit={`/ ${habits.length}`} color="#A6FF00" onClick={() => navigate('/habits')} />
      </div>

      {/* INSIGHTS */}
      <InsightPanel insights={insights} />

      {/* TIMELINE */}
      <div>
        <h2 className="font-semibold text-[15px] mb-3">Cronologia giornaliera</h2>
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

function RingRow({ label, color, value, goal, unit }: { label: string; color: string; value: number; goal: number; unit: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-white/80">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {formatNumber(value)}/{formatNumber(goal)} <span className="text-white/50 font-medium">{unit}</span>
      </span>
    </div>
  )
}
