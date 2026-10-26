import type { CreateTitleInput, Stats, Title, UpdateTitle } from '@fita/shared'
import { api } from '@/lib/api'

export interface ToggleResult {
  title: Title
  added: boolean
}

export const titlesApi = {
  list: () => api.get<Title[]>('/titles').then((r) => r.data),
  get: (id: string) => api.get<Title>(`/titles/${id}`).then((r) => r.data),
  create: (input: CreateTitleInput) => api.post<Title>('/titles', input).then((r) => r.data),
  update: (id: string, input: UpdateTitle) => api.patch<Title>(`/titles/${id}`, input).then((r) => r.data),
  remove: (id: string) => api.delete(`/titles/${id}`).then(() => undefined),
  toggleEpisode: (id: string, episode: number) =>
    api.post<ToggleResult>(`/titles/${id}/episodes/${episode}/toggle`).then((r) => r.data),
  toggleSeason: (id: string, season: number) =>
    api.post<ToggleResult>(`/titles/${id}/seasons/${season}/toggle`).then((r) => r.data),
  markNext: (id: string) => api.post<{ title: Title; episode: number }>(`/titles/${id}/next`).then((r) => r.data),
  stats: () => api.get<Stats>('/stats').then((r) => r.data),
  exportLibrary: () => api.get<{ exportedAt: string; titles: Title[] }>('/export').then((r) => r.data),
}
