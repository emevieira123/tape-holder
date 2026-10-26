import { signInSchema, type SignInInput } from '@fita/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth-client'
import { toast } from '@/stores/toast-store'

export function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [guestPending, setGuestPending] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) })

  const onSubmit = handleSubmit(async (values) => {
    const { error } = await signIn.email(values)
    if (error) return toast(error.status === 401 ? 'E-mail ou senha incorretos' : 'Não foi possível entrar')
    onSuccess()
  })

  const enterAsGuest = async () => {
    setGuestPending(true)
    const { error } = await signIn.anonymous()
    setGuestPending(false)
    if (error) return toast('Não foi possível entrar como convidado')
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex animate-fadeup flex-col gap-[18px] [animation-duration:.3s]">
      <div>
        <div className="text-2xl font-bold">Bem-vindo de volta</div>
        <div className="mt-0.5 text-sm text-muted-foreground">Continue de onde parou.</div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label>
          E-mail
          <Input type="email" autoComplete="email" placeholder="voce@exemplo.com" aria-invalid={!!errors.email} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </Label>
        <Label>
          <span className="flex justify-between">
            Senha
            <a
              href="#"
              className="font-medium"
              onClick={(e) => {
                e.preventDefault()
                toast('Recuperação de senha ainda não disponível')
              }}
            >
              Esqueci a senha
            </a>
          </span>
          <Input type="password" autoComplete="current-password" placeholder="••••••••" aria-invalid={!!errors.password} {...register('password')} />
          <FieldError message={errors.password?.message} />
        </Label>
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" onClick={enterAsGuest} disabled={guestPending}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Entrar como convidado
      </Button>
    </form>
  )
}
