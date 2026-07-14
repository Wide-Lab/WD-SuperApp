import { applicationSchema, catalogSchema } from './schema'
import type { Application, ApplicationDraft } from './types'

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

/*
 * O backend fala português e já manda o motivo pronto em `detail` (409 de id
 * repetido, 413 de imagem grande, 415 de formato). Repetir a mensagem aqui só
 * criaria duas verdades: a de lá é a que o usuário lê.
 */
async function readErrorDetail(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json()
    if (body && typeof body === 'object' && 'detail' in body) {
      const { detail } = body
      if (typeof detail === 'string') return detail
    }
  } catch {
    // corpo não é JSON — cai no texto genérico abaixo
  }
  return `Falha inesperada (${res.status})`
}

function parseApplication(body: unknown): Application {
  const parsed = applicationSchema.safeParse(body)
  if (!parsed.success)
    throw new CatalogError('Resposta inválida do catálogo', parsed.error.issues)
  return parsed.data
}

async function readOrThrow(res: Response): Promise<Application> {
  if (!res.ok) {
    const detail = await readErrorDetail(res)
    throw new CatalogError(detail, detail)
  }
  return parseApplication(await res.json())
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
    throw new CatalogError('Catálogo inválido', issues)
  }

  // Unicidade de `id` não é expressável em JSON Schema. Fica por conta daqui.
  const ids = parsed.data.apps.map((app) => app.id)
  const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (duplicated.length > 0)
    throw new CatalogError(`id duplicado: ${duplicated.join(', ')}`)

  return parsed.data.apps
}

export async function createApplication(
  draft: ApplicationDraft,
): Promise<Application> {
  const res = await fetch('/api/apps', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  })
  return readOrThrow(res)
}

/** O `id` não viaja no corpo: ele é a identidade, e o backend não o troca. */
export async function updateApplication(
  id: string,
  draft: Omit<ApplicationDraft, 'id'>,
): Promise<Application> {
  const res = await fetch(`/api/apps/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  })
  return readOrThrow(res)
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await fetch(`/api/apps/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const detail = await readErrorDetail(res)
    throw new CatalogError(detail, detail)
  }
}

export async function uploadApplicationImage(
  id: string,
  file: File,
): Promise<Application> {
  const body = new FormData()
  body.append('file', file)

  // Sem `Content-Type` manual: o navegador precisa gerar o boundary do multipart.
  const res = await fetch(`/api/apps/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body,
  })
  return readOrThrow(res)
}

export async function removeApplicationImage(id: string): Promise<Application> {
  const res = await fetch(`/api/apps/${id}/image`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return readOrThrow(res)
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
