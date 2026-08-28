import type { z } from 'zod'
import type {
  applicationDraftSchema,
  applicationExampleSchema,
  applicationSchema,
  catalogSchema,
} from './schema'

/* Derivado do schema. Nunca escreva a interface à mão — ela sai de sincronia. */
export type Application = z.infer<typeof applicationSchema>
export type ApplicationExample = z.infer<typeof applicationExampleSchema>
export type Catalog = z.infer<typeof catalogSchema>

/** Os campos que o formulário edita. `image` não está aqui: sobe por outra rota. */
export type ApplicationDraft = z.infer<typeof applicationDraftSchema>

/** Um erro por campo do rascunho. Os exemplos ficam de fora: são uma lista. */
export type DraftErrors = Partial<
  Record<Exclude<keyof ApplicationDraft, 'examples'>, string>
>

/** Um erro por campo por linha de exemplo, no mesmo índice da linha. */
export type ExampleErrors = Array<{ label?: string; url?: string }>
