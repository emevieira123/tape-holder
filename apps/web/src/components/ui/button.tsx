import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:brightness-110',
        outline: 'border border-border bg-card text-foreground font-medium hover:border-muted-foreground',
        ghost: 'bg-transparent text-foreground font-medium hover:bg-secondary',
        link: 'bg-transparent p-0 text-primary hover:text-gold',
        danger: 'border border-border bg-transparent text-primary font-medium hover:border-primary',
      },
      size: {
        default: 'px-4 py-3 text-[15px]',
        lg: 'p-3.5 text-base',
        sm: 'px-4 py-2.5 text-sm',
        icon: 'size-9 rounded-full border border-border bg-card p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
