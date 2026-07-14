import { Link } from '@tanstack/react-router'
import { buttonVariants } from '#/components/ui/button'

/* Uma tela vazia é um convite para agir: diz exatamente qual é o próximo passo. */
export function EmptyCatalogState() {
  return (
    <div className="rounded-card border border-line bg-panel px-6 py-14 text-center">
      <h2 className="text-base leading-[1.3] font-medium text-paper">
        Nenhuma aplicação cadastrada
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-[1.5] text-mute">
        Publique a primeira e ela aparece aqui na hora.
      </p>
      <Link to="/aplicacoes/nova" className={`${buttonVariants()} mt-8`}>
        Nova aplicação
      </Link>
    </div>
  )
}
