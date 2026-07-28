import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 animate-fade-up">
      <div className="w-14 h-14 rounded-full bg-base-card2 flex items-center justify-center mb-4">
        <Icon size={24} className="text-base-muted" />
      </div>
      <h3 className="font-semibold text-[15px] mb-1">{title}</h3>
      {description && <p className="text-sm text-base-muted max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 text-sm font-semibold text-stand">
          {action.label}
        </button>
      )}
    </div>
  )
}
