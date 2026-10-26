import {
  EPISODE_MINUTES,
  TITLE_STATUSES,
  TITLE_TYPES,
  markNext,
  normalizeWatched,
  range,
  totalEpisodes,
  toggleEpisode,
  toggleSeason,
  watchedCount,
  type CreateTitle,
  type EpisodeRef,
  type Stats,
  type Title,
  type TitleFilters,
  type UpdateTitle,
} from '@fita/shared'
import type { TitleRow } from '../../db/schema'
import { BadRequestError, NotFoundError } from '../../lib/errors'
import type { TitleRepository } from './repository'

export const toTitleDto = (row: TitleRow): Title => ({
  id: row.id,
  title: row.title,
  type: row.type,
  status: row.status,
  episodes: row.episodes,
  year: row.year,
  rating: row.rating,
  genres: row.genres,
  coverUrl: row.coverUrl,
  synopsis: row.synopsis,
  watched: row.watched,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const rangeError = (fn: () => void) => {
  try {
    fn()
  } catch (err) {
    if (err instanceof RangeError) throw new BadRequestError(err.message)
    throw err
  }
}

export const createTitleService = (repo: TitleRepository) => {
  const getRow = async (userId: string, id: string) => {
    const row = await repo.findById(userId, id)
    if (!row) throw new NotFoundError()
    return row
  }

  const save = async (userId: string, id: string, patch: Parameters<TitleRepository['update']>[2]) => {
    const row = await repo.update(userId, id, patch)
    if (!row) throw new NotFoundError()
    return toTitleDto(row)
  }

  return {
    async list(userId: string, filters?: TitleFilters) {
      return (await repo.list(userId, filters)).map(toTitleDto)
    },

    async get(userId: string, id: string) {
      return toTitleDto(await getRow(userId, id))
    },

    async create(userId: string, input: CreateTitle) {
      // Filme é sempre uma temporada com um "episódio".
      const episodes = input.type === 'movie' ? [1] : input.episodes
      const row = await repo.create(userId, {
        ...input,
        episodes,
        watched: episodes.map((count) => (input.status === 'completed' ? range(1, count) : [])),
      })
      return toTitleDto(row)
    },

    async update(userId: string, id: string, input: UpdateTitle) {
      const current = await getRow(userId, id)
      const type = input.type ?? current.type
      const episodes = type === 'movie' ? [1] : (input.episodes ?? current.episodes)
      // Progresso de episódios ou temporadas que deixaram de existir é descartado.
      const watched = normalizeWatched(current.watched, episodes)

      // Status escolhido explicitamente vence. Sem mudança de status, ele acompanha
      // o novo formato: temporada nova reabre um concluído, e tirar o que faltava conclui.
      let status = input.status ?? current.status
      if (status === current.status) {
        const done = watchedCount({ watched }) === totalEpisodes({ episodes })
        if (status === 'completed' && !done) status = 'watching'
        else if (status === 'watching' && done) status = 'completed'
      }
      return save(userId, id, { ...input, episodes, watched, status })
    },

    async remove(userId: string, id: string) {
      if (!(await repo.delete(userId, id))) throw new NotFoundError()
    },

    async toggleEpisode(userId: string, id: string, ref: EpisodeRef) {
      const row = await getRow(userId, id)
      let result!: ReturnType<typeof toggleEpisode>
      rangeError(() => {
        result = toggleEpisode(row, ref)
      })
      return { title: await save(userId, id, { watched: result.watched, status: result.status }), added: result.added }
    },

    async toggleSeason(userId: string, id: string, season: number) {
      const row = await getRow(userId, id)
      let result!: ReturnType<typeof toggleSeason>
      rangeError(() => {
        result = toggleSeason(row, season)
      })
      return { title: await save(userId, id, { watched: result.watched, status: result.status }), added: result.added }
    },

    async markNext(userId: string, id: string) {
      const row = await getRow(userId, id)
      const result = markNext(row)
      if (!result) throw new BadRequestError('Todos os episódios já foram assistidos')
      return {
        title: await save(userId, id, { watched: result.watched, status: result.status }),
        season: result.season,
        episode: result.episode,
      }
    },

    async stats(userId: string): Promise<Stats> {
      const rows = await repo.list(userId)
      const episodesByType = Object.fromEntries(TITLE_TYPES.map((t) => [t, 0])) as Stats['episodesByType']
      const titlesByStatus = Object.fromEntries(TITLE_STATUSES.map((s) => [s, 0])) as Stats['titlesByStatus']
      let minutesWatched = 0
      const ratings: number[] = []
      for (const row of rows) {
        const seen = watchedCount(row)
        episodesByType[row.type] += seen
        titlesByStatus[row.status] += 1
        minutesWatched += seen * EPISODE_MINUTES[row.type]
        if (row.rating !== null) ratings.push(row.rating)
      }
      return {
        totalTitles: rows.length,
        completedTitles: titlesByStatus.completed,
        episodesWatched: rows.reduce((acc, r) => acc + watchedCount(r), 0),
        minutesWatched,
        averageRating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
        episodesByType,
        titlesByStatus,
      }
    },
  }
}

export type TitleService = ReturnType<typeof createTitleService>
