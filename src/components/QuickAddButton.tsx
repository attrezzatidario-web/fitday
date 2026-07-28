import { useState } from 'react'
import { format, isToday, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { Plus, Utensils, Droplets, Dumbbell, Scale, StickyNote, CalendarClock } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/context/ToastContext'
import { useQuickAdd } from '@/context/QuickAddContext'
import { useFoodEntries } from '@/hooks/useFoodEntries'
import { useWaterEntries } from '@/hooks/useWaterEntries'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { useDailyNotes } from '@/hooks/useDailyNotes'
import { MultiFoodEntryForm, type FoodItemDraft } from '@/components/MultiFoodEntryForm'
import type { MealType, WorkoutType } from '@/types/database'

type QuickAddKind = 'meal' | 'water' | 'workout' | 'weight' | 'note' | null

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Colazione' },
  { value: 'morning_snack', label: 'Spuntino mattutino' },
  { value: 'lunch', label: 'Pranzo' },
  { value: 'afternoon_snack', label: 'Spuntino pomeridiano' },
  { value: 'dinner', label: 'Cena' },
  { value: 'other', label: 'Altro' }
]

const WORKOUT_OPTIONS: { value: WorkoutType; label: string }[] = [
  { value: 'running', label: 'Corsa' },
  { value: 'walking', label: 'Camminata' },
  { value: 'cycling', label: 'Ciclismo' },
  { value: 'gym', label: 'Palestra' },
  { value: 'weights', label: 'Pesi' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'swimming', label: 'Nuoto' },
  { value: 'soccer', label: 'Calcio' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'stretching', label: 'Stretching' },
  { value: 'custom', label: 'Personalizzato' }
]

const WATER_QUICK_ML = [100, 250, 330, 500, 750, 1000]

export function QuickAddButton() {
  const [active, setActive] = useState<QuickAddKind>(null)
  const { showToast } = useToast()
  const { menuOpen, openMenu, closeMenu, notifyAdded, targetDate } = useQuickAdd()
  const dateISO = targetDate

  const { addMultipleEntries } = useFoodEntries(dateISO)
  const { addWater } = useWaterEntries(dateISO)
  const { addWorkout } = useWorkouts(dateISO)
  const { addMeasurement } = useBodyMeasurements()
  const { addNote } = useDailyNotes(dateISO)

  const targetIsToday = isToday(parseISO(dateISO))
  const dateSuffix = targetIsToday ? '' : ` · ${format(parseISO(dateISO), "d MMMM", { locale: it })}`

  const closeAll = () => {
    closeMenu()
    setActive(null)
  }

  const notifyAndClose = (ok: boolean, successMsg: string) => {
    showToast(ok ? successMsg : 'Si è verificato un errore, riprova.', ok ? 'success' : 'error')
    if (ok) {
      closeAll()
      notifyAdded()
    }
  }

  const options: { kind: QuickAddKind; icon: typeof Utensils; label: string; color: string }[] = [
    { kind: 'meal', icon: Utensils, label: 'Aggiungi pasto', color: '#FF9F0A' },
    { kind: 'water', icon: Droplets, label: 'Aggiungi acqua', color: '#0AF1F2' },
    { kind: 'workout', icon: Dumbbell, label: 'Aggiungi allenamento', color: '#A6FF00' },
    { kind: 'weight', icon: Scale, label: 'Aggiungi peso', color: '#B983FF' },
    { kind: 'note', icon: StickyNote, label: 'Aggiungi nota', color: '#FFD60A' }
  ]

  return (
    <>
      <button
        onClick={openMenu}
        aria-label="Inserimento rapido"
        className="hidden md:flex fixed z-[70] bottom-8 right-8 w-14 h-14 rounded-full bg-base-invert text-base-invertfg items-center justify-center shadow-glow active:scale-90 transition"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <Sheet open={menuOpen} onClose={closeAll} title="Inserimento rapido">
        {!targetIsToday && (
          <div className="flex items-center gap-2 bg-stand/10 text-stand text-[12px] font-medium rounded-xl px-3 py-2 mb-3">
            <CalendarClock size={14} />
            Stai aggiungendo a {format(parseISO(dateISO), "EEEE d MMMM", { locale: it })}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          {options.map((opt) => (
            <button
              key={opt.kind}
              onClick={() => setActive(opt.kind)}
              className="fd-card !p-3.5 flex flex-col items-start gap-2.5 active:scale-95 transition"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${opt.color}26` }}>
                <opt.icon size={15} style={{ color: opt.color }} />
              </div>
              <span className="text-[13px] font-medium text-left leading-tight text-base-text">{opt.label}</span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* PASTO */}
      <Sheet open={active === 'meal'} onClose={() => setActive(null)} title={`Aggiungi pasto${dateSuffix}`}>
        <MealForm
          onSubmitAll={async (mealType, items) => {
            const { error } = await addMultipleEntries(mealType, items)
            notifyAndClose(!error, `${items.length} alimento${items.length > 1 ? 'i' : ''} aggiunto${items.length > 1 ? 'i' : ''}`)
            return { error }
          }}
        />
      </Sheet>

      {/* ACQUA */}
      <Sheet open={active === 'water'} onClose={() => setActive(null)} title={`Aggiungi acqua${dateSuffix}`}>
        <div className="grid grid-cols-3 gap-2.5">
          {WATER_QUICK_ML.map((ml) => (
            <button
              key={ml}
              onClick={async () => {
                const { error } = await addWater(ml)
                notifyAndClose(!error, `${ml} ml aggiunti`)
              }}
              className="fd-card !p-4 flex flex-col items-center gap-1 active:scale-95 transition"
            >
              <Droplets size={18} className="text-stand" />
              <span className="font-bold text-lg text-base-text">{ml}</span>
              <span className="text-[11px] text-base-muted">ml</span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* ALLENAMENTO */}
      <Sheet open={active === 'workout'} onClose={() => setActive(null)} title={`Aggiungi allenamento${dateSuffix}`}>
        <WorkoutForm
          onSubmit={async (payload) => {
            const { error } = await addWorkout(payload)
            notifyAndClose(!error, 'Allenamento registrato')
          }}
        />
      </Sheet>

      {/* PESO */}
      <Sheet open={active === 'weight'} onClose={() => setActive(null)} title={`Aggiungi peso${dateSuffix}`}>
        <NumberForm
          label="Peso corporeo"
          unit="kg"
          step={0.1}
          onSubmit={async (value) => {
            const { error } = await addMeasurement(dateISO, { weight_kg: value })
            notifyAndClose(!error, 'Peso registrato')
          }}
        />
      </Sheet>

      {/* NOTA */}
      <Sheet open={active === 'note'} onClose={() => setActive(null)} title={`Aggiungi nota${dateSuffix}`}>
        <NoteForm
          onSubmit={async (content) => {
            const { error } = await addNote(content)
            notifyAndClose(!error, 'Nota salvata')
          }}
        />
      </Sheet>
    </>
  )
}

function MealForm({ onSubmitAll }: { onSubmitAll: (mealType: MealType, items: FoodItemDraft[]) => Promise<{ error?: unknown } | void> }) {
  const [mealType, setMealType] = useState<MealType>('breakfast')

  return (
    <div className="space-y-4">
      <div>
        <label className="fd-label mb-1.5 block">Pasto</label>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_OPTIONS.map((m) => (
            <button
              type="button"
              key={m.value}
              onClick={() => setMealType(m.value)}
              className={`rounded-xl py-2.5 text-[13px] font-medium transition ${mealType === m.value ? 'bg-base-invert text-base-invertfg' : 'bg-base-card2 text-base-text/80'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <MultiFoodEntryForm submitLabel="Salva pasto" onSubmitAll={(items) => onSubmitAll(mealType, items)} />
    </div>
  )
}

function WorkoutForm({ onSubmit }: { onSubmit: (payload: { name: string; workout_type: WorkoutType; duration_minutes: number; calories: number; distance_km?: number; perceived_effort?: number; notes?: string }) => void }) {
  const [type, setType] = useState<WorkoutType>('running')
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('30')
  const [calories, setCalories] = useState('')
  const [distance, setDistance] = useState('')
  const [effort, setEffort] = useState(5)
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
          perceived_effort: effort
        })
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div>
        <label className="fd-label mb-1.5 block">Tipo</label>
        <select className="fd-input" value={type} onChange={(e) => setType(e.target.value as WorkoutType)}>
          {WORKOUT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="w-name">Nome allenamento</label>
        <input id="w-name" className="fd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Corsa mattutina" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="duration">Durata (min)</label>
          <input id="duration" type="number" step="any" inputMode="numeric" className="fd-input" value={duration} onChange={(e) => setDuration(e.target.value)} required min={1} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="w-calories">Calorie (kcal)</label>
          <input id="w-calories" type="number" step="any" inputMode="decimal" className="fd-input" value={calories} onChange={(e) => setCalories(e.target.value)} min={0} />
        </div>
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="distance">Distanza (km, facoltativo)</label>
        <input id="distance" type="number" step="any" inputMode="decimal" className="fd-input" value={distance} onChange={(e) => setDistance(e.target.value)} min={0} />
      </div>
      <div>
        <label className="fd-label mb-1.5 block">Percezione dello sforzo: {effort}/10</label>
        <input type="range" min={1} max={10} value={effort} onChange={(e) => setEffort(Number(e.target.value))} className="w-full accent-exercise" />
      </div>
      <button type="submit" disabled={!valid || submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva allenamento'}
      </button>
    </form>
  )
}

function NumberForm({ label, unit, step, defaultValue, onSubmit }: { label: string; unit: string; step: number; defaultValue?: number; onSubmit: (value: number) => void }) {
  const [value, setValue] = useState(defaultValue?.toString() ?? '')
  const [submitting, setSubmitting] = useState(false)
  const valid = value !== '' && Number(value) >= 0

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!valid) return
        setSubmitting(true)
        await onSubmit(Number(value))
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="num-value">{label} ({unit})</label>
        <input
          id="num-value"
          type="number"
          inputMode="decimal"
          step={step}
          className="fd-input text-2xl font-bold text-center"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          required
        />
      </div>
      <button type="submit" disabled={!valid || submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva'}
      </button>
    </form>
  )
}

function NoteForm({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!content.trim()) return
        setSubmitting(true)
        await onSubmit(content.trim())
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <textarea
        className="fd-input min-h-[120px] resize-none"
        placeholder="Scrivi una nota per oggi..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoFocus
        required
      />
      <button type="submit" disabled={!content.trim() || submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva nota'}
      </button>
    </form>
  )
}
