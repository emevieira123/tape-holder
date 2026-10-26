import {
  STATUS_LABELS,
  TITLE_STATUSES,
  TYPE_LABELS,
  episodeLocation,
  nextEpisode,
  progressPercent,
  range,
  seasonEpisodes,
  totalEpisodes,
  type Title,
} from '@fita/shared'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckBox } from '@/components/check-box'
import { Chip } from '@/components/chip'
import { ProgressRing } from '@/components/progress-ring'
import { StatusIcon } from '@/components/status-icon'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/features/preferences/hooks'
import { RatingStars } from '@/features/titles/rating-stars'
import { useDeleteTitle, useMarkNext, useTitle, useToggleEpisode, useToggleSeason, useUpdateTitle } from '@/features/titles/hooks'
import { STATUS_COLOR, coverOf, episodeDuration } from '@/lib/titles'
import { toast } from '@/stores/toast-store'

const pad = (n: number) => String(n).padStart(2, '0')

function BackLink() {
  return (
    <Link to="/" className="flex items-center gap-1.5 self-start p-0 text-sm text-muted-foreground hover:text-foreground">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
      Biblioteca
    </Link>
  )
}

function Episodes({ title }: { title: Title }) {
  const toggleEpisode = useToggleEpisode(title)
  const toggleSeason = useToggleSeason(title)
  const isMovie = title.type === 'movie'
  const watched = new Set(title.watched)

  return (
    <div className="flex flex-col gap-[22px]">
      {range(1, title.seasons).map((season) => {
        const eps = seasonEpisodes(title, season)
        const doneCount = eps.filter((n) => watched.has(n)).length
        const allDone = doneCount === eps.length
        return (
          <section key={season} className="flex flex-col gap-2" aria-label={isMovie ? 'Filme' : `Temporada ${season}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="m-0 text-lg font-bold">{isMovie ? 'Filme' : `Temporada ${season}`}</h2>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-muted-foreground">
                  {doneCount}/{eps.length}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSeason.mutate(season)}
                  disabled={toggleSeason.isPending}
                  className="p-0 text-[13px] font-semibold text-primary"
                >
                  {allDone ? 'Desmarcar tudo' : 'Marcar tudo'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-1.5">
              {eps.map((n) => {
                const done = watched.has(n)
                const { episode } = episodeLocation(title, n)
                return (
                  <button
                    key={n}
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => toggleEpisode.mutate(n)}
                    className="flex items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left text-foreground transition-all duration-200 hover:border-muted-foreground"
                    style={{ borderColor: done ? 'transparent' : 'var(--border)', background: done ? 'var(--surface2)' : 'var(--surface)' }}
                  >
                    <CheckBox checked={done} />
                    <span className="w-7 shrink-0 text-[13px] text-muted-foreground tabular-nums">E{pad(episode)}</span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium" style={{ opacity: done ? 0.6 : 1 }}>
                      {isMovie ? title.title : `Episódio ${episode}`}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{episodeDuration(title.type)}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function DeleteTitle({ title }: { title: Title }) {
  const [confirming, setConfirming] = useState(false)
  const remove = useDeleteTitle()
  const navigate = useNavigate()
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-t border-border pt-5">
      {confirming ? (
        <>
          <span className="text-sm text-muted-foreground">Remover {title.title} e todo o progresso?</span>
          <Button
            variant="danger"
            size="sm"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(title.id, {
                onSuccess: () => {
                  toast(`${title.title} removido`)
                  navigate('/', { replace: true })
                },
              })
            }
          >
            Remover
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        </>
      ) : (
        <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
          Remover da biblioteca
        </Button>
      )}
    </div>
  )
}

function TitleDetail({ title }: { title: Title }) {
  const update = useUpdateTitle(title.id)
  const markNext = useMarkNext(title)
  const { data: prefs } = usePreferences()
  const total = totalEpisodes(title)
  const pct = progressPercent(title)
  const next = nextEpisode(title)
  const isMovie = title.type === 'movie'
  const color = STATUS_COLOR[title.status]
  const hideSynopsis = prefs?.hideSynopsis && title.status !== 'completed'

  const meta = isMovie
    ? `${title.year} · ${episodeDuration('movie')}`
    : `${title.year} · ${title.seasons} ${title.seasons > 1 ? 'temporadas' : 'temporada'} · ${total} episódios`
  const nextLabel = next
    ? isMovie
      ? 'Ainda não assistido'
      : `Próximo: T${episodeLocation(title, next).season} E${pad(episodeLocation(title, next).episode)}`
    : 'Tudo assistido'

  return (
    <div className="flex animate-fadeup flex-col gap-6">
      <BackLink />
      <div className="flex flex-wrap gap-7">
        <div
          className="aspect-2/3 w-[220px] shrink-0 rounded-2xl bg-secondary bg-cover bg-center shadow-fita"
          style={{ backgroundImage: `url('${coverOf(title)}')` }}
          role="img"
          aria-label={`Capa de ${title.title}`}
        />
        <div className="flex min-w-[260px] flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md border border-border bg-secondary px-[9px] py-[3px] text-xs font-semibold tracking-[.06em] uppercase">
              {TYPE_LABELS[title.type]}
            </span>
            <span className="text-sm text-muted-foreground">{meta}</span>
          </div>
          <h1 className="m-0 text-[34px] leading-[1.1] font-bold tracking-[-.01em] text-balance">{title.title}</h1>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <RatingStars value={title.rating} onChange={(rating) => update.mutate({ rating })} disabled={update.isPending} />
            {title.genres && <span className="text-muted-foreground">· {title.genres}</span>}
          </div>
          {title.synopsis && (
            <p className="m-0 max-w-[560px] text-[15px] leading-[1.55] text-muted-foreground">
              {hideSynopsis ? 'Sinopse oculta até você concluir o título.' : title.synopsis}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5 rounded-[14px] border border-border bg-card p-[18px]">
            <ProgressRing percent={pct} size={76} radius={34} stroke={7} color={color}>
              <span className="text-[17px] font-bold tabular-nums">{pct}%</span>
            </ProgressRing>
            <div className="min-w-[140px] flex-1">
              <div className="text-[17px] font-semibold">
                {isMovie ? (title.watched.length ? 'Assistido' : 'Não assistido') : `${title.watched.length} de ${total} episódios`}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">{nextLabel}</div>
            </div>
            <Button onClick={() => markNext.mutate()} disabled={!next || markNext.isPending} className="px-4 py-[11px]">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12l5 5 9-10" />
              </svg>
              Marcar próximo
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[13px] font-semibold tracking-[.06em] text-muted-foreground uppercase">Status</div>
            <div className="flex flex-wrap gap-2">
              {TITLE_STATUSES.map((s) => (
                <Chip
                  key={s}
                  label={STATUS_LABELS[s]}
                  active={title.status === s}
                  color={STATUS_COLOR[s]}
                  icon={<StatusIcon status={s} size={13} />}
                  onClick={() => title.status !== s && update.mutate({ status: s })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Episodes title={title} />
      <DeleteTitle title={title} />
    </div>
  )
}

export function TitleDetailPage() {
  const { id = '' } = useParams()
  const { data: title, isPending, isError } = useTitle(id)

  if (isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <BackLink />
        <div className="flex flex-wrap gap-7">
          <div className="aspect-2/3 w-[220px] animate-pulse rounded-2xl bg-secondary" />
          <div className="flex min-w-[260px] flex-1 flex-col gap-4">
            <div className="h-9 w-2/3 animate-pulse rounded-lg bg-secondary" />
            <div className="h-24 animate-pulse rounded-[14px] bg-secondary" />
          </div>
        </div>
      </div>
    )
  }
  if (isError || !title) {
    return (
      <div className="flex flex-col items-start gap-4">
        <BackLink />
        <h1 className="m-0 text-2xl font-bold">Título não encontrado</h1>
        <p className="m-0 text-muted-foreground">Ele pode ter sido removido da biblioteca.</p>
      </div>
    )
  }
  return <TitleDetail title={title} />
}
