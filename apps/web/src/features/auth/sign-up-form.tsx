import { signUpSchema, type SignUpInput } from '@fita/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { CheckBox } from '@/components/check-box'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth-client'
import { toast } from '@/stores/toast-store'
import { passwordScore, STRENGTH_COLORS, STRENGTH_LABELS } from './password-strength'

export function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false as unknown as true },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''
  const score = passwordScore(password)
  const barColor = STRENGTH_COLORS[Math.max(0, score - 1)]

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    const { error } = await signUp.email({ name: name.trim(), email, password })
    if (error) {
      return toast(error.code === 'USER_ALREADY_EXISTS' || error.status === 422 ? 'Este e-mail já tem conta' : 'Não foi possível criar a conta')
    }
    toast(`Bem-vindo, ${name.trim().split(' ')[0]}`)
    onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex animate-fadeup flex-col gap-[18px] [animation-duration:.3s]">
      <div>
        <div className="text-2xl font-bold">Crie sua conta</div>
        <div className="mt-0.5 text-sm text-muted-foreground">Leva menos tempo que a abertura de um anime.</div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label>
          Nome
          <Input autoComplete="name" placeholder="Como quer ser chamado" aria-invalid={!!errors.name} {...register('name')} />
          <FieldError message={errors.name?.message} />
        </Label>
        <Label>
          E-mail
          <Input type="email" autoComplete="email" placeholder="voce@exemplo.com" aria-invalid={!!errors.email} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </Label>
        <div className="grid grid-cols-2 gap-2.5">
          <Label>
            Senha
            <Input type="password" autoComplete="new-password" placeholder="mín. 8" aria-invalid={!!errors.password} {...register('password', { deps: ['confirmPassword'] })} />
          </Label>
          <Label>
            Confirmar
            <Input type="password" autoComplete="new-password" placeholder="repita" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
          </Label>
        </div>
        <FieldError message={errors.password?.message ?? errors.confirmPassword?.message} />
        <div className="flex h-3.5 items-center gap-1" aria-label={password ? `Força da senha: ${STRENGTH_LABELS[score]}` : undefined}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              data-testid="strength-bar"
              className="h-1 flex-1 rounded-sm transition-colors duration-300"
              style={{ background: score >= n ? barColor : 'var(--border)' }}
            />
          ))}
          <span className="ml-1.5 min-w-[60px] text-right text-xs text-muted-foreground">{password ? STRENGTH_LABELS[score] : ''}</span>
        </div>
      </div>
      <Controller
        control={control}
        name="terms"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <button
                type="button"
                role="checkbox"
                aria-checked={!!field.value}
                aria-label="Aceito os termos de uso e a política de privacidade"
                onClick={() => field.onChange(!field.value)}
                className="rounded-[7px] outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <CheckBox checked={!!field.value} size={22} className="rounded-[7px]" />
              </button>
              <span>
                Aceito os <a href="#">termos de uso</a> e a <a href="#">política de privacidade</a>
              </span>
            </div>
            <FieldError message={fieldState.error?.message} />
          </div>
        )}
      />
      <Button type="submit" size="lg" disabled={isSubmitting} style={{ opacity: isValid ? 1 : 0.5 }}>
        {isSubmitting ? 'Criando…' : 'Criar conta'}
      </Button>
    </form>
  )
}
