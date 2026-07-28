import { useCallback, useEffect, useState } from 'react'
import { subDays, format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { SleepEntry } from '@/types/database'

export function useSleepEntries(days = 30) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const fromDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('sleep_date', fromDate)
      .order('sleep_date', { ascending: false })
    setEntries((data as SleepEntry[]) ?? [])
    setLoading(false)
  }, [user, days])

  useEffect(() => {
    load()
  }, [load])

  const addEntry = useCallback(
    async (payload: {
      sleep_date: string
      bedtime: string
      wake_time: string
      duration_minutes: number
      quality?: number
      awakenings?: number
      deep_sleep_minutes?: number
      light_sleep_minutes?: number
      rem_sleep_minutes?: number
      energy_on_wake?: number
      notes?: string
    }) => {
      if (!user) return { error: new Error('Non autenticato') }
      const { data, error } = await supabase
        .from('sleep_entries')
        .insert({ user_id: user.id, ...payload })
        .select('*')
        .single()
      if (!error && data) setEntries((prev) => [data as SleepEntry, ...prev])
      return { error, data }
    },
    [user]
  )

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('sleep_entries').delete().eq('id', id)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id))
    return { error }
  }, [])

  const avgHours = entries.length > 0 ? entries.reduce((s, e) => s + e.duration_minutes, 0) / entries.length / 60 : 0

  return { entries, loading, addEntry, deleteEntry, avgHours, reload: load }
}
