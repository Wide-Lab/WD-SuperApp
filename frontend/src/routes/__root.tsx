import { createRootRoute } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { AppShell } from '#/components/layout/app-shell'

/* Só em desenvolvimento: em produção o import nunca entra no bundle. */
const RouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/react-router-devtools').then((module) => ({
        default: module.TanStackRouterDevtools,
      })),
    )

export const Route = createRootRoute({ component: RootComponent })

function RootComponent() {
  return (
    <>
      <AppShell />
      <Suspense fallback={null}>
        <RouterDevtools />
      </Suspense>
    </>
  )
}
