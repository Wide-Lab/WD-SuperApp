import type { ReactNode } from 'react'

interface CatalogHeaderProps {
  /** A gravação da bancada: onde a pessoa está, ou o caminho de volta. */
  eyebrow: ReactNode
  title: string
  /** Um fato, em mono. Nunca um slogan. */
  meta?: string
  action?: ReactNode
}

export function CatalogHeader({
  eyebrow,
  title,
  meta,
  action,
}: CatalogHeaderProps) {
  return (
    <header className="pt-10 sm:pt-14">
      <div className="flex items-center gap-4">
        <div className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.22em] text-mute uppercase">
          {eyebrow}
        </div>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.02em] text-paper">
            {title}
          </h1>
          {meta && (
            <p className="mt-2 font-mono text-xs leading-[1.2] tracking-[0.08em] text-mute">
              {meta}
            </p>
          )}
        </div>
        {action}
      </div>
    </header>
  )
}
