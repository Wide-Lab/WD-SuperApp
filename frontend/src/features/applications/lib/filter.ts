import { fold } from './fold'
import type { Application } from '../types'

/**
 * Filtra por nome e descrição. Sem correspondência difusa, sem pontuação de
 * relevância: a ordem do arquivo se mantém.
 */
export function filterApplications(
  apps: Array<Application>,
  query: string,
): Array<Application> {
  const term = fold(query.trim()).text
  if (!term) return apps

  return apps.filter(
    (app) =>
      fold(app.name).text.includes(term) ||
      fold(app.description).text.includes(term),
  )
}
