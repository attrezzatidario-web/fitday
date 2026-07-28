import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const schema = z.object({ email: z.string().email('Inserisci un\'email valida') })
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    setServerError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-base-black flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto animate-fade-up">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-base-muted mb-8">
          <ArrowLeft size={15} /> Torna al login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-exercise/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={26} className="text-exercise" />
            </div>
            <h1 className="text-xl font-bold mb-2 text-base-text">Email inviata</h1>
            <p className="text-base-muted text-sm">
              Controlla la tua casella di posta per il link di reimpostazione della password.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1 text-base-text">Recupera password</h1>
            <p className="text-base-muted text-sm mb-8">Ti invieremo un link per reimpostarla</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="fd-label mb-1.5 block">Email</label>
                <input id="email" type="email" autoComplete="email" className="fd-input" {...register('email')} />
                {errors.email && <p className="text-move text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              {serverError && <p className="text-move text-sm bg-move/10 rounded-xl px-3.5 py-2.5">{serverError}</p>}

              <button type="submit" disabled={isSubmitting} className="fd-btn-primary flex items-center justify-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Invio...' : 'Invia link di recupero'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
