import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from './api'
import { currentUserQueryOptions } from './use-current-user'

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(currentUserQueryOptions().queryKey, null)
    },
  })
}
