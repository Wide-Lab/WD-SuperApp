import { Search, X } from 'lucide-react'
import { useEffect } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import { Input } from '#/components/ui/input'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

export function SearchField({ value, onChange, inputRef }: SearchFieldProps) {
  /*
   * `/` foca a busca. Numa central que serve de lançador, chegar ao teclado sem o
   * mouse é função, não enfeite. Ignorado se o alvo já for um campo de texto — assim
   * digitar uma barra dentro do próprio campo continua funcionando.
   */
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey)
        return

      const target = event.target
      if (target instanceof HTMLElement) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable)
          return
      }

      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inputRef])

  /* `Esc` limpa o termo e mantém o foco. */
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Escape') return
    event.preventDefault()
    onChange('')
  }

  function handleClear() {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <label htmlFor="search-applications" className="sr-only">
        Buscar aplicação
      </label>

      <Search
        aria-hidden="true"
        size={16}
        strokeWidth={1.5}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mute"
      />

      <Input
        id="search-applications"
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar aplicação"
        autoComplete="off"
        spellCheck={false}
        className="pr-10 pl-9"
      />

      {value !== '' && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-[4px] text-mute transition-colors duration-200 ease-plotter hover:text-paper"
        >
          <X aria-hidden="true" size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}
