import { useState } from 'react'
import { format } from 'date-fns'
import { Droplets, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { DateSelector } from '@/components/DateSelector'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListSkeleton } from '@/components/ui/LoadingSkeleton'
import { useWaterEntries } from '@/hooks/useWaterEntries'
import { useToast } from '@/context/ToastContext'
import { formatNumber } from '@/lib/utils'

const QUICK_AMOUNTS = [100, 250, 330, 500, 750, 1000]
const DAILY_GOAL_ML = 2000

export default function Water() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateISO = format(selectedDate, 'yyyy-MM-dd')
  const { entries, totalMl, loading, addWater, deleteEntry } = useWaterEntries(dateISO)
  const { showToast } = useToast()

  const pct = Math.min((totalMl / DAILY_GOAL_ML) * 100, 100)

  const chartData = entries.map((e) => ({
    time: format(new Date(e.logged_at), 'HH:mm'),
    ml: e.amount_ml
  }))

  const handleAdd = async (ml: number) => {
    const { error } = await addWater(ml)
    showToast(error ? 'Errore durante il salvataggio' : `${ml} ml aggiunti`, error ? 'error' : 'success')
  }

  const handleDelete = async (id: string) => {
    const { error } = await deleteEntry(id)
    showToast(error ? 'Errore durante l\'eliminazione' : 'Voce eliminata', error ? 'error' : 'success')
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Acqua</h1>
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="fd-card flex flex-col items-center py-8">
        <div className="relative w-40 h-40 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#0AF1F22E" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="#0AF1F2" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - pct / 100)}
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets size={22} className="text-stand mb-1" />
            <span className="text-2xl font-bold tabular-nums">{formatNumber(totalMl)}</span>
            <span className="text-xs text-base-muted">ml / {formatNumber(DAILY_GOAL_ML)} ml</span>
          </div>
        </div>
        <p className="text-sm font-medium text-stand">{Math.round(pct)}% dell'obiettivo</p>
      </div>

      <div>
        <p className="fd-label mb-2.5">Aggiunta rapida</p>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_AMOUNTS.map((ml) => (
            <button key={ml} onClick={() => handleAdd(ml)} className="fd-card !p-4 flex flex-col items-center gap-1 active:scale-95 transition">
              <Droplets size={16} className="text-stand" />
              <span className="font-bold">{ml}</span>
              <span className="text-[10px] text-base-muted">ml</span>
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="fd-card">
          <h2 className="font-semibold text-[15px] mb-4">Andamento per orario</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis dataKey="time" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="ml" fill="#0AF1F2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <p className="fd-label mb-2.5">Storico di oggi</p>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : entries.length === 0 ? (
          <EmptyState icon={Droplets} title="Nessuna acqua registrata" description="Usa i pulsanti sopra per registrare la tua idratazione." />
        ) : (
          <div className="space-y-1.5">
            {entries.slice().reverse().map((e) => (
              <div key={e.id} className="fd-card !py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stand/15 flex items-center justify-center">
                  <Droplets size={14} className="text-stand" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.amount_ml} ml</p>
                  <p className="text-xs text-base-muted">{format(new Date(e.logged_at), 'HH:mm')}</p>
                </div>
                <button onClick={() => handleDelete(e.id)} aria-label="Elimina" className="text-base-muted hover:text-move p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
