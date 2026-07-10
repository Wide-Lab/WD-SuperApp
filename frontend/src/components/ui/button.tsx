import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

/*
 * Regra do acento (spec 02): o rosa marca posição e foco, nunca superfície.
 * Não existe botão preenchido de rosa. O contorno basta.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-field border text-sm font-medium transition-colors duration-200 ease-plotter disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        outline:
          'border-line bg-panel text-paper hover:border-mute hover:bg-panel-hover',
        ghost: 'border-transparent text-mute hover:bg-panel hover:text-paper',
      },
      size: {
        default: 'h-10 px-4',
        icon: 'size-8 rounded-[4px]',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'default',
    },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
