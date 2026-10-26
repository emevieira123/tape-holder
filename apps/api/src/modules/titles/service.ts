import {
  EPISODE_MINUTES,
  TITLE_STATUSES,
  TITLE_TYPES,
  clampWatched,
  markNext,
  range,
  totalEpisodes,
  toggleEpisode,
  toggleSeason,
  type CreateTitle,
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
  seasons: row.seasons,
  episodesPerSeason: row.episodesPerSeason,
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
      const isMovie = input.type === 'movie'
      const seasons = isMovie ? 1 : input.seasons
      const episodesPerSeason = isMovie ? 1 : input.episodesPerSeason
      const row = await repo.create(userId, {
        ...input,
        seasons,
        episodesPerSeason,
        watched: input.status === 'completed' ? range(1, seasons * episodesPerSeason) : [],
      })
      return toTitleDto(row)
    },

    async update(userId: string, id: string, input: UpdateTitle) {
      const current = await getRow(userId, id)
      const type = input.type ?? current.type
      const seasons = type === 'movie' ? 1 : (input.seasons ?? current.seasons)
      const episodesPerSeason = type === 'movie' ? 1 : (input.episodesPerSeason ?? current.episodesPerSeason)
      const watched = clampWatched(current.watched, seasons * episodesPerSeason)
      return save(userId, id, { ...input, seasons, episodesPerSeason, watched })
    },

    async remove(userId: string, id: string) {
      if (!(await repo.delete(userId, id))) throw new NotFoundError()
    },

    async toggleEpisode(userId: string, id: string, episode: number) {
      const row = await getRow(userId, id)
      let result!: ReturnType<typeof toggleEpisode>
      rangeError(() => {
        result = toggleEpisode(row, episode)
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
        episodesByType[row.type] += row.watched.length
        titlesByStatus[row.status] += 1
        minutesWatched += row.watched.length * EPISODE_MINUTES[row.type]
        if (row.rating !== null) ratings.push(row.rating)
      }
      return {
        totalTitles: rows.length,
        completedTitles: titlesByStatus.completed,
        episodesWatched: rows.reduce((acc, r) => acc + Math.min(r.watched.length, totalEpisodes(r)), 0),
        minutesWatched,
        averageRating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
        episodesByType,
        titlesByStatus,
      }
    },
  }
}

export type TitleService = ReturnType<typeof createTitleService>
