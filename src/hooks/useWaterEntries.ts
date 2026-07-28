import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { WaterEntry } from '@/types/database'

export function useWaterEntries(dateISO: string) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<WaterEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('water_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('entry_date', dateISO)
      .order('logged_at', { ascending: true })
    setEntries((data as WaterEntry[]) ?? [])
    setLoading(false)
  }, [user, dateISO])

  useEffect(() => {
    load()
  }, [load])

  const addWater = useCallback(
    async (amountMl: number) => {
      if (!user) return { error: new Error('Non autenticato') }
      const { data, error } = await supabase
        .from('water_entries')
        .insert({ user_id: user.id, entry_date: dateISO, amount_ml: amountMl })
        .select('*')
        .single()
      if (!error && data) setEntries((prev) => [...prev, data as WaterEntry])
      return { error }
    },
    [user, dateISO]
  )

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('water_entries').delete().eq('id', id)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id))
    return { error }
  }, [])

  const totalMl = entries.reduce((sum, e) => sum + e.amount_ml, 0)

  return { entries, totalMl, loading, addWater, deleteEntry, reload: load }
}
