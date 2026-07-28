import { NavLink } from 'react-router-dom'
import { Home, Utensils, Droplets, Dumbbell, Settings, Scale, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/workouts', label: 'Allenamenti', icon: Dumbbell },
  { to: '/nutrition', label: 'Alimentazione', icon: Utensils },
  { to: '/water', label: 'Acqua', icon: Droplets },
  { to: '/body', label: 'Peso e corpo', icon: Scale },
  { to: '/profile', label: 'Profilo', icon: User },
  { to: '/settings', label: 'Impostazioni', icon: Settings }
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-base-border px-3 py-6">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-steps to-stand" />
        <span className="font-bold text-lg tracking-tight text-base-text">FitDay</span>
      </div>
      <nav className="flex flex-col gap-1 overflow-y-auto pb-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition',
                isActive ? 'bg-base-card2 text-base-text' : 'text-base-muted hover:text-base-text hover:bg-base-card2/50'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
