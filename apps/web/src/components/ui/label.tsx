import { Label as LabelPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('flex flex-col gap-1.5 text-[13px] font-semibold text-muted-foreground', className)}
      {...props}
    />
  )
}

export { Label }
