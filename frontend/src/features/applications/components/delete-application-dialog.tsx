import { useEffect, useRef } from 'react'
import { Button } from '#/components/ui/button'
import type { Application } from '../types'

interface DeleteApplicationDialogProps {
  /** A aplicação em vias de ser excluída, ou `null` quando não há nenhuma. */
  app: Application | null
  pending: boolean
  error?: string
  onConfirm: (app: Application) => void
  onDismiss: () => void
}

/**
 * Uma folha só para a página inteira, dirigida por `app`. Se cada linha tivesse a
 * sua, a exclusão derrubaria o componente que está no meio da própria mutação.
 *
 * `<dialog>` nativo: foco preso, Esc e clique fora vêm de graça do navegador.
 */
export function DeleteApplicationDialog({
  app,
  pending,
  error,
  onConfirm,
  onDismiss,
}: DeleteApplicationDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (app && !dialog.open) dialog.showModal()
    if (!app && dialog.open) dialog.close()
  }, [app])

  return (
    <dialog
      ref={ref}
      aria-labelledby="delete-title"
      onClose={onDismiss}
      // Esc não abandona uma exclusão em curso.
      onCancel={(event) => {
        if (pending) event.preventDefault()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending)
          event.currentTarget.close()
      }}
      className="confirm-dialog m-auto w-[min(420px,calc(100vw-2rem))] rounded-card border border-line bg-panel p-0 text-paper"
    >
      {app && (
        <div className="px-6 py-5">
          <h2
            id="delete-title"
            className="text-base leading-[1.3] font-medium text-paper"
          >
            Excluir {app.name}?
          </h2>
          <p className="mt-2.5 text-sm leading-[1.6] text-mute">
            A aplicação sai da vitrine na hora, e a capa enviada é apagada
            junto. Não dá para desfazer.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-field border border-line bg-ink px-4 py-3 text-sm leading-[1.5] text-paper"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={onDismiss}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={pending}
              onClick={() => onConfirm(app)}
            >
              {pending ? 'Excluindo…' : 'Excluir'}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  )
}
