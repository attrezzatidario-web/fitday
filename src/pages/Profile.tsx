import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Save, User as UserIcon, Scale, Moon, ListChecks, Calendar, Target, Settings as SettingsIcon, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import type { ActivityLevel, PrimaryGoal, Units } from '@/types/database'

const MORE_LINKS = [
  { to: '/body', label: 'Corpo e misurazioni', icon: Scale },
  { to: '/sleep', label: 'Sonno', icon: Moon },
  { to: '/habits', label: 'Abitudini', icon: ListChecks },
  { to: '/calendar', label: 'Calendario', icon: Calendar },
  { to: '/goals', label: 'Obiettivi', icon: Target },
  { to: '/settings', label: 'Impostazioni', icon: SettingsIcon }
]

export default function Profile() {
  const { profile, user, refreshProfile, signOut } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [heightCm, setHeightCm] = useState(profile?.height_cm?.toString() ?? '')
  const [currentWeight, setCurrentWeight] = useState(profile?.current_weight_kg?.toString() ?? '')
  const [targetWeight, setTargetWeight] = useState(profile?.target_weight_kg?.toString() ?? '')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activity_level ?? 'moderate')
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>(profile?.primary_goal ?? 'maintain')
  const [units, setUnits] = useState<Units>(profile?.units ?? 'metric')

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        height_cm: heightCm ? Number(heightCm) : null,
        current_weight_kg: currentWeight ? Number(currentWeight) : null,
        target_weight_kg: targetWeight ? Number(targetWeight) : null,
        activity_level: activityLevel,
        primary_goal: primaryGoal,
        units
      })
      .eq('id', user.id)
    if (!error) await refreshProfile()
    showToast(error ? 'Errore durante il salvataggio' : 'Profilo aggiornato', error ? 'error' : 'success')
    setSaving(false)
  }

  return (
    <div className="space-y-6 pb-4 max-w-lg">
      <h1 className="text-2xl font-bold">Profilo</h1>

      <div className="fd-card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-steps to-stand flex items-center justify-center text-xl font-bold shrink-0 text-base-invertfg">
          {profile?.full_name?.[0]?.toUpperCase() ?? <UserIcon size={22} />}
        </div>
        <div>
          <p className="font-semibold">{profile?.full_name || 'Utente FitDay'}</p>
          <p className="text-sm text-base-muted">{user?.email}</p>
        </div>
      </div>

      <div className="fd-card space-y-4">
        <h2 className="font-semibold text-[15px]">Dati personali</h2>
        <div>
          <label className="fd-label mb-1.5 block" htmlFor="name">Nome</label>
          <input id="name" className="fd-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="height">Altezza (cm)</label>
            <input id="height" type="number" className="fd-input" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </div>
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="cw">Peso (kg)</label>
            <input id="cw" type="number" inputMode="decimal" className="fd-input" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
          </div>
          <div>
            <label className="fd-label mb-1.5 block" htmlFor="tw">Obiettivo (kg)</label>
            <input id="tw" type="number" inputMode="decimal" className="fd-input" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="fd-card space-y-4">
        <h2 className="font-semibold text-[15px]">Obiettivo e attività</h2>
        <div>
          <label className="fd-label mb-1.5 block">Livello di attività</label>
          <select className="fd-input" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}>
            <option value="sedentary">Sedentario</option>
            <option value="light">Leggero</option>
            <option value="moderate">Moderato</option>
            <option value="active">Attivo</option>
            <option value="very_active">Molto attivo</option>
          </select>
        </div>
        <div>
          <label className="fd-label mb-1.5 block">Obiettivo principale</label>
          <select className="fd-input" value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value as PrimaryGoal)}>
            <option value="lose_weight">Perdita di peso</option>
            <option value="maintain">Mantenimento</option>
            <option value="gain_muscle">Massa muscolare</option>
            <option value="improve_fitness">Forma fisica</option>
          </select>
        </div>
        <div>
          <label className="fd-label mb-1.5 block">Unità di misura</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setUnits('metric')} className={`rounded-xl py-2.5 text-[13px] font-medium ${units === 'metric' ? 'bg-base-invert text-base-invertfg' : 'bg-base-card2'}`}>Metriche</button>
            <button type="button" onClick={() => setUnits('imperial')} className={`rounded-xl py-2.5 text-[13px] font-medium ${units === 'imperial' ? 'bg-base-invert text-base-invertfg' : 'bg-base-card2'}`}>Imperiali</button>
          </div>
        </div>
      </div>

      <div className="fd-card !p-0 overflow-hidden md:hidden">
        {MORE_LINKS.map((link, i) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${i !== MORE_LINKS.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
          >
            <link.icon size={16} className="text-base-muted" />
            <span className="text-sm flex-1">{link.label}</span>
            <ChevronRight size={15} className="text-base-muted" />
          </button>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving} className="fd-btn-primary flex items-center justify-center gap-2">
        <Save size={16} />
        {saving ? 'Salvataggio...' : 'Salva modifiche'}
      </button>

      <button onClick={signOut} className="w-full flex items-center justify-center gap-2 text-move font-semibold py-3.5 text-[15px]">
        <LogOut size={16} />
        Esci
      </button>
    </div>
  )
}
