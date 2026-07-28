import { NavLink } from 'react-router-dom'
import { Home, Activity, TrendingUp, User, Utensils, Droplets, Dumbbell, Settings, Scale, Moon, ListChecks, Calendar, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/activity', label: 'Attività', icon: Activity },
  { to: '/workouts', label: 'Allenamenti', icon: Dumbbell },
  { to: '/nutrition', label: 'Alimentazione', icon: Utensils },
  { to: '/water', label: 'Acqua', icon: Droplets },
  { to: '/body', label: 'Corpo', icon: Scale },
  { to: '/sleep', label: 'Sonno', icon: Moon },
  { to: '/habits', label: 'Abitudini', icon: ListChecks },
  { to: '/calendar', label: 'Calendario', icon: Calendar },
  { to: '/progress', label: 'Progressi', icon: TrendingUp },
  { to: '/goals', label: 'Obiettivi', icon: Target },
  { to: '/profile', label: 'Profilo', icon: User },
  { to: '/settings', label: 'Impostazioni', icon: Settings }
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-white/[0.06] px-3 py-6">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-steps to-stand" />
        <span className="font-bold text-lg tracking-tight">FitDay</span>
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
