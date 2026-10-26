import {
  createTitleSchema,
  titleFiltersSchema,
  updatePreferencesSchema,
  updateTitleSchema,
} from '@fita/shared'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { z } from 'zod'
import { BadRequestError, NotFoundError } from './lib/errors'
import type { PreferencesService } from './modules/preferences/service'
import type { TitleService } from './modules/titles/service'

export interface SessionUser {
  id: string
  name: string
  email: string
}

export interface AppDeps {
  titles: TitleService
  preferences: PreferencesService
  /** Resolve a sessão a partir dos headers da requisição. */
  getSession(headers: Headers): Promise<{ user: SessionUser } | null>
  /** Handler do better-auth, montado em /api/auth. */
  authHandler?: (request: Request) => Response | Promise<Response>
  webOrigin?: string
}

const idParams = z.object({ id: z.string().min(1) })
const episodeParams = idParams.extend({ episode: z.coerce.number().int().min(1) })
const seasonParams = idParams.extend({ season: z.coerce.number().int().min(1) })

export const createApp = (deps: AppDeps) => {
  const authGuard = new Elysia({ name: 'auth-guard' }).macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await deps.getSession(headers)
        if (!session) return status(401, { message: 'Sessão expirada. Entre novamente.' })
        return { user: session.user }
      },
    },
  })

  const api = new Elysia({ prefix: '/api' })
    .use(authGuard)
    .get('/titles', ({ user, query }) => deps.titles.list(user.id, query), {
      auth: true,
      query: titleFiltersSchema,
      detail: { tags: ['Títulos'], summary: 'Lista os títulos da biblioteca' },
    })
    .post('/titles', ({ user, body, status }) => deps.titles.create(user.id, body).then((t) => status(201, t)), {
      auth: true,
      body: createTitleSchema,
      detail: { tags: ['Títulos'], summary: 'Adiciona um título' },
    })
    .get('/titles/:id', ({ user, params }) => deps.titles.get(user.id, params.id), {
      auth: true,
      params: idParams,
      detail: { tags: ['Títulos'], summary: 'Detalhe de um título' },
    })
    .patch('/titles/:id', ({ user, params, body }) => deps.titles.update(user.id, params.id, body), {
      auth: true,
      params: idParams,
      body: updateTitleSchema,
      detail: { tags: ['Títulos'], summary: 'Atualiza um título' },
    })
    .delete(
      '/titles/:id',
      async ({ user, params, status }) => {
        await deps.titles.remove(user.id, params.id)
        return status(204)
      },
      { auth: true, params: idParams, detail: { tags: ['Títulos'], summary: 'Remove um título' } },
    )
    .post(
      '/titles/:id/episodes/:episode/toggle',
      ({ user, params }) => deps.titles.toggleEpisode(user.id, params.id, params.episode),
      { auth: true, params: episodeParams, detail: { tags: ['Progresso'], summary: 'Marca ou desmarca um episódio' } },
    )
    .post(
      '/titles/:id/seasons/:season/toggle',
      ({ user, params }) => deps.titles.toggleSeason(user.id, params.id, params.season),
      { auth: true, params: seasonParams, detail: { tags: ['Progresso'], summary: 'Marca ou desmarca a temporada' } },
    )
    .post('/titles/:id/next', ({ user, params }) => deps.titles.markNext(user.id, params.id), {
      auth: true,
      params: idParams,
      detail: { tags: ['Progresso'], summary: 'Marca o próximo episódio' },
    })
    .get('/stats', ({ user }) => deps.titles.stats(user.id), {
      auth: true,
      detail: { tags: ['Estatísticas'], summary: 'Resumo da biblioteca' },
    })
    .get(
      '/export',
      async ({ user, set }) => {
        set.headers['content-disposition'] = 'attachment; filename="fita-biblioteca.json"'
        return { exportedAt: new Date().toISOString(), titles: await deps.titles.list(user.id) }
      },
      { auth: true, detail: { tags: ['Títulos'], summary: 'Exporta a biblioteca em JSON' } },
    )
    .get('/preferences', ({ user }) => deps.preferences.get(user.id), {
      auth: true,
      detail: { tags: ['Preferências'], summary: 'Preferências do usuário' },
    })
    .patch('/preferences', ({ user, body }) => deps.preferences.update(user.id, body), {
      auth: true,
      body: updatePreferencesSchema,
      detail: { tags: ['Preferências'], summary: 'Atualiza preferências' },
    })

  const app = new Elysia()
    .use(
      cors({
        origin: deps.webOrigin ?? true,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    )
    .use(
      openapi({
        path: '/docs',
        mapJsonSchema: { zod: z.toJSONSchema },
        documentation: { info: { title: 'Fita API', version: '1.0.0' } },
      }),
    )
    .error({ NotFoundError, BadRequestError })
    .onError(({ code, error, status }) => {
      if (code === 'NotFoundError') return status(404, { message: error.message })
      if (code === 'BadRequestError') return status(400, { message: error.message })
      if (code === 'VALIDATION') return status(422, { message: 'Dados inválidos', issues: error.all })
    })
    .get('/health', () => ({ ok: true }))

  if (deps.authHandler) app.mount(deps.authHandler)

  return app.use(api)
}

export type App = ReturnType<typeof createApp>
