import { Skeleton } from '#/components/ui/skeleton'

/* Quatro linhas: o bastante para a página não pular quando o catálogo chega. */
const ROWS = [0, 1, 2, 3]

export function CatalogSkeleton() {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
      {ROWS.map((row) => (
        <li key={row} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="aspect-[16/10] w-14 shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-[0.9375rem] w-40 rounded-[3px]" />
            <Skeleton className="mt-2 h-[0.8125rem] w-64 max-w-full rounded-[3px]" />
          </div>
        </li>
      ))}
    </ul>
  )
}
