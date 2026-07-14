import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

/*
 * Regra do acento (spec 02): o rosa marca posição e foco, nunca superfície.
 * Não existe botão preenchido de rosa. O contorno basta.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-field border text-sm font-medium transition-colors duration-200 ease-plotter disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        outline:
          'border-line bg-panel text-paper hover:border-mute hover:bg-panel-hover',
        ghost: 'border-transparent text-mute hover:bg-panel hover:text-paper',
        // Destrutivo continua sendo contorno: o que muda é o texto, em `pink-soft`
        // (14px — o `pink` puro reprovaria no contraste). Fundo rosa, nunca.
        danger:
          'border-line bg-panel text-pink-soft hover:border-[rgba(237,29,84,0.45)] hover:bg-panel-hover',
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
