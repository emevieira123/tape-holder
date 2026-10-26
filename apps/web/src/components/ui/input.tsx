import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'w-full min-w-0 rounded-[10px] border border-border bg-secondary px-3.5 py-3 text-[15px] font-normal text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-primary aria-invalid:border-primary',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
