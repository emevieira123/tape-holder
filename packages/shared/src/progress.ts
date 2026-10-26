import type { TitleStatus } from './constants'

export interface ProgressSubject {
  seasons: number
  episodesPerSeason: number
  status: TitleStatus
  watched: number[]
}

export const range = (from: number, to: number) =>
  to < from ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i)

export const totalEpisodes = (t: Pick<ProgressSubject, 'seasons' | 'episodesPerSeason'>) =>
  t.seasons * t.episodesPerSeason

export const progressPercent = (t: Pick<ProgressSubject, 'seasons' | 'episodesPerSeason' | 'watched'>) => {
  const total = totalEpisodes(t)
  return total === 0 ? 0 : Math.round((t.watched.length / total) * 100)
}

export const nextEpisode = (t: Pick<ProgressSubject, 'seasons' | 'episodesPerSeason' | 'watched'>) => {
  const watched = new Set(t.watched)
  return range(1, totalEpisodes(t)).find((n) => !watched.has(n)) ?? null
}

/** Episódios absolutos (1-based) de uma temporada. */
export const seasonEpisodes = (t: Pick<ProgressSubject, 'episodesPerSeason'>, season: number) =>
  range((season - 1) * t.episodesPerSeason + 1, season * t.episodesPerSeason)

/** Converte um episódio absoluto em temporada e número dentro dela. */
export const episodeLocation = (t: Pick<ProgressSubject, 'episodesPerSeason'>, n: number) => ({
  season: Math.ceil(n / t.episodesPerSeason),
  episode: ((n - 1) % t.episodesPerSeason) + 1,
})

const normalize = (list: number[], total: number) =>
  [...new Set(list)].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)

/**
 * Status depois de mudar a lista de assistidos: tudo visto vira Concluído;
 * marcar algo num título concluído ou na fila volta para Assistindo.
 */
const statusAfterChange = (t: ProgressSubject, watched: number[], added: boolean): TitleStatus => {
  if (watched.length === totalEpisodes(t)) return 'completed'
  if (t.status === 'completed') return 'watching'
  if (added && t.status === 'planned') return 'watching'
  return t.status
}

export const toggleEpisode = (t: ProgressSubject, n: number) => {
  const total = totalEpisodes(t)
  if (n < 1 || n > total) throw new RangeError(`Episódio ${n} fora do intervalo 1..${total}`)
  const has = t.watched.includes(n)
  const watched = normalize(has ? t.watched.filter((v) => v !== n) : [...t.watched, n], total)
  return { watched, status: statusAfterChange(t, watched, !has), added: !has }
}

export const toggleSeason = (t: ProgressSubject, season: number) => {
  if (season < 1 || season > t.seasons) throw new RangeError(`Temporada ${season} não existe`)
  const eps = seasonEpisodes(t, season)
  const allDone = eps.every((n) => t.watched.includes(n))
  const total = totalEpisodes(t)
  const watched = normalize(allDone ? t.watched.filter((n) => !eps.includes(n)) : [...t.watched, ...eps], total)
  return { watched, status: statusAfterChange(t, watched, !allDone), added: !allDone }
}

export const markNext = (t: ProgressSubject) => {
  const next = nextEpisode(t)
  if (next === null) return null
  return { episode: next, ...toggleEpisode(t, next) }
}

/** Ajusta a lista de assistidos quando temporadas ou episódios mudam. */
export const clampWatched = (watched: number[], total: number) => normalize(watched, total)
