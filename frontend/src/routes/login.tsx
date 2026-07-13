import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginForm } from '#/features/auth/components/login-form'
import { safeRedirect } from '#/features/auth/lib/redirect'
import { currentUserQueryOptions } from '#/features/auth/use-current-user'

/*
 * `?redirect=` é como um app em `*.widelab.com.br` pede a sessão e diz para onde
 * o usuário deve voltar. Destino é entrada não confiável: quem valida é
 * `safeRedirect`, nunca esta rota.
 */
const searchSchema = z.object({ redirect: z.string().optional() })

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(
      currentUserQueryOptions(),
    )
    if (!user) return

    /*
     * Já tem sessão. Se veio de um app, devolve na hora — é o caso comum do SSO:
     * o segundo app aberto no mesmo navegador já encontra o cookie posto e o
     * usuário nunca vê esta tela.
     */
    const destination = safeRedirect(search.redirect)
    throw destination ? redirect({ href: destination }) : redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const { redirect: destination } = Route.useSearch()

  return (
    <div className="mx-auto flex max-w-sm flex-col pt-24 sm:pt-32">
      <span className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.22em] text-mute uppercase">
        Widelab
      </span>
      <h1 className="mt-3 text-2xl leading-[1.2] font-semibold text-paper">
        Entrar
      </h1>
      <div className="mt-8">
        <LoginForm redirectTo={destination} />
      </div>
    </div>
  )
}
