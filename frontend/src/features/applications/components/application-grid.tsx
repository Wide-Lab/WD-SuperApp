import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ApplicationCard } from './application-card'
import type { Application } from '../types'

export const GRID_CLASS =
  'grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]'

const STAGGER_MS = 30
const STAGGER_CAP_MS = 300
const ENTER_MS = 220

interface EnterStyle extends CSSProperties {
  '--enter-delay': string
}

interface ApplicationGridProps {
  apps: Array<Application>
  query: string
}

export function ApplicationGrid({ apps, query }: ApplicationGridProps) {
  /*
   * A entrada roda uma única vez, na montagem. Filtrar não é chegar; é esconder —
   * então assim que a última animação termina o atributo sai, e nenhum card que
   * volte ao grid depois disso anima de novo.
   */
  const [entering, setEntering] = useState(true)

  useEffect(() => {
    const id = window.setTimeout(
      () => setEntering(false),
      STAGGER_CAP_MS + ENTER_MS + 40,
    )
    return () => window.clearTimeout(id)
  }, [])

  return (
    <ul className={GRID_CLASS}>
      {apps.map((app, index) => (
        <li
          key={app.id}
          data-enter={entering ? '' : undefined}
          style={
            entering
              ? ({
                  '--enter-delay': `${Math.min(index * STAGGER_MS, STAGGER_CAP_MS)}ms`,
                } as EnterStyle)
              : undefined
          }
        >
          <ApplicationCard app={app} query={query} />
        </li>
      ))}
    </ul>
  )
}
