import { useCallback, useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { DailyActivity } from '@/types/database'

export interface DaySummary {
  date: string
  movePct: number
  exercisePct: number
  standPct: number
  workoutsCount: number
  mealsCount: number
  weightLogged: boolean
  sleepLogged: boolean
  habitsCompleted: number
}

export function useCalendarMonth(monthDate: Date) {
  const { user } = useAuth()
  const [summaries, setSummaries] = useState<Record<string, DaySummary>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const from = format(startOfMonth(monthDate), 'yyyy-MM-dd')
    const to = format(endOfMonth(monthDate), 'yyyy-MM-dd')

    const [activityRes, workoutsRes, foodRes, weightRes, sleepRes, habitLogsRes] = await Promise.all([
      supabase.from('daily_activity').select('*').eq('user_id', user.id).gte('activity_date', from).lte('activity_date', to),
      supabase.from('workouts').select('workout_date').eq('user_id', user.id).gte('workout_date', from).lte('workout_date', to),
      supabase.from('food_entries').select('entry_date').eq('user_id', user.id).gte('entry_date', from).lte('entry_date', to),
      supabase.from('body_measurements').select('measured_date').eq('user_id', user.id).gte('measured_date', from).lte('measured_date', to),
      supabase.from('sleep_entries').select('sleep_date').eq('user_id', user.id).gte('sleep_date', from).lte('sleep_date', to),
      supabase.from('habit_logs').select('log_date').eq('user_id', user.id).gte('log_date', from).lte('log_date', to)
    ])

    const map: Record<string, DaySummary> = {}
    const ensure = (date: string): DaySummary => {
      if (!map[date]) {
        map[date] = { date, movePct: 0, exercisePct: 0, standPct: 0, workoutsCount: 0, mealsCount: 0, weightLogged: false, sleepLogged: false, habitsCompleted: 0 }
      }
      return map[date]
    }

    ;((activityRes.data as DailyActivity[]) ?? []).forEach((a) => {
      const s = ensure(a.activity_date)
      s.movePct = a.move_goal > 0 ? Math.round((a.active_calories / a.move_goal) * 100) : 0
      s.exercisePct = a.exercise_goal > 0 ? Math.round((a.exercise_minutes / a.exercise_goal) * 100) : 0
      s.standPct = a.stand_goal > 0 ? Math.round((a.stand_hours / a.stand_goal) * 100) : 0
    })
    ;((workoutsRes.data as { workout_date: string }[]) ?? []).forEach((w) => { ensure(w.workout_date).workoutsCount++ })
    ;((foodRes.data as { entry_date: string }[]) ?? []).forEach((f) => { ensure(f.entry_date).mealsCount++ })
    ;((weightRes.data as { measured_date: string }[]) ?? []).forEach((m) => { ensure(m.measured_date).weightLogged = true })
    ;((sleepRes.data as { sleep_date: string }[]) ?? []).forEach((s) => { ensure(s.sleep_date).sleepLogged = true })
    ;((habitLogsRes.data as { log_date: string }[]) ?? []).forEach((h) => { ensure(h.log_date).habitsCompleted++ })

    setSummaries(map)
    setLoading(false)
  }, [user, monthDate])

  useEffect(() => {
    load()
  }, [load])

  return { summaries, loading, reload: load }
}
