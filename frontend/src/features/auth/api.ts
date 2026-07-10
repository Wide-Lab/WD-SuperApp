import { userResponseSchema } from './schema'
import type { LoginRequest, UserResponse } from './types'

export class AuthError extends Error {
  readonly detail?: unknown

  constructor(message: string, detail?: unknown) {
    super(message)
    this.name = 'AuthError'
    this.detail = detail
  }
}

function parseUser(body: unknown): UserResponse {
  const parsed = userResponseSchema.safeParse(body)
  if (!parsed.success)
    throw new AuthError(
      'Resposta de autenticação inválida',
      parsed.error.issues,
    )
  return parsed.data
}

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json()
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = body.detail
      if (typeof detail === 'string') return detail
    }
  } catch {
    // corpo não é JSON — cai no texto genérico abaixo
  }
  return `Falha inesperada (${res.status})`
}

export async function login(credentials: LoginRequest): Promise<UserResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const detail = await readErrorDetail(res)
    throw new AuthError(detail, detail)
  }
  return parseUser(await res.json())
}

export async function fetchCurrentUser(
  signal?: AbortSignal,
): Promise<UserResponse | null> {
  const res = await fetch('/api/auth/me', {
    signal,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (res.status === 401) return null
  if (!res.ok) throw new AuthError(await readErrorDetail(res))
  return parseUser(await res.json())
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new AuthError(await readErrorDetail(res))
}
