import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { QuickAddButton } from '@/components/QuickAddButton'
import { QuickAddProvider } from '@/context/QuickAddContext'

export function AppLayout() {
  return (
    <QuickAddProvider>
      <div className="min-h-screen bg-black flex">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-28 md:pb-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            <Outlet />
          </div>
        </main>
        <BottomNav />
        <QuickAddButton />
      </div>
    </QuickAddProvider>
  )
}
