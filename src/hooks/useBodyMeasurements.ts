import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { BodyMeasurement } from '@/types/database'

export function useBodyMeasurements(limit = 30) {
  const { user } = useAuth()
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measured_date', { ascending: false })
      .limit(limit)
    setMeasurements((data as BodyMeasurement[]) ?? [])
    setLoading(false)
  }, [user, limit])

  useEffect(() => {
    load()
  }, [load])

  const addMeasurement = useCallback(
    async (measuredDateISO: string, patch: Partial<BodyMeasurement>) => {
      if (!user) return { error: new Error('Non autenticato') }
      const { data, error } = await supabase
        .from('body_measurements')
        .insert({ user_id: user.id, measured_date: measuredDateISO, ...patch })
        .select('*')
        .single()
      if (!error && data) setMeasurements((prev) => [data as BodyMeasurement, ...prev])
      return { error, data }
    },
    [user]
  )

  const deleteMeasurement = useCallback(async (id: string) => {
    const { error } = await supabase.from('body_measurements').delete().eq('id', id)
    if (!error) setMeasurements((prev) => prev.filter((m) => m.id !== id))
    return { error }
  }, [])

  return { measurements, loading, addMeasurement, deleteMeasurement, reload: load }
}
