import { useCallback, useEffect, useState } from 'react'
import { subDays, format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { DailyActivity } from '@/types/database'

export function useActivityHistory(days: number) {
  const { user } = useAuth()
  const [history, setHistory] = useState<DailyActivity[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const fromDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', user.id)
      .gte('activity_date', fromDate)
      .order('activity_date', { ascending: true })
    setHistory((data as DailyActivity[]) ?? [])
    setLoading(false)
  }, [user, days])

  useEffect(() => {
    load()
  }, [load])

  return { history, loading, reload: load }
}
