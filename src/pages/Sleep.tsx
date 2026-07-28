import { useState } from 'react'
import { format, differenceInMinutes } from 'date-fns'
import { it } from 'date-fns/locale'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Moon, Sun, Trash2, Plus, BedDouble } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListSkeleton } from '@/components/ui/LoadingSkeleton'
import { useSleepEntries } from '@/hooks/useSleepEntries'
import { useToast } from '@/context/ToastContext'
import { formatNumber } from '@/lib/utils'

const SLEEP_GOAL_HOURS = 8

export default function Sleep() {
  const { entries, loading, addEntry, deleteEntry, avgHours } = useSleepEntries(30)
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const last7 = entries.slice(0, 7)
  const weeklyAvg = last7.length > 0 ? last7.reduce((s, e) => s + e.duration_minutes, 0) / last7.length / 60 : 0
  const debt = Math.max((SLEEP_GOAL_HOURS - weeklyAvg) * last7.length, 0)

  const chartData = entries
    .slice(0, 14)
    .slice()
    .reverse()
    .map((e) => ({ date: format(new Date(e.sleep_date), 'd MMM', { locale: it }), ore: Math.round((e.duration_minutes / 60) * 10) / 10 }))

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const { error } = await deleteEntry(confirmDeleteId)
    showToast(error ? 'Errore durante l\'eliminazione' : 'Voce eliminata', error ? 'error' : 'success')
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sonno</h1>
        <button onClick={() => setFormOpen(true)} className="w-9 h-9 rounded-full bg-base-invert text-base-invertfg flex items-center justify-center">
          <Plus size={17} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="fd-card !p-3.5">
          <Moon size={14} className="text-steps mb-2" />
          <p className="fd-label">Media 7gg</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{formatNumber(weeklyAvg, 1)}<span className="text-xs text-base-muted ml-1">h</span></p>
        </div>
        <div className="fd-card !p-3.5">
          <BedDouble size={14} className="text-stand mb-2" />
          <p className="fd-label">Media 30gg</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{formatNumber(avgHours, 1)}<span className="text-xs text-base-muted ml-1">h</span></p>
        </div>
        <div className="fd-card !p-3.5">
          <Sun size={14} className="text-move mb-2" />
          <p className="fd-label">Debito sonno</p>
          <p className="text-lg font-bold tabular-nums mt-0.5">{formatNumber(debt, 1)}<span className="text-xs text-base-muted ml-1">h</span></p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="fd-card">
          <h2 className="font-semibold text-[15px] mb-4">Ultime 14 notti</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
              <XAxis dataKey="date" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="ore" fill="#B983FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <p className="fd-label mb-2.5">Storico</p>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : entries.length === 0 ? (
          <EmptyState icon={Moon} title="Nessun sonno registrato" description="Registra la tua prima notte di sonno." />
        ) : (
          <div className="space-y-1.5">
            {entries.map((e) => (
              <div key={e.id} className="fd-card !py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-steps/15 flex items-center justify-center shrink-0">
                  <Moon size={15} className="text-steps" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{format(new Date(e.sleep_date), "d MMMM yyyy", { locale: it })}</p>
                  <p className="text-xs text-base-muted">
                    {Math.floor(e.duration_minutes / 60)}h {e.duration_minutes % 60}min
                    {e.quality ? ` · qualità ${e.quality}/5` : ''}
                  </p>
                </div>
                <button onClick={() => setConfirmDeleteId(e.id)} aria-label="Elimina" className="text-base-muted hover:text-move p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Registra sonno">
        <SleepForm
          onSubmit={async (payload) => {
            const { error } = await addEntry(payload)
            showToast(error ? 'Errore durante il salvataggio' : 'Sonno registrato', error ? 'error' : 'success')
            if (!error) setFormOpen(false)
          }}
        />
      </Sheet>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Eliminare questa voce?"
        description="L'azione non può essere annullata."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function SleepForm({ onSubmit }: { onSubmit: (payload: { sleep_date: string; bedtime: string; wake_time: string; duration_minutes: number; quality?: number; energy_on_wake?: number; notes?: string }) => void }) {
  const [bedTime, setBedTime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setSubmitting(true)
        const today = new Date()
        const bed = new Date(today)
        const [bh, bm] = bedTime.split(':').map(Number)
        bed.setHours(bh, bm, 0, 0)
        // se l'orario di andare a dormire è dopo mezzogiorno consideralo la sera precedente
        if (bh >= 12) bed.setDate(bed.getDate() - 1)

        const wake = new Date(today)
        const [wh, wm] = wakeTime.split(':').map(Number)
        wake.setHours(wh, wm, 0, 0)

        const duration = Math.max(differenceInMinutes(wake, bed), 0)

        await onSubmit({
          sleep_date: format(today, 'yyyy-MM-dd'),
          bedtime: bed.toISOString(),
          wake_time: wake.toISOString(),
          duration_minutes: duration,
          quality,
          energy_on_wake: energy,
          notes: notes.trim() || undefined
        })
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="bedtime">A letto</label>
          <input id="bedtime" type="time" className="fd-input" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="waketime">Sveglia</label>
          <input id="waketime" type="time" className="fd-input" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="fd-label mb-1.5 block">Qualità del sonno: {quality}/5</label>
        <input type="range" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-steps" />
      </div>
      <div>
        <label className="fd-label mb-1.5 block">Energia al risveglio: {energy}/5</label>
        <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full accent-exercise" />
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="sleep-notes">Note</label>
        <textarea id="sleep-notes" className="fd-input min-h-[60px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button type="submit" disabled={submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva'}
      </button>
    </form>
  )
}
