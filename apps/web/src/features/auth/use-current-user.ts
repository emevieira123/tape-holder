import { useSession } from '@/lib/auth-client'

export interface CurrentUser {
  id: string
  name: string
  email: string
  image?: string | null
  createdAt: Date
  isAnonymous: boolean
}

export function useCurrentUser(): CurrentUser | null {
  const { data } = useSession()
  if (!data) return null
  const u = data.user as typeof data.user & { isAnonymous?: boolean | null }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    createdAt: new Date(u.createdAt),
    isAnonymous: Boolean(u.isAnonymous),
  }
}
