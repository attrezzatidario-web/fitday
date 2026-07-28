import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { ActivityLevel, PrimaryGoal, Units } from '@/types/database'

interface OnboardingData {
  fullName: string
  sex: 'male' | 'female' | 'other' | 'unspecified'
  birthDate: string
  heightCm: string
  currentWeightKg: string
  targetWeightKg: string
  units: Units
  activityLevel: ActivityLevel
  primaryGoal: PrimaryGoal
  caloriesGoal: string
  stepsGoal: string
  exerciseGoal: string
  standGoal: string
  waterGoal: string
  sleepGoal: string
}

const DEFAULTS: OnboardingData = {
  fullName: '',
  sex: 'unspecified',
  birthDate: '',
  heightCm: '',
  currentWeightKg: '',
  targetWeightKg: '',
  units: 'metric',
  activityLevel: 'moderate',
  primaryGoal: 'maintain',
  caloriesGoal: '2200',
  stepsGoal: '10000',
  exerciseGoal: '60',
  standGoal: '12',
  waterGoal: '2000',
  sleepGoal: '8'
}

const STEPS = ['Chi sei', 'Corpo', 'Obiettivo', 'Traguardi giornalieri']

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(DEFAULTS)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const isLastStep = step === STEPS.length - 1

  const finish = async () => {
    if (!user) return
    setSaving(true)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName || null,
        sex: data.sex,
        birth_date: data.birthDate || null,
        height_cm: data.heightCm ? Number(data.heightCm) : null,
        current_weight_kg: data.currentWeightKg ? Number(data.currentWeightKg) : null,
        target_weight_kg: data.targetWeightKg ? Number(data.targetWeightKg) : null,
        activity_level: data.activityLevel,
        primary_goal: data.primaryGoal,
        units: data.units,
        onboarding_completed: true
      })
      .eq('id', user.id)

    if (profileError) {
      showToast('Errore nel salvataggio del profilo, riprova.', 'error')
      setSaving(false)
      return
    }

    const goalRows = [
      { user_id: user.id, goal_type: 'calories' as const, target_value: Number(data.caloriesGoal), unit: 'kcal' },
      { user_id: user.id, goal_type: 'steps' as const, target_value: Number(data.stepsGoal), unit: 'passi' },
      { user_id: user.id, goal_type: 'exercise_minutes' as const, target_value: Number(data.exerciseGoal), unit: 'min' },
      { user_id: user.id, goal_type: 'stand_hours' as const, target_value: Number(data.standGoal), unit: 'ore' },
      { user_id: user.id, goal_type: 'water_ml' as const, target_value: Number(data.waterGoal), unit: 'ml' },
      { user_id: user.id, goal_type: 'sleep_hours' as const, target_value: Number(data.sleepGoal), unit: 'ore' }
    ]
    await supabase.from('goals').insert(goalRows)

    await supabase.from('daily_activity').upsert(
      {
        user_id: user.id,
        activity_date: new Date().toISOString().slice(0, 10),
        move_goal: Number(data.caloriesGoal) * 0.3,
        exercise_goal: Number(data.exerciseGoal),
        stand_goal: Number(data.standGoal),
        steps_goal: Number(data.stepsGoal)
      },
      { onConflict: 'user_id,activity_date' }
    )

    await refreshProfile()
    setSaving(false)
    navigate('/', { replace: true })
  }

  const next = () => {
    if (isLastStep) {
      finish()
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8 flex flex-col">
      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} aria-label="Indietro" className="w-8 h-8 rounded-full bg-base-card2 flex items-center justify-center">
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="flex-1 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-base-card2'}`} />
            ))}
          </div>
        </div>

        <h1 className="text-xl font-bold mb-1">{STEPS[step]}</h1>
        <p className="text-sm text-base-muted mb-6">
          {step === 0 && 'Raccontaci qualcosa di te'}
          {step === 1 && 'Dati facoltativi, modificabili in ogni momento'}
          {step === 2 && 'Cosa vuoi ottenere con FitDay?'}
          {step === 3 && 'Puoi cambiarli quando vuoi dalla sezione Obiettivi'}
        </p>

        <div className="flex-1 space-y-4 animate-fade-up" key={step}>
          {step === 0 && (
            <>
              <div>
                <label className="fd-label mb-1.5 block" htmlFor="fullName">Nome</label>
                <input id="fullName" className="fd-input" value={data.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Il tuo nome" />
              </div>
              <div>
                <label className="fd-label mb-1.5 block">Sesso (facoltativo)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('sex', s)}
                      className={`rounded-xl py-2.5 text-[13px] font-medium ${data.sex === s ? 'bg-white text-black' : 'bg-base-card2'}`}
                    >
                      {s === 'male' ? 'Uomo' : s === 'female' ? 'Donna' : 'Altro'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="fd-label mb-1.5 block" htmlFor="birthDate">Data di nascita</label>
                <input id="birthDate" type="date" className="fd-input" value={data.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="fd-label mb-1.5 block">Unità di misura</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => set('units', 'metric')} className={`rounded-xl py-2.5 text-[13px] font-medium ${data.units === 'metric' ? 'bg-white text-black' : 'bg-base-card2'}`}>Metriche (kg, cm)</button>
                  <button type="button" onClick={() => set('units', 'imperial')} className={`rounded-xl py-2.5 text-[13px] font-medium ${data.units === 'imperial' ? 'bg-white text-black' : 'bg-base-card2'}`}>Imperiali (lb, ft)</button>
                </div>
              </div>
              <div>
                <label className="fd-label mb-1.5 block" htmlFor="height">Altezza (cm)</label>
                <input id="height" type="number" inputMode="decimal" className="fd-input" value={data.heightCm} onChange={(e) => set('heightCm', e.target.value)} placeholder="Es. 175" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="curWeight">Peso attuale (kg)</label>
                  <input id="curWeight" type="number" inputMode="decimal" className="fd-input" value={data.currentWeightKg} onChange={(e) => set('currentWeightKg', e.target.value)} placeholder="Es. 70" />
                </div>
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="targetWeight">Peso obiettivo (kg)</label>
                  <input id="targetWeight" type="number" inputMode="decimal" className="fd-input" value={data.targetWeightKg} onChange={(e) => set('targetWeightKg', e.target.value)} placeholder="Es. 68" />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="fd-label mb-1.5 block">Livello di attività</label>
                <div className="space-y-2">
                  {([
                    ['sedentary', 'Sedentario'],
                    ['light', 'Leggero'],
                    ['moderate', 'Moderato'],
                    ['active', 'Attivo'],
                    ['very_active', 'Molto attivo']
                  ] as [ActivityLevel, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => set('activityLevel', val)}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm font-medium ${data.activityLevel === val ? 'bg-white text-black' : 'bg-base-card2'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="fd-label mb-1.5 block">Obiettivo principale</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['lose_weight', 'Perdita di peso'],
                    ['maintain', 'Mantenimento'],
                    ['gain_muscle', 'Massa muscolare'],
                    ['improve_fitness', 'Forma fisica']
                  ] as [PrimaryGoal, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => set('primaryGoal', val)}
                      className={`rounded-xl py-3 text-[13px] font-medium ${data.primaryGoal === val ? 'bg-white text-black' : 'bg-base-card2'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="calGoal">Calorie (kcal)</label>
                  <input id="calGoal" type="number" className="fd-input" value={data.caloriesGoal} onChange={(e) => set('caloriesGoal', e.target.value)} />
                </div>
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="stepsGoal">Passi</label>
                  <input id="stepsGoal" type="number" className="fd-input" value={data.stepsGoal} onChange={(e) => set('stepsGoal', e.target.value)} />
                </div>
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="exGoal">Esercizio (min)</label>
                  <input id="exGoal" type="number" className="fd-input" value={data.exerciseGoal} onChange={(e) => set('exerciseGoal', e.target.value)} />
                </div>
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="standGoal">In piedi (ore)</label>
                  <input id="standGoal" type="number" className="fd-input" value={data.standGoal} onChange={(e) => set('standGoal', e.target.value)} />
                </div>
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="waterGoal">Acqua (ml)</label>
                  <input id="waterGoal" type="number" className="fd-input" value={data.waterGoal} onChange={(e) => set('waterGoal', e.target.value)} />
                </div>
                <div>
                  <label className="fd-label mb-1.5 block" htmlFor="sleepGoal">Sonno (ore)</label>
                  <input id="sleepGoal" type="number" className="fd-input" value={data.sleepGoal} onChange={(e) => set('sleepGoal', e.target.value)} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-6 space-y-2.5">
          <button onClick={next} disabled={saving} className="fd-btn-primary flex items-center justify-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isLastStep ? (saving ? 'Configurazione...' : 'Inizia con FitDay') : 'Continua'}
          </button>
          {!isLastStep && (
            <button onClick={() => setStep((s) => s + 1)} className="w-full text-center text-sm text-base-muted py-1">
              Salta per ora
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
