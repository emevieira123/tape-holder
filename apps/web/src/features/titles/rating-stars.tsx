import { formatDecimal } from '@/lib/titles'

export function RatingStars({ value, onChange, disabled }: { value: number | null; onChange: (v: number | null) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Nota">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value !== null && n <= Math.round(value)
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value !== null && Math.round(value) === n}
            aria-label={`${n} de 5`}
            disabled={disabled}
            onClick={() => onChange(value === n ? null : n)}
            className="text-gold transition-transform hover:scale-115"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.6 6 20.9l1.3-6.7-5-4.7 6.8-.8z" />
            </svg>
          </button>
        )
      })}
      <span className="ml-1.5 text-sm font-semibold text-gold">{value === null ? '—' : formatDecimal(value)}</span>
    </div>
  )
}
