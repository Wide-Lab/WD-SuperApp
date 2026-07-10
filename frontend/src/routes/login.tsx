import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '#/features/auth/components/login-form'
import { currentUserQueryOptions } from '#/features/auth/use-current-user'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      currentUserQueryOptions(),
    )
    if (user) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col pt-24 sm:pt-32">
      <span className="font-mono text-[0.6875rem] leading-none font-medium tracking-[0.22em] text-mute uppercase">
        Widelab
      </span>
      <h1 className="mt-3 text-2xl leading-[1.2] font-semibold text-paper">
        Entrar
      </h1>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  )
}
