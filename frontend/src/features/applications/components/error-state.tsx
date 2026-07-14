import { Button } from '#/components/ui/button'
import { catalogIssues } from '../api'

interface ErrorStateProps {
  error: unknown
  onRetry: () => void
}

/* Erros não pedem desculpa e nunca são vagos sobre o que aconteceu. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const issues = catalogIssues(error)

  return (
    <div className="rounded-card border border-line bg-panel px-6 py-14 text-center">
      <h2 className="text-base leading-[1.3] font-medium text-paper">
        Não foi possível carregar as aplicações
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-[1.5] text-mute">
        O catálogo não respondeu ou veio em um formato que a vitrine não
        entende.
      </p>

      {import.meta.env.DEV && issues.length > 0 && (
        <ul className="mx-auto mt-6 max-w-md space-y-1 text-left font-mono text-xs leading-[1.6] text-mute">
          {issues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`}>
              <span className="text-paper">{issue.path}</span> — {issue.message}
            </li>
          ))}
        </ul>
      )}

      <Button type="button" onClick={onRetry} className="mt-8">
        Tentar de novo
      </Button>
    </div>
  )
}
