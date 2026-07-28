import { useCallback, useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Habit, HabitLog } from '@/types/database'

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logsByDate, setLogsByDate] = useState<Record<string, HabitLog[]>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: true })

    const fromDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', fromDate)

    const grouped: Record<string, HabitLog[]> = {}
    ;(logsData ?? []).forEach((log) => {
      const l = log as HabitLog
      if (!grouped[l.habit_id]) grouped[l.habit_id] = []
      grouped[l.habit_id].push(l)
    })

    setHabits((habitsData as Habit[]) ?? [])
    setLogsByDate(grouped)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const addHabit = useCallback(
    async (payload: { name: string; icon?: string; color?: string; frequency?: 'daily' | 'weekly' | 'custom'; target_value?: number; unit?: string }) => {
      if (!user) return { error: new Error('Non autenticato') }
      const { data, error } = await supabase
        .from('habits')
        .insert({ user_id: user.id, ...payload })
        .select('*')
        .single()
      if (!error && data) setHabits((prev) => [...prev, data as Habit])
      return { error, data }
    },
    [user]
  )

  const archiveHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').update({ is_archived: true }).eq('id', id)
    if (!error) setHabits((prev) => prev.filter((h) => h.id !== id))
    return { error }
  }, [])

  const toggleToday = useCallback(
    async (habitId: string) => {
      if (!user) return { error: new Error('Non autenticato') }
      const todayISO = format(new Date(), 'yyyy-MM-dd')
      const existing = logsByDate[habitId]?.find((l) => l.log_date === todayISO)

      if (existing) {
        const { error } = await supabase.from('habit_logs').delete().eq('id', existing.id)
        if (!error) {
          setLogsByDate((prev) => ({
            ...prev,
            [habitId]: prev[habitId].filter((l) => l.id !== existing.id)
          }))
          const habit = habits.find((h) => h.id === habitId)
          if (habit) {
            await supabase.from('habits').update({ current_streak: Math.max(habit.current_streak - 1, 0) }).eq('id', habitId)
            setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, current_streak: Math.max(h.current_streak - 1, 0) } : h)))
          }
        }
        return { error }
      }

      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ user_id: user.id, habit_id: habitId, log_date: todayISO, value: 1, completed: true })
        .select('*')
        .single()

      if (!error && data) {
        setLogsByDate((prev) => ({
          ...prev,
          [habitId]: [...(prev[habitId] ?? []), data as HabitLog]
        }))
        const habit = habits.find((h) => h.id === habitId)
        if (habit) {
          const newStreak = habit.current_streak + 1
          const newBest = Math.max(habit.best_streak, newStreak)
          await supabase.from('habits').update({ current_streak: newStreak, best_streak: newBest }).eq('id', habitId)
          setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, current_streak: newStreak, best_streak: newBest } : h)))
        }
      }
      return { error }
    },
    [user, logsByDate, habits]
  )

  const isCompletedToday = useCallback(
    (habitId: string) => {
      const todayISO = format(new Date(), 'yyyy-MM-dd')
      return !!logsByDate[habitId]?.some((l) => l.log_date === todayISO)
    },
    [logsByDate]
  )

  return { habits, logsByDate, loading, addHabit, archiveHabit, toggleToday, isCompletedToday, reload: load }
}
