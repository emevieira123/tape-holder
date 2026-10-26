import { toggleEpisode, type CreateTitleInput, type Title, type UpdateTitle } from '@fita/shared'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/lib/api'
import { toast } from '@/stores/toast-store'
import { titlesApi } from './api'

export const titleKeys = {
  all: ['titles'] as const,
  list: () => [...titleKeys.all, 'list'] as const,
  detail: (id: string) => [...titleKeys.all, 'detail', id] as const,
  stats: ['stats'] as const,
}

/** Grava o título atualizado no detalhe e na lista, e marca as estatísticas como velhas. */
function syncTitle(qc: QueryClient, title: Title) {
  qc.setQueryData(titleKeys.detail(title.id), title)
  qc.setQueryData<Title[]>(titleKeys.list(), (list) => list?.map((t) => (t.id === title.id ? title : t)))
  void qc.invalidateQueries({ queryKey: titleKeys.stats })
}

export const useTitles = () => useQuery({ queryKey: titleKeys.list(), queryFn: titlesApi.list })

export function useTitle(id: string) {
  const qc = useQueryClient()
  return useQuery({
    queryKey: titleKeys.detail(id),
    queryFn: () => titlesApi.get(id),
    placeholderData: () => qc.getQueryData<Title[]>(titleKeys.list())?.find((t) => t.id === id),
  })
}

export const useStats = () => useQuery({ queryKey: titleKeys.stats, queryFn: titlesApi.stats })

export function useCreateTitle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTitleInput) => titlesApi.create(input),
    onSuccess: (title) => {
      qc.setQueryData<Title[]>(titleKeys.list(), (list) => (list ? [title, ...list] : list))
      void qc.invalidateQueries({ queryKey: titleKeys.stats })
    },
    onError: (err) => toast(errorMessage(err)),
  })
}

export function useUpdateTitle(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTitle) => titlesApi.update(id, input),
    onSuccess: (title) => syncTitle(qc, title),
    onError: (err) => toast(errorMessage(err)),
  })
}

export function useDeleteTitle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => titlesApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: titleKeys.detail(id) })
      qc.setQueryData<Title[]>(titleKeys.list(), (list) => list?.filter((t) => t.id !== id))
      void qc.invalidateQueries({ queryKey: titleKeys.stats })
    },
    onError: (err) => toast(errorMessage(err)),
  })
}

/** Marca/desmarca um episódio já aplicando a mudança na tela, e desfaz se a API recusar. */
export function useToggleEpisode(title: Title) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (episode: number) => titlesApi.toggleEpisode(title.id, episode),
    onMutate: async (episode) => {
      await qc.cancelQueries({ queryKey: titleKeys.detail(title.id) })
      const previous = qc.getQueryData<Title>(titleKeys.detail(title.id)) ?? title
      const next = toggleEpisode(previous, episode)
      syncTitle(qc, { ...previous, watched: next.watched, status: next.status })
      return { previous }
    },
    onError: (err, _, ctx) => {
      if (ctx) syncTitle(qc, ctx.previous)
      toast(errorMessage(err))
    },
    onSuccess: ({ title: saved, added }, episode) => {
      syncTitle(qc, saved)
      if (added) toast(saved.type === 'movie' ? `${saved.title} concluído` : `Episódio ${episode} marcado`)
    },
  })
}

export function useToggleSeason(title: Title) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (season: number) => titlesApi.toggleSeason(title.id, season),
    onSuccess: ({ title: saved, added }, season) => {
      syncTitle(qc, saved)
      if (added) toast(saved.type === 'movie' ? 'Filme concluído' : `Temporada ${season} concluída`)
    },
    onError: (err) => toast(errorMessage(err)),
  })
}

export function useMarkNext(title: Title) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => titlesApi.markNext(title.id),
    onSuccess: ({ title: saved, episode }) => {
      syncTitle(qc, saved)
      toast(saved.type === 'movie' ? `${saved.title} concluído` : `Episódio ${episode} marcado`)
    },
    onError: (err) => toast(errorMessage(err)),
  })
}
