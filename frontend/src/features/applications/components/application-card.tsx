import { ApplicationCardMedia } from './application-card-media'
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
 */
export function ApplicationCard({ app, query }: ApplicationCardProps) {
  const isAbsolute = ABSOLUTE_URL.test(app.url)

  return (
    <a
      href={app.url}
      target={isAbsolute ? '_blank' : undefined}
      rel={isAbsolute ? 'noopener noreferrer' : undefined}
      className="group block h-full rounded-card border border-line bg-panel p-2.5 transition-colors duration-200 ease-plotter hover:border-[rgba(237,29,84,0.45)] hover:bg-panel-hover focus-visible:border-[rgba(237,29,84,0.45)] focus-visible:bg-panel-hover"
    >
      <ApplicationCardMedia app={app} />

      <div className="px-1 pt-3 pb-1">
        <h3 className="text-base leading-[1.3] font-medium tracking-[-0.005em] text-paper transition-colors duration-200 ease-plotter group-hover:text-white group-focus-visible:text-white">
          <HighlightedText text={app.name} query={query} />
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-[1.5] text-mute">
          <HighlightedText text={app.description} query={query} />
        </p>
      </div>

      {isAbsolute && <span className="sr-only">(abre em nova aba)</span>}
    </a>
  )
}
