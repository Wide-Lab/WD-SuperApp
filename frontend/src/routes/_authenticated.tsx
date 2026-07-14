import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { currentUserQueryOptions } from '#/features/auth/use-current-user'

/**
 * Tudo que exige sessão pendura aqui. Uma rota nova protegida ganha o guard só
 * por nascer debaixo deste layout — ninguém precisa lembrar de copiá-lo.
 */
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      currentUserQueryOptions(),
    )
    if (!user) throw redirect({ to: '/login' })
  },
  component: Outlet,
})
