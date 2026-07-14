import { dynamicIconImports } from 'lucide-react/dynamic'
import type { IconName } from 'lucide-react/dynamic'

/** O ícone usado quando o nome cadastrado não existe no Lucide. */
export const FALLBACK_ICON: IconName = 'app-window'

export function isIconName(name: string): name is IconName {
  return name in dynamicIconImports
}
