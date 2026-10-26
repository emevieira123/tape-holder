import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTitle, useUpdateTitle } from '@/features/titles/hooks'
import { TitleForm, toFormValues } from '@/features/titles/title-form'
import { toast } from '@/stores/toast-store'

export function EditTitlePage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: title, isPending, isError } = useTitle(id)
  const update = useUpdateTitle(id)
  const back = () => navigate(`/titulos/${id}`)

  if (isPending) return <div className="h-96 max-w-[560px] animate-pulse rounded-2xl bg-secondary" aria-busy="true" />
  if (isError || !title) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="m-0 text-2xl font-bold">Título não encontrado</h1>
        <Link to="/">Voltar para a biblioteca</Link>
      </div>
    )
  }

  return (
    <div className="flex animate-fadeup flex-col gap-[22px]">
      <div>
        <h1 className="m-0 text-[30px] font-bold">Editar título</h1>
        <div className="mt-0.5 text-[15px] text-muted-foreground">
          Mude temporadas, episódios e dados de {title.title}. O progresso das temporadas mantidas continua.
        </div>
      </div>
      <TitleForm
        // Recria o formulário se o título carregado mudar (ex.: placeholder da lista → dado completo).
        key={title.updatedAt}
        defaultValues={toFormValues(title)}
        watched={title.watched}
        submitLabel="Salvar alterações"
        submitting={update.isPending}
        onCancel={back}
        onInvalid={toast}
        onSubmit={(values) =>
          update.mutate(values, {
            onSuccess: () => {
              toast('Alterações salvas')
              back()
            },
          })
        }
      />
    </div>
  )
}
