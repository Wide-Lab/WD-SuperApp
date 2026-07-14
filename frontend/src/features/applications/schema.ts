import { z } from 'zod'

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const applicationSchema = z.object({
  id: z.string().regex(KEBAB_CASE),
  name: z.string().min(1).max(60),
  description: z.string().min(1).max(160),
  url: z.string().min(1),
  icon: z.string().regex(KEBAB_CASE),
  // O backend manda `null` para quem não tem capa; o resto do app só conhece
  // "tem imagem" ou "não tem". A distinção morre aqui, na borda — e o `.optional()`
  // externo é o que mantém a chave opcional depois do transform.
  image: z
    .string()
    .nullable()
    .transform((value) => value ?? undefined)
    .optional(),
})

export const catalogSchema = z.object({
  apps: z.array(applicationSchema),
})

/*
 * O que o formulário edita. Espelha as restrições do backend
 * (`CreateApplicationRequest`): se um limite mudar lá, muda aqui.
 * As mensagens são as que o usuário lê — diretas, e nunca vagas sobre o conserto.
 */
export const applicationDraftSchema = z.object({
  id: z
    .string()
    .min(1, 'Escolha um identificador.')
    .regex(
      KEBAB_CASE,
      'Só minúsculas, números e hífens. Ex.: leitor-de-notas.',
    ),
  name: z.string().trim().min(1, 'Dê um nome à aplicação.').max(60),
  description: z
    .string()
    .trim()
    .min(1, 'Descreva em uma linha o que a aplicação faz.')
    .max(160),
  url: z.string().trim().min(1, 'Informe o endereço da aplicação.'),
  icon: z
    .string()
    .min(1, 'Escolha um ícone.')
    .regex(KEBAB_CASE, 'Nome de ícone Lucide em kebab-case. Ex.: file-text.'),
})
