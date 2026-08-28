import { z } from 'zod'

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/*
 * Não é só validação de forma: é o que impede `javascript:` de virar `href`.
 * `new URL('javascript:alert(1)')` é uma URL válida, então qualquer validação
 * genérica aceitaria esse valor e ele viraria um link executável dentro do
 * `<dialog>`. Só `http` e `https` passam.
 */
const HTTP_URL = /^https?:\/\//

export const applicationExampleSchema = z.object({
  label: z.string().min(1).max(40),
  url: z.string().max(2048).regex(HTTP_URL),
})

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
  /*
   * O backend sempre manda a chave, mas um frontend novo contra um backend antigo
   * mostraria "Catálogo inválido" na vitrine inteira por causa de uma seção
   * secundária. O padrão falha para o lado certo.
   */
  examples: z.array(applicationExampleSchema).default([]),
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
  examples: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Dê um nome ao exemplo.').max(40),
        url: z
          .string()
          .trim()
          .max(2048, 'Link longo demais.')
          .regex(HTTP_URL, 'Cole o link completo, começando com https://.'),
      }),
    )
    .max(8, 'No máximo 8 exemplos por aplicação.'),
})
