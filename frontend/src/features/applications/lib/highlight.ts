import { fold } from './fold'

export interface Segment {
  text: string
  match: boolean
}

/**
 * Parte `input` nos trechos que casaram com `query` e nos que não casaram.
 *
 * Usa o mapa da `fold`: achado o intervalo `[início, fim)` no texto dobrado, os
 * índices no original são `map[início]` e `map[fim - 1] + 1`. Recortar o original
 * direto pelos índices do dobrado destacaria o trecho errado em nome com acento.
 */
export function highlight(input: string, query: string): Array<Segment> {
  const term = fold(query.trim()).text
  if (!term) return [{ text: input, match: false }]

  const { text, map } = fold(input)
  const segments: Array<Segment> = []
  let cursor = 0 // índice em `input`
  let from = 0 // índice em `text`

  for (;;) {
    const start = text.indexOf(term, from)
    if (start === -1) break

    const end = start + term.length
    const originalStart = map[start]
    const originalEnd = map[end - 1] + 1

    if (originalStart > cursor) {
      segments.push({ text: input.slice(cursor, originalStart), match: false })
    }
    segments.push({
      text: input.slice(originalStart, originalEnd),
      match: true,
    })

    cursor = originalEnd
    from = end
  }

  if (cursor < input.length)
    segments.push({ text: input.slice(cursor), match: false })
  return segments
}
