import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous } from 'better-auth/plugins'
import { db } from './db/client'
import * as schema from './db/schema'
import { env } from './env'

export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_ORIGIN],
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  plugins: [anonymous({ generateName: () => 'Convidado' })],
})

export type Session = typeof auth.$Infer.Session
