/**
 * A posição da marca de coordenada no leito, em porcentagem.
 *
 * Derivada do `id` por FNV-1a: fixa e única por aplicação. Cada ferramenta tem seu
 * lugar na bancada, e ele não muda entre recargas.
 */
export function coordinate(id: string): { x: number; y: number } {
  let h = 0x811c9dc5 // FNV-1a 32 bits
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }

  let x = 14 + (h % 73) // 14..86
  const y = 14 + ((h >>> 11) % 73)

  // Não colide com o ícone, que ocupa o miolo.
  if (x > 34 && x < 66 && y > 34 && y < 66) {
    x = x < 50 ? Math.max(10, x - 24) : Math.min(90, x + 24)
  }

  return { x, y }
}
