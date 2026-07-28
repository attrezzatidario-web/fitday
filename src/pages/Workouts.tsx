import { useState } from 'react'
import { format } from 'date-fns'
import { Dumbbell, Trash2, Plus, Flame, Clock, MapPin, Heart } from 'lucide-react'
import { DateSelector } from '@/components/DateSelector'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListSkeleton } from '@/components/ui/LoadingSkeleton'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useToast } from '@/context/ToastContext'
import type { Workout, WorkoutType } from '@/types/database'

const WORKOUT_TYPES: { value: WorkoutType; label: string; color: string }[] = [
  { value: 'running', label: 'Corsa', color: '#FA114F' },
  { value: 'walking', label: 'Camminata', color: '#0AF1F2' },
  { value: 'cycling', label: 'Ciclismo', color: '#FF9F0A' },
  { value: 'gym', label: 'Palestra', color: '#A6FF00' },
  { value: 'weights', label: 'Pesi', color: '#B983FF' },
  { value: 'hiit', label: 'HIIT', color: '#FF375F' },
  { value: 'swimming', label: 'Nuoto', color: '#0A84FF' },
  { value: 'soccer', label: 'Calcio', color: '#A6FF00' },
  { value: 'yoga', label: 'Yoga', color: '#FFD60A' },
  { value: 'stretching', label: 'Stretching', color: '#64D2FF' },
  { value: 'custom', label: 'Personalizzato', color: '#8E8E93' }
]

function typeMeta(t: WorkoutType) {
  return WORKOUT_TYPES.find((w) => w.value === t) ?? WORKOUT_TYPES[WORKOUT_TYPES.length - 1]
}

export default function Workouts() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateISO = format(selectedDate, 'yyyy-MM-dd')
  const { workouts, loading, addWorkout, deleteWorkout } = useWorkouts(dateISO)
  const { showToast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<WorkoutType | 'all'>('all')

  const filtered = filterType === 'all' ? workouts : workouts.filter((w) => w.workout_type === filterType)

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const { error } = await deleteWorkout(confirmDeleteId)
    showToast(error ? 'Errore durante l\'eliminazione' : 'Allenamento eliminato', error ? 'error' : 'success')
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Allenamenti</h1>
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
      </div>

      <button onClick={() => setFormOpen(true)} className="fd-card w-full flex items-center justify-center gap-2 !py-4 border-dashed border-2 border-base-border bg-transparent">
        <Plus size={16} />
        <span className="text-sm font-semibold">Nuovo allenamento</span>
      </button>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setFilterType('all')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${filterType === 'all' ? 'bg-white text-black' : 'bg-base-card2 text-white/70'}`}
        >
          Tutti
        </button>
        {WORKOUT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilterType(t.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${filterType === t.value ? 'bg-white text-black' : 'bg-base-card2 text-white/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Dumbbell} title="Nessun allenamento" description="Registra il tuo primo allenamento di oggi." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((w) => (
            <WorkoutRow key={w.id} workout={w} onDelete={() => setConfirmDeleteId(w.id)} />
          ))}
        </div>
      )}

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Nuovo allenamento">
        <WorkoutForm
          onSubmit={async (payload) => {
            const { error } = await addWorkout(payload)
            showToast(error ? 'Errore durante il salvataggio' : 'Allenamento registrato', error ? 'error' : 'success')
            if (!error) setFormOpen(false)
          }}
        />
      </Sheet>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Eliminare questo allenamento?"
        description="L'azione non può essere annullata."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function WorkoutRow({ workout, onDelete }: { workout: Workout; onDelete: () => void }) {
  const meta = typeMeta(workout.workout_type)
  return (
    <div className="fd-card flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}26` }}>
        <Dumbbell size={17} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{workout.name}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-base-muted flex-wrap">
          <span className="flex items-center gap-1"><Clock size={11} />{workout.duration_minutes} min</span>
          {workout.calories ? <span className="flex items-center gap-1"><Flame size={11} />{Math.round(workout.calories)} kcal</span> : null}
          {workout.distance_km ? <span className="flex items-center gap-1"><MapPin size={11} />{workout.distance_km} km</span> : null}
          {workout.avg_heart_rate ? <span className="flex items-center gap-1"><Heart size={11} />{workout.avg_heart_rate} bpm</span> : null}
        </div>
      </div>
      <button onClick={onDelete} aria-label="Elimina allenamento" className="text-base-muted hover:text-move p-1 shrink-0">
        <Trash2 size={15} />
      </button>
    </div>
  )
}

function WorkoutForm({ onSubmit }: { onSubmit: (payload: { name: string; workout_type: WorkoutType; duration_minutes: number; calories: number; distance_km?: number; avg_heart_rate?: number; perceived_effort?: number; notes?: string }) => void }) {
  const [type, setType] = useState<WorkoutType>('running')
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('30')
  const [calories, setCalories] = useState('')
  const [distance, setDistance] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [effort, setEffort] = useState(5)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const valid = name.trim().length > 0 && Number(duration) > 0

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!valid) return
        setSubmitting(true)
        await onSubmit({
          name: name.trim(),
          workout_type: type,
          duration_minutes: Number(duration),
          calories: Number(calories) || 0,
          distance_km: distance ? Number(distance) : undefined,
          avg_heart_rate: heartRate ? Number(heartRate) : undefined,
          perceived_effort: effort,
          notes: notes.trim() || undefined
        })
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div>
        <label className="fd-label mb-1.5 block">Tipo</label>
        <select className="fd-input" value={type} onChange={(e) => setType(e.target.value as WorkoutType)}>
          {WORKOUT_TYPES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="w-name">Nome allenamento</label>
        <input id="w-name" className="fd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Corsa al parco" required autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="duration">Durata (min)</label>
          <input id="duration" type="number" className="fd-input" value={duration} onChange={(e) => setDuration(e.target.value)} required min={1} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="w-cal">Calorie (kcal)</label>
          <input id="w-cal" type="number" className="fd-input" value={calories} onChange={(e) => setCalories(e.target.value)} min={0} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="dist">Distanza (km)</label>
          <input id="dist" type="number" inputMode="decimal" className="fd-input" value={distance} onChange={(e) => setDistance(e.target.value)} min={0} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="hr">Battito medio (bpm)</label>
          <input id="hr" type="number" className="fd-input" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} min={0} />
        </div>
      </div>
      <div>
        <label className="fd-label mb-1.5 block">Percezione dello sforzo: {effort}/10</label>
        <input type="range" min={1} max={10} value={effort} onChange={(e) => setEffort(Number(e.target.value))} className="w-full accent-exercise" />
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="notes">Note (facoltativo)</label>
        <textarea id="notes" className="fd-input min-h-[70px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button type="submit" disabled={!valid || submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva allenamento'}
      </button>
    </form>
  )
}
