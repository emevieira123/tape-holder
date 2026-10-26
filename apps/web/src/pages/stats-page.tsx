import { STATUS_LABELS, TITLE_STATUSES, TITLE_TYPES, TYPE_PLURAL_LABELS } from '@fita/shared'
import { Link } from 'react-router-dom'
import { ProgressRing } from '@/components/progress-ring'
import { StatusIcon } from '@/components/status-icon'
import { progressLabel } from '@/components/title-card'
import { useStats, useTitles } from '@/features/titles/hooks'
import { STATUS_COLOR, coverOf, formatDecimal } from '@/lib/titles'
import { progressPercent } from '@fita/shared'

const BAR_COLORS = ['var(--gold)', 'var(--accent)', 'var(--blue)']

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-4 rounded-2xl border border-border bg-card p-[22px] ${className ?? ''}`}>
      <h2 className="m-0 text-[17px] font-bold">{title}</h2>
      {children}
    </section>
  )
}

export function StatsPage() {
  const { data: stats, isPending } = useStats()
  const { data: titles = [] } = useTitles()

  if (isPending || !stats) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-[14px] bg-secondary" />
        ))}
      </div>
    )
  }

  const hours = Math.round(stats.minutesWatched / 60)
  const kpis = [
    { label: 'Títulos', value: String(stats.totalTitles), sub: `${stats.completedTitles} concluídos` },
    { label: 'Episódios vistos', value: String(stats.episodesWatched), sub: 'incluindo filmes' },
    { label: 'Horas assistidas', value: String(hours), sub: `${formatDecimal(Math.round((stats.minutesWatched / 60 / 24) * 10) / 10)} dias inteiros` },
    {
      label: 'Média de nota',
      value: stats.averageRating === null ? '—' : formatDecimal(stats.averageRating),
      sub: stats.averageRating === null ? 'nenhum título avaliado' : 'dos títulos avaliados',
    },
  ]
  const max = Math.max(1, ...TITLE_TYPES.map((t) => stats.episodesByType[t]))
  const inProgress = titles.filter((t) => t.status === 'watching')

  return (
    <div className="flex animate-fadeup flex-col gap-[22px]">
      <div>
        <h1 className="m-0 text-[30px] font-bold">Estatísticas</h1>
        <div className="mt-0.5 text-[15px] text-muted-foreground">Um retrato do que você já assistiu.</div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-1 rounded-[14px] border border-border bg-card p-[18px]">
            <div className="text-[13px] font-semibold text-muted-foreground">{k.label}</div>
            <div className="text-[30px] font-bold tracking-[-.01em] tabular-nums">{k.value}</div>
            <div className="text-[13px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        <Card title="Episódios por tipo">
          <svg viewBox="0 0 320 180" width="100%" className="overflow-visible" role="img" aria-label="Episódios assistidos por tipo">
            <line x1="0" y1="150" x2="320" y2="150" stroke="var(--border)" />
            {TITLE_TYPES.map((type, i) => {
              const value = stats.episodesByType[type]
              const h = Math.max(6, (value / max) * 120)
              const cx = 60 + i * 100
              return (
                <g key={type}>
                  <rect
                    x={28 + i * 100}
                    y={150 - h}
                    width="64"
                    height={h}
                    rx="8"
                    fill={BAR_COLORS[i]}
                    className="animate-grow"
                    style={{ transformOrigin: '0 150px', animationDelay: `${i * 120}ms` }}
                  />
                  <text x={cx} y={150 - h - 8} textAnchor="middle" fill="var(--text)" fontSize="15" fontWeight="700" className="animate-fadeup" style={{ animationDelay: '.7s' }}>
                    {value}
                  </text>
                  <text x={cx} y="170" textAnchor="middle" fill="var(--muted)" fontSize="13">
                    {TYPE_PLURAL_LABELS[type]}
                  </text>
                </g>
              )
            })}
          </svg>
        </Card>

        <Card title="Títulos por status">
          <div className="flex flex-col gap-3">
            {TITLE_STATUSES.map((s) => {
              const count = stats.titlesByStatus[s]
              const pct = stats.totalTitles ? Math.round((count / stats.totalTitles) * 100) : 0
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="grid w-[22px] place-items-center" style={{ color: STATUS_COLOR[s] }}>
                    <StatusIcon status={s} size={16} />
                  </span>
                  <span className="w-[120px] text-sm font-medium">{STATUS_LABELS[s]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-secondary">
                    <div className="h-full origin-left animate-growx rounded" style={{ width: `${pct}%`, background: STATUS_COLOR[s] }} />
                  </div>
                  <span className="w-6 text-right font-bold tabular-nums">{count}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card title="Em andamento">
        {inProgress.length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">Nenhum título com status Assistindo.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {inProgress.map((t) => {
              const pct = progressPercent(t)
              return (
                <Link
                  key={t.id}
                  to={`/titulos/${t.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary p-2.5 text-left text-foreground hover:border-muted-foreground hover:text-foreground"
                >
                  <div className="h-[60px] w-10 shrink-0 rounded-md bg-card bg-cover bg-center" style={{ backgroundImage: `url('${coverOf(t)}')` }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t.title}</div>
                    <div className="mt-0.5 mb-1.5 text-xs text-muted-foreground">{progressLabel(t)}</div>
                    <div className="h-1 overflow-hidden rounded-sm bg-card">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <ProgressRing percent={pct} size={40} radius={18} stroke={4} color="var(--accent)" trackColor="var(--surface)" />
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
