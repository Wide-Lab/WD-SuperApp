import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('junta as palavras com hífen', () => {
    expect(slugify('Leitor de Notas')).toBe('leitor-de-notas')
  })

  it('dobra acentos', () => {
    expect(slugify('Gestão de Contratos')).toBe('gestao-de-contratos')
  })

  it('colapsa pontuação e espaços em um hífen só', () => {
    expect(slugify('RPA  —  Fiscal 2.0')).toBe('rpa-fiscal-2-0')
  })

  it('não deixa hífen sobrando nas pontas', () => {
    expect(slugify('  Cronify!  ')).toBe('cronify')
  })

  it('devolve vazio quando não sobra nada aproveitável', () => {
    expect(slugify('—')).toBe('')
  })
})
