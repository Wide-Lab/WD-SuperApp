import { useQuery } from '@tanstack/react-query'
import { fetchApplications } from './api'

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: ({ signal }) => fetchApplications(signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    // Um 404 no arquivo estático e um erro de validação do Zod são determinísticos:
    // repetir a requisição não muda a resposta. O botão "Tentar de novo" do estado de
    // erro é a retentativa, e ela é do usuário.
    retry: false,
  })
}
