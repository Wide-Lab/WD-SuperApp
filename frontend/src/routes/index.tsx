import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef } from 'react'
import { z } from 'zod'
import { Masthead } from '#/components/layout/masthead'
import { ApplicationGrid } from '#/features/applications/components/application-grid'
import { ApplicationGridSkeleton } from '#/features/applications/components/application-grid-skeleton'
import { EmptyCatalogState } from '#/features/applications/components/empty-catalog-state'
import { EmptyResultsState } from '#/features/applications/components/empty-results-state'
import { ErrorState } from '#/features/applications/components/error-state'
import { filterApplications } from '#/features/applications/lib/filter'
import { useApplications } from '#/features/applications/use-applications'

/* O termo vive na URL: o link é compartilhável e Voltar/Avançar funcionam. */
const searchSchema = z.object({ q: z.string().optional() })

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  component: Vitrine,
})

function Vitrine() {
  const { q } = Route.useSearch()
  const navigate = Route.useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const query = q ?? ''
  const { data, isPending, isError, error, refetch } = useApplications()

  const visible = useMemo(
    () => filterApplications(data ?? [], query),
    [data, query],
  )

  function setQuery(value: string) {
    /*
     * `replace` é obrigatório: sem ele cada tecla vira uma entrada no histórico e o
     * botão Voltar leva o usuário letra por letra até o começo da palavra.
     * `undefined` quando vazio mantém a URL limpa, sem um `?q=` pendurado.
     */
    void navigate({ search: { q: value || undefined }, replace: true })
  }

  function clearQuery() {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <>
      <Masthead
        total={data?.length}
        visible={data ? visible.length : undefined}
        query={query}
        onQueryChange={setQuery}
        inputRef={inputRef}
      />

      <div className="mt-12">
        {isPending ? (
          <ApplicationGridSkeleton />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyCatalogState />
        ) : visible.length === 0 ? (
          <EmptyResultsState query={query} onClear={clearQuery} />
        ) : (
          <ApplicationGrid apps={visible} query={query} />
        )}
      </div>
    </>
  )
}
