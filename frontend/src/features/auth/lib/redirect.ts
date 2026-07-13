/*
 * O `?redirect=` do /login é o que faz o SSO ter volta: um app em
 * `*.widelab.com.br` manda o usuário para cá e espera recebê-lo de volta depois
 * de autenticado. Como o destino chega pela URL, ele é entrada não confiável —
 * sem esta validação, `/login?redirect=https://evil.com` transforma a central
 * num open redirect assinado pela nossa marca.
 *
 * A regra é deliberadamente estreita: só https, só o domínio registrável da
 * Widelab. Nada de http (o cookie é `Secure`), nada de host que apenas *termine*
 * com o texto do domínio — `evilwidelab.com.br` não é subdomínio nosso, e é
 * exatamente por isso que a checagem compara o sufixo `.widelab.com.br` com o
 * ponto incluso, em vez de usar `includes`.
 */
const ROOT_DOMAIN = 'widelab.com.br'

export function safeRedirect(raw: string | undefined): string | null {
  if (!raw) return null

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  if (url.protocol !== 'https:') return null

  const host = url.hostname.toLowerCase()
  if (host !== ROOT_DOMAIN && !host.endsWith(`.${ROOT_DOMAIN}`)) return null

  return url.toString()
}
