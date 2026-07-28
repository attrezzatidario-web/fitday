import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export type ThemePreference = 'dark' | 'light' | 'system'

interface ThemeContextValue {
  preference: ThemePreference
  resolvedTheme: 'dark' | 'light'
  setPreference: (pref: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'fitday-theme'

function systemPrefersLight(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
}

function applyThemeClass(resolved: 'dark' | 'light') {
  const root = document.documentElement
  if (resolved === 'light') root.classList.add('theme-light')
  else root.classList.remove('theme-light')

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'light' ? '#F6F6F8' : '#000000')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem(STORAGE_KEY) as ThemePreference) || 'dark'
  })
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() =>
    preference === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : preference === 'light' ? 'light' : 'dark'
  )

  // Applica la classe al primo render e ad ogni cambio
  useEffect(() => {
    const resolved = preference === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : preference
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
    localStorage.setItem(STORAGE_KEY, preference)
  }, [preference])

  // Ascolta i cambi di tema di sistema quando la preferenza è "system"
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => {
      const resolved = mq.matches ? 'light' : 'dark'
      setResolvedTheme(resolved)
      applyThemeClass(resolved)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  // Carica la preferenza salvata su Supabase al login (ha priorità sul localStorage se presente)
  useEffect(() => {
    if (!user) return
    supabase
      .from('user_settings')
      .select('theme')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.theme) setPreferenceState(data.theme as ThemePreference)
      })
  }, [user])

  const setPreference = useCallback(
    (pref: ThemePreference) => {
      setPreferenceState(pref)
      if (user) {
        supabase.from('user_settings').upsert({ user_id: user.id, theme: pref }, { onConflict: 'user_id' }).then()
      }
    },
    [user]
  )

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve essere usato dentro ThemeProvider')
  return ctx
}
