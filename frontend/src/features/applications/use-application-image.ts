import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeApplicationImage, uploadApplicationImage } from './api'

/*
 * Os dois lados da capa de uma aplicação que já existe. Na edição a troca é
 * imediata — escolher o arquivo já envia, e o card muda na hora. Não existe
 * "salvar imagem": ela não é um campo do formulário, é um recurso próprio.
 */

export function useUploadApplicationImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadApplicationImage(id, file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export function useRemoveApplicationImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => removeApplicationImage(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
