import type { z } from 'zod'
import type {
  applicationDraftSchema,
  applicationSchema,
  catalogSchema,
} from './schema'

/* Derivado do schema. Nunca escreva a interface à mão — ela sai de sincronia. */
export type Application = z.infer<typeof applicationSchema>
export type Catalog = z.infer<typeof catalogSchema>

/** Os campos que o formulário edita. `image` não está aqui: sobe por outra rota. */
export type ApplicationDraft = z.infer<typeof applicationDraftSchema>

/** Um erro por campo do rascunho. */
export type DraftErrors = Partial<Record<keyof ApplicationDraft, string>>
