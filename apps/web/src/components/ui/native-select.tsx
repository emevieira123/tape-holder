import * as React from 'react'
import { cn } from '@/lib/utils'

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        'rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary',
        className,
      )}
      {...props}
    />
  )
}

export { NativeSelect }
