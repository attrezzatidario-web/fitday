import { LucideIcon } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface ProgressCardProps {
  icon: LucideIcon
  label: string
  current: number
  goal: number
  unit: string
  color: string
}

export function ProgressCard({ icon: Icon, label, current, goal, unit, color }: ProgressCardProps) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  return (
    <div className="fd-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color }} />
        <p className="fd-label">{label}</p>
      </div>
      <p className="text-xl font-bold tabular-nums mb-2">
        {formatNumber(current)} <span className="text-sm text-base-muted font-medium">/ {formatNumber(goal)} {unit}</span>
      </p>
      <div className="h-1.5 bg-base-card2 rounded-pill overflow-hidden">
        <div
          className="h-full rounded-pill transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
