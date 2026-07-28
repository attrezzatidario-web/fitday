import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const schema = z
  .object({
    fullName: z.string().min(2, 'Inserisci il tuo nome'),
    email: z.string().email('Inserisci un\'email valida'),
    password: z.string().min(6, 'Almeno 6 caratteri'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Le password non coincidono',
    path: ['confirmPassword']
  })
type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    setServerError(null)
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } }
    })
    if (error) {
      setServerError(error.message === 'User already registered' ? 'Esiste già un account con questa email.' : error.message)
      return
    }
    if (data.session) {
      navigate('/onboarding', { replace: true })
    } else {
      setEmailSent(true)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-base-black flex flex-col justify-center px-6 py-12">
        <div className="w-full max-w-sm mx-auto text-center animate-fade-up">
          <div className="w-14 h-14 rounded-full bg-exercise/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={26} className="text-exercise" />
          </div>
          <h1 className="text-xl font-bold mb-2 text-base-text">Controlla la tua email</h1>
          <p className="text-base-muted text-sm mb-8">
            Ti abbiamo inviato un link di conferma. Clicca sul link per attivare il tuo account FitDay.
          </p>
          <Link to="/login" className="fd-btn-ghost inline-block">Torna al login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-black flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto animate-fade-up">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-steps to-stand flex items-center justify-center text-white font-bold text-lg shrink-0">F</div>
          <span className="font-bold text-2xl tracking-tight text-base-text">FitDay</span>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-base-text">Crea il tuo account</h1>
        <p className="text-base-muted text-sm mb-8">Inizia oggi il tuo percorso di fitness</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="fullName" className="fd-label mb-1.5 block">Nome</label>
            <input id="fullName" autoComplete="name" className="fd-input" {...register('fullName')} />
            {errors.fullName && <p className="text-move text-xs mt-1.5">{errors.fullName.message}</p>}
          </div>

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
                autoComplete="new-password"
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

          <div>
            <label htmlFor="confirmPassword" className="fd-label mb-1.5 block">Conferma password</label>
            <input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="fd-input" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-move text-xs mt-1.5">{errors.confirmPassword.message}</p>}
          </div>

          {serverError && (
            <p className="text-move text-sm bg-move/10 rounded-xl px-3.5 py-2.5">{serverError}</p>
          )}

          <button type="submit" disabled={isSubmitting} className="fd-btn-primary flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Creazione account...' : 'Crea account'}
          </button>
        </form>

        <p className="text-center text-sm text-base-muted mt-8">
          Hai già un account?{' '}
          <Link to="/login" className="text-base-text font-semibold">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
