import { cn } from '@/lib/utils'

/** Caixa que desenha o check ao marcar. Puramente visual. */
export function CheckBox({ checked, size = 26, className }: { checked: boolean; size?: number; className?: string }) {
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-lg border-[1.5px] transition-all duration-200', className)}
      style={{
        width: size,
        height: size,
        borderColor: checked ? 'var(--accent)' : 'var(--muted)',
        background: checked ? 'var(--accent)' : 'transparent',
      }}
      aria-hidden
    >
      {checked && (
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" className="check-draw" />
        </svg>
      )}
    </span>
  )
}
