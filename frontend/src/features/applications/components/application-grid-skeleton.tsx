import { ApplicationCardSkeleton } from './application-card-skeleton'
import { GRID_CLASS } from './application-grid'

const PLACEHOLDERS = ['a', 'b', 'c', 'd', 'e', 'f']

export function ApplicationGridSkeleton() {
  return (
    <ul className={GRID_CLASS} aria-hidden="true">
      {PLACEHOLDERS.map((key) => (
        <li key={key}>
          <ApplicationCardSkeleton />
        </li>
      ))}
    </ul>
  )
}
