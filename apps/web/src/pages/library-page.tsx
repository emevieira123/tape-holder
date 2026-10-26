import { STATUS_LABELS, TITLE_STATUSES, TITLE_TYPES, TYPE_LABELS, titleStatusSchema, titleTypeSchema, type Title } from '@fita/shared'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Chip } from '@/components/chip'
import { EmptyState } from '@/components/empty-state'
import { StatusIcon } from '@/components/status-icon'
import { TitleCard } from '@/components/title-card'
import { useTitles } from '@/features/titles/hooks'
import { STATUS_COLOR } from '@/lib/titles'

export function filterTitles(titles: Title[], filters: { status?: string; type?: string; q?: string }) {
  const q = filters.q?.trim().toLowerCase()
  return titles.filter(
    (t) =>
      (!filters.status || t.status === filters.status) &&
      (!filters.type || t.type === filters.type) &&
      (!q || t.title.toLowerCase().includes(q)),
  )
}

export function LibraryPage() {
  const { data: titles = [], isPending, isError, refetch } = useTitles()
  const [params, setParams] = useSearchParams()
  const status = titleStatusSchema.safeParse(params.get('status')).data
  const type = titleTypeSchema.safeParse(params.get('tipo')).data
  const q = params.get('q') ?? ''

  const setParam = (key: string, value?: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  const visible = useMemo(() => filterTitles(titles, { status, type, q }), [titles, status, type, q])
  const countBy = (s?: string) => (s ? titles.filter((t) => t.status === s).length : titles.length)

  return (
    <div className="flex animate-fadeup flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="m-0 text-[30px] font-bold tracking-[-.01em]">Biblioteca</h1>
          <div className="mt-0.5 text-[15px] text-muted-foreground">
            {isPending ? 'Carregando…' : `${visible.length} ${visible.length === 1 ? 'título' : 'títulos'}`}
          </div>
        </div>
        <label className="flex max-w-[380px] min-w-[200px] flex-1 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 focus-within:border-primary">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Buscar título"
            aria-label="Buscar título"
            className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-foreground outline-none"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2" aria-label="Filtrar por status">
          <Chip label="Todos" active={!status} count={countBy()} onClick={() => setParam('status')} />
          {TITLE_STATUSES.map((s) => (
            <Chip
              key={s}
              label={STATUS_LABELS[s]}
              active={status === s}
              color={STATUS_COLOR[s]}
              icon={<StatusIcon status={s} size={13} />}
              count={countBy(s)}
              onClick={() => setParam('status', s)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar por tipo">
          <Chip label="Todos" shape="square" active={!type} onClick={() => setParam('tipo')} />
          {TITLE_TYPES.map((t) => (
            <Chip key={t} label={TYPE_LABELS[t]} shape="square" active={type === t} onClick={() => setParam('tipo', t)} />
          ))}
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-15 text-center text-muted-foreground">
          <div className="text-base font-semibold text-foreground">Não foi possível carregar a biblioteca</div>
          <button type="button" onClick={() => refetch()} className="text-sm font-semibold text-primary">
            Tentar de novo
          </button>
        </div>
      ) : isPending ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3.5 gap-y-[18px]" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-2/3 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3.5 gap-y-[18px]">
          {visible.map((t, i) => (
            <TitleCard key={t.id} title={t} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState onClear={() => setParams({}, { replace: true })} />
      )}
    </div>
  )
}
