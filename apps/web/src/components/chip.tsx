import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  active: boolean
  /** Cor de fundo quando ativo, como variável CSS. */
  color?: string
  icon?: ReactNode
  count?: number
  shape?: 'pill' | 'square'
  onClick: () => void
}

/** Chip de filtro/seleção. Ativo, ganha a cor do status; texto escuro sobre cores neutras. */
export function Chip({ label, active, color = 'var(--text)', icon, count, shape = 'pill', onClick }: ChipProps) {
  const neutral = color === 'var(--text)' || color === 'var(--muted)'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-[7px] border font-medium transition-all duration-200',
        shape === 'pill' ? 'rounded-full px-3.5 py-2 text-sm' : 'rounded-lg px-3 py-1.5 text-[13px]',
        !active && 'border-border bg-card text-foreground hover:border-muted-foreground',
      )}
      style={active ? { background: color, borderColor: color, color: neutral ? 'var(--bg)' : '#fff' } : undefined}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && <span className="text-xs opacity-60">{count}</span>}
    </button>
  )
}
