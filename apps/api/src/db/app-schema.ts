import { TITLE_STATUSES, TITLE_TYPES } from '@fita/shared'
import { boolean, index, integer, pgEnum, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'
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
    seasons: integer('seasons').notNull().default(1),
    episodesPerSeason: integer('episodes_per_season').notNull().default(1),
    year: integer('year').notNull(),
    rating: real('rating'),
    genres: text('genres').notNull().default(''),
    coverUrl: text('cover_url').notNull().default(''),
    synopsis: text('synopsis').notNull().default(''),
    watched: integer('watched').array().notNull().default([]),
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
  autoMarkNext: boolean('auto_mark_next').notNull().default(true),
  language: text('language', { enum: ['pt-BR', 'en', 'ja'] }).notNull().default('pt-BR'),
})

export type TitleRow = typeof title.$inferSelect
export type NewTitleRow = typeof title.$inferInsert
export type PreferencesRow = typeof preferences.$inferSelect
