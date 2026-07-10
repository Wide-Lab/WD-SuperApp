import type { RefObject } from 'react'
import { SearchField } from '#/features/applications/components/search-field'

interface MastheadProps {
  /** Total no catálogo. `undefined` enquanto ele não chegou. */
  total: number | undefined
  /** Quantos sobraram depois do filtro. */
  visible: number | undefined
  query: string
  onQueryChange: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

function counterText(
  total: number | undefined,
  visible: number | undefined,
  query: string,
) {
  if (total === undefined || visible === undefined) return ' ' // reserva a linha
  if (query.trim() === '')
    return `${total} ${total === 1 ? 'aplicação' : 'aplicações'}`
  return `${visible} de ${total}`
}

/* Factual e assimétrico. Não existe hero: o grid começa quase imediatamente. */
export function Masthead({
  total,
  visible,
  query,
  onQueryChange,
  inputRef,
}: MastheadProps) {
  return (
    <header className="pt-10 sm:pt-14">
      <div className="flex items-center gap-4">
        <span className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.22em] text-mute uppercase">
          Widelab
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-8 flex flex-col gap-6 min-[720px]:flex-row min-[720px]:items-baseline min-[720px]:justify-between min-[720px]:gap-12">
        <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.03em]">
          Widelab
        </h1>

        <div className="flex w-full flex-col gap-2 min-[720px]:w-[320px] min-[720px]:shrink-0">
          <SearchField
            value={query}
            onChange={onQueryChange}
            inputRef={inputRef}
          />
          <p
            aria-live="polite"
            className="font-mono text-xs leading-[1.2] tracking-[0.08em] text-mute min-[720px]:text-right"
          >
            {counterText(total, visible, query)}
          </p>
        </div>
      </div>
    </header>
  )
}
