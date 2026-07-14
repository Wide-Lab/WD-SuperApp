import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchApplications } from './api'

/*
 * Exportada (não só o hook) para que `loader`/`beforeLoad` das rotas possam
 * garantir os dados pela mesma entrada de cache que a tela lê.
 */
export function applicationsQueryOptions() {
  return queryOptions({
    queryKey: ['applications'] as const,
    queryFn: ({ signal }) => fetchApplications(signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    // Um erro de validação do Zod é determinístico: repetir a requisição não muda
    // a resposta. O botão "Tentar de novo" do estado de erro é a retentativa, e
    // ela é do usuário.
    retry: false,
  })
}

export function useApplications() {
  return useQuery(applicationsQueryOptions())
}

/**
 * Uma aplicação do catálogo já carregado. A tela de edição não precisa de
 * `GET /apps/{id}`: a lista está no cache, e ler dela mantém uma verdade só —
 * editar e publicar invalidam a mesma entrada.
 */
export function useApplication(id: string) {
  return useQuery({
    ...applicationsQueryOptions(),
    select: (apps) => apps.find((app) => app.id === id),
  })
}
