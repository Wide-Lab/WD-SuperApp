import { catalogSchema } from './schema'
import type { Application } from './types'

/** Um problema de validação, já achatado para exibição. */
export interface CatalogIssue {
  path: string
  message: string
}

export class CatalogError extends Error {
  readonly detail?: unknown

  constructor(message: string, detail?: unknown) {
    super(message)
    this.name = 'CatalogError'
    this.detail = detail
  }
}

/** Lê o catálogo do backend (fase 2). */
export async function fetchApplications(
  signal?: AbortSignal,
): Promise<Array<Application>> {
  const res = await fetch('/api/apps', {
    signal,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new CatalogError(`/api/apps respondeu ${res.status}`)

  const parsed = catalogSchema.safeParse(await res.json())
  if (!parsed.success) {
    const issues: Array<CatalogIssue> = parsed.error.issues.map((issue) => ({
      path: issue.path.length > 0 ? issue.path.join('.') : '(raiz)',
      message: issue.message,
    }))
    throw new CatalogError('apps.json inválido', issues)
  }

  // Unicidade de `id` não é expressável em JSON Schema. Fica por conta daqui.
  const ids = parsed.data.apps.map((app) => app.id)
  const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (duplicated.length > 0)
    throw new CatalogError(`id duplicado: ${duplicated.join(', ')}`)

  return parsed.data.apps
}

/** Os problemas de validação de um erro, ou lista vazia se o erro for de outra natureza. */
export function catalogIssues(error: unknown): Array<CatalogIssue> {
  if (!(error instanceof CatalogError) || !Array.isArray(error.detail))
    return []
  return error.detail.filter(isCatalogIssue)
}

function isCatalogIssue(value: unknown): value is CatalogIssue {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<CatalogIssue>
  return (
    typeof candidate.path === 'string' && typeof candidate.message === 'string'
  )
}
