import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { AppIcon } from './app-icon'
import { coordinate } from '../lib/coordinate'
import type { Application } from '../types'

/**
 * O leito do plotter. Papel milimetrado, o ícone ao centro, e a coordenada fixa
 * daquele app. Sob hover, o cabeçote atravessa o papel (`.plot-bed::after`).
 *
 * Com `image`, a capa cobre o papel — a varredura continua passando por cima.
 */
export function ApplicationCardMedia({ app }: { app: Application }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = app.image !== undefined && !imageFailed
  const { x, y } = coordinate(app.id)

  return (
    <div className="plot-bed aspect-[16/10] w-full rounded-media">
      {showImage ? (
        <img
          src={app.image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="size-full object-cover"
        />
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
              size={40}
              strokeWidth={1.25}
              aria-hidden="true"
              className="text-mute transition-colors duration-200 ease-plotter group-hover:text-paper group-focus-visible:text-paper"
            />
          </div>
        </>
      )}

      <span
        aria-hidden="true"
        className="open-label pointer-events-none absolute top-2 right-2 flex -translate-x-1 items-center gap-1 font-mono text-[0.6875rem] tracking-[0.08em] text-pink-soft opacity-0 transition-[opacity,transform] duration-200 ease-plotter group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        Abrir
        <ArrowUpRight size={12} strokeWidth={1.5} />
      </span>
    </div>
  )
}
