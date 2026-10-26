import type { Preferences } from '@fita/shared'
import { eq } from 'drizzle-orm'
import type { Database } from '../../db/client'
import { preferences } from '../../db/schema'

export const DEFAULT_PREFERENCES: Preferences = {
  notifyNewEpisodes: true,
  hideSynopsis: false,
  autoMarkNext: true,
  language: 'pt-BR',
}

export interface PreferencesRepository {
  get(userId: string): Promise<Preferences | null>
  upsert(userId: string, data: Preferences): Promise<Preferences>
}

const pick = ({ notifyNewEpisodes, hideSynopsis, autoMarkNext, language }: Preferences): Preferences => ({
  notifyNewEpisodes,
  hideSynopsis,
  autoMarkNext,
  language,
})

export const createDrizzlePreferencesRepository = (db: Database): PreferencesRepository => ({
  async get(userId) {
    const [row] = await db.select().from(preferences).where(eq(preferences.userId, userId))
    return row ? pick(row) : null
  },

  async upsert(userId, data) {
    const [row] = await db
      .insert(preferences)
      .values({ userId, ...data })
      .onConflictDoUpdate({ target: preferences.userId, set: data })
      .returning()
    return pick(row!)
  },
})
