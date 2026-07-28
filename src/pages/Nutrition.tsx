import { useState } from 'react'
import { format } from 'date-fns'
import { Utensils, Trash2, Plus, PieChart } from 'lucide-react'
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { DateSelector } from '@/components/DateSelector'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListSkeleton } from '@/components/ui/LoadingSkeleton'
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
  const { entries, totals, loading, addEntry, deleteEntry } = useFoodEntries(dateISO)
  const { showToast } = useToast()

  const [addSheetMeal, setAddSheetMeal] = useState<MealType | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const remaining = CALORIES_GOAL - totals.calories

  const macroData = [
    { name: 'Proteine', value: totals.protein * 4, color: MACRO_COLORS.protein },
    { name: 'Carboidrati', value: totals.carbs * 4, color: MACRO_COLORS.carbs },
    { name: 'Grassi', value: totals.fat * 9, color: MACRO_COLORS.fat }
  ].filter((d) => d.value > 0)

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
        <h1 className="text-2xl font-bold">Alimentazione</h1>
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* RIEPILOGO CALORIE */}
      <div className="fd-card flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-36 h-36 shrink-0">
          {macroData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={macroData} dataKey="value" innerRadius={48} outerRadius={64} paddingAngle={3} stroke="none">
                  {macroData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-full border-8 border-base-card2 flex items-center justify-center">
              <PieChart size={24} className="text-base-muted" />
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums">{formatNumber(Math.max(remaining, 0))}</span>
            <span className="text-[10px] text-base-muted">kcal rimanenti</span>
          </div>
        </div>
        <div className="flex-1 w-full grid grid-cols-3 gap-3">
          <MacroStat label="Proteine" value={totals.protein} color={MACRO_COLORS.protein} />
          <MacroStat label="Carboidrati" value={totals.carbs} color={MACRO_COLORS.carbs} />
          <MacroStat label="Grassi" value={totals.fat} color={MACRO_COLORS.fat} />
        </div>
      </div>

      <div className="fd-card !py-3 flex items-center justify-between">
        <span className="text-sm text-base-muted">Calorie assunte oggi</span>
        <span className="font-bold tabular-nums">{formatNumber(totals.calories)} / {formatNumber(CALORIES_GOAL)} kcal</span>
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
                  <h3 className="font-semibold text-[14px]">{meal.label}</h3>
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
          <QuickFoodForm
            onSubmit={async (payload) => {
              const { error } = await addEntry({ meal_type: addSheetMeal, ...payload })
              showToast(error ? 'Errore durante il salvataggio' : 'Alimento aggiunto', error ? 'error' : 'success')
              if (!error) setAddSheetMeal(null)
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
      <p className="font-bold tabular-nums">{formatNumber(value)}g</p>
    </div>
  )
}

function FoodRow({ entry, onDelete }: { entry: FoodEntry; onDelete: () => void }) {
  return (
    <div className="fd-card !py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{entry.food_name}</p>
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

function QuickFoodForm({ onSubmit }: { onSubmit: (payload: { food_name: string; quantity: number; unit: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }) => void }) {
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
        <label className="fd-label mb-1.5 block" htmlFor="fn">Alimento</label>
        <input id="fn" className="fd-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Yogurt greco" required autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="fq">Quantità (g)</label>
          <input id="fq" type="number" inputMode="decimal" className="fd-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min={1} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="fc">Calorie (kcal)</label>
          <input id="fc" type="number" inputMode="decimal" className="fd-input" value={calories} onChange={(e) => setCalories(e.target.value)} required min={0} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="fp">Prot. (g)</label>
          <input id="fp" type="number" inputMode="decimal" className="fd-input" value={protein} onChange={(e) => setProtein(e.target.value)} min={0} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="fcarb">Carbo (g)</label>
          <input id="fcarb" type="number" inputMode="decimal" className="fd-input" value={carbs} onChange={(e) => setCarbs(e.target.value)} min={0} />
        </div>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="ff">Grassi (g)</label>
          <input id="ff" type="number" inputMode="decimal" className="fd-input" value={fat} onChange={(e) => setFat(e.target.value)} min={0} />
        </div>
      </div>
      <button type="submit" disabled={!valid || submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Aggiungi alimento'}
      </button>
    </form>
  )
}
