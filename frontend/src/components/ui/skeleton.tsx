import type { ComponentProps } from 'react'
import { cn } from '#/lib/utils'

/* Sem animação de pulso: `panel` estático já basta (spec 04). */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-media bg-panel', className)} {...props} />
}
