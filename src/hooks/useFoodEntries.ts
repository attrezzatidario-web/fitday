import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { FoodEntry, MealType } from '@/types/database'

export function useFoodEntries(dateISO: string) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', dateISO)
      .order('created_at', { ascending: true })
    setEntries((data as FoodEntry[]) ?? [])
    setLoading(false)
  }, [user, dateISO])

  useEffect(() => {
    load()
  }, [load])

  const addEntry = useCallback(
    async (entry: {
      meal_type: MealType
      food_name: string
      quantity: number
      unit: string
      calories: number
      protein_g?: number
      carbs_g?: number
      fat_g?: number
      fiber_g?: number
      sugar_g?: number
      salt_g?: number
      notes?: string
    }) => {
      if (!user) return { error: new Error('Non autenticato') }
      const { data, error } = await supabase
        .from('food_entries')
        .insert({ user_id: user.id, entry_date: dateISO, ...entry })
        .select('*')
        .single()
      if (!error && data) setEntries((prev) => [...prev, data as FoodEntry])
      return { error }
    },
    [user, dateISO]
  )

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('food_entries').delete().eq('id', id)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id))
    return { error }
  }, [])

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.calories),
      protein: acc.protein + Number(e.protein_g),
      carbs: acc.carbs + Number(e.carbs_g),
      fat: acc.fat + Number(e.fat_g)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return { entries, totals, loading, addEntry, deleteEntry, reload: load }
}
