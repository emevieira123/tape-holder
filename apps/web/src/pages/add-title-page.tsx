import { useNavigate } from 'react-router-dom'
import { useCreateTitle } from '@/features/titles/hooks'
import { TitleForm, type TitleFormInput } from '@/features/titles/title-form'
import { toast } from '@/stores/toast-store'

const defaults: TitleFormInput = {
  title: '',
  type: 'series',
  status: 'planned',
  seasons: [{ episodes: 12 }],
  year: new Date().getFullYear(),
  genres: '',
  coverUrl: '',
  synopsis: '',
}

export function AddTitlePage() {
  const navigate = useNavigate()
  const create = useCreateTitle()

  return (
    <div className="flex animate-fadeup flex-col gap-[22px]">
      <div>
        <h1 className="m-0 text-[30px] font-bold">Adicionar título</h1>
        <div className="mt-0.5 text-[15px] text-muted-foreground">Preencha o básico; os episódios são gerados automaticamente.</div>
      </div>
      <TitleForm
        defaultValues={defaults}
        submitLabel="Salvar título"
        submitting={create.isPending}
        onCancel={() => navigate('/')}
        onInvalid={toast}
        onSubmit={(values) =>
          create.mutate(values, {
            onSuccess: (t) => {
              toast(`${t.title} adicionado`)
              navigate('/')
            },
          })
        }
      />
    </div>
  )
}
