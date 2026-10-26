import { cn } from '@/lib/utils'
import { useToastStore } from '@/stores/toast-store'

export function Toaster({ className }: { className?: string }) {
  const message = useToastStore((s) => s.message)
  const key = useToastStore((s) => s.key)
  if (!message) return null
  return (
    <div
      key={key}
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed bottom-[92px] left-1/2 z-20 flex animate-toast items-center gap-2.5 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-fita desk:bottom-7',
        className,
      )}
    >
      <span className="grid size-[22px] animate-pop place-items-center rounded-full bg-primary">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7" className="check-draw" style={{ animationDelay: '.15s' }} />
        </svg>
      </span>
      <span>{message}</span>
    </div>
  )
}
