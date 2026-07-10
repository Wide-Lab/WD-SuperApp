import { Button } from '#/components/ui/button'

interface EmptyResultsStateProps {
  query: string
  onClear: () => void
}

/*
 * Distinto do catálogo vazio: um diz que a busca não achou, o outro que não há nada
 * cadastrado. Confundir os dois manda o usuário procurar o problema no lugar errado.
 */
export function EmptyResultsState({ query, onClear }: EmptyResultsStateProps) {
  return (
    <div className="rounded-card border border-line bg-panel px-6 py-14 text-center">
      <h2 className="text-base leading-[1.3] font-medium text-paper">
        Nenhuma aplicação encontrada
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-[1.5] text-mute">
        Nada corresponde a “{query}”.
      </p>

      <Button type="button" onClick={onClear} className="mt-8">
        Limpar busca
      </Button>
    </div>
  )
}
