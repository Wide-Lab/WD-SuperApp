import { Outlet } from '@tanstack/react-router'

/* Container e nada mais. Na fase 3, o cabeçalho ganha a área do usuário e o logout. */
export function AppShell() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-[clamp(20px,4vw,48px)]">
      {/* A página termina no grid, com 96px de respiro. Não existe rodapé. */}
      <main className="pb-24">
        <Outlet />
      </main>
    </div>
  )
}
