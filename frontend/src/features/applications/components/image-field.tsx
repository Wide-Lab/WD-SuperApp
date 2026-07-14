import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

/*
 * Os mesmos limites que o backend aplica (`upload_application_image`). Checar aqui
 * não substitui a checagem de lá — só evita mandar 8 MB pela rede para receber um
 * 413 de volta. Se um dia mudarem lá, mudam aqui.
 */
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

interface ImageFieldProps {
  /** A capa atual: a do servidor, ou a prévia local do arquivo escolhido. */
  imageUrl?: string
  /** Nome do arquivo escolhido e ainda não enviado. */
  fileName?: string
  pending: boolean
  error?: string
  onSelect: (file: File) => void
  onReject: (reason: string) => void
  onRemove: () => void
}

/**
 * A área de recepção da capa: arrastar o arquivo para cá ou escolher pelo botão
 * dão no mesmo. O botão não é redundante — arrastar não existe para quem navega
 * por teclado, e em touch não existe nem para o mouse.
 *
 * A borda tracejada é o único lugar do app onde ela aparece, e diz uma coisa só:
 * isto aqui recebe algo de fora.
 */
export function ImageField({
  imageUrl,
  fileName,
  pending,
  error,
  onSelect,
  onReject,
  onRemove,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function accept(files: FileList | null | undefined) {
    const file = files?.[0]
    if (!file) return
    if (files.length > 1) return onReject('Solte uma imagem só.')
    if (!ACCEPTED.includes(file.type))
      return onReject('Formato não suportado. Use PNG, JPG, WebP ou SVG.')
    if (file.size > MAX_BYTES)
      return onReject('Imagem maior que 5 MB. Comprima ou reduza o tamanho.')
    onSelect(file)
  }

  /* Só arquivo. Arrastar um link ou um trecho de texto não acende a zona. */
  function carriesFiles(event: DragEvent) {
    return event.dataTransfer.types.includes('Files')
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (pending || !carriesFiles(event)) return
    // Sem o `preventDefault` o navegador abre o arquivo numa aba nova.
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setOver(true)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    // Ignora a saída rumo a um filho da própria zona (o botão, o texto).
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setOver(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    if (pending || !carriesFiles(event)) return
    event.preventDefault()
    setOver(false)
    accept(event.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.18em] text-mute uppercase">
        Capa
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
        onChange={(event) => {
          accept(event.target.files)
          // Zera o valor: escolher o mesmo arquivo de novo tem que disparar `change`.
          event.target.value = ''
        }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col gap-3 rounded-field border border-dashed p-4 transition-colors duration-200 ease-plotter',
          over
            ? 'border-[rgba(237,29,84,0.45)] bg-panel-hover'
            : 'border-line bg-panel',
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            aria-describedby="image-hint"
          >
            {pending
              ? 'Enviando…'
              : imageUrl
                ? 'Trocar imagem'
                : 'Escolher imagem'}
          </Button>

          {imageUrl && (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={onRemove}
            >
              Remover
            </Button>
          )}

          {fileName && (
            <span className="truncate font-mono text-xs text-mute">
              {fileName}
            </span>
          )}
        </div>

        {/* Sem `aria-live`: quem navega por teclado não arrasta, e a troca de
            texto durante o arrasto só faria barulho no leitor de tela. */}
        <p id="image-hint" className="text-[0.8125rem] leading-[1.5] text-mute">
          {over
            ? 'Solte para usar como capa.'
            : 'Ou arraste uma imagem para cá. PNG, JPG, WebP ou SVG, até 5 MB — a capa cobre o papel milimetrado do card.'}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="text-[0.8125rem] leading-[1.5] text-pink-soft"
        >
          {error}
        </p>
      )}
    </div>
  )
}
