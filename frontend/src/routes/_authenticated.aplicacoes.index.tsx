import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { buttonVariants } from '#/components/ui/button'
import { CatalogHeader } from '#/features/applications/components/catalog-header'
import { CatalogRow } from '#/features/applications/components/catalog-row'
import { CatalogSkeleton } from '#/features/applications/components/catalog-skeleton'
import { DeleteApplicationDialog } from '#/features/applications/components/delete-application-dialog'
import { ErrorState } from '#/features/applications/components/error-state'
import type { Application } from '#/features/applications/types'
import { useApplications } from '#/features/applications/use-applications'
import { useDeleteApplication } from '#/features/applications/use-delete-application'

export const Route = createFileRoute('/_authenticated/aplicacoes/')({
  component: Catalogo,
})

function Catalogo() {
  const { data, isPending, isError, error, refetch } = useApplications()
  const [target, setTarget] = useState<Application | null>(null)
  const remove = useDeleteApplication()

  function dismiss() {
    if (remove.isPending) return
    setTarget(null)
    remove.reset()
  }

  function confirm(app: Application) {
    remove.mutate(app.id, { onSuccess: () => setTarget(null) })
  }

  return (
    <>
      <CatalogHeader
        eyebrow="Widelab / Catálogo"
        title="Catálogo"
        meta={
          data
            ? `${data.length} ${data.length === 1 ? 'aplicação publicada' : 'aplicações publicadas'}`
            : undefined
        }
        action={
          <Link to="/aplicacoes/nova" className={buttonVariants()}>
            Nova aplicação
          </Link>
        }
      />

      <div className="mt-10">
        {isPending ? (
          <CatalogSkeleton />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <div className="rounded-card border border-line bg-panel px-6 py-14 text-center">
            <h2 className="text-base leading-[1.3] font-medium text-paper">
              Nenhuma aplicação publicada
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-[1.5] text-mute">
              A primeira que você publicar aparece aqui e na vitrine, no mesmo
              instante.
            </p>
            <Link to="/aplicacoes/nova" className={`${buttonVariants()} mt-8`}>
              Nova aplicação
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
            {data.map((app) => (
              <CatalogRow key={app.id} app={app} onRequestDelete={setTarget} />
            ))}
          </ul>
        )}
      </div>

      <DeleteApplicationDialog
        app={target}
        pending={remove.isPending}
        error={remove.isError ? remove.error.message : undefined}
        onConfirm={confirm}
        onDismiss={dismiss}
      />
    </>
  )
}
