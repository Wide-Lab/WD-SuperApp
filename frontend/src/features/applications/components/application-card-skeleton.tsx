import { Skeleton } from '#/components/ui/skeleton'

/* A mesma proporção do card real, para a página não pular quando os dados chegarem. */
export function ApplicationCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-panel p-2.5">
      <Skeleton className="aspect-[16/10] w-full bg-[#0f1219]" />
      <div className="px-1 pt-3 pb-3">
        <Skeleton className="h-4 w-1/2 rounded-[3px] bg-line" />
        <Skeleton className="mt-2.5 h-3 w-full rounded-[3px] bg-line" />
        <Skeleton className="mt-1.5 h-3 w-4/5 rounded-[3px] bg-line" />
      </div>

      {/* A régua de "Ver detalhes": sem ela o card encolheria ao carregar. */}
      <div className="-mx-2.5 -mb-2.5 border-t border-line px-3.5 py-3">
        <Skeleton className="h-[0.8125rem] w-28 rounded-[3px] bg-line" />
      </div>
    </div>
  )
}
