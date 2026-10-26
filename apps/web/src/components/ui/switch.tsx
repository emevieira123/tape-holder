import { Switch as SwitchPrimitive } from 'radix-ui'
import * as React from 'react'
import { cn } from '@/lib/utils'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-border transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=checked]:bg-primary',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block size-[22px] translate-x-[3px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,.3)] transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] data-[state=checked]:translate-x-[23px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
