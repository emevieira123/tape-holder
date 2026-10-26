import type { Preferences } from '@fita/shared'
import type { TitleRow } from '../db/schema'
import type { PreferencesRepository } from '../modules/preferences/repository'
import type { TitleRepository } from '../modules/titles/repository'

export const createMemoryTitleRepository = (seed: TitleRow[] = []): TitleRepository & { rows: TitleRow[] } => {
  const rows = [...seed]
  let clock = Date.now()
  return {
    rows,
    async list(userId, filters = {}) {
      const q = filters.q?.toLowerCase()
      return rows
        .filter(
          (r) =>
            r.userId === userId &&
            (!filters.status || r.status === filters.status) &&
            (!filters.type || r.type === filters.type) &&
            (!q || r.title.toLowerCase().includes(q)),
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    },
    async findById(userId, id) {
      return rows.find((r) => r.userId === userId && r.id === id) ?? null
    },
    async create(userId, data) {
      const now = new Date(++clock)
      const row: TitleRow = {
        id: crypto.randomUUID(),
        userId,
        rating: null,
        genres: '',
        coverUrl: '',
        synopsis: '',
        watched: [],
        seasons: 1,
        episodesPerSeason: 1,
        createdAt: now,
        updatedAt: now,
        ...data,
      } as TitleRow
      rows.push(row)
      return row
    },
    async update(userId, id, patch) {
      const row = rows.find((r) => r.userId === userId && r.id === id)
      if (!row) return null
      Object.assign(row, patch, { updatedAt: new Date(++clock) })
      return row
    },
    async delete(userId, id) {
      const i = rows.findIndex((r) => r.userId === userId && r.id === id)
      if (i < 0) return false
      rows.splice(i, 1)
      return true
    },
  }
}

export const createMemoryPreferencesRepository = (): PreferencesRepository => {
  const store = new Map<string, Preferences>()
  return {
    async get(userId) {
      return store.get(userId) ?? null
    },
    async upsert(userId, data) {
      store.set(userId, data)
      return data
    },
  }
}
