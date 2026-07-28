import { NavLink } from 'react-router-dom'
import { Home, Activity, TrendingUp, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuickAdd } from '@/context/QuickAddContext'

export function BottomNav() {
  const { openMenu } = useQuickAdd()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-base-black/85 backdrop-blur-xl border-t border-base-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1 py-2">
        <NavLink to="/" end className={({ isActive }) => cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition', isActive ? 'text-base-text' : 'text-base-muted')}>
          <Home size={21} strokeWidth={2.2} />
          <span className="text-[10px] font-medium text-base-text">Home</span>
        </NavLink>
        <NavLink to="/activity" className={({ isActive }) => cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition', isActive ? 'text-base-text' : 'text-base-muted')}>
          <Activity size={21} strokeWidth={2.2} />
          <span className="text-[10px] font-medium text-base-text">Attività</span>
        </NavLink>

        <button onClick={openMenu} aria-label="Aggiungi" className="flex flex-col items-center gap-1 -mt-5">
          <span className="w-12 h-12 rounded-full bg-base-invert text-base-invertfg flex items-center justify-center shadow-glow active:scale-90 transition">
            <Plus size={22} strokeWidth={2.5} />
          </span>
          <span className="text-[10px] font-medium text-base-muted">Aggiungi</span>
        </button>

        <NavLink to="/progress" className={({ isActive }) => cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition', isActive ? 'text-base-text' : 'text-base-muted')}>
          <TrendingUp size={21} strokeWidth={2.2} />
          <span className="text-[10px] font-medium text-base-text">Progressi</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => cn('flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition', isActive ? 'text-base-text' : 'text-base-muted')}>
          <User size={21} strokeWidth={2.2} />
          <span className="text-[10px] font-medium text-base-text">Profilo</span>
        </NavLink>
      </div>
    </nav>
  )
}
