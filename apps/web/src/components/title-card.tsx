import { STATUS_LABELS, TYPE_LABELS, progressPercent, totalEpisodes, type Title } from '@fita/shared'
import { Link } from 'react-router-dom'
import { STATUS_COLOR, coverOf } from '@/lib/titles'
import { StatusIcon } from './status-icon'

export const progressLabel = (t: Title) =>
  t.type === 'movie' ? (t.watched.length ? 'Assistido' : 'Não assistido') : `${t.watched.length}/${totalEpisodes(t)} ep`

export function CoverBadges({ type, status }: Pick<Title, 'type' | 'status'>) {
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/75 to-transparent" />
      <div className="absolute top-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold tracking-[.06em] text-white uppercase backdrop-blur-md">
        {TYPE_LABELS[type]}
      </div>
      <div
        className="absolute top-2 right-2 grid size-[26px] place-items-center rounded-full bg-black/55 backdrop-blur-md"
        style={{ color: STATUS_COLOR[status] }}
        title={STATUS_LABELS[status]}
      >
        <StatusIcon status={status} />
      </div>
    </>
  )
}

export function TitleCard({ title, index = 0 }: { title: Title; index?: number }) {
  const pct = progressPercent(title)
  const color = STATUS_COLOR[title.status]
  return (
    <Link
      to={`/titulos/${title.id}`}
      className="flex animate-fadeup flex-col gap-[9px] text-left text-foreground transition-transform duration-250 hover:-translate-y-[3px] hover:text-foreground"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <div
        className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-secondary bg-cover bg-center shadow-[0_8px_24px_rgba(0,0,0,.25)]"
        style={{ backgroundImage: `url('${coverOf(title)}')` }}
      >
        <CoverBadges type={title.type} status={title.status} />
        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2 text-white">
          <div className="h-1 flex-1 overflow-hidden rounded-sm bg-white/25">
            <div className="h-full transition-[width] duration-600" style={{ width: `${pct}%`, background: color }} />
          </div>
          <div className="text-xs font-semibold tabular-nums">{progressLabel(title)}</div>
        </div>
      </div>
      <div className="px-0.5">
        <div className="text-[15px] leading-tight font-semibold">{title.title}</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          {title.year} · {STATUS_LABELS[title.status]}
        </div>
      </div>
    </Link>
  )
}
