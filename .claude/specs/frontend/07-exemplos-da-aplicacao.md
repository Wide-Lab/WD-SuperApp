# 07 — Exemplos da aplicação

**Depende de:** `06-detalhe-da-aplicacao.md`, `../backend/04-exemplos-da-aplicacao.md`.
**Entrega:** a seção "Exemplos" no `<dialog>` de detalhe, o grupo repetível no formulário de
cadastro, e `features/applications/lib/example-source.ts`.

## Objetivo

Quem abre o detalhe de uma aplicação quer decidir se vale abrir a aplicação. Para metade do
catálogo, a resposta mais rápida a essa pergunta não é a descrição: é a pasta do Drive com o
que aquele app já produziu. Esta spec põe esses links a um clique do detalhe, e dá ao
formulário um jeito de cadastrá-los.

## Fora de escopo

- **Exemplo como link no card.** O card é uma âncora só, com um destino só (`04-vitrine.md`).
  Um segundo destino ali quebra "o card inteiro é o link" e enche o grid de ruído. O card
  ganha só um contador, e ele não é clicável.
- **Buscar por exemplo.** `filterApplications` continua em nome e descrição (`05-busca.md`).
- **Copiar o link, prévia do Drive, miniatura, contagem de arquivos.** Cada um exigiria API do
  Google ou um controle novo por linha. O link abre no Drive; o Drive faz o resto.
- **Reordenar arrastando.** A ordem é a ordem das linhas do formulário. Arrastar exigiria uma
  dependência de DnD que o projeto não tem.
- **Terceira animação.** O orçamento de movimento continua fechado em dois (`02-design-system.md`):
  entrada do grid e varredura do plotter. A seção de exemplos aparece, como o resto do `<dialog>`.

## Emenda às specs 06 e 00

`06-detalhe-da-aplicacao.md` diz, em "Fora de escopo": "Nenhum campo novo no catálogo". Esta
spec adiciona um. A emenda é deliberada e o critério que a justifica está em
`../backend/04-exemplos-da-aplicacao.md` § "Por que este campo entra e aqueles não": os campos
vetados (`category`, `tags`, `status`, `featured`, `order`) são metadado de organização do grid;
`examples` é conteúdo da aplicação, vive só no segundo nível e não muda ordenação, agrupamento
nem filtro.

O que a spec 06 continua governando sem mudança: o detalhe **não é um segundo lançador**. A
seção de exemplos leva a material sobre a aplicação, não a um segundo caminho para abri-la.

## Schema e tipos

Em `features/applications/schema.ts`:

```ts
const HTTP_URL = /^https?:\/\//

export const applicationExampleSchema = z.object({
  label: z.string().min(1).max(40),
  url: z.string().max(2048).regex(HTTP_URL),
})

export const applicationSchema = z.object({
  ...
  examples: z.array(applicationExampleSchema).default([]),
})
```

**A regex de esquema não é só validação de forma — é o que impede `javascript:` de virar
`href`.** `new URL('javascript:alert(1)')` é uma URL válida, então qualquer validação genérica
de URL aceita esse valor e ele vira um link executável dentro do `<dialog>`. Só `http` e `https`
passam. (Em Zod 4 `z.string().url()` está depreciado; a regex resolve os dois problemas de uma
vez.)

`.default([])`: o backend sempre manda a chave, mas um frontend novo contra um backend antigo
mostraria "Catálogo inválido" na vitrine inteira por causa de uma seção secundária. O padrão
falha para o lado certo.

No `applicationDraftSchema`, com as mensagens que a pessoa lê:

```ts
examples: z
  .array(
    z.object({
      label: z.string().trim().min(1, 'Dê um nome ao exemplo.').max(40),
      url: z
        .string()
        .trim()
        .max(2048, 'Link longo demais.')
        .regex(HTTP_URL, 'Cole o link completo, começando com https://.'),
    }),
  )
  .max(8, 'No máximo 8 exemplos por aplicação.')
```

`ApplicationExample` sai de `z.infer`, como todo o resto — nunca escrito à mão.

## `lib/example-source.ts`

```ts
export type ExampleIcon = 'drive' | 'doc' | 'video' | 'link'

export interface ExampleSource {
  /** Hostname sem `www.`, para exibição. */
  origin: string
  icon: ExampleIcon
}

export function exampleSource(url: string): ExampleSource
```

| Hostname | `icon` |
|---|---|
| `drive.google.com` | `drive` |
| `docs.google.com` | `doc` |
| `youtube.com`, `youtu.be` | `video` |
| qualquer outro | `link` |

**`origin` é o hostname cru, não um apelido.** "Drive" seria mais bonito, mas `docs.google.com`
serve Docs, Sheets e Slides ao mesmo tempo — um apelido acertaria um terço das vezes e mentiria
nas outras duas. Distinguir exigiria farejar o path (`/spreadsheets/d/`), que quebra quando o
Google mexe na URL, para ganhar um ícone. Hostname é factual, cabe em `font-mono` 12px e
combina com a bancada.

Se `new URL(url)` lançar, devolve `{ origin: url, icon: 'link' }` — a mesma postura da função
`destination` que já existe no `<dialog>`. Essa função continua onde está: ela também trata
caminho relativo, que a `url` da aplicação aceita e a de um exemplo nunca terá.

O mapa `ExampleIcon` → componente Lucide (`Folder`, `FileText`, `Play`, `Link`) mora no
componente, não aqui: `lib/` é pura e testada com Vitest sem DOM (`01-fundacao.md`).

## O `<dialog>` de detalhe

A seção entra entre a descrição e o rodapé de destino:

```
│  Descrição completa, sem cortar.       │
│  ─────────────────────────────────     │
│  EXEMPLOS                              │
│  ┌────────────────────────────────┐    │
│  │ ▤  Cupons processados   drive.google.com ↗ │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │ ▤  Planilha modelo      docs.google.com  ↗ │
│  └────────────────────────────────┘    │
│  ─────────────────────────────────     │
│  app.widelab.com.br         [Abrir]    │
```

- **Cabeçalho:** `<h3>Exemplos</h3>` com o mesmo tratamento do sobrescrito do masthead —
  `font-mono text-[0.6875rem] tracking-[0.22em] text-mute uppercase`. O texto é escrito
  "Exemplos", e as maiúsculas vêm do CSS: caixa alta no fonte faz leitor de tela soletrar.
- **Lista:** `<ul>`, uma `<li>` por exemplo, `gap-2`.
- **Linha:** `<a href={url} target="_blank" rel="noopener noreferrer">`, altura 40px,
  `rounded-field`, `border border-line`, `px-3`, `gap-3`. Ícone 14px `mute` à esquerda; `label`
  em `paper` 14px com `truncate`; `origin` em `font-mono text-xs text-mute` `shrink-0`;
  `ArrowUpRight` 12px `mute` no fim. Hover e `focus-visible`: `border-[rgba(237,29,84,0.45)]` e
  `bg-panel-hover` — mesmo vocabulário do botão "Abrir", nenhum token novo, nenhum preenchimento
  rosa.
- **Sem exemplos, a seção não existe.** Nada de "Nenhum exemplo cadastrado": ausência de
  material não é informação que ajude quem só quer abrir o app.

### O `<dialog>` precisa passar a rolar

Hoje ele é `max-h-[90vh] overflow-hidden` com conteúdo de altura fixa. Oito linhas de 40px mais
o leito estouram 90vh em telas baixas, e `overflow-hidden` cortaria o botão "Abrir" — o
controle mais importante da tela. Passa a ser: `<dialog>` com `flex flex-col`, o leito com
`shrink-0`, e o bloco de conteúdo com `overflow-y-auto`. O leito nunca encolhe (é o que
identifica o app) e o rodapé nunca some.

## O card

Uma linha de contagem depois da descrição, **dentro** da âncora:

```tsx
{app.examples.length > 0 && (
  <p aria-hidden="true" className="mt-2 font-mono text-[0.6875rem] tracking-[0.04em] text-mute">
    {app.examples.length} {app.examples.length === 1 ? 'exemplo' : 'exemplos'}
  </p>
)}
```

`aria-hidden` porque o texto está dentro da âncora mas os exemplos **não** estão nela: um leitor
de tela anunciaria "link: Leitor de Recibos, …, 2 exemplos" e prometeria um destino que aquele
link não tem. A informação vai para quem realmente leva a ela — o botão de expandir:

```
aria-label={
  app.examples.length > 0
    ? `Ver detalhes de ${app.name} (${n} ${n === 1 ? 'exemplo' : 'exemplos'})`
    : `Ver detalhes de ${app.name}`
}
```

Nada mais muda no card: nenhum controle novo, nenhuma marca no leito, nenhuma mudança de altura
além dessa linha.

## O formulário

Grupo repetível em `application-form.tsx`, depois do campo "Ícone", com rótulo "Exemplos" e
dica: *"Links de material de apoio — normalmente uma pasta do Drive. Aparecem no detalhe da
aplicação, na ordem abaixo."*

Cada linha é uma grade `[minmax(0,1fr)_minmax(0,1.6fr)_auto]`, empilhando em uma coluna abaixo
de 640px:

| Campo | Componente | Detalhe |
|---|---|---|
| Rótulo | `Input` | `maxLength={40}`, `id="app-example-{i}-label"` |
| Endereço | `Input` | `className="font-mono"`, `spellCheck={false}`, `id="app-example-{i}-url"` |
| Remover | `Button` `ghost`/`icon` | ícone `X` 14px, `aria-label="Remover exemplo {i+1}"` |

Abaixo da lista, um `Button variant="outline"` com ícone `Plus`: "Adicionar exemplo". Com 8
linhas ele fica `disabled` e a dica passa a "Máximo de 8 exemplos." Sem nenhuma linha, só o
botão aparece — sem estado vazio ilustrado.

**A chave de cada linha é um `crypto.randomUUID()` local, não o índice.** Com índice, remover a
primeira de três faz o React reaproveitar o DOM errado: o valor digitado "sobe" uma linha e o
foco vai para o campo errado. Esse id vive só no estado do formulário e **não** é enviado ao
backend — lá a coleção é substituída inteira (`../backend/04-exemplos-da-aplicacao.md`).

**Foco:** ao adicionar, o foco vai para o campo "Rótulo" da linha nova. Ao remover, vai para o
botão "Remover" da linha seguinte, ou para "Adicionar exemplo" se a removida era a última —
foco nunca cai no `<body>`.

**Erros:** um por campo por linha, em estado próprio (`Array<{ label?: string; url?: string }>`),
já que `DraftErrors` é chaveado por campo do rascunho. No `handleSubmit`, a busca do primeiro
campo inválido (`FIELD_ORDER`) passa a considerar os exemplos **depois** dos campos existentes,
e foca `app-example-{i}-{campo}`.

**Prévia:** `application-preview.tsx` ganha a mesma linha de contagem do card. A prévia é o
resultado, não uma ilustração dele (`06`), então ela mostra o que o card vai mostrar.

## Acessibilidade

1. A seção do `<dialog>` é um `<section aria-labelledby>` apontando para o `<h3>` "Exemplos".
2. Cada exemplo é um `<a>` de verdade: Tab, Enter, Ctrl+clique e "copiar endereço" funcionam
   sem código.
3. Cada linha ganha `<span className="sr-only">(abre em nova aba)</span>`, como o card faz para
   destino absoluto.
4. O contador do card é `aria-hidden`; a contagem chega ao leitor de tela pelo `aria-label` do
   botão de expandir.
5. O anel de foco é o global de `02-design-system.md` — nenhum foco custom por linha.
6. Com `prefers-reduced-motion: reduce` nada muda, porque nada aqui anima.

## Critérios de aceite

1. Uma aplicação com dois exemplos mostra os dois no `<dialog>`, na ordem cadastrada, e clicar
   em um abre a URL em nova aba.
2. Uma aplicação sem exemplos abre o `<dialog>` idêntico ao de antes desta spec — sem cabeçalho
   "Exemplos", sem separador extra.
3. O card de uma aplicação com exemplos mostra `2 exemplos`; com um, mostra `1 exemplo`.
4. Clicar em qualquer ponto do card continua abrindo a aplicação, não o detalhe (critério 2 da
   spec 06 segue valendo).
5. Com 8 exemplos e viewport de 700px de altura, o `<dialog>` rola por dentro e o botão "Abrir"
   continua visível e alcançável por Tab.
6. Zoom de 200% e viewport de 360px não geram rolagem horizontal no `<dialog>` (critério 10 da
   spec 06 segue valendo).
7. No formulário, "Adicionar exemplo" cria uma linha vazia e o foco vai para o campo "Rótulo"
   dela.
8. Preencher três linhas, remover a primeira e salvar grava exatamente as duas restantes, na
   ordem em que aparecem na tela.
9. Salvar com um endereço `pasta/exemplos` mostra "Cole o link completo, começando com
   https://." na linha certa, sem enviar requisição, e o foco vai para aquele campo.
10. Um exemplo com `url` começando em `javascript:` é rejeitado no formulário e, se vier do
    backend, faz o catálogo falhar a validação em vez de virar um `href`.
11. `npm run typecheck`, `npm run lint` e `npm run test` passam — `example-source.test.ts`
    cobre as quatro origens e a URL inválida.
