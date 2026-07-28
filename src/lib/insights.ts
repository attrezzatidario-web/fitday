// Servizio di generazione insight basato su regole.
// Predisposto per essere sostituito/integrato in futuro con Gemini o OpenAI:
// basta implementare generateAIInsights() con la stessa interfaccia.

export interface InsightInput {
  moveValue: number
  moveGoal: number
  exerciseValue: number
  exerciseGoal: number
  standValue: number
  standGoal: number
  steps: number
  stepsGoal: number
  waterMl: number
  waterGoalMl: number
  caloriesIn: number
  caloriesOut: number
  proteinG: number
  proteinGoalG: number
  sleepHours: number | null
  avgSleepHours: number | null
  habitsCompleted: number
  habitsTotal: number
}

export interface Insight {
  id: string
  tone: 'positive' | 'neutral' | 'warning'
  message: string
}

export function generateDailyInsights(input: InsightInput): Insight[] {
  const insights: Insight[] = []

  const movePct = input.moveGoal > 0 ? Math.round((input.moveValue / input.moveGoal) * 100) : 0
  insights.push({
    id: 'move',
    tone: movePct >= 100 ? 'positive' : movePct >= 60 ? 'neutral' : 'warning',
    message: `Hai completato il ${movePct}% dell'obiettivo Movimento.`
  })

  const stepsRemaining = input.stepsGoal - input.steps
  if (stepsRemaining > 0) {
    insights.push({
      id: 'steps',
      tone: 'neutral',
      message: `Ti mancano ${stepsRemaining.toLocaleString('it-IT')} passi per raggiungere il tuo obiettivo.`
    })
  } else {
    insights.push({ id: 'steps', tone: 'positive', message: 'Obiettivo passi raggiunto, ottimo lavoro!' })
  }

  if (input.proteinGoalG > 0) {
    const proteinPct = input.proteinG / input.proteinGoalG
    if (proteinPct < 0.6) {
      insights.push({ id: 'protein', tone: 'warning', message: 'Hai assunto poche proteine rispetto al tuo obiettivo giornaliero.' })
    }
  }

  if (input.waterGoalMl > 0 && input.waterMl < input.waterGoalMl * 0.5) {
    insights.push({ id: 'water', tone: 'warning', message: 'Oggi hai bevuto meno acqua del solito: continua a idratarti.' })
  }

  if (input.sleepHours !== null && input.avgSleepHours !== null) {
    if (input.sleepHours > input.avgSleepHours + 0.5) {
      insights.push({ id: 'sleep', tone: 'positive', message: 'Hai dormito più della tua media settimanale.' })
    } else if (input.sleepHours < input.avgSleepHours - 0.5) {
      insights.push({ id: 'sleep', tone: 'warning', message: 'Hai dormito meno della tua media settimanale.' })
    }
  }

  const balance = input.caloriesIn - input.caloriesOut
  insights.push({
    id: 'balance',
    tone: 'neutral',
    message: balance > 0
      ? `Sei in surplus calorico di ${Math.round(balance)} kcal oggi.`
      : `Sei in deficit calorico di ${Math.round(Math.abs(balance))} kcal oggi.`
  })

  if (input.habitsTotal > 0) {
    const remaining = input.habitsTotal - input.habitsCompleted
    if (remaining > 0) {
      insights.push({
        id: 'habits',
        tone: 'neutral',
        message: `Ti mancano ${remaining} abitudine${remaining > 1 ? 'i' : ''} da completare oggi.`
      })
    } else {
      insights.push({ id: 'habits', tone: 'positive', message: 'Tutte le abitudini di oggi completate!' })
    }
  }

  return insights
}

// Punto di estensione futuro:
// export async function generateAIInsights(input: InsightInput, apiKey: string): Promise<Insight[]> { ... }
