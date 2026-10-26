import { z } from 'zod'
import { LANGUAGES, TITLE_STATUSES, TITLE_TYPES } from './constants'

export const titleTypeSchema = z.enum(TITLE_TYPES)
export const titleStatusSchema = z.enum(TITLE_STATUSES)

const currentYear = new Date().getFullYear()

export const createTitleSchema = z.object({
  title: z.string().trim().min(1, 'Dê um nome ao título').max(200),
  type: titleTypeSchema,
  status: titleStatusSchema,
  seasons: z.coerce.number().int().min(1, 'Mínimo 1').max(100),
  episodesPerSeason: z.coerce.number().int().min(1, 'Mínimo 1').max(2000),
  year: z.coerce.number().int().min(1888, 'Ano inválido').max(currentYear + 10, 'Ano inválido'),
  genres: z.string().trim().max(200).default(''),
  coverUrl: z.union([z.literal(''), z.url('URL inválida')]).default(''),
  synopsis: z.string().trim().max(2000).default(''),
})
export type CreateTitleInput = z.input<typeof createTitleSchema>
export type CreateTitle = z.output<typeof createTitleSchema>

export const updateTitleSchema = createTitleSchema
  .partial()
  .extend({ rating: z.number().min(0).max(5).nullable().optional() })
export type UpdateTitle = z.output<typeof updateTitleSchema>

export const titleFiltersSchema = z.object({
  status: titleStatusSchema.optional(),
  type: titleTypeSchema.optional(),
  q: z.string().trim().max(200).optional(),
})
export type TitleFilters = z.output<typeof titleFiltersSchema>

export const titleSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: titleTypeSchema,
  status: titleStatusSchema,
  seasons: z.number().int(),
  episodesPerSeason: z.number().int(),
  year: z.number().int(),
  rating: z.number().nullable(),
  genres: z.string(),
  coverUrl: z.string(),
  synopsis: z.string(),
  watched: z.array(z.number().int()),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Title = z.output<typeof titleSchema>

export const preferencesSchema = z.object({
  notifyNewEpisodes: z.boolean(),
  hideSynopsis: z.boolean(),
  autoMarkNext: z.boolean(),
  language: z.enum(LANGUAGES),
})
export type Preferences = z.output<typeof preferencesSchema>
export const updatePreferencesSchema = preferencesSchema.partial()

export const statsSchema = z.object({
  totalTitles: z.number(),
  completedTitles: z.number(),
  episodesWatched: z.number(),
  minutesWatched: z.number(),
  averageRating: z.number().nullable(),
  episodesByType: z.record(titleTypeSchema, z.number()),
  titlesByStatus: z.record(titleStatusSchema, z.number()),
})
export type Stats = z.output<typeof statsSchema>

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe seu nome').max(80),
    email: z.email('E-mail inválido'),
    password: z.string().min(8, 'Mínimo de 8 caracteres').max(128),
    confirmPassword: z.string(),
    terms: z.literal(true, { error: 'Aceite os termos para continuar' }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem',
  })
export type SignUpInput = z.input<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})
export type SignInInput = z.input<typeof signInSchema>
