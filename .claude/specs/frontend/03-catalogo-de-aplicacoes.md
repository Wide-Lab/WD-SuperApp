# 03 — Catálogo de aplicações

**Depende de:** `01-fundacao.md`.
**Entrega:** `public/apps.json`, `public/apps.schema.json` e a camada `features/applications`.

## Objetivo

Definir de onde vêm as aplicações e como o resto do código as consome.

Este é **o único módulo que a fase 2 vai reescrever**. Tudo que estiver acima dele —
grid, card, busca — não pode saber que os dados vêm de um arquivo estático.

## Por que `fetch` e não `import`

Importar o JSON daria tipagem em tempo de build e uma linha a menos de código. Mas
significaria que a vitrine nasce **síncrona**: sem estado de carregando, sem estado de
erro, sem `useQuery`. Quando o backend chegasse, cada tela teria que aprender a esperar.

Buscar com `fetch` faz a fase 1 já nascer com o formato assíncrono do backend. A migração
da fase 2 troca uma linha:

```diff
- const res = await fetch('/apps.json', { signal })
+ const res = await fetch('/api/apps', { signal, credentials: 'include' })
```

Nenhum componente é tocado. O custo é perder a checagem em tempo de build, e é por isso
que validamos com Zod em runtime e com um JSON Schema no editor.

## O arquivo: `public/apps.json`

```json
{
  "$schema": "./apps.schema.json",
  "apps": [
    {
      "id": "cronify",
      "name": "Cronify",
      "description": "Agenda e acompanha a execução de rotinas automatizadas.",
      "url": "https://cronify.widelab.com.br",
      "icon": "calendar-clock",
      "image": "/apps/cronify.png"
    }
  ]
}
```

Um envelope `{ "apps": [...] }` em vez de um array puro, por um motivo prático: com o
envelope cabe a chave `$schema`, e com ela o VSCode dá autocomplete e sublinha erro
**enquanto você digita**. Um array no topo do arquivo não aceita `$schema`.

### Campos

| Campo | Obrigatório | Regra |
|---|---|---|
| `id` | sim | kebab-case, `^[a-z0-9]+(-[a-z0-9]+)*$`. Único no arquivo. Vira a chave do React, a coordenada do plotter e, na fase 2, a chave primária. |
| `name` | sim | 1 a 60 caracteres. |
| `description` | sim | 1 a 160 caracteres. Truncada em 2 linhas no card, então escreva para caber. |
| `url` | sim | URL absoluta (`https://…`) ou caminho relativo. Absoluta abre em nova aba. |
| `icon` | sim | Nome de um ícone Lucide em kebab-case: `calendar-clock`, `search`, `bot`. |
| `image` | não | Caminho ou URL de uma capa. Sem ela, o card usa o leito do plotter. |

**A ordem do arquivo é a ordem da tela.** Não existe campo `order`.

Deliberadamente ausentes: `category`, `status`, `featured`, `tags`, `roles`. Cada um ganha
uma spec própria no dia em que fizer falta. Ver `../00-visao-geral.md`.

### Ícones

Resolvidos em runtime pelo `DynamicIcon` de `lucide-react/dynamic`, que aceita o nome em
kebab-case e carrega o ícone sob demanda. Adicionar uma aplicação nova com um ícone novo
**nunca exige mexer em código**.

Se o nome não existir no Lucide, o componente renderiza um ícone de fallback
(`app-window`) em vez de quebrar. Um `console.warn` em desenvolvimento aponta o `id`
culpado.

> Confirmado em 2026-07-10 que o subpath `lucide-react/dynamic` ainda existe na 1.24.0.
> Se um major futuro removê-lo, a alternativa é um mapa curado
> `Record<string, LucideIcon>` e um `z.enum` sobre as chaves dele — ao custo de exigir
> mudança de código para cada ícone novo.

### Imagens

Ficam em `public/apps/`. Proporção 16:10, mínimo 640×400. Se o arquivo apontado por
`image` falhar ao carregar, o card cai para o leito do plotter — o usuário nunca vê um
ícone de imagem quebrada.

## O JSON Schema: `public/apps.schema.json`

Mora ao lado do `apps.json` para que o `$schema` relativo resolva. Espelha exatamente as
regras da tabela acima e usa `"additionalProperties": false`, para que um campo digitado
errado seja sublinhado em vez de silenciosamente ignorado.

Unicidade de `id` não é expressável em JSON Schema. Fica por conta do Zod.

## A camada de dados: `src/features/applications/`

### `schema.ts`

```ts
import { z } from 'zod'

export const applicationSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1).max(60),
  description: z.string().min(1).max(160),
  url: z.string().min(1),
  icon: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  image: z.string().optional(),
})

export const catalogSchema = z.object({
  apps: z.array(applicationSchema),
})
```

### `types.ts`

```ts
export type Application = z.infer<typeof applicationSchema>
```

O tipo é **derivado** do schema. Nunca escreva a interface à mão — ela sai de sincronia.

### `api.ts`

```ts
export class CatalogError extends Error {
  constructor(message: string, readonly detail?: unknown) {
    super(message)
    this.name = 'CatalogError'
  }
}

export async function fetchApplications(signal?: AbortSignal): Promise<Application[]> {
  const res = await fetch('/apps.json', { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new CatalogError(`apps.json respondeu ${res.status}`)

  const parsed = catalogSchema.safeParse(await res.json())
  if (!parsed.success) throw new CatalogError('apps.json inválido', parsed.error.issues)

  const ids = parsed.data.apps.map((a) => a.id)
  const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (duplicated.length) throw new CatalogError(`id duplicado: ${duplicated.join(', ')}`)

  return parsed.data.apps
}
```

Em desenvolvimento, o `ErrorState` mostra `issue.path` e `issue.message` de cada problema
de validação. Em produção, mostra só a mensagem genérica.

### `use-applications.ts`

```ts
export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: ({ signal }) => fetchApplications(signal),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
}
```

## Conteúdo inicial

Sete aplicações, semeadas a partir dos projetos vizinhos em `Codes/Widelab/`.

⚠️ **As `url` são placeholders.** A hospedagem ainda não foi decidida — ver "Decisões
adiadas" em `../00-visao-geral.md`. As descrições foram inferidas do nome e da estrutura
de cada projeto e devem ser revisadas por quem conhece cada um.

| `id` | Nome | `icon` |
|---|---|---|
| `cronify` | Cronify | `calendar-clock` |
| `quickfind` | QuickFind | `search` |
| `receipt-reader` | Receipt Reader | `receipt` |
| `disparador-mensagens` | Disparador de Mensagens | `send` |
| `message-sender-pro` | Message Sender Pro | `messages-square` |
| `widehub` | Widehub | `layout-dashboard` |
| `rpa-generator` | RPA Generator | `bot` |

Nenhuma tem `image` ainda. Todas vão renderizar o leito do plotter, que é exatamente o
caso que ele foi desenhado para atender.

## Migração da fase 2

O contrato de `GET /api/apps` deve devolver o mesmo envelope `{ "apps": [...] }`, com os
mesmos campos. Assim `catalogSchema` continua valendo e `fetchApplications` muda só a URL
e ganha `credentials: 'include'`.

## Critérios de aceite

1. Abrir `public/apps.json` no VSCode dá autocomplete de campo e sublinha um campo inválido.
2. `fetchApplications()` devolve 7 aplicações tipadas como `Application[]`.
3. Um `id` duplicado no arquivo faz a promise rejeitar com `CatalogError`.
4. Um campo obrigatório ausente faz a promise rejeitar, e a mensagem aponta o caminho do campo.
5. Um `icon` inexistente no Lucide renderiza o fallback, sem quebrar a página.
6. Nenhum componente fora de `features/applications/` importa `apps.json` diretamente.
7. Remover `image` de uma aplicação não muda nada além do visual do card.
