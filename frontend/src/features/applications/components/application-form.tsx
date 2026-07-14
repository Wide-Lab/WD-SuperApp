import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApplicationPreview } from './application-preview'
import { FormField } from './form-field'
import { ImageField } from './image-field'
import { Button, buttonVariants } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { isIconName } from '../lib/icon-name'
import { slugify } from '../lib/slugify'
import { applicationDraftSchema } from '../schema'
import type { ApplicationDraft, DraftErrors } from '../types'

interface ImageState {
  url?: string
  fileName?: string
  pending: boolean
  error?: string
  onSelect: (file: File) => void
  onReject: (reason: string) => void
  onRemove: () => void
}

interface ApplicationFormProps {
  mode: 'create' | 'edit'
  initial: ApplicationDraft
  image: ImageState
  submitting: boolean
  /** O que o backend respondeu quando o salvamento falhou. */
  error?: string
  submitLabel: string
  onSubmit: (draft: ApplicationDraft) => void
}

const FIELD_ORDER = ['id', 'name', 'description', 'url', 'icon'] as const

export function ApplicationForm({
  mode,
  initial,
  image,
  submitting,
  error,
  submitLabel,
  onSubmit,
}: ApplicationFormProps) {
  const [draft, setDraft] = useState<ApplicationDraft>(initial)
  const [errors, setErrors] = useState<DraftErrors>({})
  /*
   * Enquanto ninguém tocar no identificador, ele acompanha o nome. Depois do
   * primeiro toque ele é da pessoa, e o nome não mexe mais nele.
   */
  const [idTouched, setIdTouched] = useState(false)

  const editing = mode === 'edit'
  const unknownIcon = draft.icon !== '' && !isIconName(draft.icon)

  function set<TKey extends keyof ApplicationDraft>(
    key: TKey,
    value: ApplicationDraft[TKey],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function handleNameChange(name: string) {
    setDraft((current) => ({
      ...current,
      name,
      id: !editing && !idTouched ? slugify(name) : current.id,
    }))
    setErrors((current) => ({ ...current, name: undefined, id: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = applicationDraftSchema.safeParse(draft)
    if (!parsed.success) {
      const found: DraftErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ApplicationDraft
        found[key] ??= issue.message
      }
      setErrors(found)

      // O foco vai para o primeiro campo com problema, na ordem em que aparecem.
      const first = FIELD_ORDER.find((key) => found[key])
      if (first) document.getElementById(`app-${first}`)?.focus()
      return
    }

    onSubmit(parsed.data)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-x-12 gap-y-12 min-[900px]:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div className="flex flex-col gap-7">
        <FormField
          id="app-name"
          label="Nome"
          counter={`${draft.name.length}/60`}
          error={errors.name}
        >
          {(aria) => (
            <Input
              {...aria}
              value={draft.name}
              maxLength={60}
              autoComplete="off"
              onChange={(event) => handleNameChange(event.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="app-id"
          label="Identificador"
          error={errors.id}
          hint={
            editing
              ? 'O identificador é a coordenada da aplicação na bancada. Ele não muda depois de publicada.'
              : 'Minúsculas, números e hífens. Ele define a posição da aplicação no leito do plotter — e não muda depois de publicada.'
          }
        >
          {(aria) => (
            <Input
              {...aria}
              value={draft.id}
              readOnly={editing}
              aria-readonly={editing || undefined}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                setIdTouched(true)
                set('id', event.target.value)
              }}
              className={
                editing ? 'font-mono text-mute focus:border-line' : 'font-mono'
              }
            />
          )}
        </FormField>

        <FormField
          id="app-description"
          label="Descrição"
          counter={`${draft.description.length}/160`}
          error={errors.description}
          hint="O card mostra duas linhas. O que passar disso fica cortado."
        >
          {(aria) => (
            <Textarea
              {...aria}
              rows={3}
              value={draft.description}
              maxLength={160}
              onChange={(event) => set('description', event.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="app-url"
          label="Endereço"
          error={errors.url}
          hint="URL completa (https://…) abre em nova aba. Um caminho interno (/relatorios) abre na mesma."
        >
          {(aria) => (
            <Input
              {...aria}
              value={draft.url}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => set('url', event.target.value)}
              className="font-mono"
            />
          )}
        </FormField>

        <FormField
          id="app-icon"
          label="Ícone"
          error={errors.icon}
          hint={
            unknownIcon ? (
              <>
                Não existe um ícone{' '}
                <span className="font-mono text-paper">{draft.icon}</span> no
                Lucide — a vitrine vai mostrar{' '}
                <span className="font-mono">app-window</span>. Procure o nome
                certo em{' '}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-soft underline underline-offset-2"
                >
                  lucide.dev/icons
                </a>
                .
              </>
            ) : (
              <>
                Nome de um ícone{' '}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-soft underline underline-offset-2"
                >
                  Lucide
                </a>{' '}
                em kebab-case: <span className="font-mono">file-text</span>,{' '}
                <span className="font-mono">bot</span>,{' '}
                <span className="font-mono">calendar-clock</span>.
              </>
            )
          }
        >
          {(aria) => (
            <Input
              {...aria}
              value={draft.icon}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => set('icon', event.target.value)}
              className="font-mono"
            />
          )}
        </FormField>

        <ImageField {...image} />

        {error && (
          <p
            role="alert"
            className="rounded-field border border-line bg-panel px-4 py-3 text-sm leading-[1.5] text-paper"
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 border-t border-line pt-7">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando…' : submitLabel}
          </Button>
          <Link
            to="/aplicacoes"
            className={buttonVariants({ variant: 'ghost' })}
          >
            Cancelar
          </Link>
        </div>
      </div>

      <div className="min-[900px]:sticky min-[900px]:top-8 min-[900px]:self-start">
        <ApplicationPreview draft={draft} imageUrl={image.url} />
      </div>
    </form>
  )
}
