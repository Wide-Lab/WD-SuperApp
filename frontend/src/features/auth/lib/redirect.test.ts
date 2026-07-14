import { describe, expect, it } from 'vitest'
import { safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it('aceita subdomínio da Widelab', () => {
    expect(safeRedirect('https://whatsflow.widelab.com.br/')).toBe(
      'https://whatsflow.widelab.com.br/',
    )
  })

  it('preserva caminho e query do destino', () => {
    expect(safeRedirect('https://cupomweb.widelab.com.br/notas?id=7')).toBe(
      'https://cupomweb.widelab.com.br/notas?id=7',
    )
  })

  it('aceita o domínio raiz', () => {
    expect(safeRedirect('https://widelab.com.br/')).toBe(
      'https://widelab.com.br/',
    )
  })

  it('recusa domínio de fora', () => {
    expect(safeRedirect('https://evil.com/')).toBeNull()
  })

  it('recusa host que só termina com o texto do domínio', () => {
    expect(safeRedirect('https://evilwidelab.com.br/')).toBeNull()
  })

  it('recusa http — o cookie de sessão é Secure', () => {
    expect(safeRedirect('http://whatsflow.widelab.com.br/')).toBeNull()
  })

  it('recusa esquema não-http', () => {
    expect(safeRedirect('javascript:alert(1)')).toBeNull()
  })

  it('recusa caminho relativo, que não é URL absoluta', () => {
    expect(safeRedirect('/vitrine')).toBeNull()
  })

  it('devolve null sem destino', () => {
    expect(safeRedirect(undefined)).toBeNull()
    expect(safeRedirect('')).toBeNull()
  })
})
