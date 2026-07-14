import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateApplication } from './api'
import type { ApplicationDraft } from './types'

export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...draft }: ApplicationDraft) =>
      updateApplication(id, draft),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
