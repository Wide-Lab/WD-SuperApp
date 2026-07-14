import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createApplication, uploadApplicationImage } from './api'
import type { Application, ApplicationDraft } from './types'

interface CreateInput {
  draft: ApplicationDraft
  /** A capa escolhida antes da aplicação existir, se houve uma. */
  image?: File
}

/**
 * Publicar é um passo para quem usa e dois para a rede: a imagem só pode subir
 * depois que a aplicação existe (`POST /apps/{id}/image` precisa do id). Se a
 * capa falhar, a aplicação continua publicada — o erro diz exatamente isso, e a
 * capa pode ser reenviada na edição.
 */
export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ draft, image }: CreateInput): Promise<Application> => {
      const created = await createApplication(draft)
      if (!image) return created
      return uploadApplicationImage(created.id, image)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}
