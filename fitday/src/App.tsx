import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { ProtectedRoute, PublicOnlyRoute, OnboardingRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Onboarding from '@/pages/onboarding/Onboarding'
import Dashboard from '@/pages/Dashboard'
import ActivityPage from '@/pages/Activity'
import Workouts from '@/pages/Workouts'
import Nutrition from '@/pages/Nutrition'
import Water from '@/pages/Water'
import Body from '@/pages/Body'
import Sleep from '@/pages/Sleep'
import Habits from '@/pages/Habits'
import CalendarPage from '@/pages/CalendarPage'
import Goals from '@/pages/Goals'
import Progress from '@/pages/Progress'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <ToastProvider>
          <Routes>
            {/* Pubbliche: solo per utenti non autenticati */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Onboarding: autenticato ma non ancora completato */}
            <Route element={<OnboardingRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            {/* Area privata */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/water" element={<Water />} />
                <Route path="/body" element={<Body />} />
                <Route path="/sleep" element={<Sleep />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
