import type { z } from 'zod'
import type { userResponseSchema } from './schema'

/* Derivado do schema. Nunca escreva a interface à mão — ela sai de sincronia. */
export type UserResponse = z.infer<typeof userResponseSchema>

/*
 * Não deriva de schema: é um payload que o próprio frontend monta a partir de
 * dois inputs já controlados, não um dado de fronteira externa. Validar contra
 * si mesmo aqui seria abstração sem propósito.
 */
export interface LoginRequest {
  email: string
  password: string
}
