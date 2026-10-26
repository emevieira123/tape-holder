import { anonymousClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: '/api/auth',
  plugins: [anonymousClient()],
})

export const { useSession, signIn, signUp, signOut } = authClient
export type SessionData = typeof authClient.$Infer.Session
