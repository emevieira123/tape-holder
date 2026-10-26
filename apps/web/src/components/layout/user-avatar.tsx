import { picsum } from '@/lib/titles'
import { cn } from '@/lib/utils'

export function UserAvatar({ userId, image, size, className }: { userId: string; image?: string | null; size: number; className?: string }) {
  return (
    <div
      className={cn('shrink-0 rounded-full bg-secondary bg-cover bg-center', className)}
      style={{ width: size, height: size, backgroundImage: `url('${image || picsum(`fita-avatar-${userId}`, size * 2, size * 2)}')` }}
      aria-hidden
    />
  )
}
