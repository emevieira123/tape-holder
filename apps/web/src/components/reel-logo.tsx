import { cn } from '@/lib/utils'

export function ReelIcon({ size = 28, color = 'var(--accent)', className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={cn('shrink-0 animate-spin-slow', className)} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2.2" />
      <circle cx="12" cy="12" r="2.2" fill={color} />
      <circle cx="12" cy="6" r="2" fill={color} />
      <circle cx="17.2" cy="15" r="2" fill={color} />
      <circle cx="6.8" cy="15" r="2" fill={color} />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn('font-bold tracking-[.14em]', className)}>FITA</span>
}
