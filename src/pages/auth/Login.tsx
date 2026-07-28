import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().email('Inserisci un\'email valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri')
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    setServerError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setServerError(error.message === 'Invalid login credentials' ? 'Email o password non corretti.' : error.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-base-black flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto animate-fade-up">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-steps to-stand" />
          <span className="font-bold text-2xl tracking-tight text-base-text">FitDay</span>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-base-text">Bentornato</h1>
        <p className="text-base-muted text-sm mb-8">Accedi per continuare il tuo percorso</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="fd-label mb-1.5 block">Email</label>
            <input id="email" type="email" autoComplete="email" className="fd-input" {...register('email')} />
            {errors.email && <p className="text-move text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="fd-label mb-1.5 block">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="fd-input pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-muted"
                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="text-move text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-[13px] text-stand font-medium">Password dimenticata?</Link>
          </div>

          {serverError && (
            <p className="text-move text-sm bg-move/10 rounded-xl px-3.5 py-2.5">{serverError}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="fd-btn-primary flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <p className="text-center text-sm text-base-muted mt-8">
          Non hai un account?{' '}
          <Link to="/register" className="text-base-text font-semibold">Registrati</Link>
        </p>
      </div>
    </div>
  )
}
