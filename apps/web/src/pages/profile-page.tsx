import type { Preferences } from '@fita/shared'
import { useState } from 'react'
import { UserAvatar } from '@/components/layout/user-avatar'
import { ThemeIcon } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCurrentUser } from '@/features/auth/use-current-user'
import { useSignOut } from '@/features/auth/use-sign-out'
import { usePreferences, useUpdatePreferences } from '@/features/preferences/hooks'
import { titlesApi } from '@/features/titles/api'
import { errorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from '@/stores/toast-store'
import { useUiStore } from '@/stores/ui-store'

const PREF_ROWS: { key: keyof Preferences; label: string; sub: string }[] = [
  { key: 'notifyNewEpisodes', label: 'Lembretes de episódio', sub: 'Avisar quando sair episódio novo' },
  { key: 'hideSynopsis', label: 'Ocultar sinopses', sub: 'Esconder a sinopse de títulos não concluídos' },
  { key: 'jumpToNext', label: 'Ir direto ao próximo episódio', sub: 'Ao abrir um título que você está assistindo' },
]

function Row({ label, sub, children, last }: { label: string; sub: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-3.5 px-5 py-4', !last && 'border-b border-border')}>
      <div>
        <div className="text-[15px] font-semibold">{label}</div>
        <div className="text-[13px] text-muted-foreground">{sub}</div>
      </div>
      {children}
    </div>
  )
}

function ThemeSwitch() {
  const dark = useUiStore((s) => s.theme === 'dark')
  const toggle = useUiStore((s) => s.toggleTheme)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!dark}
      aria-label="Tema claro"
      onClick={toggle}
      className="relative h-[34px] w-16 shrink-0 rounded-[17px] p-0 transition-colors duration-350"
      style={{ background: dark ? 'var(--surface2)' : 'var(--accent)' }}
    >
      <span
        className="absolute top-[3px] grid size-7 place-items-center rounded-full bg-card text-foreground shadow-[0_2px_6px_rgba(0,0,0,.3)] transition-[left] duration-350 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ left: dark ? 3 : 33 }}
      >
        <ThemeIcon size={16} />
      </span>
    </button>
  )
}

export function ProfilePage() {
  const user = useCurrentUser()
  const dark = useUiStore((s) => s.theme === 'dark')
  const { data: prefs } = usePreferences()
  const updatePrefs = useUpdatePreferences()
  const signOut = useSignOut()
  const [exporting, setExporting] = useState(false)

  if (!user) return null

  const set = (patch: Partial<Preferences>) => updatePrefs.mutate(patch)

  const exportLibrary = async () => {
    setExporting(true)
    try {
      const data = await titlesApi.exportLibrary()
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'fita-biblioteca.json'
      a.click()
      URL.revokeObjectURL(url)
      toast(`${data.titles.length} títulos exportados`)
    } catch (err) {
      toast(errorMessage(err))
    } finally {
      setExporting(false)
    }
  }


  return (
    <div className="flex max-w-[640px] animate-fadeup flex-col gap-[22px]">
      <div className="flex items-center gap-[18px]">
        <UserAvatar userId={user.id} image={user.image} size={76} className="border-[3px] border-card shadow-fita" />
        <div>
          <h1 className="m-0 text-[28px] font-bold">{user.name}</h1>
          <div className="text-[15px] text-muted-foreground">
            {user.isAnonymous ? 'Sessão de convidado' : user.email} · desde {user.createdAt.getFullYear()}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Row label="Tema" sub={dark ? 'Escuro (padrão)' : 'Claro'}>
          <ThemeSwitch />
        </Row>
        {PREF_ROWS.map((p, i) => (
          <Row key={p.key} label={p.label} sub={p.sub} last={i === PREF_ROWS.length - 1}>
            <Switch checked={prefs?.[p.key] ?? false} disabled={!prefs} onCheckedChange={(v) => set({ [p.key]: v })} aria-label={p.label} />
          </Row>
        ))}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Button variant="outline" size="sm" onClick={exportLibrary} disabled={exporting}>
          {exporting ? 'Exportando…' : 'Exportar biblioteca'}
        </Button>
        <Button variant="danger" size="sm" onClick={signOut.signOut} disabled={signOut.pending}>
          {signOut.pending ? 'Saindo…' : 'Sair'}
        </Button>
      </div>
    </div>
  )
}
