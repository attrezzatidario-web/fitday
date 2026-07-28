import { useState } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Scale, Ruler, Heart, Plus, Trash2 } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListSkeleton } from '@/components/ui/LoadingSkeleton'
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements'
import { useToast } from '@/context/ToastContext'
import { todayISO, formatNumber } from '@/lib/utils'
import type { BodyMeasurement } from '@/types/database'

const CHARTS: { key: keyof BodyMeasurement; label: string; color: string; unit: string }[] = [
  { key: 'weight_kg', label: 'Peso', color: '#B983FF', unit: 'kg' },
  { key: 'body_fat_pct', label: 'Massa grassa', color: '#FA114F', unit: '%' },
  { key: 'waist_cm', label: 'Girovita', color: '#0AF1F2', unit: 'cm' }
]

export default function Body() {
  const { measurements, loading, addMeasurement, deleteMeasurement } = useBodyMeasurements(90)
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const latest = measurements[0]

  const chartData = (key: keyof BodyMeasurement) =>
    measurements
      .filter((m) => m[key] !== null && m[key] !== undefined)
      .slice()
      .reverse()
      .map((m) => ({ date: format(new Date(m.measured_date), 'd MMM', { locale: it }), value: Number(m[key]) }))

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const { error } = await deleteMeasurement(confirmDeleteId)
    showToast(error ? 'Errore durante l\'eliminazione' : 'Misurazione eliminata', error ? 'error' : 'success')
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Corpo e misurazioni</h1>
        <button onClick={() => setFormOpen(true)} className="w-9 h-9 rounded-full bg-base-invert text-base-invertfg flex items-center justify-center">
          <Plus size={17} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Scale} label="Peso" value={latest?.weight_kg} unit="kg" />
        <StatCard icon={Ruler} label="Girovita" value={latest?.waist_cm} unit="cm" />
        <StatCard icon={Heart} label="Battito riposo" value={latest?.resting_heart_rate} unit="bpm" />
      </div>

      {CHARTS.map((chart) => {
        const data = chartData(chart.key)
        if (data.length < 2) return null
        return (
          <div key={chart.key} className="fd-card">
            <h2 className="font-semibold text-[15px] mb-4">{chart.label} — andamento</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                <XAxis dataKey="date" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ background: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2.5} dot={{ r: 3, fill: chart.color }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      })}

      <div>
        <p className="fd-label mb-2.5">Storico</p>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : measurements.length === 0 ? (
          <EmptyState icon={Scale} title="Nessuna misurazione" description="Registra il tuo primo peso o le tue misure corporee." />
        ) : (
          <div className="space-y-1.5">
            {measurements.map((m) => (
              <div key={m.id} className="fd-card !py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{format(new Date(m.measured_date), "d MMMM yyyy", { locale: it })}</p>
                  <p className="text-xs text-base-muted">
                    {[
                      m.weight_kg ? `${m.weight_kg} kg` : null,
                      m.body_fat_pct ? `${m.body_fat_pct}% grasso` : null,
                      m.waist_cm ? `${m.waist_cm} cm vita` : null,
                      m.resting_heart_rate ? `${m.resting_heart_rate} bpm` : null
                    ].filter(Boolean).join(' · ') || 'Nessun dato'}
                  </p>
                </div>
                <button onClick={() => setConfirmDeleteId(m.id)} aria-label="Elimina" className="text-base-muted hover:text-move p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={formOpen} onClose={() => setFormOpen(false)} title="Nuova misurazione">
        <MeasurementForm
          onSubmit={async (payload) => {
            const { error } = await addMeasurement(todayISO(), payload)
            showToast(error ? 'Errore durante il salvataggio' : 'Misurazione registrata', error ? 'error' : 'success')
            if (!error) setFormOpen(false)
          }}
        />
      </Sheet>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Eliminare questa misurazione?"
        description="L'azione non può essere annullata."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, unit }: { icon: typeof Scale; label: string; value?: number | null; unit: string }) {
  return (
    <div className="fd-card !p-3.5">
      <Icon size={14} className="text-steps mb-2" />
      <p className="fd-label">{label}</p>
      <p className="text-lg font-bold tabular-nums mt-0.5">{value != null ? `${formatNumber(value, 1)}` : '—'}<span className="text-xs text-base-muted ml-1">{unit}</span></p>
    </div>
  )
}

function MeasurementForm({ onSubmit }: { onSubmit: (payload: Partial<BodyMeasurement>) => void }) {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [waist, setWaist] = useState('')
  const [chest, setChest] = useState('')
  const [hips, setHips] = useState('')
  const [arm, setArm] = useState('')
  const [thigh, setThigh] = useState('')
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [glucose, setGlucose] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setSubmitting(true)
        await onSubmit({
          weight_kg: weight ? Number(weight) : null,
          body_fat_pct: bodyFat ? Number(bodyFat) : null,
          waist_cm: waist ? Number(waist) : null,
          chest_cm: chest ? Number(chest) : null,
          hips_cm: hips ? Number(hips) : null,
          arm_cm: arm ? Number(arm) : null,
          thigh_cm: thigh ? Number(thigh) : null,
          blood_pressure_systolic: systolic ? Number(systolic) : null,
          blood_pressure_diastolic: diastolic ? Number(diastolic) : null,
          resting_heart_rate: heartRate ? Number(heartRate) : null,
          blood_glucose: glucose ? Number(glucose) : null,
          notes: notes.trim() || null
        })
        setSubmitting(false)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field id="weight" label="Peso (kg)" value={weight} onChange={setWeight} />
        <Field id="bodyFat" label="Massa grassa (%)" value={bodyFat} onChange={setBodyFat} />
      </div>
      <p className="fd-label">Circonferenze (cm)</p>
      <div className="grid grid-cols-2 gap-3">
        <Field id="waist" label="Vita" value={waist} onChange={setWaist} />
        <Field id="chest" label="Torace" value={chest} onChange={setChest} />
        <Field id="hips" label="Fianchi" value={hips} onChange={setHips} />
        <Field id="arm" label="Braccio" value={arm} onChange={setArm} />
        <Field id="thigh" label="Coscia" value={thigh} onChange={setThigh} />
      </div>
      <p className="fd-label">Salute</p>
      <div className="grid grid-cols-2 gap-3">
        <Field id="systolic" label="Pressione sist." value={systolic} onChange={setSystolic} />
        <Field id="diastolic" label="Pressione diast." value={diastolic} onChange={setDiastolic} />
        <Field id="heartRate" label="Battito a riposo" value={heartRate} onChange={setHeartRate} />
        <Field id="glucose" label="Glicemia (facolt.)" value={glucose} onChange={setGlucose} />
      </div>
      <div>
        <label className="fd-label mb-1.5 block" htmlFor="notes">Note</label>
        <textarea id="notes" className="fd-input min-h-[70px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <button type="submit" disabled={submitting} className="fd-btn-primary">
        {submitting ? 'Salvataggio...' : 'Salva misurazione'}
      </button>
    </form>
  )
}

function Field({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="fd-label mb-1.5 block" htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" className="fd-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
