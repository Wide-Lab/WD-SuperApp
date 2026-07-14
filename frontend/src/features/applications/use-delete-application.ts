import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteApplication } from './api'

export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
