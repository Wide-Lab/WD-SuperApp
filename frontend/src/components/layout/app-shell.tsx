import { Outlet, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useCurrentUser } from '#/features/auth/use-current-user'
import { useLogout } from '#/features/auth/use-logout'

export function AppShell() {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => void navigate({ to: '/login' }),
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,48px)]">
      {/* Some em /login: o beforeLoad da própria rota já garante `user` nulo ali. */}
      {user && (
        <div className="flex items-center justify-between border-b border-line py-3">
          <span className="font-mono text-xs text-mute">{user.email}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sair"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" size={16} strokeWidth={1.5} />
          </Button>
        </div>
      )}

      {/* A página termina no grid, com 96px de respiro. Não existe rodapé. */}
      <main className="pb-24">
        <Outlet />
      </main>
    </div>
  )
}
