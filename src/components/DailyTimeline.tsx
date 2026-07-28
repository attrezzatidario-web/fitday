import { Utensils, Dumbbell, Droplets, StickyNote, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { FoodEntry, Workout, WaterEntry } from '@/types/database'
import { EmptyState } from '@/components/ui/EmptyState'

interface TimelineEvent {
  id: string
  time: string
  icon: typeof Utensils
  color: string
  title: string
  subtitle: string
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Colazione',
  morning_snack: 'Spuntino mattutino',
  lunch: 'Pranzo',
  afternoon_snack: 'Spuntino pomeridiano',
  dinner: 'Cena',
  other: 'Altro'
}

interface DailyTimelineProps {
  foodEntries: FoodEntry[]
  workouts: Workout[]
  waterEntries: WaterEntry[]
}

export function DailyTimeline({ foodEntries, workouts, waterEntries }: DailyTimelineProps) {
  const events: TimelineEvent[] = [
    ...foodEntries.map((f) => ({
      id: `food-${f.id}`,
      time: f.created_at,
      icon: Utensils,
      color: '#FF9F0A',
      title: `${MEAL_LABELS[f.meal_type]} · ${f.food_name}`,
      subtitle: `${Math.round(f.calories)} kcal`
    })),
    ...workouts.map((w) => ({
      id: `workout-${w.id}`,
      time: w.created_at,
      icon: Dumbbell,
      color: '#A6FF00',
      title: w.name,
      subtitle: `${w.duration_minutes} min${w.calories ? ` · ${Math.round(w.calories)} kcal` : ''}`
    })),
    ...waterEntries.map((w) => ({
      id: `water-${w.id}`,
      time: w.logged_at,
      icon: Droplets,
      color: '#0AF1F2',
      title: 'Acqua',
      subtitle: `${w.amount_ml} ml`
    }))
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  if (events.length === 0) {
    return (
      <EmptyState
        icon={StickyNote}
        title="Ancora nessuna attività oggi"
        description="Usa il pulsante + per aggiungere pasti, allenamenti o acqua."
      />
    )
  }

  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div key={e.id} className="fd-card flex items-center gap-3 !py-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${e.color}26` }}>
            <e.icon size={16} style={{ color: e.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-base-text">{e.title}</p>
            <p className="text-xs text-base-muted">{e.subtitle}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-base-muted shrink-0">
            <Clock size={11} />
            {format(parseISO(e.time), 'HH:mm')}
          </div>
        </div>
      ))}
    </div>
  )
}
