export const TITLE_TYPES = ['movie', 'series', 'anime'] as const
export type TitleType = (typeof TITLE_TYPES)[number]

export const TITLE_STATUSES = ['watching', 'completed', 'paused', 'planned', 'dropped'] as const
export type TitleStatus = (typeof TITLE_STATUSES)[number]

export const TYPE_LABELS: Record<TitleType, string> = {
  movie: 'Filme',
  series: 'Série',
  anime: 'Anime',
}

export const TYPE_PLURAL_LABELS: Record<TitleType, string> = {
  movie: 'Filmes',
  series: 'Séries',
  anime: 'Animes',
}

export const STATUS_LABELS: Record<TitleStatus, string> = {
  watching: 'Assistindo',
  completed: 'Concluído',
  paused: 'Pausado',
  planned: 'Quero assistir',
  dropped: 'Abandonado',
}

/** Duração estimada de cada episódio, em minutos, usada nas estatísticas. */
export const EPISODE_MINUTES: Record<TitleType, number> = {
  movie: 112,
  series: 48,
  anime: 24,
}

export const LANGUAGES = ['pt-BR', 'en', 'ja'] as const
export type Language = (typeof LANGUAGES)[number]
