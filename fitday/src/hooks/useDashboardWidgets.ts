import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export const ALL_DASHBOARD_WIDGETS = [
  { key: 'steps', label: 'Passi' },
  { key: 'distance', label: 'Distanza' },
  { key: 'active_calories', label: 'Calorie attive' },
  { key: 'total_calories', label: 'Calorie totali' },
  { key: 'workouts', label: 'Allenamento' },
  { key: 'water', label: 'Acqua' },
  { key: 'calories_in', label: 'Calorie assunte' },
  { key: 'protein', label: 'Proteine' },
  { key: 'carbs', label: 'Carboidrati' },
  { key: 'fat', label: 'Grassi' },
  { key: 'weight', label: 'Peso' },
  { key: 'balance', label: 'Bilancio calorico' },
  { key: 'sleep', label: 'Sonno' },
  { key: 'habits', label: 'Abitudini' }
] as const

export type DashboardWidgetKey = (typeof ALL_DASHBOARD_WIDGETS)[number]['key']

const DEFAULT_WIDGETS: DashboardWidgetKey[] = ALL_DASHBOARD_WIDGETS.map((w) => w.key)

export function useDashboardWidgets() {
  const { user } = useAuth()
  const [widgets, setWidgets] = useState<DashboardWidgetKey[]>(DEFAULT_WIDGETS)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('user_settings').select('dashboard_widgets').eq('user_id', user.id).maybeSingle()
    const stored = data?.dashboard_widgets
    if (stored && Array.isArray(stored) && stored.length > 0) {
      setWidgets(stored as DashboardWidgetKey[])
    } else {
      setWidgets(DEFAULT_WIDGETS)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(
    async (next: DashboardWidgetKey[]) => {
      if (!user) return
      setWidgets(next)
      await supabase.from('user_settings').upsert({ user_id: user.id, dashboard_widgets: next }, { onConflict: 'user_id' })
    },
    [user]
  )

  const toggle = useCallback(
    (key: DashboardWidgetKey) => {
      const next = widgets.includes(key) ? widgets.filter((w) => w !== key) : [...widgets, key]
      save(next)
    },
    [widgets, save]
  )

  const isVisible = useCallback((key: DashboardWidgetKey) => widgets.includes(key), [widgets])

  return { widgets, loading, toggle, save, isVisible }
}
