import { queryOptions, useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from './api'

/*
 * Exportada (não só o hook) para que `beforeLoad` das rotas possa ler a mesma
 * entrada de cache via `queryClient.ensureQueryData(currentUserQueryOptions())`.
 */
export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: ['auth', 'me'] as const,
    queryFn: ({ signal }) => fetchCurrentUser(signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions())
}
