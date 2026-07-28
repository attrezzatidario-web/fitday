import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { DailyNote } from '@/types/database'

export function useDailyNotes(dateISO: string) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<DailyNote[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('note_date', dateISO)
      .order('created_at', { ascending: true })
    setNotes((data as DailyNote[]) ?? [])
    setLoading(false)
  }, [user, dateISO])

  useEffect(() => {
    load()
  }, [load])

  const addNote = useCallback(
    async (content: string) => {
      if (!user) return { error: new Error('Non autenticato') }
      const { data, error } = await supabase
        .from('daily_notes')
        .insert({ user_id: user.id, note_date: dateISO, content })
        .select('*')
        .single()
      if (!error && data) setNotes((prev) => [...prev, data as DailyNote])
      return { error }
    },
    [user, dateISO]
  )

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase.from('daily_notes').delete().eq('id', id)
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== id))
    return { error }
  }, [])

  return { notes, loading, addNote, deleteNote, reload: load }
}
