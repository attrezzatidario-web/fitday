import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Footprints, MapPin, Flame, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { ActivityRings } from '@/components/ActivityRings'
import { MetricCard } from '@/components/MetricCard'
import { DateSelector } from '@/components/DateSelector'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import { useDailyActivity } from '@/hooks/useDailyActivity'
import { useActivityHistory } from '@/hooks/useActivityHistory'
import { formatNumber } from '@/lib/utils'

export default function ActivityPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateISO = format(selectedDate, 'yyyy-MM-dd')

  const { data: activity, loading } = useDailyActivity(dateISO)
  const { history, loading: historyLoading } = useActivityHistory(14)

  const yesterday = useMemo(() => {
    const idx = history.findIndex((h) => h.activity_date === dateISO)
    return idx > 0 ? history[idx - 1] : null
  }, [history, dateISO])

  const weeklyAvgSteps = useMemo(() => {
    const last7 = history.slice(-7)
    if (last7.length === 0) return 0
    return last7.reduce((sum, h) => sum + h.steps, 0) / last7.length
  }, [history])

  const chartData = history.map((h) => ({
    date: format(new Date(h.activity_date), 'd MMM', { locale: it }),
    passi: h.steps,
    calorie: Math.round(h.active_calories)
  }))

  const stepsDiffVsYesterday = yesterday ? activity.steps - yesterday.steps : null
  const stepsDiffVsAvg = activity.steps - weeklyAvgSteps

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-base-text">Attività</h1>
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="fd-card flex justify-center">
          <ActivityRings
            move={{ value: activity.active_calories, goal: activity.move_goal }}
            exercise={{ value: activity.exercise_minutes, goal: activity.exercise_goal }}
            stand={{ value: activity.stand_hours, goal: activity.stand_goal }}
            size={200}
          />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Footprints} label="Passi" value={activity.steps} color="#B983FF" />
        <MetricCard icon={MapPin} label="Distanza" value={activity.distance_km} unit="km" decimals={2} color="#0A84FF" />
        <MetricCard icon={Flame} label="Calorie attive" value={activity.active_calories} unit="kcal" color="#FA114F" />
        <MetricCard icon={Flame} label="Calorie a riposo" value={activity.resting_calories} unit="kcal" color="#FF9F0A" />
      </div>

      {/* CONFRONTI */}
      <div className="grid grid-cols-2 gap-3">
        <div className="fd-card">
          <p className="fd-label mb-2">Vs. giorno precedente</p>
          {stepsDiffVsYesterday === null ? (
            <p className="text-sm text-base-muted">Nessun dato</p>
          ) : (
            <ComparisonRow diff={stepsDiffVsYesterday} unit="passi" />
          )}
        </div>
        <div className="fd-card">
          <p className="fd-label mb-2">Vs. media settimanale</p>
          <ComparisonRow diff={Math.round(stepsDiffVsAvg)} unit="passi" />
        </div>
      </div>

      {/* GRAFICO STORICO */}
      <div className="fd-card">
        <h2 className="font-semibold text-[15px] mb-4 text-base-text">Passi — ultimi 14 giorni</h2>
        {historyLoading ? (
          <div className="h-48 bg-base-card2 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <p className="text-sm text-base-muted py-8 text-center">Non ci sono ancora dati sufficienti.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis dataKey="date" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#8E8E93' }}
              />
              <Bar dataKey="passi" fill="#B983FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="fd-card">
        <h2 className="font-semibold text-[15px] mb-4 text-base-text">Calorie attive — ultimi 14 giorni</h2>
        {historyLoading ? (
          <div className="h-48 bg-base-card2 rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <p className="text-sm text-base-muted py-8 text-center">Non ci sono ancora dati sufficienti.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis dataKey="date" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#8E8E93' }}
              />
              <Bar dataKey="calorie" fill="#FA114F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function ComparisonRow({ diff, unit }: { diff: number; unit: string }) {
  const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus
  const color = diff > 0 ? 'text-exercise' : diff < 0 ? 'text-move' : 'text-base-muted'
  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      <Icon size={16} />
      <span className="text-lg font-bold tabular-nums text-base-text">{formatNumber(Math.abs(diff))}</span>
      <span className="text-xs text-base-muted">{unit}</span>
    </div>
  )
}
