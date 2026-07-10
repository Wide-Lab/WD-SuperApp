import { describe, expect, it } from 'vitest'
import { filterApplications } from './filter'
import type { Application } from '../types'

const apps: Array<Application> = [
  {
    id: 'cronify',
    name: 'Cronify',
    description: 'Agenda e acompanha a execução de rotinas automatizadas.',
    url: 'https://cronify.widelab.com.br',
    icon: 'calendar-clock',
  },
  {
    id: 'rpa-generator',
    name: 'RPA Generator',
    description: 'Cada Ação vira um passo do robô.',
    url: 'https://rpa-generator.widelab.com.br',
    icon: 'bot',
  },
  {
    id: 'widehub',
    name: 'Widehub',
    description: 'Hub interno de dados e indicadores.',
    url: 'https://widehub.widelab.com.br',
    icon: 'layout-dashboard',
  },
]

const idsOf = (result: Array<Application>) => result.map((app) => app.id)

describe('filterApplications', () => {
  it('devolve a lista inteira para termo vazio', () => {
    expect(filterApplications(apps, '')).toEqual(apps)
  })

  it('devolve a lista inteira para termo só de espaço', () => {
    expect(filterApplications(apps, '   ')).toEqual(apps)
  })

  it('acha uma descrição acentuada por um termo sem acento', () => {
    expect(idsOf(filterApplications(apps, 'acao'))).toEqual(['rpa-generator'])
  })

  it('ignora a caixa do termo', () => {
    expect(idsOf(filterApplications(apps, 'CRON'))).toEqual(['cronify'])
  })

  it('casa em description, não só em name', () => {
    expect(idsOf(filterApplications(apps, 'indicadores'))).toEqual(['widehub'])
  })

  it('devolve lista vazia para termo sem correspondência', () => {
    expect(filterApplications(apps, 'servidor')).toEqual([])
  })

  it('preserva a ordem do arquivo', () => {
    // 'a' casa com as três; a ordem tem que ser a de entrada.
    expect(idsOf(filterApplications(apps, 'a'))).toEqual([
      'cronify',
      'rpa-generator',
      'widehub',
    ])
  })
})
