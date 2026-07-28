import { useRef, useState } from 'react'
import { Camera, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react'
import { useAIFoodAnalysis } from '@/hooks/useAIFoodAnalysis'
import type { AIFoodResult } from '@/lib/aiFood'

interface AIAnalyzeControlsProps {
  currentName: string
  onResult: (result: AIFoodResult) => void
  onError: (message: string) => void
}

export function AIAnalyzeControls({ currentName, onResult, onError }: AIAnalyzeControlsProps) {
  const { analyzing, analyzePhoto, analyzeText } = useAIFoodAnalysis()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [lastNote, setLastNote] = useState<string | null>(null)

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return
    setLastNote(null)
    const { result, error } = await analyzePhoto(file)
    if (result) {
      onResult(result)
      setLastNote(buildNote(result))
    } else {
      onError(error ?? 'Errore durante l\'analisi della foto.')
    }
  }

  const handleTextAnalyze = async () => {
    if (!currentName.trim()) return
    setLastNote(null)
    const { result, error } = await analyzeText(currentName.trim())
    if (result) {
      onResult(result)
      setLastNote(buildNote(result))
    } else {
      onError(error ?? 'Errore durante l\'analisi.')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={analyzing}
          className="flex-1 flex items-center justify-center gap-1.5 bg-base-card2 rounded-xl py-2.5 text-[12px] font-medium disabled:opacity-40"
        >
          <Camera size={14} />
          Scatta foto
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={analyzing}
          className="flex-1 flex items-center justify-center gap-1.5 bg-base-card2 rounded-xl py-2.5 text-[12px] font-medium disabled:opacity-40"
        >
          <ImageIcon size={14} />
          Carica foto
        </button>
        <button
          type="button"
          onClick={handleTextAnalyze}
          disabled={analyzing || !currentName.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 bg-exercise/15 text-exercise rounded-xl py-2.5 text-[12px] font-semibold disabled:opacity-30"
        >
          {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Analizza IA
        </button>
      </div>

      {analyzing && <p className="text-[11px] text-base-muted text-center">Analisi in corso, qualche secondo...</p>}

      {lastNote && !analyzing && (
        <p className="text-[11px] text-stand bg-stand/10 rounded-lg px-2.5 py-1.5">{lastNote}</p>
      )}
    </div>
  )
}

function buildNote(result: AIFoodResult): string {
  const parts: string[] = [`Stima IA (confidenza ${result.confidence}). Controlla e correggi i valori prima di salvare.`]
  if (result.brand) parts.push(`Marca riconosciuta: ${result.brand}.`)
  if (result.notes) parts.push(result.notes)
  return parts.join(' ')
}
