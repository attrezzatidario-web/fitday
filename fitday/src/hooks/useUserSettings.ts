import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { UserSettings } from '@/types/database'

export function useUserSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
    setSettings(data as UserSettings | null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const update = useCallback(
    async (patch: Partial<UserSettings>) => {
      if (!user) return
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...settings, ...patch }, { onConflict: 'user_id' })
        .select('*')
        .single()
      if (!error && data) setSettings(data as UserSettings)
      return { error }
    },
    [user, settings]
  )

  return { settings, loading, update }
}
