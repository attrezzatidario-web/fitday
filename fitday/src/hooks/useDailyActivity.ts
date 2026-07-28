import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { DailyActivity } from '@/types/database'

const DEFAULTS: Omit<DailyActivity, 'id' | 'user_id' | 'activity_date' | 'created_at' | 'updated_at'> = {
  active_calories: 0,
  resting_calories: 0,
  exercise_minutes: 0,
  stand_hours: 0,
  steps: 0,
  distance_km: 0,
  flights_climbed: 0,
  move_goal: 700,
  exercise_goal: 60,
  stand_goal: 12,
  steps_goal: 10000
}

export function useDailyActivity(dateISO: string) {
  const { user } = useAuth()
  const [data, setData] = useState<DailyActivity | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: row } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', user.id)
      .eq('activity_date', dateISO)
      .maybeSingle()
    setData(row as DailyActivity | null)
    setLoading(false)
  }, [user, dateISO])

  useEffect(() => {
    load()
  }, [load])

  const update = useCallback(
    async (patch: Partial<DailyActivity>) => {
      if (!user) return
      const { data: row, error } = await supabase
        .from('daily_activity')
        .upsert(
          { user_id: user.id, activity_date: dateISO, ...DEFAULTS, ...data, ...patch },
          { onConflict: 'user_id,activity_date' }
        )
        .select('*')
        .single()
      if (!error && row) setData(row as DailyActivity)
      return { error }
    },
    [user, dateISO, data]
  )

  return { data: data ?? { ...DEFAULTS, id: '', user_id: user?.id ?? '', activity_date: dateISO, created_at: '', updated_at: '' }, loading, update, reload: load }
}
