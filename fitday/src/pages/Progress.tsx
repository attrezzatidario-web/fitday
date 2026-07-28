import { useMemo, useState } from 'react'
import { format, subDays, isAfter } from 'date-fns'
import { it } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { TrendingUp, Flame, Footprints, Scale, Dumbbell } from 'lucide-react'
import { useActivityHistory } from '@/hooks/useActivityHistory'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { MetricCard } from '@/components/MetricCard'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'

const PERIODS = [
  { label: '7 giorni', days: 7 },
  { label: '30 giorni', days: 30 },
  { label: '3 mesi', days: 90 },
  { label: '6 mesi', days: 180 },
  { label: 'Anno', days: 365 }
]

export default function Progress() {
  const [periodDays, setPeriodDays] = useState(30)
  const { history, loading: historyLoading } = useActivityHistory(periodDays)
  const { measurements, loading: measurementsLoading } = useBodyMeasurements(200)

  const weightData = useMemo(() => {
    const cutoff = subDays(new Date(), periodDays)
    return measurements
      .filter((m) => m.weight_kg && isAfter(new Date(m.measured_date), cutoff))
      .slice()
      .reverse()
      .map((m) => ({ date: format(new Date(m.measured_date), 'd MMM', { locale: it }), peso: m.weight_kg }))
  }, [measurements, periodDays])

  const activityChartData = history.map((h) => ({
    date: format(new Date(h.activity_date), 'd MMM', { locale: it }),
    calorie: Math.round(h.active_calories),
    passi: h.steps
  }))

  const totals = history.reduce(
    (acc, h) => ({
      steps: acc.steps + h.steps,
      calories: acc.calories + h.active_calories,
      distance: acc.distance + h.distance_km
    }),
    { steps: 0, calories: 0, distance: 0 }
  )

  const avgSteps = history.length > 0 ? totals.steps / history.length : 0

  return (
    <div className="space-y-6 pb-4">
      <h1 className="text-2xl font-bold">Progressi</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setPeriodDays(p.days)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${periodDays === p.days ? 'bg-base-invert text-base-invertfg' : 'bg-base-card2 text-base-text/70'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Footprints} label="Passi totali" value={totals.steps} color="#B983FF" />
        <MetricCard icon={Flame} label="Calorie attive" value={totals.calories} unit="kcal" color="#FA114F" />
        <MetricCard icon={TrendingUp} label="Media passi/giorno" value={avgSteps} color="#0A84FF" />
        <MetricCard icon={Dumbbell} label="Distanza totale" value={totals.distance} unit="km" decimals={1} color="#A6FF00" />
      </div>

      <div className="fd-card">
        <h2 className="font-semibold text-[15px] mb-4 flex items-center gap-2"><Scale size={15} className="text-steps" />Andamento peso</h2>
        {measurementsLoading ? (
          <div className="h-48 bg-base-card2 rounded-xl animate-pulse" />
        ) : weightData.length < 2 ? (
          <p className="text-sm text-base-muted py-8 text-center">Registra il peso in più giorni per vedere l'andamento.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis dataKey="date" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="peso" stroke="#B983FF" strokeWidth={2.5} dot={{ r: 3, fill: '#B983FF' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="fd-card">
        <h2 className="font-semibold text-[15px] mb-4">Passi nel periodo</h2>
        {historyLoading ? (
          <div className="h-48 bg-base-card2 rounded-xl animate-pulse" />
        ) : activityChartData.length === 0 ? (
          <p className="text-sm text-base-muted py-8 text-center">Non ci sono ancora dati sufficienti.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis dataKey="date" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="passi" stroke="#0AF1F2" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {history.length === 0 && !historyLoading && <CardSkeleton />}
    </div>
  )
}
