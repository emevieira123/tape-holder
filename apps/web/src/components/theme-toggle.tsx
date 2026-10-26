import { useId } from 'react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'

/** Sol que vira lua: a máscara desliza sobre o círculo e os raios somem. */
export function ThemeIcon({ size = 18 }: { size?: number }) {
  const dark = useUiStore((s) => s.theme === 'dark')
  const maskId = useId()
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <mask id={maskId}>
        <rect width="24" height="24" fill="#fff" />
        <circle cx={dark ? 16 : 30} cy="7" r="7" fill="#000" style={{ transition: 'cx .45s ease' }} />
      </mask>
      <circle cx="12" cy="12" r={dark ? 9 : 5} fill="currentColor" mask={`url(#${maskId})`} style={{ transition: 'r .45s ease' }} />
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 12px',
          opacity: dark ? 0 : 1,
          transform: `rotate(${dark ? '-60deg' : '0deg'})`,
          transition: 'opacity .4s, transform .5s',
        }}
      >
        <line x1="12" y1="1.5" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="22.5" y2="12" />
        <line x1="4.6" y1="4.6" x2="6" y2="6" />
        <line x1="18" y1="18" x2="19.4" y2="19.4" />
        <line x1="4.6" y1="19.4" x2="6" y2="18" />
        <line x1="18" y1="6" x2="19.4" y2="4.6" />
      </g>
    </svg>
  )
}

export function ThemeToggleButton({ className, iconSize = 18 }: { className?: string; iconSize?: number }) {
  const toggle = useUiStore((s) => s.toggleTheme)
  const dark = useUiStore((s) => s.theme === 'dark')
  return (
    <button
      type="button"
      onClick={toggle}
      title="Tema"
      aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-muted-foreground',
        className,
      )}
    >
      <ThemeIcon size={iconSize} />
    </button>
  )
}
