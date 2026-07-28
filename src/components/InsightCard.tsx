import { Sparkles } from 'lucide-react'
import type { Insight } from '@/lib/insights'
import { cn } from '@/lib/utils'

export function InsightPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null

  return (
    <div className="fd-card">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} className="text-accent-yellow" />
        <h3 className="font-semibold text-[15px]">Riepilogo della giornata</h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-2.5">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                insight.tone === 'positive' && 'bg-exercise',
                insight.tone === 'warning' && 'bg-move',
                insight.tone === 'neutral' && 'bg-stand'
              )}
            />
            <p className="text-[13px] text-white/85 leading-snug">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
