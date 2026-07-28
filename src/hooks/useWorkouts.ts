import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Workout, WorkoutType } from '@/types/database'

export function useWorkouts(dateISO: string) {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('workout_date', dateISO)
      .order('created_at', { ascending: true })
    setWorkouts((data as Workout[]) ?? [])
    setLoading(false)
  }, [user, dateISO])

  useEffect(() => {
    load()
  }, [load])

  const addWorkout = useCallback(
    async (workout: {
      name: string
      workout_type: WorkoutType
      duration_minutes: number
      calories?: number
      distance_km?: number
      avg_heart_rate?: number
      perceived_effort?: number
      notes?: string
    }) => {
      if (!user) return { error: new Error('Non autenticato') }
      const { data, error } = await supabase
        .from('workouts')
        .insert({ user_id: user.id, workout_date: dateISO, ...workout })
        .select('*')
        .single()
      if (!error && data) setWorkouts((prev) => [...prev, data as Workout])
      return { error, data }
    },
    [user, dateISO]
  )

  const deleteWorkout = useCallback(async (id: string) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (!error) setWorkouts((prev) => prev.filter((w) => w.id !== id))
    return { error }
  }, [])

  return { workouts, loading, addWorkout, deleteWorkout, reload: load }
}
