import type { z } from 'zod'
import type { applicationSchema, catalogSchema } from './schema'

/* Derivado do schema. Nunca escreva a interface à mão — ela sai de sincronia. */
export type Application = z.infer<typeof applicationSchema>
export type Catalog = z.infer<typeof catalogSchema>
