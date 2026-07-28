import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Goal, GoalType } from '@/types/database'

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('goal_type', { ascending: true })
    setGoals((data as Goal[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const upsertGoal = useCallback(
    async (goalType: GoalType, targetValue: number, unit: string) => {
      if (!user) return { error: new Error('Non autenticato') }
      const existing = goals.find((g) => g.goal_type === goalType)

      if (existing) {
        const { data, error } = await supabase
          .from('goals')
          .update({ target_value: targetValue })
          .eq('id', existing.id)
          .select('*')
          .single()
        if (!error && data) {
          await supabase.from('goal_history').insert({
            goal_id: existing.id,
            user_id: user.id,
            previous_value: existing.target_value,
            new_value: targetValue
          })
          setGoals((prev) => prev.map((g) => (g.id === existing.id ? (data as Goal) : g)))
        }
        return { error }
      }

      const { data, error } = await supabase
        .from('goals')
        .insert({ user_id: user.id, goal_type: goalType, target_value: targetValue, unit })
        .select('*')
        .single()
      if (!error && data) setGoals((prev) => [...prev, data as Goal])
      return { error }
    },
    [user, goals]
  )

  const getGoal = useCallback((goalType: GoalType) => goals.find((g) => g.goal_type === goalType), [goals])

  return { goals, loading, upsertGoal, getGoal, reload: load }
}
