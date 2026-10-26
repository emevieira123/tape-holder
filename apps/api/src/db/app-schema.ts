import { TITLE_STATUSES, TITLE_TYPES } from '@fita/shared'
import { boolean, index, integer, jsonb, pgEnum, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export const titleTypeEnum = pgEnum('title_type', TITLE_TYPES)
export const titleStatusEnum = pgEnum('title_status', TITLE_STATUSES)

export const title = pgTable(
  'title',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: titleTypeEnum('type').notNull(),
    status: titleStatusEnum('status').notNull(),
    /** Quantidade de episódios de cada temporada, na ordem. */
    episodes: integer('episodes').array().notNull().default([1]),
    year: integer('year').notNull(),
    rating: real('rating'),
    genres: text('genres').notNull().default(''),
    coverUrl: text('cover_url').notNull().default(''),
    synopsis: text('synopsis').notNull().default(''),
    /** Episódios assistidos por temporada; watched[0] é a temporada 1. */
    watched: jsonb('watched').$type<number[][]>().notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('title_userId_idx').on(table.userId)],
)

export const preferences = pgTable('preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  notifyNewEpisodes: boolean('notify_new_episodes').notNull().default(true),
  hideSynopsis: boolean('hide_synopsis').notNull().default(false),
  jumpToNext: boolean('jump_to_next').notNull().default(true),
})

export type TitleRow = typeof title.$inferSelect
export type NewTitleRow = typeof title.$inferInsert
export type PreferencesRow = typeof preferences.$inferSelect
