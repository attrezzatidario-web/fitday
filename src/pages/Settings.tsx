import { Bell, Download, Droplets, Dumbbell, Sparkles } from 'lucide-react'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'

export default function Settings() {
  const { settings, loading, update } = useUserSettings()
  const { showToast } = useToast()
  const { user } = useAuth()

  const toggle = async (key: 'notifications_enabled' | 'water_reminder_enabled' | 'workout_reminder_enabled' | 'daily_summary_enabled') => {
    if (!settings) return
    const result = await update({ [key]: !settings[key] })
    if (result?.error) showToast('Errore durante il salvataggio', 'error')
  }

  const handleExport = async () => {
    if (!user) return
    showToast('Preparazione esportazione...', 'info')
    const tables = ['daily_activity', 'workouts', 'food_entries', 'water_entries', 'body_measurements', 'sleep_entries', 'habits', 'habit_logs', 'goals'] as const
    const results: Record<string, unknown> = {}
    for (const table of tables) {
      const { data } = await supabase.from(table).select('*').eq('user_id', user.id)
      results[table] = data ?? []
    }
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitday-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Esportazione completata', 'success')
  }

  if (loading || !settings) return <CardSkeleton />

  return (
    <div className="space-y-6 pb-4 max-w-lg">
      <h1 className="text-2xl font-bold">Impostazioni</h1>

      <div className="fd-card space-y-1">
        <h2 className="font-semibold text-[15px] mb-3">Notifiche</h2>
        <ToggleRow icon={Bell} label="Notifiche abilitate" checked={settings.notifications_enabled} onChange={() => toggle('notifications_enabled')} />
        <ToggleRow icon={Droplets} label="Promemoria acqua" checked={settings.water_reminder_enabled} onChange={() => toggle('water_reminder_enabled')} />
        <ToggleRow icon={Dumbbell} label="Promemoria allenamento" checked={settings.workout_reminder_enabled} onChange={() => toggle('workout_reminder_enabled')} />
        <ToggleRow icon={Sparkles} label="Riepilogo giornaliero" checked={settings.daily_summary_enabled} onChange={() => toggle('daily_summary_enabled')} />
      </div>

      <div className="fd-card">
        <h2 className="font-semibold text-[15px] mb-3">Dati</h2>
        <button onClick={handleExport} className="fd-btn-ghost flex items-center justify-center gap-2">
          <Download size={16} />
          Esporta i miei dati (JSON)
        </button>
      </div>
    </div>
  )
}

function ToggleRow({ icon: Icon, label, checked, onChange }: { icon: typeof Bell; label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        <Icon size={16} className="text-base-muted" />
        <span className="text-sm">{label}</span>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`w-11 h-6 rounded-full relative transition ${checked ? 'bg-exercise' : 'bg-base-card2'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
