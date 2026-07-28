import { LucideIcon } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: number
  unit?: string
  color?: string
  decimals?: number
  onClick?: () => void
  sparkline?: number[]
}

export function MetricCard({ icon: Icon, label, value, unit, color = '#B983FF', decimals = 0, onClick, sparkline }: MetricCardProps) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'fd-card text-left w-full',
        onClick && 'active:scale-[0.98] transition'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}26` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="fd-label">{label}</p>
      <p className="text-2xl font-bold mt-0.5 tabular-nums text-base-text">
        {formatNumber(value, decimals)}
        {unit && <span className="text-sm font-medium text-base-muted ml-1">{unit}</span>}
      </p>
      {sparkline && sparkline.length > 0 && (
        <div className="flex items-end gap-0.5 h-6 mt-2">
          {sparkline.map((v, i) => {
            const max = Math.max(...sparkline, 1)
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${Math.max((v / max) * 100, 6)}%`, backgroundColor: `${color}80` }}
              />
            )
          })}
        </div>
      )}
    </Comp>
  )
}
