import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { AIAnalyzeControls } from '@/components/AIAnalyzeControls'
import { useToast } from '@/context/ToastContext'
import { formatNumber } from '@/lib/utils'
import type { AIFoodResult } from '@/lib/aiFood'

export interface FoodItemDraft {
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  salt_g: number
}

interface DraftListItem extends FoodItemDraft {
  clientId: string
}

const EMPTY_DRAFT = {
  name: '',
  quantity: '100',
  unit: 'g',
  calories: '',
  protein: '0',
  carbs: '0',
  fat: '0',
  fiber: '0',
  sugar: '0',
  salt: '0'
}

interface MultiFoodEntryFormProps {
  onSubmitAll: (items: FoodItemDraft[]) => Promise<{ error?: unknown } | void>
  submitLabel?: string
}

export function MultiFoodEntryForm({ onSubmitAll, submitLabel = 'Salva' }: MultiFoodEntryFormProps) {
  const { showToast } = useToast()
  const [items, setItems] = useState<DraftListItem[]>([])
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof typeof EMPTY_DRAFT>(key: K, value: string) => setDraft((p) => ({ ...p, [key]: value }))

  const currentValid = draft.name.trim().length > 0 && Number(draft.calories) >= 0 && Number(draft.quantity) > 0

  const applyAIResult = (r: AIFoodResult) => {
    setDraft({
      name: r.food_name || draft.name,
      quantity: String(r.quantity),
      unit: r.unit || 'g',
      calories: String(Math.round(r.calories)),
      protein: String(r.protein_g),
      carbs: String(r.carbs_g),
      fat: String(r.fat_g),
      fiber: String(r.fiber_g),
      sugar: String(r.sugar_g),
      salt: String(r.salt_g)
    })
  }

  const draftToItem = (): FoodItemDraft => ({
    food_name: draft.name.trim(),
    quantity: Number(draft.quantity),
    unit: draft.unit,
    calories: Number(draft.calories),
    protein_g: Number(draft.protein),
    carbs_g: Number(draft.carbs),
    fat_g: Number(draft.fat),
    fiber_g: Number(draft.fiber),
    sugar_g: Number(draft.sugar),
    salt_g: Number(draft.salt)
  })

  const addToList = () => {
    if (!currentValid) return
    setItems((prev) => [...prev, { clientId: `${Date.now()}-${Math.random()}`, ...draftToItem() }])
    setDraft(EMPTY_DRAFT)
    showToast(`${draft.name.trim()} aggiunto all'elenco`, 'success')
  }

  const removeItem = (clientId: string) => setItems((prev) => prev.filter((i) => i.clientId !== clientId))

  const pendingCount = items.length + (currentValid ? 1 : 0)
  const totalCalories = items.reduce((s, i) => s + i.calories, 0) + (currentValid ? Number(draft.calories) : 0)

  const handleFinalSubmit = async () => {
    const allItems: FoodItemDraft[] = items.map(({ clientId: _clientId, ...rest }) => rest)
    if (currentValid) allItems.push(draftToItem())
    if (allItems.length === 0) return

    setSubmitting(true)
    const result = await onSubmitAll(allItems)
    setSubmitting(false)

    if (!result?.error) {
      setItems([])
      setDraft(EMPTY_DRAFT)
    }
  }

  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="fd-label">Alimenti aggiunti ({items.length})</p>
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.clientId} className="fd-card !py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-base-text">{item.food_name}</p>
                  <p className="text-xs text-base-muted">{formatNumber(item.quantity)} {item.unit} · {Math.round(item.calories)} kcal</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.clientId)}
                  aria-label={`Rimuovi ${item.food_name}`}
                  className="text-base-muted hover:text-move p-1 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={items.length > 0 ? 'border-t border-base-border pt-4 space-y-4' : 'space-y-4'}>
        {items.length > 0 && <p className="fd-label">Aggiungi un altro alimento o bevanda</p>}

        <div>
          <label className="fd-label mb-1.5 block" htmlFor="mf-name">Alimento o bevanda</label>
          <input
            id="mf-name"
            className="fd-input"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Es. Petto di pollo, caffè, '10 chicchi di uva'..."
          />
        </div>

        <AIAnalyzeControls currentName={draft.name} onResult={applyAIResult} onError={(msg) => showToast(msg, 'error')} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-qty">Quantità</label>
            <div className="flex gap-2">
              <input id="mf-qty" type="number" step="any" inputMode="decimal" className="fd-input flex-1" value={draft.quantity} onChange={(e) => set('quantity', e.target.value)} min={0} />
              <input aria-label="Unità" className="fd-input w-16 text-center px-1" value={draft.unit} onChange={(e) => set('unit', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-cal">Calorie (kcal)</label>
            <input id="mf-cal" type="number" step="any" inputMode="decimal" className="fd-input" value={draft.calories} onChange={(e) => set('calories', e.target.value)} min={0} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-p">Prot. (g)</label>
            <input id="mf-p" type="number" step="any" inputMode="decimal" className="fd-input" value={draft.protein} onChange={(e) => set('protein', e.target.value)} min={0} />
          </div>
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-c">Carbo (g)</label>
            <input id="mf-c" type="number" step="any" inputMode="decimal" className="fd-input" value={draft.carbs} onChange={(e) => set('carbs', e.target.value)} min={0} />
          </div>
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-f">Grassi (g)</label>
            <input id="mf-f" type="number" step="any" inputMode="decimal" className="fd-input" value={draft.fat} onChange={(e) => set('fat', e.target.value)} min={0} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-fib">Fibre (g)</label>
            <input id="mf-fib" type="number" step="any" inputMode="decimal" className="fd-input" value={draft.fiber} onChange={(e) => set('fiber', e.target.value)} min={0} />
          </div>
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-sug">Zuccheri (g)</label>
            <input id="mf-sug" type="number" step="any" inputMode="decimal" className="fd-input" value={draft.sugar} onChange={(e) => set('sugar', e.target.value)} min={0} />
          </div>
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="mf-salt">Sale (g)</label>
            <input id="mf-salt" type="number" step="any" inputMode="decimal" className="fd-input" value={draft.salt} onChange={(e) => set('salt', e.target.value)} min={0} />
          </div>
        </div>

        <button type="button" onClick={addToList} disabled={!currentValid} className="fd-btn-ghost flex items-center justify-center gap-2 disabled:opacity-40">
          <Plus size={16} />
          Aggiungi alla lista{items.length > 0 ? ' e continua' : ''}
        </button>
      </div>

      <button
        type="button"
        onClick={handleFinalSubmit}
        disabled={pendingCount === 0 || submitting}
        className="fd-btn-primary"
      >
        {submitting
          ? 'Salvataggio...'
          : pendingCount > 0
            ? `${submitLabel} · ${pendingCount} alimento${pendingCount > 1 ? 'i' : ''} · ${Math.round(totalCalories)} kcal`
            : submitLabel}
      </button>
    </div>
  )
}
