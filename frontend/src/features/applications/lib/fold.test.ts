import { describe, expect, it } from 'vitest'
import { fold } from './fold'

describe('fold', () => {
  it('remove acentos', () => {
    expect(fold('Ação').text).toBe('acao')
  })

  it('mapeia cada índice dobrado ao original que o gerou', () => {
    // Composto: um caractere dobrado para cada original.
    expect(fold('Ação'.normalize('NFC')).map).toEqual([0, 1, 2, 3])
  })

  it('mapeia através de um acento que encolhe o texto', () => {
    // Decomposto: cada acento solto ocupa um índice e não gera caractere dobrado.
    const decomposed = 'Ação'.normalize('NFD')
    const { text, map } = fold(decomposed)

    expect(decomposed).toHaveLength(6)
    expect(text).toBe('acao')
    expect(map).toEqual([0, 1, 3, 5])
    // O 'o' final do texto dobrado aponta para o 'o' final do original.
    expect(decomposed[map[3]]).toBe('o')
  })

  it('dobra a caixa', () => {
    expect(fold('CRONIFY').text).toBe('cronify')
  })

  it('devolve texto e mapa vazios para entrada vazia', () => {
    expect(fold('')).toEqual({ text: '', map: [] })
  })
})
