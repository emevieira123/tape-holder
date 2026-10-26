import { STATUS_LABELS, TITLE_STATUSES, TITLE_TYPES, TYPE_LABELS, createTitleSchema, type CreateTitleInput, type CreateTitle } from '@fita/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Chip } from '@/components/chip'
import { StatusIcon } from '@/components/status-icon'
import { CoverBadges } from '@/components/title-card'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field-error'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateTitle } from '@/features/titles/hooks'
import { STATUS_COLOR, picsum } from '@/lib/titles'
import { cn } from '@/lib/utils'
import { toast } from '@/stores/toast-store'

const defaults: CreateTitleInput = {
  title: '',
  type: 'series',
  status: 'planned',
  seasons: 1,
  episodesPerSeason: 12,
  year: new Date().getFullYear(),
  genres: '',
  coverUrl: '',
  synopsis: '',
}

export function AddTitlePage() {
  const navigate = useNavigate()
  const create = useCreateTitle()
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTitleInput, unknown, CreateTitle>({ resolver: zodResolver(createTitleSchema), defaultValues: defaults })

  const [type, status, title, coverUrl, seasons, eps] = useWatch({
    control,
    name: ['type', 'status', 'title', 'coverUrl', 'seasons', 'episodesPerSeason'],
  })
  const isSeries = type !== 'movie'
  const total = (Number(seasons) || 1) * (Number(eps) || 1)

  const onSubmit = handleSubmit(
    (values) =>
      create.mutate(values, {
        onSuccess: (t) => {
          toast(`${t.title} adicionado`)
          navigate('/')
        },
      }),
    (errs) => {
      if (errs.title) toast(errs.title.message ?? 'Dê um nome ao título')
    },
  )

  return (
    <div className="flex animate-fadeup flex-col gap-[22px]">
      <div>
        <h1 className="m-0 text-[30px] font-bold">Adicionar título</h1>
        <div className="mt-0.5 text-[15px] text-muted-foreground">Preencha o básico; os episódios são gerados automaticamente.</div>
      </div>
      <div className="flex flex-wrap items-start gap-7">
        <form
          onSubmit={onSubmit}
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
            <div className="grid grid-cols-2 gap-3.5">
              <Label>
                Temporadas
                <Input type="number" min={1} aria-invalid={!!errors.seasons} {...register('seasons')} />
                <FieldError message={errors.seasons?.message} />
              </Label>
              <Label>
                Episódios por temporada
                <Input type="number" min={1} aria-invalid={!!errors.episodesPerSeason} {...register('episodesPerSeason')} />
                <FieldError message={errors.episodesPerSeason?.message} />
              </Label>
            </div>
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

          <div className="flex justify-end gap-2.5 pt-1">
            <Button type="button" variant="outline" className="bg-transparent px-[18px]" onClick={() => navigate('/')}>
              Cancelar
            </Button>
            <Button type="submit" className="px-5" disabled={create.isPending}>
              {create.isPending ? 'Salvando…' : 'Salvar título'}
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
              {isSeries ? `0/${total} ep` : 'Não assistido'}
            </div>
          </div>
          <div className="text-[15px] font-semibold">{title || 'Novo título'}</div>
        </aside>
      </div>
    </div>
  )
}
