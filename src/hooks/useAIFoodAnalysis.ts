import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { resizeImageToBase64, type AIFoodResult } from '@/lib/aiFood'

interface AnalyzeResponse {
  analyzing: boolean
  analyzePhoto: (file: File) => Promise<{ result?: AIFoodResult; error?: string }>
  analyzeText: (text: string) => Promise<{ result?: AIFoodResult; error?: string }>
}

export function useAIFoodAnalysis(): AnalyzeResponse {
  const [analyzing, setAnalyzing] = useState(false)

  const invoke = useCallback(async (body: { imageBase64?: string; mimeType?: string; text?: string }) => {
    setAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', { body })
      if (error) {
        return { error: 'Impossibile contattare il servizio IA. Verifica di aver configurato la funzione su Supabase.' }
      }
      if (data?.error) {
        return { error: data.error as string }
      }
      return { result: data?.result as AIFoodResult }
    } catch {
      return { error: 'Errore di connessione al servizio IA.' }
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const analyzePhoto = useCallback(
    async (file: File) => {
      try {
        const { base64, mimeType } = await resizeImageToBase64(file)
        return await invoke({ imageBase64: base64, mimeType })
      } catch {
        return { error: "Impossibile elaborare l'immagine selezionata." }
      }
    },
    [invoke]
  )

  const analyzeText = useCallback(async (text: string) => invoke({ text }), [invoke])

  return { analyzing, analyzePhoto, analyzeText }
}
