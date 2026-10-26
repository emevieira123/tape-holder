import type { Preferences } from '@fita/shared'
import { eq } from 'drizzle-orm'
import type { Database } from '../../db/client'
import { preferences } from '../../db/schema'

export const DEFAULT_PREFERENCES: Preferences = {
  notifyNewEpisodes: true,
  hideSynopsis: false,
  jumpToNext: true,
}

export interface PreferencesRepository {
  get(userId: string): Promise<Preferences | null>
  upsert(userId: string, data: Preferences): Promise<Preferences>
}

const pick = ({ notifyNewEpisodes, hideSynopsis, jumpToNext }: Preferences): Preferences => ({
  notifyNewEpisodes,
  hideSynopsis,
  jumpToNext,
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
