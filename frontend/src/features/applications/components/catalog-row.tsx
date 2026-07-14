import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { AppIcon } from './app-icon'
import { Button, buttonVariants } from '#/components/ui/button'
import { coordinate } from '../lib/coordinate'
import type { Application } from '../types'

interface CatalogRowProps {
  app: Application
  onRequestDelete: (app: Application) => void
}

/**
 * O registro de uma aplicação no fichário. A miniatura é o mesmo leito da
 * vitrine — a coordenada é como se reconhece uma ferramenta na bancada, e ela
 * aparece aqui pelo mesmo motivo que aparece lá.
 */
export function CatalogRow({ app, onRequestDelete }: CatalogRowProps) {
  const { x, y } = coordinate(app.id)

  /*
   * A linha vive sobre o `ink`; o hover a acende para `panel`. Profundidade é
   * luminosidade — a mesma regra do card, um degrau abaixo.
   */
  return (
    <li className="flex items-center gap-4 px-4 py-3 transition-colors duration-200 ease-plotter hover:bg-panel">
      <div className="plot-bed aspect-[16/10] w-14 shrink-0 rounded-media">
        {app.image ? (
          <img src={app.image} alt="" className="size-full object-cover" />
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
                size={18}
                strokeWidth={1.25}
                aria-hidden="true"
                className="text-mute"
              />
            </div>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[0.9375rem] leading-[1.3] font-medium text-paper">
          {app.name}
        </h3>
        <p className="truncate text-[0.8125rem] leading-[1.5] text-mute">
          {app.description}
        </p>
      </div>

      <span className="hidden shrink-0 font-mono text-xs tracking-[0.04em] text-mute min-[720px]:block">
        {app.id}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          to="/aplicacoes/$applicationId"
          params={{ applicationId: app.id }}
          className={buttonVariants({ variant: 'ghost' })}
          aria-label={`Editar ${app.name}`}
        >
          Editar
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Excluir ${app.name}`}
          aria-haspopup="dialog"
          onClick={() => onRequestDelete(app)}
          className="hover:text-pink-soft"
        >
          <Trash2 aria-hidden="true" size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </li>
  )
}
