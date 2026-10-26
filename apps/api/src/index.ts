import { createApp } from './app'
import { auth } from './auth'
import { db } from './db/client'
import { env } from './env'
import { createDrizzlePreferencesRepository } from './modules/preferences/repository'
import { createPreferencesService } from './modules/preferences/service'
import { createDrizzleTitleRepository } from './modules/titles/repository'
import { createTitleService } from './modules/titles/service'

const app = createApp({
  titles: createTitleService(createDrizzleTitleRepository(db)),
  preferences: createPreferencesService(createDrizzlePreferencesRepository(db)),
  getSession: (headers) => auth.api.getSession({ headers }),
  authHandler: auth.handler,
  webOrigin: env.WEB_ORIGIN,
  // Sem reusePort, uma segunda instância falha em vez de dividir a porta com a primeira.
}).listen({ port: env.PORT, reusePort: false })

console.log(`Fita API em http://${app.server?.hostname}:${app.server?.port} (docs em /docs)`)
