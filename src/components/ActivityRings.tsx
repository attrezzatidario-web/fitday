import { useEffect, useState } from 'react'

interface RingDef {
  key: string
  value: number
  goal: number
  color: string
  dim: string
}

interface ActivityRingsProps {
  move: { value: number; goal: number }
  exercise: { value: number; goal: number }
  stand: { value: number; goal: number }
  size?: number
  onRingClick?: (ring: 'move' | 'exercise' | 'stand') => void
}

const STROKE_RATIO = 0.085

export function ActivityRings({ move, exercise, stand, size = 220, onRingClick }: ActivityRingsProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const rings: RingDef[] = [
    { key: 'move', value: move.value, goal: move.goal, color: '#FA114F', dim: '#FA114F2E' },
    { key: 'exercise', value: exercise.value, goal: exercise.goal, color: '#A6FF00', dim: '#A6FF002E' },
    { key: 'stand', value: stand.value, goal: stand.goal, color: '#0AF1F2', dim: '#0AF1F22E' }
  ]

  const center = size / 2
  const strokeWidth = size * STROKE_RATIO
  const gap = strokeWidth * 0.28

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="drop-shadow-[0_0_18px_rgba(0,0,0,0.5)]"
      role="img"
      aria-label={`Movimento ${Math.round((move.value / move.goal) * 100)}%, Esercizio ${Math.round((exercise.value / exercise.goal) * 100)}%, In piedi ${Math.round((stand.value / stand.goal) * 100)}%`}
    >
      {rings.map((ring, i) => {
        const radius = center - strokeWidth / 2 - i * (strokeWidth + gap)
        const circumference = 2 * Math.PI * radius
        const pct = Math.min(ring.value / ring.goal, 1)
        const overflowPct = ring.value / ring.goal > 1 ? Math.min((ring.value / ring.goal) - 1, 1) : 0
        const dashoffset = mounted ? circumference * (1 - pct) : circumference

        return (
          <g
            key={ring.key}
            className={onRingClick ? 'cursor-pointer' : ''}
            onClick={() => onRingClick?.(ring.key as 'move' | 'exercise' | 'stand')}
          >
            {/* background track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={ring.dim}
              strokeWidth={strokeWidth}
            />
            {/* overflow ring (subtle second pass when >100%) */}
            {overflowPct > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeOpacity={0.35}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={mounted ? circumference * (1 - overflowPct) : circumference}
                transform={`rotate(-90 ${center} ${center})`}
              />
            )}
            {/* filled progress */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.65,0,0.35,1)' }}
            />
          </g>
        )
      })}
    </svg>
  )
}
