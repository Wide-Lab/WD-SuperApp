import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded-field border border-line bg-panel px-3 py-2.5 text-sm leading-[1.5] text-paper',
        'placeholder:text-mute',
        'transition-colors duration-200 ease-plotter',
        'focus:border-pink',
        className,
      )}
      {...props}
    />
  )
}
