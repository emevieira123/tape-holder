import type { TitleFilters } from '@fita/shared'
import { and, desc, eq, ilike } from 'drizzle-orm'
import type { Database } from '../../db/client'
import { title, type NewTitleRow, type TitleRow } from '../../db/schema'

export type TitlePatch = Partial<Omit<NewTitleRow, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>

export interface TitleRepository {
  list(userId: string, filters?: TitleFilters): Promise<TitleRow[]>
  findById(userId: string, id: string): Promise<TitleRow | null>
  create(userId: string, data: Omit<NewTitleRow, 'userId'>): Promise<TitleRow>
  update(userId: string, id: string, patch: TitlePatch): Promise<TitleRow | null>
  delete(userId: string, id: string): Promise<boolean>
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

export const createDrizzleTitleRepository = (db: Database): TitleRepository => ({
  async list(userId, filters = {}) {
    const conditions = [eq(title.userId, userId)]
    if (filters.status) conditions.push(eq(title.status, filters.status))
    if (filters.type) conditions.push(eq(title.type, filters.type))
    if (filters.q) conditions.push(ilike(title.title, `%${escapeLike(filters.q)}%`))
    return db.select().from(title).where(and(...conditions)).orderBy(desc(title.createdAt))
  },

  async findById(userId, id) {
    const [row] = await db.select().from(title).where(and(eq(title.userId, userId), eq(title.id, id)))
    return row ?? null
  },

  async create(userId, data) {
    const [row] = await db.insert(title).values({ ...data, userId }).returning()
    return row!
  },

  async update(userId, id, patch) {
    const [row] = await db
      .update(title)
      .set(patch)
      .where(and(eq(title.userId, userId), eq(title.id, id)))
      .returning()
    return row ?? null
  },

  async delete(userId, id) {
    const rows = await db
      .delete(title)
      .where(and(eq(title.userId, userId), eq(title.id, id)))
      .returning({ id: title.id })
    return rows.length > 0
  },
})
