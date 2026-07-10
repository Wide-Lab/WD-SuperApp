import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from './api'
import type { LoginRequest } from './types'
import { currentUserQueryOptions } from './use-current-user'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (user) => {
      // A resposta do login já é o mesmo UserResponse que /me devolveria —
      // não vale gastar outra requisição só para confirmar o que já sabemos.
      queryClient.setQueryData(currentUserQueryOptions().queryKey, user)
    },
  })
}
