import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Utensils, Trash2, Plus } from 'lucide-react'
import { DateSelector } from '@/components/DateSelector'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListSkeleton } from '@/components/ui/LoadingSkeleton'
import { MultiFoodEntryForm } from '@/components/MultiFoodEntryForm'
import { useFoodEntries } from '@/hooks/useFoodEntries'
import { useToast } from '@/context/ToastContext'
import { formatNumber } from '@/lib/utils'
import type { FoodEntry, MealType } from '@/types/database'

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Colazione' },
  { value: 'morning_snack', label: 'Spuntino mattutino' },
  { value: 'lunch', label: 'Pranzo' },
  { value: 'afternoon_snack', label: 'Spuntino pomeridiano' },
  { value: 'dinner', label: 'Cena' },
  { value: 'other', label: 'Altro' }
]

const CALORIES_GOAL = 2200
const MACRO_COLORS = { protein: '#FF375F', carbs: '#FF9F0A', fat: '#B983FF' }

export default function Nutrition() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateISO = format(selectedDate, 'yyyy-MM-dd')
  const { entries, totals, loading, addMultipleEntries, deleteEntry } = useFoodEntries(dateISO)
  const { showToast } = useToast()

  const [addSheetMeal, setAddSheetMeal] = useState<MealType | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const entriesByMeal = (meal: MealType) => entries.filter((e) => e.meal_type === meal)

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const { error } = await deleteEntry(confirmDeleteId)
    showToast(error ? 'Errore durante l\'eliminazione' : 'Alimento rimosso', error ? 'error' : 'success')
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-base-text">Alimentazione</h1>
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* RIEPILOGO CALORIE */}
      <div className="fd-card flex flex-col md:flex-row items-center gap-6">
        <CalorieRing consumed={totals.calories} goal={CALORIES_GOAL} />
        <div className="flex-1 w-full grid grid-cols-3 gap-3">
          <MacroStat label="Proteine" value={totals.protein} color={MACRO_COLORS.protein} />
          <MacroStat label="Carboidrati" value={totals.carbs} color={MACRO_COLORS.carbs} />
          <MacroStat label="Grassi" value={totals.fat} color={MACRO_COLORS.fat} />
        </div>
      </div>

      <div className="fd-card !py-3 flex items-center justify-between">
        <span className="text-sm text-base-muted">Calorie assunte oggi</span>
        <span className="font-bold tabular-nums text-base-text">{formatNumber(totals.calories)} / {formatNumber(CALORIES_GOAL)} kcal</span>
      </div>

      {/* PASTI */}
      {loading ? (
        <ListSkeleton rows={3} />
      ) : (
        <div className="space-y-4">
          {MEAL_TYPES.map((meal) => {
            const mealEntries = entriesByMeal(meal.value)
            const mealCalories = mealEntries.reduce((s, e) => s + Number(e.calories), 0)
            return (
              <div key={meal.value}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[14px] text-base-text">{meal.label}</h3>
                  <div className="flex items-center gap-2">
                    {mealEntries.length > 0 && <span className="text-xs text-base-muted">{Math.round(mealCalories)} kcal</span>}
                    <button
                      onClick={() => setAddSheetMeal(meal.value)}
                      aria-label={`Aggiungi a ${meal.label}`}
                      className="w-6 h-6 rounded-full bg-base-card2 flex items-center justify-center"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                {mealEntries.length === 0 ? (
                  <button onClick={() => setAddSheetMeal(meal.value)} className="fd-card w-full text-left !py-3 text-sm text-base-muted">
                    Nessun alimento aggiunto
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    {mealEntries.map((entry) => (
                      <FoodRow key={entry.id} entry={entry} onDelete={() => setConfirmDeleteId(entry.id)} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {entries.length === 0 && !loading && (
        <EmptyState icon={Utensils} title="Nessun pasto registrato" description="Aggiungi il tuo primo alimento per iniziare a tracciare la giornata." />
      )}

      <Sheet open={addSheetMeal !== null} onClose={() => setAddSheetMeal(null)} title={addSheetMeal ? `Aggiungi a ${MEAL_TYPES.find((m) => m.value === addSheetMeal)?.label}` : ''}>
        {addSheetMeal && (
          <MultiFoodEntryForm
            submitLabel="Salva pasto"
            onSubmitAll={async (foodItems) => {
              const { error } = await addMultipleEntries(addSheetMeal, foodItems)
              showToast(
                error ? 'Errore durante il salvataggio' : `${foodItems.length} alimento${foodItems.length > 1 ? 'i' : ''} aggiunto${foodItems.length > 1 ? 'i' : ''}`,
                error ? 'error' : 'success'
              )
              if (!error) setAddSheetMeal(null)
              return { error }
            }}
          />
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Eliminare questo alimento?"
        description="L'azione non può essere annullata."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function MacroStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] text-base-muted">{label}</span>
      </div>
      <p className="font-bold tabular-nums text-base-text">{formatNumber(value)}g</p>
    </div>
  )
}

function FoodRow({ entry, onDelete }: { entry: FoodEntry; onDelete: () => void }) {
  return (
    <div className="fd-card !py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-base-text">{entry.food_name}</p>
        <p className="text-xs text-base-muted">
          {formatNumber(entry.quantity)} {entry.unit} · {Math.round(entry.calories)} kcal
        </p>
      </div>
      <button onClick={onDelete} aria-label="Elimina" className="text-base-muted hover:text-move p-1">
        <Trash2 size={15} />
      </button>
    </div>
  )
}

function CalorieRing({ consumed, goal, size = 128 }: { consumed: number; goal: number; size?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const remaining = Math.max(goal - consumed, 0)
  const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0
  const strokeWidth = size * 0.09
  const radius = size / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-base-card2" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFD60A"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? circumference * (1 - pct) : circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.65,0,0.35,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-base-text">{formatNumber(remaining)}</span>
        <span className="text-[10px] text-base-muted text-center px-2">kcal rimanenti</span>
      </div>
    </div>
  )
}
