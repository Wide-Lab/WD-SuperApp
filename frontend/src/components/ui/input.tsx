import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-10 w-full rounded-field border border-line bg-panel text-sm text-paper',
        'placeholder:text-mute',
        'transition-colors duration-200 ease-plotter',
        'focus:border-pink',
        className,
      )}
      {...props}
    />
  )
}
