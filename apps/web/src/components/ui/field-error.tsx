import { cn } from '@/lib/utils'

export function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null
  return (
    <span role="alert" className={cn('text-xs font-medium text-primary', className)}>
      {message}
    </span>
  )
}
