import type { TitleStatus } from './constants'

export interface ProgressSubject {
  /** Quantidade de episódios de cada temporada. */
  episodes: number[]
  status: TitleStatus
  /** Números de episódio assistidos, por temporada (índice 0 = temporada 1). */
  watched: number[][]
}

export interface EpisodeRef {
  season: number
  episode: number
}

export const range = (from: number, to: number) =>
  to < from ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i)

export const totalEpisodes = (t: Pick<ProgressSubject, 'episodes'>) => t.episodes.reduce((a, b) => a + b, 0)

export const watchedCount = (t: Pick<ProgressSubject, 'watched'>) => t.watched.reduce((a, s) => a + s.length, 0)

export const progressPercent = (t: Pick<ProgressSubject, 'episodes' | 'watched'>) => {
  const total = totalEpisodes(t)
  return total === 0 ? 0 : Math.round((watchedCount(t) / total) * 100)
}

/** Primeiro episódio não assistido, seguindo a ordem das temporadas. */
export const nextEpisode = (t: Pick<ProgressSubject, 'episodes' | 'watched'>): EpisodeRef | null => {
  for (const [i, count] of t.episodes.entries()) {
    const seen = new Set(t.watched[i] ?? [])
    const episode = range(1, count).find((e) => !seen.has(e))
    if (episode !== undefined) return { season: i + 1, episode }
  }
  return null
}

/**
 * Ajusta o progresso ao formato das temporadas: uma lista por temporada,
 * sem duplicados, ordenada e só com episódios que existem.
 */
export const normalizeWatched = (watched: number[][], episodes: number[]) =>
  episodes.map((count, i) => [...new Set(watched[i] ?? [])].filter((e) => e >= 1 && e <= count).sort((a, b) => a - b))

/** Quantos episódios assistidos seriam perdidos ao trocar as temporadas por `episodes`. */
export const lostWatchedCount = (watched: number[][], episodes: number[]) =>
  watchedCount({ watched: normalizeWatched(watched, watched.map(() => Infinity)) }) -
  watchedCount({ watched: normalizeWatched(watched, episodes) })

/**
 * Status depois de mudar o progresso: tudo visto vira Concluído;
 * desmarcar algo de um título concluído ou marcar algo na fila volta para Assistindo.
 */
export const statusAfterProgress = (
  t: Pick<ProgressSubject, 'episodes' | 'status'>,
  watched: number[][],
  added: boolean,
): TitleStatus => {
  if (watchedCount({ watched }) === totalEpisodes(t)) return 'completed'
  if (t.status === 'completed') return 'watching'
  if (added && t.status === 'planned') return 'watching'
  return t.status
}

const assertSeason = (t: Pick<ProgressSubject, 'episodes'>, season: number) => {
  if (!Number.isInteger(season) || season < 1 || season > t.episodes.length) {
    throw new RangeError(`Temporada ${season} não existe`)
  }
}

export const toggleEpisode = (t: ProgressSubject, { season, episode }: EpisodeRef) => {
  assertSeason(t, season)
  const count = t.episodes[season - 1]!
  if (!Number.isInteger(episode) || episode < 1 || episode > count) {
    throw new RangeError(`Episódio ${episode} fora do intervalo 1..${count} da temporada ${season}`)
  }
  const current = t.watched[season - 1] ?? []
  const has = current.includes(episode)
  const next = t.watched.map((s) => [...s])
  next[season - 1] = has ? current.filter((e) => e !== episode) : [...current, episode]
  const watched = normalizeWatched(next, t.episodes)
  return { watched, status: statusAfterProgress(t, watched, !has), added: !has }
}

export const toggleSeason = (t: ProgressSubject, season: number) => {
  assertSeason(t, season)
  const all = range(1, t.episodes[season - 1]!)
  const current = new Set(t.watched[season - 1] ?? [])
  const allDone = all.every((e) => current.has(e))
  const next = t.watched.map((s) => [...s])
  next[season - 1] = allDone ? [] : all
  const watched = normalizeWatched(next, t.episodes)
  return { watched, status: statusAfterProgress(t, watched, !allDone), added: !allDone }
}

export const markNext = (t: ProgressSubject) => {
  const next = nextEpisode(t)
  if (!next) return null
  return { ...next, ...toggleEpisode(t, next) }
}

/** Progresso com os primeiros `n` episódios assistidos, em ordem. */
export const firstWatched = (episodes: number[], n: number) => {
  let left = n
  return episodes.map((count) => {
    const take = Math.max(0, Math.min(count, left))
    left -= take
    return range(1, take)
  })
}
