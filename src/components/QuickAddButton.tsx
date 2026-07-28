import { useState } from 'react'
import { Plus, Utensils, Droplets, Dumbbell, Scale, Footprints, StickyNote, Moon, Check } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/context/ToastContext'
import { useQuickAdd } from '@/context/QuickAddContext'
import { useFoodEntries } from '@/hooks/useFoodEntries'
import { useWaterEntries } from '@/hooks/useWaterEntries'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { useDailyNotes } from '@/hooks/useDailyNotes'
import { useDailyActivity } from '@/hooks/useDailyActivity'
import { useSleepEntries } from '@/hooks/useSleepEntries'
import { useHabits } from '@/hooks/useHabits'
import { todayISO } from '@/lib/utils'
import type { MealType, WorkoutType } from '@/types/database'

type QuickAddKind = 'meal' | 'water' | 'workout' | 'weight' | 'steps' | 'note' | 'sleep' | 'habit' | null

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
  const dateISO = todayISO()
  const [active, setActive] = useState<QuickAddKind>(null)
  const { showToast } = useToast()
  const { menuOpen, openMenu, closeMenu, notifyAdded } = useQuickAdd()

  const { addEntry: addFood } = useFoodEntries(dateISO)
  const { addWater } = useWaterEntries(dateISO)
  const { addWorkout } = useWorkouts(dateISO)
  const { addMeasurement } = useBodyMeasurements()
  const { addNote } = useDailyNotes(dateISO)
  const { update: updateActivity, data: activity } = useDailyActivity(dateISO)
  const { addEntry: addSleep } = useSleepEntries(1)
  const { habits, toggleToday, isCompletedToday } = useHabits()

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
    { kind: 'steps', icon: Footprints, label: 'Aggiungi passi', color: '#FA114F' },
    { kind: 'sleep', icon: Moon, label: 'Aggiungi sonno', color: '#64D2FF' },
    { kind: 'habit', icon: Check, label: 'Completa abitudine', color: '#A6FF00' },
    { kind: 'note', icon: StickyNote, label: 'Aggiungi nota', color: '#FFD60A' }
  ]

  return (
    <>
      <button
        onClick={openMenu}
        aria-label="Inserimento rapido"
        className="hidden md:flex fixed z-[70] bottom-8 right-8 w-14 h-14 rounded-full bg-white text-black items-center justify-center shadow-glow active:scale-90 transition"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <Sheet open={menuOpen} onClose={closeAll} title="Inserimento rapido">
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
              <span className="text-[13px] font-medium text-left leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* PASTO */}
      <Sheet open={active === 'meal'} onClose={() => setActive(null)} title="Aggiungi pasto">
        <MealForm
          onSubmit={async (payload) => {
            const { error } = await addFood(payload)
            notifyAndClose(!error, 'Pasto aggiunto')
          }}
        />
      </Sheet>

      {/* ACQUA */}
      <Sheet open={active === 'water'} onClose={() => setActive(null)} title="Aggiungi acqua">
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
              <span className="font-bold text-lg">{ml}</span>
              <span className="text-[11px] text-base-muted">ml</span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* ALLENAMENTO */}
      <Sheet open={active === 'workout'} onClose={() => setActive(null)} title="Aggiungi allenamento">
        <WorkoutForm
          onSubmit={async (payload) => {
            const { error } = await addWorkout(payload)
            notifyAndClose(!error, 'Allenamento registrato')
          }}
        />
      </Sheet>

      {/* PESO */}
      <Sheet open={active === 'weight'} onClose={() => setActive(null)} title="Aggiungi peso">
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

      {/* PASSI */}
      <Sheet open={active === 'steps'} onClose={() => setActive(null)} title="Aggiungi passi">
        <NumberForm
          label="Passi totali di oggi"
          unit="passi"
          step={1}
          defaultValue={activity.steps}
          onSubmit={async (value) => {
            const result = await updateActivity({ steps: Math.round(value) })
            notifyAndClose(!result?.error, 'Passi aggiornati')
          }}
        />
      </Sheet>

      {/* NOTA */}
      <Sheet open={active === 'note'} onClose={() => setActive(null)} title="Aggiungi nota">
        <NoteForm
          onSubmit={async (content) => {
            const { error } = await addNote(content)
            notifyAndClose(!error, 'Nota salvata')
          }}
        />
      </Sheet>

      {/* SONNO */}
      <Sheet open={active === 'sleep'} onClose={() => setActive(null)} title="Aggiungi sonno">
        <QuickSleepForm
          onSubmit={async (payload) => {
            const { error } = await addSleep(payload)
            notifyAndClose(!error, 'Sonno registrato')
          }}
        />
      </Sheet>

      {/* ABITUDINE */}
      <Sheet open={active === 'habit'} onClose={() => setActive(null)} title="Completa abitudine">
        {habits.length === 0 ? (
          <p className="text-sm text-base-muted text-center py-6">Non hai ancora creato abitudini. Vai alla sezione Abitudini per crearne una.</p>
        ) : (
          <div className="space-y-2">
            {habits.map((h) => {
              const done = isCompletedToday(h.id)
              return (
                <button
                  key={h.id}
                  onClick={async () => {
                    const { error } = await toggleToday(h.id)
                    notifyAndClose(!error, done ? 'Abitudine annullata' : 'Abitudine completata')
                  }}
                  className="fd-card w-full flex items-center gap-3 !py-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: done ? h.color : `${h.color}22`, border: `2px solid ${h.color}` }}
                  >
                    {done && <Check size={14} className="text-black" strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-medium">{h.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </Sheet>
    </>
  )
}

function MealForm({ onSubmit }: { onSubmit: (payload: { meal_type: MealType; food_name: string; quantity: number; unit: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }) => void }) {
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('100')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('0')
  const [carbs, setCarbs] = useState('0')
  const [fat, setFat] = useState('0')
  const [submitting, setSubmitting] = useState(false)

  const valid = name.trim().length > 0 && Number(calories) >= 0 && Number(quantity) > 0

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!valid) return
        setSubmitting(true)
        await onSubmit({
          meal_type: mealType,
          food_name: name.trim(),
          quantity: Number(quantity),
          unit: 'g',
          calories: Number(calories),
          protein_g: Number(protein),
          carbs_g: Number(carbs),
          fat_g: Number(fat)
        })
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div>
        <label className="fd-label mb-1.5 block">Pasto</label>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_OPTIONS.map((m) => (
            <button
              type="button"
              key={m.value}
              onClick={() => setMealType(m.value)}
              className={`rounded-xl py-2.5 text-[13px] font-medium transition ${mealType === m.value ? 'bg-white text-black' : 'bg-base-card2 text-white/80'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="food-name">Alimento</label>
        <input id="food-name" className="fd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Petto di pollo" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="quantity">Quantità (g)</label>
          <input id="quantity" type="number" inputMode="decimal" className="fd-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min={1} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="calories">Calorie (kcal)</label>
          <input id="calories" type="number" inputMode="decimal" className="fd-input" value={calories} onChange={(e) => setCalories(e.target.value)} required min={0} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="protein">Proteine (g)</label>
          <input id="protein" type="number" inputMode="decimal" className="fd-input" value={protein} onChange={(e) => setProtein(e.target.value)} min={0} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="carbs">Carbo (g)</label>
          <input id="carbs" type="number" inputMode="decimal" className="fd-input" value={carbs} onChange={(e) => setCarbs(e.target.value)} min={0} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="fat">Grassi (g)</label>
          <input id="fat" type="number" inputMode="decimal" className="fd-input" value={fat} onChange={(e) => setFat(e.target.value)} min={0} />
        </div>
      </div>
      <button type="submit" disabled={!valid || submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva pasto'}
      </button>
    </form>
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
          <input id="duration" type="number" inputMode="numeric" className="fd-input" value={duration} onChange={(e) => setDuration(e.target.value)} required min={1} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="w-calories">Calorie (kcal)</label>
          <input id="w-calories" type="number" inputMode="decimal" className="fd-input" value={calories} onChange={(e) => setCalories(e.target.value)} min={0} />
        </div>
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="distance">Distanza (km, facoltativo)</label>
        <input id="distance" type="number" inputMode="decimal" className="fd-input" value={distance} onChange={(e) => setDistance(e.target.value)} min={0} />
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

function QuickSleepForm({ onSubmit }: { onSubmit: (payload: { sleep_date: string; bedtime: string; wake_time: string; duration_minutes: number; quality?: number }) => void }) {
  const [bedTime, setBedTime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState(3)
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
        if (bh >= 12) bed.setDate(bed.getDate() - 1)
        const wake = new Date(today)
        const [wh, wm] = wakeTime.split(':').map(Number)
        wake.setHours(wh, wm, 0, 0)
        const duration = Math.max(Math.round((wake.getTime() - bed.getTime()) / 60000), 0)
        await onSubmit({
          sleep_date: today.toISOString().slice(0, 10),
          bedtime: bed.toISOString(),
          wake_time: wake.toISOString(),
          duration_minutes: duration,
          quality
        })
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="qs-bed">A letto</label>
          <input id="qs-bed" type="time" className="fd-input" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="qs-wake">Sveglia</label>
          <input id="qs-wake" type="time" className="fd-input" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="fd-label mb-1.5 block">Qualità: {quality}/5</label>
        <input type="range" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-steps" />
      </div>
      <button type="submit" disabled={submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva'}
      </button>
    </form>
  )
}
