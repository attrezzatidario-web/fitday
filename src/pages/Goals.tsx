import { useState } from 'react'
import { Target, Save } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { useToast } from '@/context/ToastContext'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import type { GoalType } from '@/types/database'

const GOAL_DEFS: { type: GoalType; label: string; unit: string; color: string }[] = [
  { type: 'calories', label: 'Calorie giornaliere', unit: 'kcal', color: '#FA114F' },
  { type: 'exercise_minutes', label: 'Minuti di esercizio', unit: 'min', color: '#A6FF00' },
  { type: 'stand_hours', label: 'Ore in piedi', unit: 'ore', color: '#0AF1F2' },
  { type: 'steps', label: 'Passi giornalieri', unit: 'passi', color: '#B983FF' },
  { type: 'distance_km', label: 'Distanza', unit: 'km', color: '#0A84FF' },
  { type: 'water_ml', label: 'Acqua', unit: 'ml', color: '#0AF1F2' },
  { type: 'food_calories', label: 'Calorie alimentari', unit: 'kcal', color: '#FFD60A' },
  { type: 'protein_g', label: 'Proteine', unit: 'g', color: '#FF375F' },
  { type: 'carbs_g', label: 'Carboidrati', unit: 'g', color: '#FF9F0A' },
  { type: 'fat_g', label: 'Grassi', unit: 'g', color: '#B983FF' },
  { type: 'weight_kg', label: 'Peso obiettivo', unit: 'kg', color: '#B983FF' },
  { type: 'workouts_per_week', label: 'Allenamenti a settimana', unit: 'sessioni', color: '#A6FF00' },
  { type: 'sleep_hours', label: 'Ore di sonno', unit: 'ore', color: '#64D2FF' }
]

export default function Goals() {
  const { getGoal, upsertGoal, loading } = useGoals()
  const { showToast } = useToast()

  if (loading) {
    return (
      <div className="space-y-6 pb-4">
        <h1 className="text-2xl font-bold text-base-text">Obiettivi</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center gap-2">
        <Target size={20} className="text-exercise" />
        <h1 className="text-2xl font-bold text-base-text">Obiettivi</h1>
      </div>
      <p className="text-sm text-base-muted -mt-4">Modifica i tuoi traguardi giornalieri e settimanali. Le modifiche si applicano da subito.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOAL_DEFS.map((def) => (
          <GoalRow
            key={def.type}
            label={def.label}
            unit={def.unit}
            color={def.color}
            currentValue={getGoal(def.type)?.target_value}
            onSave={async (value) => {
              const { error } = await upsertGoal(def.type, value, def.unit)
              showToast(error ? 'Errore durante il salvataggio' : `${def.label} aggiornato`, error ? 'error' : 'success')
            }}
          />
        ))}
      </div>
    </div>
  )
}

function GoalRow({ label, unit, color, currentValue, onSave }: { label: string; unit: string; color: string; currentValue?: number; onSave: (value: number) => void }) {
  const [value, setValue] = useState(currentValue?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const dirty = value !== '' && Number(value) !== currentValue

  return (
    <div className="fd-card">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-sm font-medium text-base-text">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number" step="any"
          inputMode="decimal"
          className="fd-input flex-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Non impostato"
        />
        <span className="text-xs text-base-muted w-14 shrink-0">{unit}</span>
        <button
          onClick={async () => {
            if (!dirty || value === '') return
            setSaving(true)
            await onSave(Number(value))
            setSaving(false)
          }}
          disabled={!dirty || saving}
          aria-label="Salva obiettivo"
          className="w-9 h-9 rounded-full bg-base-invert text-base-invertfg flex items-center justify-center shrink-0 disabled:opacity-30 transition"
        >
          <Save size={14} />
        </button>
      </div>
    </div>
  )
}
