import { DynamicIcon } from 'lucide-react/dynamic'
import type { ComponentProps } from 'react'
import { FALLBACK_ICON, isIconName } from '../lib/icon-name'

/* Um aviso por `id`, para o console não virar enxurrada a cada render. */
const warned = new Set<string>()

type AppIconProps = Omit<ComponentProps<typeof DynamicIcon>, 'name'> & {
  /** Nome de um ícone Lucide em kebab-case. */
  name: string
  /** Só para a mensagem de aviso: aponta o culpado. */
  appId: string
}

/**
 * O ícone do app, resolvido em runtime. Adicionar uma aplicação com um ícone novo
 * nunca exige mexer em código; um nome inexistente cai no fallback em vez de quebrar.
 */
export function AppIcon({ name, appId, ...props }: AppIconProps) {
  const known = isIconName(name)

  if (!known && import.meta.env.DEV && !warned.has(appId)) {
    warned.add(appId)
    console.warn(
      `[central] ícone "${name}" não existe no Lucide (app "${appId}"). Usando "${FALLBACK_ICON}".`,
    )
  }

  return <DynamicIcon name={known ? name : FALLBACK_ICON} {...props} />
}
