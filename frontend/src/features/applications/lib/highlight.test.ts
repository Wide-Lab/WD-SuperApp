import { describe, expect, it } from 'vitest'
import { highlight } from './highlight'

describe('highlight', () => {
  it('devolve o texto inteiro, sem destaque, para termo vazio', () => {
    expect(highlight('Cronify', '  ')).toEqual([
      { text: 'Cronify', match: false },
    ])
  })

  it('destaca o trecho que casou', () => {
    expect(highlight('Cronify', 'cron')).toEqual([
      { text: 'Cron', match: true },
      { text: 'ify', match: false },
    ])
  })

  it('recorta o trecho certo em texto acentuado', () => {
    // Buscando 'acao', o destaque tem que cair sobre 'Ação' — não sobre 'Açã'.
    expect(highlight('Cada Ação conta', 'acao')).toEqual([
      { text: 'Cada ', match: false },
      { text: 'Ação', match: true },
      { text: ' conta', match: false },
    ])
  })

  it('destaca todas as ocorrências', () => {
    expect(highlight('bot robot', 'bot')).toEqual([
      { text: 'bot', match: true },
      { text: ' ro', match: false },
      { text: 'bot', match: true },
    ])
  })

  it('não destaca nada quando o termo não casa', () => {
    expect(highlight('Cronify', 'zzz')).toEqual([
      { text: 'Cronify', match: false },
    ])
  })
})
