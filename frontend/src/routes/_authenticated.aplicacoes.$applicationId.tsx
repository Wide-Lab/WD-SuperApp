import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { buttonVariants } from '#/components/ui/button'
import { ApplicationForm } from '#/features/applications/components/application-form'
import { CatalogHeader } from '#/features/applications/components/catalog-header'
import { CatalogSkeleton } from '#/features/applications/components/catalog-skeleton'
import { ErrorState } from '#/features/applications/components/error-state'
import type { ApplicationDraft } from '#/features/applications/types'
import {
  useRemoveApplicationImage,
  useUploadApplicationImage,
} from '#/features/applications/use-application-image'
import {
  applicationsQueryOptions,
  useApplication,
} from '#/features/applications/use-applications'
import { useUpdateApplication } from '#/features/applications/use-update-application'

export const Route = createFileRoute(
  '/_authenticated/aplicacoes/$applicationId',
)({
  // O catálogo inteiro já é a fonte da edição — chegar direto pela URL não pode
  // renderizar "não encontrada" antes da lista existir.
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(applicationsQueryOptions()),
  component: EditarAplicacao,
})

function EditarAplicacao() {
  const { applicationId } = Route.useParams()
  const navigate = useNavigate()

  const {
    data: app,
    isPending,
    isError,
    error,
    refetch,
  } = useApplication(applicationId)

  const update = useUpdateApplication()
  const uploadImage = useUploadApplicationImage()
  const removeImage = useRemoveApplicationImage()
  const [imageError, setImageError] = useState<string | undefined>(undefined)

  function handleSubmit(draft: ApplicationDraft) {
    update.mutate(draft, {
      onSuccess: () => void navigate({ to: '/aplicacoes' }),
    })
  }

  const header = (
    <CatalogHeader
      eyebrow={
        <Link
          to="/aplicacoes"
          className="inline-flex items-center gap-2 transition-colors duration-200 ease-plotter hover:text-paper"
        >
          <ArrowLeft aria-hidden="true" size={12} strokeWidth={2} />
          Catálogo
        </Link>
      }
      title={app ? app.name : 'Editar aplicação'}
      meta={app ? app.id : undefined}
    />
  )

  if (isPending)
    return (
      <>
        {header}
        <div className="mt-10">
          <CatalogSkeleton />
        </div>
      </>
    )

  if (isError)
    return (
      <>
        {header}
        <div className="mt-10">
          <ErrorState error={error} onRetry={() => void refetch()} />
        </div>
      </>
    )

  if (!app)
    return (
      <>
        {header}
        <div className="mt-10 rounded-card border border-line bg-panel px-6 py-14 text-center">
          <h2 className="text-base leading-[1.3] font-medium text-paper">
            Aplicação não encontrada
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-[1.5] text-mute">
            Nenhuma aplicação com o identificador{' '}
            <span className="font-mono text-[0.8125rem] text-paper">
              {applicationId}
            </span>
            . Ela pode ter sido excluída.
          </p>
          <Link to="/aplicacoes" className={`${buttonVariants()} mt-8`}>
            Voltar ao catálogo
          </Link>
        </div>
      </>
    )

  const imageBusy = uploadImage.isPending || removeImage.isPending
  const imageFailure = uploadImage.isError
    ? uploadImage.error.message
    : removeImage.isError
      ? removeImage.error.message
      : undefined

  return (
    <>
      {header}

      <div className="mt-10">
        {/* Trocar de aplicação remonta o formulário: o rascunho é de uma só. */}
        <ApplicationForm
          key={app.id}
          mode="edit"
          initial={{
            id: app.id,
            name: app.name,
            description: app.description,
            url: app.url,
            icon: app.icon,
          }}
          submitLabel="Salvar alterações"
          submitting={update.isPending}
          error={update.isError ? update.error.message : undefined}
          onSubmit={handleSubmit}
          image={{
            url: app.image,
            pending: imageBusy,
            error: imageError ?? imageFailure,
            // A aplicação já existe: a capa sobe na hora, sem esperar o "salvar".
            onSelect: (file) => {
              setImageError(undefined)
              uploadImage.mutate({ id: app.id, file })
            },
            onReject: setImageError,
            onRemove: () => {
              setImageError(undefined)
              removeImage.mutate(app.id)
            },
          }}
        />
      </div>
    </>
  )
}
