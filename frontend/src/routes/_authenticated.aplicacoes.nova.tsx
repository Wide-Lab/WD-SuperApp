import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ApplicationForm } from '#/features/applications/components/application-form'
import { CatalogHeader } from '#/features/applications/components/catalog-header'
import type { ApplicationDraft } from '#/features/applications/types'
import { useCreateApplication } from '#/features/applications/use-create-application'

export const Route = createFileRoute('/_authenticated/aplicacoes/nova')({
  component: NovaAplicacao,
})

const EMPTY: ApplicationDraft = {
  id: '',
  name: '',
  description: '',
  url: '',
  icon: '',
}

function NovaAplicacao() {
  const navigate = useNavigate()
  const create = useCreateApplication()

  /*
   * A capa fica na mão até a aplicação existir: `POST /apps/{id}/image` precisa de
   * um id, e antes de publicar não há um. A prévia sai do arquivo local.
   */
  const [file, setFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | undefined>(undefined)

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : undefined),
    [file],
  )

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function handleSubmit(draft: ApplicationDraft) {
    create.mutate(
      { draft, image: file ?? undefined },
      { onSuccess: () => void navigate({ to: '/aplicacoes' }) },
    )
  }

  return (
    <>
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
        title="Nova aplicação"
      />

      <div className="mt-10">
        <ApplicationForm
          mode="create"
          initial={EMPTY}
          submitLabel="Publicar aplicação"
          submitting={create.isPending}
          error={create.isError ? create.error.message : undefined}
          onSubmit={handleSubmit}
          image={{
            url: previewUrl,
            fileName: file?.name,
            pending: false,
            error: imageError,
            onSelect: (chosen) => {
              setImageError(undefined)
              setFile(chosen)
            },
            onReject: setImageError,
            onRemove: () => {
              setImageError(undefined)
              setFile(null)
            },
          }}
        />
      </div>
    </>
  )
}
