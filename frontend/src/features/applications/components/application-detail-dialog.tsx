import { ArrowUpRight, X } from 'lucide-react'
import type { Ref } from 'react'
import { AppIcon } from './app-icon'
import { Button } from '#/components/ui/button'
import { coordinate } from '../lib/coordinate'
import type { Application } from '../types'

const ABSOLUTE_URL = /^https?:\/\//

interface ApplicationDetailDialogProps {
  app: Application
  ref: Ref<HTMLDialogElement>
}

function destination(url: string) {
  if (!ABSOLUTE_URL.test(url)) return url
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * A folha ampliada da mesma bancada: papel milimetrado e coordenada fixa, sem
 * recorte na imagem. `<dialog>` nativo porque o foco preso, o Esc e o clique
 * fora já vêm de graça do navegador — e o orçamento de movimento da spec 02
 * já está cheio, então ela só aparece, sem animação de entrada.
 */
export function ApplicationDetailDialog({
  app,
  ref,
}: ApplicationDetailDialogProps) {
  const isAbsolute = ABSOLUTE_URL.test(app.url)
  const { x, y } = coordinate(app.id)
  const titleId = `${app.id}-detail-title`

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
      className="detail-dialog m-auto w-[min(560px,calc(100vw-2rem))] max-h-[90vh] overflow-hidden rounded-card border border-line bg-panel p-0 text-paper"
    >
      <div className="plot-bed relative aspect-[16/10] w-full">
        {app.image ? (
          <img src={app.image} alt="" className="size-full object-contain" />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="plot-cross"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <AppIcon
                name={app.icon}
                appId={app.id}
                size={56}
                strokeWidth={1.1}
                aria-hidden="true"
                className="text-mute"
              />
            </div>
          </>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={(event) => event.currentTarget.closest('dialog')?.close()}
        aria-label="Fechar"
        className="absolute top-3 right-3 size-8 bg-panel/90 text-mute hover:border-[rgba(237,29,84,0.45)] hover:text-paper"
      >
        <X size={16} strokeWidth={1.5} />
      </Button>

      <div className="px-6 py-5">
        <h2
          id={titleId}
          className="font-display text-2xl leading-[1.1] font-semibold tracking-[-0.01em] text-paper"
        >
          {app.name}
        </h2>
        <p className="mt-2.5 text-sm leading-[1.6] text-mute">
          {app.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
          <span className="truncate font-mono text-xs tracking-[0.04em] text-mute">
            {destination(app.url)}
          </span>
          <a
            href={app.url}
            target={isAbsolute ? '_blank' : undefined}
            rel={isAbsolute ? 'noopener noreferrer' : undefined}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-field border border-line bg-panel px-4 text-sm font-medium text-paper transition-colors duration-200 ease-plotter hover:border-[rgba(237,29,84,0.45)] hover:bg-panel-hover"
          >
            Abrir
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </dialog>
  )
}
