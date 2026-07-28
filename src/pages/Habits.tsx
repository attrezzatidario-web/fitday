import { useState } from 'react'
import { Check, Flame, Plus, Trash2, ListChecks } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListSkeleton } from '@/components/ui/LoadingSkeleton'
import { useHabits } from '@/hooks/useHabits'
import { useToast } from '@/context/ToastContext'

const HABIT_COLORS = ['#A6FF00', '#0AF1F2', '#FA114F', '#B983FF', '#FF9F0A', '#FFD60A', '#64D2FF']

export default function Habits() {
  const { habits, loading, addHabit, archiveHabit, toggleToday, isCompletedToday } = useHabits()
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null)

  const completedCount = habits.filter((h) => isCompletedToday(h.id)).length

  const handleToggle = async (habitId: string) => {
    const { error } = await toggleToday(habitId)
    if (error) showToast('Errore, riprova.', 'error')
  }

  const handleArchive = async () => {
    if (!confirmArchiveId) return
    const { error } = await archiveHabit(confirmArchiveId)
    showToast(error ? 'Errore durante l\'eliminazione' : 'Abitudine rimossa', error ? 'error' : 'success')
    setConfirmArchiveId(null)
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-base-text">Abitudini</h1>
        <button onClick={() => setFormOpen(true)} className="w-9 h-9 rounded-full bg-base-invert text-base-invertfg flex items-center justify-center">
          <Plus size={17} />
        </button>
      </div>

      {habits.length > 0 && (
        <div className="fd-card !py-3 flex items-center justify-between">
          <span className="text-sm text-base-muted">Completate oggi</span>
          <span className="font-bold text-base-text">{completedCount} / {habits.length}</span>
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : habits.length === 0 ? (
        <EmptyState icon={ListChecks} title="Nessuna abitudine" description="Crea la tua prima abitudine da tracciare ogni giorno." />
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => {
            const done = isCompletedToday(habit.id)
            return (
              <div key={habit.id} className="fd-card flex items-center gap-3">
                <button
                  onClick={() => handleToggle(habit.id)}
                  aria-label={done ? 'Segna come non completata' : 'Segna come completata'}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition"
                  style={{ backgroundColor: done ? habit.color : `${habit.color}22`, border: `2px solid ${habit.color}` }}
                >
                  {done && <Check size={18} className="text-base-invertfg" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-base-text">{habit.name}</p>
                  <div className="flex items-center gap-1 text-xs text-base-muted mt-0.5">
                    <Flame size={11} className="text-move" />
                    {habit.current_streak} giorni di fila · record {habit.best_streak}
                  </div>
                </div>
                <button onClick={() => setConfirmArchiveId(habit.id)} aria-label="Elimina abitudine" className="text-base-muted hover:text-move p-1 shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Nuova abitudine">
        <HabitForm
          onSubmit={async (payload) => {
            const { error } = await addHabit(payload)
            showToast(error ? 'Errore durante il salvataggio' : 'Abitudine creata', error ? 'error' : 'success')
            if (!error) setFormOpen(false)
          }}
        />
      </Sheet>

      <ConfirmDialog
        open={confirmArchiveId !== null}
        title="Eliminare questa abitudine?"
        description="Lo storico rimarrà salvato ma l'abitudine non sarà più visibile."
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchiveId(null)}
      />
    </div>
  )
}

function HabitForm({ onSubmit }: { onSubmit: (payload: { name: string; color: string; frequency: 'daily' | 'weekly' | 'custom' }) => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!name.trim()) return
        setSubmitting(true)
        await onSubmit({ name: name.trim(), color, frequency })
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="habit-name">Nome abitudine</label>
        <input id="habit-name" className="fd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Bere acqua, Meditare..." required autoFocus />
      </div>
      <div>
        <label className="fd-label mb-1.5 block">Colore</label>
        <div className="flex gap-2 flex-wrap">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Colore ${c}`}
              className="w-8 h-8 rounded-full transition"
              style={{ backgroundColor: c, outline: color === c ? '2px solid white' : 'none', outlineOffset: '2px' }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="fd-label mb-1.5 block">Frequenza</label>
        <div className="grid grid-cols-3 gap-2">
          {(['daily', 'weekly', 'custom'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`rounded-xl py-2.5 text-[13px] font-medium ${frequency === f ? 'bg-base-invert text-base-invertfg' : 'bg-base-card2'}`}
            >
              {f === 'daily' ? 'Ogni giorno' : f === 'weekly' ? 'Settimanale' : 'Personalizzata'}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" disabled={!name.trim() || submitting} className="fd-btn-primary">
        {submitting ? 'Creazione...' : 'Crea abitudine'}
      </button>
    </form>
  )
}
