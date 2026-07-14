import { DynamicIcon } from 'lucide-react/dynamic'
import { coordinate } from '../lib/coordinate'
import { FALLBACK_ICON, isIconName } from '../lib/icon-name'
import type { ApplicationDraft } from '../types'

interface ApplicationPreviewProps {
  draft: ApplicationDraft
  /** A capa: a que está no servidor, ou a prévia local do arquivo escolhido. */
  imageUrl?: string
}

/**
 * O card exato que vai para a vitrine — mesma geometria, mesmo leito, mesmo
 * recorte da capa. Não é uma ilustração do resultado: é o resultado.
 *
 * A coordenada sai do `id` (`coordinate.ts`), então a cruz **salta** para o lugar
 * novo a cada tecla, sem transição. Um plotter posiciona, não desliza — e o
 * orçamento de movimento da spec 02 já está fechado em duas animações.
 *
 * Aqui o ícone é resolvido sem o `AppIcon`: ele avisa no console a cada `id`
 * desconhecido, e um formulário produziria um `id` novo por tecla. O aviso de
 * ícone inexistente é dado no próprio campo, que é onde o conserto acontece.
 */
export function ApplicationPreview({
  draft,
  imageUrl,
}: ApplicationPreviewProps) {
  const plotted = draft.id !== ''
  const { x, y } = coordinate(draft.id)
  const iconName = isIconName(draft.icon) ? draft.icon : FALLBACK_ICON

  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.22em] text-mute uppercase">
          Prévia
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>

      {/*
        `aria-hidden`: a prévia é redundante para quem não enxerga — cada valor
        dela já foi digitado no campo ao lado, e um leitor de tela releria tudo.
      */}
      <div
        aria-hidden="true"
        className="mt-5 rounded-card border border-line bg-panel p-2.5"
      >
        <div className="plot-bed aspect-[16/10] w-full rounded-media">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <>
              {plotted && (
                <span
                  className="plot-cross"
                  style={{ left: `${x}%`, top: `${y}%` }}
                />
              )}
              <div className="absolute inset-0 grid place-items-center">
                <DynamicIcon
                  name={iconName}
                  size={40}
                  strokeWidth={1.25}
                  className="text-mute"
                />
              </div>
            </>
          )}
        </div>

        <div className="px-1 pt-3 pb-1">
          <h3 className="text-base leading-[1.3] font-medium tracking-[-0.005em] text-paper">
            {draft.name === '' ? (
              <span className="text-mute">Nome da aplicação</span>
            ) : (
              draft.name
            )}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-[1.5] text-mute">
            {draft.description === ''
              ? 'O que ela faz, em uma linha.'
              : draft.description}
          </p>
        </div>
      </div>

      <p className="mt-4 font-mono text-xs leading-[1.2] tracking-[0.08em] text-mute">
        {plotted ? (
          <>
            Coordenada{' '}
            <span className="text-paper">
              {x},{y}
            </span>
          </>
        ) : (
          'Sem coordenada até o identificador existir'
        )}
      </p>
    </div>
  )
}
