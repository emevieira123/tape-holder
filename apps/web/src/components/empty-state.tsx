import { Button } from './ui/button'

const holes = [6, 46, 86, 126, 166, 206, 246]

/** Película correndo com "VAZIO" piscando. */
export function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3.5 px-5 py-15 text-center text-muted-foreground">
      <svg viewBox="0 0 200 70" width="220" height="77" className="overflow-hidden" aria-hidden>
        <g className="animate-film">
          <rect x="0" y="12" width="280" height="46" rx="4" fill="var(--surface2)" stroke="var(--border)" />
          {holes.map((x) => (
            <g key={x}>
              <rect x={x} y="4" width="10" height="7" rx="2" fill="var(--muted)" />
              <rect x={x} y="59" width="10" height="7" rx="2" fill="var(--muted)" />
              <rect x={x} y="18" width="30" height="34" rx="2" fill="var(--bg)" />
            </g>
          ))}
        </g>
        <text x="100" y="40" textAnchor="middle" fill="var(--accent)" fontSize="13" fontWeight="700" letterSpacing="3" className="animate-blink">
          VAZIO
        </text>
      </svg>
      <div className="text-base font-semibold text-foreground">Nada por aqui</div>
      <div className="max-w-[280px] text-sm">Nenhum título combina com a busca ou os filtros.</div>
      <Button variant="outline" size="sm" onClick={onClear}>
        Limpar filtros
      </Button>
    </div>
  )
}
