import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { useCurrentUser } from '#/features/auth/use-current-user'
import { useLogout } from '#/features/auth/use-logout'

const NAV_LINK =
  'relative py-1 font-mono text-xs tracking-[0.08em] text-mute transition-colors duration-200 ease-plotter hover:text-paper'

/*
 * A marca da página atual é uma régua rosa de 1px sob o item — o rosa marca
 * posição, e não existe posição mais literal que "você está aqui". É linha, não
 * texto: o rótulo em si continua em `paper`.
 */
const NAV_ACTIVE =
  'text-paper after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-pink after:content-[""]'

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
        <div className="flex items-center justify-between gap-4 border-b border-line py-3">
          <nav className="flex items-center gap-5">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={NAV_LINK}
              activeProps={{ className: NAV_ACTIVE }}
            >
              Vitrine
            </Link>
            <Link
              to="/aplicacoes"
              className={NAV_LINK}
              activeProps={{ className: NAV_ACTIVE }}
            >
              Catálogo
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden truncate font-mono text-xs text-mute sm:block">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" size={16} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      )}

      {/* A página termina no grid, com 96px de respiro. Não existe rodapé. */}
      <main className="pb-24">
        <Outlet />
      </main>
    </div>
  )
}
