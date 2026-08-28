export type ExampleIcon = 'drive' | 'doc' | 'video' | 'link'

export interface ExampleSource {
  /** Hostname sem `www.`, para exibição. */
  origin: string
  icon: ExampleIcon
}

/*
 * Hostname, não apelido. "Drive" seria mais bonito, mas `docs.google.com` serve
 * Docs, Sheets e Slides ao mesmo tempo — um apelido acertaria um terço das vezes
 * e mentiria nas outras duas. Distinguir exigiria farejar o path
 * (`/spreadsheets/d/`), que quebra quando o Google mexe na URL, para ganhar um
 * ícone. Hostname é factual e cabe em `font-mono` 12px.
 */
const ICON_BY_ORIGIN: Record<string, ExampleIcon> = {
  'drive.google.com': 'drive',
  'docs.google.com': 'doc',
  'youtube.com': 'video',
  'youtu.be': 'video',
}

/**
 * De onde vem o exemplo, para a linha do `<dialog>` de detalhe.
 *
 * O mapa de `ExampleIcon` para componente Lucide mora no componente, não aqui:
 * `lib/` é puro e testado sem DOM.
 *
 * URL que não parseia devolve o texto cru e o ícone genérico — mesma postura da
 * `destination` do `<dialog>`, que também prefere mostrar algo a quebrar.
 */
export function exampleSource(url: string): ExampleSource {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return { origin: url, icon: 'link' }
  }

  const origin = hostname.replace(/^www\./, '')
  return { origin, icon: ICON_BY_ORIGIN[origin] ?? 'link' }
}
