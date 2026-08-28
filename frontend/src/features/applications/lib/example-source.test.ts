import { describe, expect, it } from 'vitest'
import { exampleSource } from './example-source'

describe('exampleSource', () => {
  it('reconhece uma pasta do Drive', () => {
    expect(
      exampleSource('https://drive.google.com/drive/folders/1a2b3c'),
    ).toEqual({ origin: 'drive.google.com', icon: 'drive' })
  })

  it('reconhece um documento do Google', () => {
    expect(
      exampleSource('https://docs.google.com/spreadsheets/d/4d5e6f'),
    ).toEqual({ origin: 'docs.google.com', icon: 'doc' })
  })

  it('reconhece vídeo nos dois domínios do YouTube', () => {
    expect(exampleSource('https://www.youtube.com/watch?v=abc').icon).toBe(
      'video',
    )
    expect(exampleSource('https://youtu.be/abc').icon).toBe('video')
  })

  it('cai no genérico para qualquer outra origem', () => {
    expect(exampleSource('https://widelab.com.br/manual')).toEqual({
      origin: 'widelab.com.br',
      icon: 'link',
    })
  })

  it('tira o www. do hostname exibido', () => {
    expect(exampleSource('https://www.notion.so/pagina').origin).toBe(
      'notion.so',
    )
  })

  it('devolve o texto cru quando a URL não parseia', () => {
    expect(exampleSource('pasta/exemplos')).toEqual({
      origin: 'pasta/exemplos',
      icon: 'link',
    })
  })
})
