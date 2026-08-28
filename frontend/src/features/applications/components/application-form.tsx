import { Link } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import type { ApplicationDraft, DraftErrors, ExampleErrors } from '../types'

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

/* Acima disso o detalhe vira um índice de pasta, e o lugar do índice é o Drive. */
const MAX_EXAMPLES = 8

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
   * Um erro por campo por linha: `DraftErrors` é chaveado por campo do rascunho e
   * não teria onde guardar o terceiro exemplo.
   */
  const [exampleErrors, setExampleErrors] = useState<ExampleErrors>([])
  /*
   * A chave de cada linha é um id local, não o índice. Com índice, remover a
   * primeira de três faz o React reaproveitar o DOM errado: o valor digitado
   * "sobe" uma linha e o foco vai para o campo errado. Este id não é enviado ao
   * backend — lá a coleção é substituída inteira.
   */
  const [exampleKeys, setExampleKeys] = useState<Array<string>>(() =>
    initial.examples.map(() => crypto.randomUUID()),
  )
  /* O elemento só existe depois do commit; focar dentro do handler pegaria o DOM velho. */
  const [pendingFocus, setPendingFocus] = useState<string | null>(null)
  /*
   * Enquanto ninguém tocar no identificador, ele acompanha o nome. Depois do
   * primeiro toque ele é da pessoa, e o nome não mexe mais nele.
   */
  const [idTouched, setIdTouched] = useState(false)

  const editing = mode === 'edit'
  const unknownIcon = draft.icon !== '' && !isIconName(draft.icon)
  const examplesFull = draft.examples.length >= MAX_EXAMPLES

  useEffect(() => {
    if (!pendingFocus) return
    document.getElementById(pendingFocus)?.focus()
    setPendingFocus(null)
  }, [pendingFocus])

  function set<TKey extends keyof ApplicationDraft>(
    key: TKey,
    value: ApplicationDraft[TKey],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function setExample(index: number, field: 'label' | 'url', value: string) {
    setDraft((current) => ({
      ...current,
      examples: current.examples.map((example, i) =>
        i === index ? { ...example, [field]: value } : example,
      ),
    }))
    setExampleErrors((current) =>
      current.map((row, i) =>
        i === index ? { ...row, [field]: undefined } : row,
      ),
    )
  }

  function addExample() {
    setPendingFocus(`app-example-${draft.examples.length}-label`)
    setDraft((current) => ({
      ...current,
      examples: [...current.examples, { label: '', url: '' }],
    }))
    setExampleKeys((current) => [...current, crypto.randomUUID()])
    setExampleErrors((current) => [...current, {}])
  }

  /*
   * O foco vai para o "Remover" da linha seguinte, ou para "Adicionar exemplo" se
   * a removida era a última. Ele nunca cai no `<body>`.
   */
  function removeExample(index: number) {
    const wasLast = index === draft.examples.length - 1
    setPendingFocus(wasLast ? 'app-example-add' : `app-example-${index}-remove`)
    setDraft((current) => ({
      ...current,
      examples: current.examples.filter((_, i) => i !== index),
    }))
    setExampleKeys((current) => current.filter((_, i) => i !== index))
    setExampleErrors((current) => current.filter((_, i) => i !== index))
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
      const foundExamples: ExampleErrors = draft.examples.map(() => ({}))

      for (const issue of parsed.error.issues) {
        const [key, index, field] = issue.path
        if (key === 'examples') {
          if (typeof index !== 'number') continue
          if (field !== 'label' && field !== 'url') continue
          foundExamples[index][field] ??= issue.message
          continue
        }
        if (typeof key !== 'string') continue
        found[key as keyof DraftErrors] ??= issue.message
      }
      setErrors(found)
      setExampleErrors(foundExamples)

      /*
       * O foco vai para o primeiro campo com problema, na ordem em que aparecem —
       * e os exemplos vêm depois dos campos da aplicação.
       */
      const first = FIELD_ORDER.find((key) => found[key])
      if (first) {
        document.getElementById(`app-${first}`)?.focus()
        return
      }
      const row = foundExamples.findIndex((line) => line.label ?? line.url)
      if (row !== -1)
        document
          .getElementById(
            `app-example-${row}-${foundExamples[row].label ? 'label' : 'url'}`,
          )
          ?.focus()
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

        <div
          role="group"
          aria-labelledby="app-examples-label"
          aria-describedby="app-examples-hint"
          className="flex flex-col gap-2"
        >
          <span
            id="app-examples-label"
            className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.18em] text-mute uppercase"
          >
            Exemplos
          </span>

          {draft.examples.length > 0 && (
            <ul className="flex flex-col gap-2">
              {draft.examples.map((example, index) => {
                const labelId = `app-example-${index}-label`
                const urlId = `app-example-${index}-url`
                const rowErrors = exampleErrors[index] ?? {}

                return (
                  <li key={exampleKeys[index]} className="flex flex-col gap-1">
                    <div className="grid gap-2 min-[640px]:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto]">
                      <div className="min-w-0">
                        <label htmlFor={labelId} className="sr-only">
                          Rótulo do exemplo {index + 1}
                        </label>
                        <Input
                          id={labelId}
                          value={example.label}
                          maxLength={40}
                          autoComplete="off"
                          placeholder="Cupons processados"
                          aria-invalid={rowErrors.label ? true : undefined}
                          aria-describedby={
                            rowErrors.label ? `${labelId}-error` : undefined
                          }
                          onChange={(event) =>
                            setExample(index, 'label', event.target.value)
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <label htmlFor={urlId} className="sr-only">
                          Endereço do exemplo {index + 1}
                        </label>
                        <Input
                          id={urlId}
                          value={example.url}
                          maxLength={2048}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="https://drive.google.com/…"
                          aria-invalid={rowErrors.url ? true : undefined}
                          aria-describedby={
                            rowErrors.url ? `${urlId}-error` : undefined
                          }
                          onChange={(event) =>
                            setExample(index, 'url', event.target.value)
                          }
                          className="font-mono"
                        />
                      </div>

                      <Button
                        id={`app-example-${index}-remove`}
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover exemplo ${index + 1}`}
                        onClick={() => removeExample(index)}
                        className="justify-self-start self-center"
                      >
                        <X size={14} strokeWidth={1.5} />
                      </Button>
                    </div>

                    {rowErrors.label && (
                      <p
                        id={`${labelId}-error`}
                        className="text-[0.8125rem] leading-[1.5] text-pink-soft"
                      >
                        {rowErrors.label}
                      </p>
                    )}
                    {rowErrors.url && (
                      <p
                        id={`${urlId}-error`}
                        className="text-[0.8125rem] leading-[1.5] text-pink-soft"
                      >
                        {rowErrors.url}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          <div>
            <Button
              id="app-example-add"
              type="button"
              variant="outline"
              disabled={examplesFull}
              onClick={addExample}
            >
              <Plus size={14} strokeWidth={1.5} />
              Adicionar exemplo
            </Button>
          </div>

          <p
            id="app-examples-hint"
            className="text-[0.8125rem] leading-[1.5] text-mute"
          >
            {examplesFull
              ? 'Máximo de 8 exemplos.'
              : 'Links de material de apoio — normalmente uma pasta do Drive. Aparecem no detalhe da aplicação, na ordem abaixo.'}
          </p>
        </div>

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
