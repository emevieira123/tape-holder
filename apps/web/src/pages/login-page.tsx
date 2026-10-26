import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClapperIllustration } from '@/components/clapper-illustration'
import { ReelIcon, Wordmark } from '@/components/reel-logo'
import { StatusIcon } from '@/components/status-icon'
import { ThemeToggleButton } from '@/components/theme-toggle'
import { SignInForm } from '@/features/auth/sign-in-form'
import { SignUpForm } from '@/features/auth/sign-up-form'
import { picsum } from '@/lib/titles'
import { cn } from '@/lib/utils'

const WALL = Array.from({ length: 36 }, (_, i) => picsum(`fita-wall-${i + 1}`))

const FEATURES = [
  { status: 'watching', color: 'var(--accent)', text: 'Marque episódios com um toque' },
  { status: 'completed', color: 'var(--gold)', text: 'Veja o progresso de cada temporada' },
  { status: 'planned', color: 'var(--blue)', text: 'Guarde o que quer assistir depois' },
] as const

type Mode = 'signin' | 'signup'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const done = () => navigate(from, { replace: true })

  return (
    <div className="relative box-border grid min-h-screen grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-center gap-x-[6vw] gap-y-10 overflow-hidden px-[6vw] py-14">
      <div className="pointer-events-none absolute -inset-x-[10%] -inset-y-[20%] grid animate-drift grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 opacity-22 saturate-70">
        {WALL.map((src) => (
          <div key={src} className="aspect-2/3 rounded-[10px] bg-secondary bg-cover bg-center" style={{ backgroundImage: `url('${src}')` }} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,transparent_10%,var(--bg)_70%),linear-gradient(to_top,var(--bg),transparent_40%)]" />

      <section className="relative flex max-w-[520px] animate-fadeup flex-col gap-[26px] [animation-duration:.6s]">
        <div className="flex items-center gap-2.5">
          <ReelIcon size={30} />
          <Wordmark className="text-xl tracking-[.16em]" />
        </div>
        <h1 className="m-0 text-[clamp(34px,4.6vw,56px)] leading-[1.04] font-bold tracking-[-.02em] text-balance">
          Tudo o que você assiste, <span className="text-primary">no lugar.</span>
        </h1>
        <p className="m-0 max-w-[420px] text-[17px] leading-normal text-muted-foreground">
          Filmes, séries e animes em uma biblioteca só. Marque episódios, acompanhe o progresso e nunca mais pergunte "onde eu parei?".
        </p>
        <div className="flex flex-wrap items-center gap-[22px]">
          <ClapperIllustration />
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[15px]">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg border border-border bg-card" style={{ color: f.color }}>
                  <StatusIcon status={f.status} />
                </span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative box-border flex w-full max-w-[420px] animate-fadeup flex-col gap-[22px] justify-self-center rounded-[22px] border border-border bg-card/88 p-7 shadow-fita backdrop-blur-[18px] [animation-delay:.1s] [animation-duration:.6s]">
        <div className="relative grid grid-cols-2 rounded-xl bg-secondary p-1" role="tablist">
          <span
            className="absolute inset-y-1 w-[calc(50%-4px)] rounded-[9px] bg-card shadow-[0_2px_8px_rgba(0,0,0,.2)] transition-[left] duration-350 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ left: mode === 'signin' ? 4 : '50%' }}
          />
          {(
            [
              ['signin', 'Entrar'],
              ['signup', 'Criar conta'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                'relative rounded-[9px] p-2.5 text-[15px] font-semibold transition-colors duration-300',
                mode === m ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === 'signin' ? <SignInForm onSuccess={done} /> : <SignUpForm onSuccess={done} />}
      </section>

      <ThemeToggleButton className="absolute top-[18px] right-[18px] size-[42px]" iconSize={20} />
    </div>
  )
}
