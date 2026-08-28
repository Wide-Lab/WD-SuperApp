import { Maximize2 } from 'lucide-react'
import { useRef } from 'react'
import { ApplicationCardMedia } from './application-card-media'
import { ApplicationDetailDialog } from './application-detail-dialog'
import { HighlightedText } from './highlighted-text'
import type { Application } from '../types'

const ABSOLUTE_URL = /^https?:\/\//

interface ApplicationCardProps {
  app: Application
  query: string
}

/**
 * Uma âncora de verdade, não uma `div` com `onClick`. Isso dá de graça: Ctrl+clique,
 * copiar endereço, navegação por Tab e leitura correta por leitor de tela.
 *
 * A central é um lançador: ela continua aberta atrás do app.
 *
 * O botão de detalhe é irmão da âncora, não filho — `<button>` dentro de `<a>` é
 * aninhamento inválido. Ele mora numa régua no pé do card, e não flutuando sobre a
 * capa: sobreposto ele disputava a leitura com a própria imagem que serve para
 * reconhecer o app, e um ícone sem rótulo não diz que existe um segundo nível. Na
 * régua ele tem rótulo, largura inteira de alvo (bom no toque, onde não há hover) e
 * a capa volta a ser só a capa.
 *
 * A superfície do card reage ao hover da âncora via `has-[a:hover]`, e não mais por
 * `group` na raiz: a régua está fora da âncora e não deve acender o card inteiro
 * como se fosse levar ao mesmo destino.
 *
 * A contagem de exemplos vive aqui dentro, e não mais no corpo do card: dentro da
 * âncora ela precisava de `aria-hidden` para não prometer um destino que o link não
 * tem. No botão ela é o que sempre foi — o que se ganha ao abrir o detalhe.
 */
export function ApplicationCard({ app, query }: ApplicationCardProps) {
  const isAbsolute = ABSOLUTE_URL.test(app.url)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const examples = app.examples.length
  const countLabel = `${examples} ${examples === 1 ? 'exemplo' : 'exemplos'}`

  return (
    <div className="relative flex h-full flex-col rounded-card border border-line bg-panel p-2.5 transition-colors duration-200 ease-plotter has-[a:hover]:border-[rgba(237,29,84,0.45)] has-[a:hover]:bg-panel-hover has-[a:focus-visible]:border-[rgba(237,29,84,0.45)] has-[a:focus-visible]:bg-panel-hover">
      <a
        href={app.url}
        target={isAbsolute ? '_blank' : undefined}
        rel={isAbsolute ? 'noopener noreferrer' : undefined}
        className="group block flex-1"
      >
        <ApplicationCardMedia app={app} />

        <div className="px-1 pt-3 pb-3">
          <h3 className="text-base leading-[1.3] font-medium tracking-[-0.005em] text-paper transition-colors duration-200 ease-plotter group-hover:text-white group-focus-visible:text-white">
            <HighlightedText text={app.name} query={query} />
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-[1.5] text-mute">
            <HighlightedText text={app.description} query={query} />
          </p>
        </div>

        {isAbsolute && <span className="sr-only">(abre em nova aba)</span>}
      </a>

      <button
        type="button"
        aria-label={
          examples > 0
            ? `Ver detalhes de ${app.name} (${countLabel})`
            : `Ver detalhes de ${app.name}`
        }
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="group/rail -mx-2.5 -mb-2.5 flex items-center gap-2 rounded-b-[9px] border-t border-line px-3.5 py-3 text-left transition-colors duration-200 ease-plotter hover:bg-panel-hover"
      >
        <Maximize2
          size={13}
          strokeWidth={1.5}
          aria-hidden="true"
          className="shrink-0 text-mute transition-colors duration-200 ease-plotter group-hover/rail:text-pink-soft group-focus-visible/rail:text-pink-soft"
        />
        <span className="text-[0.8125rem] leading-none font-medium text-paper">
          Ver detalhes
        </span>
        {examples > 0 && (
          <span className="ml-auto font-mono text-[0.6875rem] leading-none tracking-[0.04em] text-mute">
            {countLabel}
          </span>
        )}
      </button>

      <ApplicationDetailDialog ref={dialogRef} app={app} />
    </div>
  )
}
