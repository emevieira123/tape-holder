import {
  MAX_EPISODES_PER_SEASON,
  MAX_SEASONS,
  STATUS_LABELS,
  TITLE_STATUSES,
  TITLE_TYPES,
  TYPE_LABELS,
  createTitleSchema,
  lostWatchedCount,
  normalizeWatched,
  totalEpisodes,
  watchedCount,
  type CreateTitle,
} from '@fita/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Chip } from '@/components/chip'
import { StatusIcon } from '@/components/status-icon'
import { CoverBadges } from '@/components/title-card'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { STATUS_COLOR, picsum } from '@/lib/titles'
import { cn } from '@/lib/utils'

// O useFieldArray trabalha com objetos, então cada temporada vira { episodes }.
const titleFormSchema = createTitleSchema.omit({ episodes: true }).extend({
  seasons: z
    .array(
      z.object({
        episodes: z.coerce
          .number({ error: 'Informe os episódios' })
          .int('Use um número inteiro')
          .min(1, 'Mínimo 1')
          .max(MAX_EPISODES_PER_SEASON, `Máximo ${MAX_EPISODES_PER_SEASON}`),
      }),
    )
    .min(1, 'Adicione ao menos uma temporada')
    .max(MAX_SEASONS, `Máximo de ${MAX_SEASONS} temporadas`),
})
export type TitleFormInput = z.input<typeof titleFormSchema>
type TitleFormOutput = z.output<typeof titleFormSchema>

export const toFormValues = (t: CreateTitle): TitleFormInput => ({
  ...t,
  seasons: t.episodes.map((episodes) => ({ episodes })),
})

const toPayload = ({ seasons, ...rest }: TitleFormOutput): CreateTitle => ({
  ...rest,
  episodes: rest.type === 'movie' ? [1] : seasons.map((s) => s.episodes),
})

interface TitleFormProps {
  defaultValues: TitleFormInput
  /** Progresso atual, na edição: mostra na prévia e avisa o que seria desmarcado. */
  watched?: number[][]
  submitLabel: string
  submitting: boolean
  onSubmit: (values: CreateTitle) => void
  onCancel: () => void
  onInvalid?: (message: string) => void
}

export function TitleForm({ defaultValues, watched, submitLabel, submitting, onSubmit, onCancel, onInvalid }: TitleFormProps) {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<TitleFormInput, unknown, TitleFormOutput>({ resolver: zodResolver(titleFormSchema), defaultValues })
  const seasons = useFieldArray({ control, name: 'seasons' })

  const [type, status, title, coverUrl, seasonValues] = useWatch({
    control,
    name: ['type', 'status', 'title', 'coverUrl', 'seasons'],
  })
  const isSeries = type !== 'movie'
  const episodes = isSeries ? (seasonValues ?? []).map((s) => Math.max(0, Math.floor(Number(s.episodes)) || 0)) : [1]
  const total = totalEpisodes({ episodes })
  const seen = watched ? watchedCount({ watched: normalizeWatched(watched, episodes) }) : 0
  const lost = watched ? lostWatchedCount(watched, episodes) : 0

  const addSeason = () => {
    const last = seasonValues?.at(-1)?.episodes
    seasons.append({ episodes: Number(last) || 12 }, { shouldFocus: true })
  }

  const submit = handleSubmit(
    (values) => onSubmit(toPayload(values)),
    (errs) => {
      if (errs.title?.message) onInvalid?.(errs.title.message)
    },
  )

  return (
    <div className="flex flex-wrap items-start gap-7">
      <form
        onSubmit={submit}
        noValidate
        className="flex max-w-[560px] min-w-[280px] flex-1 flex-col gap-[18px] rounded-2xl border border-border bg-card p-[22px]"
      >
        <Label>
          Título
          <Input placeholder="Nome do filme, série ou anime" aria-invalid={!!errors.title} {...register('title')} />
          <FieldError message={errors.title?.message} />
        </Label>

        <div className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-foreground">
          Tipo
          <div className="flex gap-1.5 rounded-[10px] bg-secondary p-1" role="radiogroup" aria-label="Tipo">
            {TITLE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => setValue('type', t)}
                className={cn(
                  'flex-1 rounded-lg p-[9px] text-sm font-semibold transition-all duration-200',
                  type === t ? 'bg-card text-foreground' : 'bg-transparent text-muted-foreground',
                )}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-[13px] font-semibold text-muted-foreground">
          Status
          <div className="flex flex-wrap gap-2">
            {TITLE_STATUSES.map((s) => (
              <Chip
                key={s}
                label={STATUS_LABELS[s]}
                active={status === s}
                color={STATUS_COLOR[s]}
                icon={<StatusIcon status={s} size={13} />}
                onClick={() => setValue('status', s)}
              />
            ))}
          </div>
        </div>

        {isSeries && (
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-1.5 flex w-full items-baseline justify-between gap-3 p-0 text-[13px] font-semibold text-muted-foreground">
              Temporadas
              <span className="font-normal">
                {seasons.fields.length} {seasons.fields.length === 1 ? 'temporada' : 'temporadas'} · {total} episódios
              </span>
            </legend>
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {seasons.fields.map((field, i) => {
                const error = errors.seasons?.[i]?.episodes?.message
                return (
                  <li key={field.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-[104px] shrink-0 text-sm font-semibold whitespace-nowrap text-foreground tabular-nums">Temporada {i + 1}</span>
                      <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        aria-label={`Episódios da temporada ${i + 1}`}
                        aria-invalid={!!error}
                        className="py-2.5"
                        {...register(`seasons.${i}.episodes`)}
                      />
                      <span className="shrink-0 text-sm font-normal text-muted-foreground">episódios</span>
                      <button
                        type="button"
                        onClick={() => seasons.remove(i)}
                        disabled={seasons.fields.length === 1}
                        aria-label={`Remover temporada ${i + 1}`}
                        title="Remover temporada"
                        className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary disabled:opacity-30"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                    <FieldError message={error} className="pl-[114px]" />
                  </li>
                )
              })}
            </ol>
            <FieldError message={errors.seasons?.root?.message ?? errors.seasons?.message} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSeason}
              disabled={seasons.fields.length >= MAX_SEASONS}
              className="self-start bg-transparent"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Adicionar temporada
            </Button>
          </fieldset>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <Label>
            Ano
            <Input type="number" aria-invalid={!!errors.year} {...register('year')} />
            <FieldError message={errors.year?.message} />
          </Label>
          <Label>
            Gêneros
            <Input placeholder="Drama, Mistério" {...register('genres')} />
          </Label>
        </div>

        <Label>
          URL da capa
          <Input placeholder="https://…" aria-invalid={!!errors.coverUrl} {...register('coverUrl')} />
          <FieldError message={errors.coverUrl?.message} />
        </Label>

        <Label>
          Sinopse
          <textarea
            rows={3}
            placeholder="Opcional"
            className="resize-y rounded-[10px] border border-border bg-secondary px-3.5 py-3 text-[15px] font-normal text-foreground outline-none focus:border-primary"
            {...register('synopsis')}
          />
        </Label>

        {lost > 0 && (
          <p role="alert" className="m-0 rounded-[10px] border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-sm text-foreground">
            {lost === 1 ? '1 episódio assistido vai ser desmarcado' : `${lost} episódios assistidos vão ser desmarcados`} ao salvar.
          </p>
        )}

        <div className="flex justify-end gap-2.5 pt-1">
          <Button type="button" variant="outline" className="bg-transparent px-[18px]" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="px-5" disabled={submitting}>
            {submitting ? 'Salvando…' : submitLabel}
          </Button>
        </div>
      </form>

      <aside className="flex w-[200px] flex-col gap-2.5" aria-label="Prévia">
        <div className="text-[13px] font-semibold tracking-[.06em] text-muted-foreground uppercase">Prévia</div>
        <div
          className="relative aspect-2/3 overflow-hidden rounded-xl bg-secondary bg-cover bg-center shadow-fita"
          style={{ backgroundImage: `url('${coverUrl || picsum(`preview-${title || 'novo'}`)}')` }}
        >
          <CoverBadges type={type} status={status} />
          <div className="absolute inset-x-2.5 bottom-2.5 text-xs font-semibold text-white">
            {isSeries ? `${seen}/${total} ep` : seen ? 'Assistido' : 'Não assistido'}
          </div>
        </div>
        <div className="text-[15px] font-semibold">{title || 'Novo título'}</div>
      </aside>
    </div>
  )
}
