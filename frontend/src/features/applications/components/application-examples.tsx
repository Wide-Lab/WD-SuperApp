import {
  ArrowUpRight,
  FileText,
  Folder,
  Link as LinkIcon,
  Play,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { exampleSource } from '../lib/example-source'
import type { ExampleIcon } from '../lib/example-source'
import type { ApplicationExample } from '../types'

interface ApplicationExamplesProps {
  examples: Array<ApplicationExample>
  /** O `<h3>` que rotula a seção — precisa ser único na página. */
  headingId: string
}

/* O mapa mora aqui, e não em `lib/`: `lib/` é puro e testado sem DOM. */
const ICON: Record<ExampleIcon, LucideIcon> = {
  drive: Folder,
  doc: FileText,
  video: Play,
  link: LinkIcon,
}

/**
 * O material de apoio da aplicação, no segundo nível. Cada linha é uma âncora de
 * verdade — Tab, Enter, Ctrl+clique e "copiar endereço" saem de graça.
 *
 * Isto não é um segundo lançador (spec 06): leva a material *sobre* a aplicação,
 * nunca a um segundo caminho para abri-la. Por isso o vocabulário visual é o do
 * botão "Abrir" sem nenhum preenchimento — o rosa marca foco, não superfície.
 */
export function ApplicationExamples({
  examples,
  headingId,
}: ApplicationExamplesProps) {
  return (
    <section
      aria-labelledby={headingId}
      className="mt-5 border-t border-line pt-4"
    >
      <h3
        id={headingId}
        className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.22em] text-mute uppercase"
      >
        {/* Escrito em caixa baixa: caixa alta no fonte faz leitor de tela soletrar. */}
        Exemplos
      </h3>

      <ul className="mt-3 flex flex-col gap-2">
        {examples.map((example, index) => {
          const { origin, icon } = exampleSource(example.url)
          const Icon = ICON[icon]

          return (
            <li key={`${index}-${example.url}`}>
              <a
                href={example.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center gap-3 rounded-field border border-line px-3 transition-colors duration-200 ease-plotter hover:border-[rgba(237,29,84,0.45)] hover:bg-panel-hover focus-visible:border-[rgba(237,29,84,0.45)] focus-visible:bg-panel-hover"
              >
                <Icon
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.5}
                  className="shrink-0 text-mute"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-paper">
                  {example.label}
                </span>
                <span className="shrink-0 font-mono text-xs tracking-[0.04em] text-mute">
                  {origin}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  size={12}
                  strokeWidth={1.5}
                  className="shrink-0 text-mute"
                />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
