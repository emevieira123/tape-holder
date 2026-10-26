import type { Preferences } from '@fita/shared'
import { DEFAULT_PREFERENCES, type PreferencesRepository } from './repository'

export const createPreferencesService = (repo: PreferencesRepository) => ({
  async get(userId: string) {
    return (await repo.get(userId)) ?? DEFAULT_PREFERENCES
  },

  async update(userId: string, patch: Partial<Preferences>) {
    const current = (await repo.get(userId)) ?? DEFAULT_PREFERENCES
    return repo.upsert(userId, { ...current, ...patch })
  },
})

export type PreferencesService = ReturnType<typeof createPreferencesService>
