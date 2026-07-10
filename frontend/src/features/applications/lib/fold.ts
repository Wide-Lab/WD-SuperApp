export interface Folded {
  /** Texto sem acento, em caixa baixa. */
  text: string
  /** Para cada índice de `text`, o índice correspondente em `input`. */
  map: Array<number>
}

/**
 * Dobra acentos e caixa, devolvendo o mapa de volta para o texto original.
 *
 * Sem o mapa não dá para destacar o trecho certo: os índices do texto dobrado não
 * batem com os do original em qualquer palavra acentuada.
 */
export function fold(input: string): Folded {
  let text = ''
  const map: Array<number> = []

  for (let i = 0; i < input.length; i++) {
    const folded = input[i]
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()

    // Um caractere original pode gerar zero caracteres dobrados (um acento solto)
    // ou mais de um. O mapa aguenta os dois casos.
    for (const char of folded) {
      text += char
      map.push(i)
    }
  }

  return { text, map }
}
