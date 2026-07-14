import { fold } from './fold'

/**
 * O identificador sugerido a partir do nome: "Leitor de Notas" → "leitor-de-notas".
 *
 * É só uma sugestão — vale enquanto a pessoa não editar o campo de id na mão. O
 * formato é o mesmo que o backend exige (`^[a-z0-9]+(-[a-z0-9]+)*$`), então o que
 * sai daqui já passa na validação, ou sai vazio.
 */
export function slugify(input: string): string {
  return fold(input)
    .text.replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
