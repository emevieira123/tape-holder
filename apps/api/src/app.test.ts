import { beforeEach, describe, expect, it } from 'bun:test'
import { createApp } from './app'
import { createPreferencesService } from './modules/preferences/service'
import { createTitleService } from './modules/titles/service'
import { createMemoryPreferencesRepository, createMemoryTitleRepository } from './test/memory-repositories'

const user = { id: 'u1', name: 'Ana', email: 'ana@exemplo.com' }
let app: ReturnType<typeof createApp>

beforeEach(() => {
  app = createApp({
    titles: createTitleService(createMemoryTitleRepository()),
    preferences: createPreferencesService(createMemoryPreferencesRepository()),
    getSession: async (headers) => (headers.get('authorization') === 'Bearer ok' ? { user } : null),
  })
})

const call = (path: string, init: RequestInit & { json?: unknown } = {}, authed = true) => {
  const headers = new Headers(init.headers)
  if (authed) headers.set('authorization', 'Bearer ok')
  if (init.json !== undefined) headers.set('content-type', 'application/json')
  return app.handle(
    new Request(`http://localhost${path}`, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    }),
  )
}

const newTitle = { title: 'Kaze no Uta', type: 'anime', status: 'planned', seasons: 1, episodesPerSeason: 13, year: 2025 }

describe('API', () => {
  it('responde health sem sessão', async () => {
    expect((await call('/health', {}, false)).status).toBe(200)
  })

  it('exige sessão nas rotas da biblioteca', async () => {
    const res = await call('/api/titles', {}, false)
    expect(res.status).toBe(401)
  })

  it('cria, lista com filtros e busca um título', async () => {
    const created = await call('/api/titles', { method: 'POST', json: newTitle })
    expect(created.status).toBe(201)
    const { id } = (await created.json()) as { id: string }

    await call('/api/titles', { method: 'POST', json: { ...newTitle, title: 'Vidro', type: 'series' } })

    const animes = (await (await call('/api/titles?type=anime')).json()) as unknown[]
    expect(animes).toHaveLength(1)
    const search = (await (await call('/api/titles?q=vid')).json()) as { title: string }[]
    expect(search.map((t) => t.title)).toEqual(['Vidro'])

    const one = await call(`/api/titles/${id}`)
    expect(((await one.json()) as { title: string }).title).toBe('Kaze no Uta')
  })

  it('valida o corpo com zod', async () => {
    const res = await call('/api/titles', { method: 'POST', json: { ...newTitle, title: '' } })
    expect(res.status).toBe(422)
  })

  it('rejeita filtro com status desconhecido', async () => {
    expect((await call('/api/titles?status=foo')).status).toBe(422)
  })

  it('marca episódio, temporada e próximo', async () => {
    const { id } = (await (await call('/api/titles', { method: 'POST', json: newTitle })).json()) as { id: string }

    const ep = await call(`/api/titles/${id}/episodes/3/toggle`, { method: 'POST' })
    expect(((await ep.json()) as { title: { watched: number[] } }).title.watched).toEqual([3])

    const next = await call(`/api/titles/${id}/next`, { method: 'POST' })
    expect(((await next.json()) as { episode: number }).episode).toBe(1)

    const season = await call(`/api/titles/${id}/seasons/1/toggle`, { method: 'POST' })
    const body = (await season.json()) as { title: { status: string; watched: number[] } }
    expect(body.title.status).toBe('completed')
    expect(body.title.watched).toHaveLength(13)
  })

  it('devolve 404 para título inexistente e 400 para episódio fora do total', async () => {
    expect((await call('/api/titles/nao-existe')).status).toBe(404)
    const { id } = (await (await call('/api/titles', { method: 'POST', json: newTitle })).json()) as { id: string }
    expect((await call(`/api/titles/${id}/episodes/50/toggle`, { method: 'POST' })).status).toBe(400)
  })

  it('remove um título', async () => {
    const { id } = (await (await call('/api/titles', { method: 'POST', json: newTitle })).json()) as { id: string }
    expect((await call(`/api/titles/${id}`, { method: 'DELETE' })).status).toBe(204)
    expect((await call(`/api/titles/${id}`)).status).toBe(404)
  })

  it('lê e atualiza preferências com padrão', async () => {
    const defaults = (await (await call('/api/preferences')).json()) as { autoMarkNext: boolean }
    expect(defaults.autoMarkNext).toBe(true)
    const updated = await call('/api/preferences', { method: 'PATCH', json: { autoMarkNext: false } })
    expect(((await updated.json()) as { autoMarkNext: boolean }).autoMarkNext).toBe(false)
  })

  it('exporta a biblioteca como anexo', async () => {
    await call('/api/titles', { method: 'POST', json: newTitle })
    const res = await call('/api/export')
    expect(res.headers.get('content-disposition')).toContain('attachment')
    expect(((await res.json()) as { titles: unknown[] }).titles).toHaveLength(1)
  })

  it('publica a documentação OpenAPI', async () => {
    const res = await call('/docs/json', {}, false)
    expect(res.status).toBe(200)
    const spec = (await res.json()) as { paths: Record<string, unknown> }
    expect(spec.paths['/api/titles']).toBeDefined()
  })
})
