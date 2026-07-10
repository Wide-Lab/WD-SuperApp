# 05 — Busca

**Depende de:** `03-catalogo-de-aplicacoes.md`, `04-vitrine.md`.
**Entrega:** o campo de busca, o filtro, o contador vivo e o destaque dos trechos que casaram.

## Objetivo

Filtrar as aplicações por nome e descrição enquanto o usuário digita.

É a **única** funcionalidade além do grid. Categoria, status e destaque estão fora de
escopo por decisão explícita — ver `../00-visao-geral.md`.

## Sem debounce

O catálogo tem sete itens e vai ter dezenas, não milhares. O filtro é uma passada linear
sobre um array em memória: mais barato que o `setTimeout` que o debounce criaria. Filtrar
a cada tecla é o comportamento correto aqui.

Reavaliar se o catálogo passar de ~500 aplicações, o que não vai acontecer.

## Normalização

Buscar por `acao` tem que achar `Ação`. Buscar por `CRONIFY` tem que achar `Cronify`.

O problema: se você dobra os acentos para comparar, os índices do texto dobrado não batem
com os do texto original — e sem eles não dá para destacar o trecho certo. Então a dobra
devolve também um mapa de volta.

`features/applications/lib/fold.ts`:

```ts
export interface Folded {
  /** Texto sem acento, em caixa baixa. */
  text: string
  /** Para cada índice de `text`, o índice correspondente em `input`. */
  map: number[]
}

export function fold(input: string): Folded {
  let text = ''
  const map: number[] = []

  for (let i = 0; i < input.length; i++) {
    const folded = input[i]
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()

    for (const char of folded) {
      text += char
      map.push(i) // todo caractere dobrado aponta para o original que o gerou
    }
  }

  return { text, map }
}
```

Um caractere original pode gerar zero caracteres dobrados (um acento solto) ou mais de um.
O mapa aguenta os dois casos.

## Filtro

`features/applications/lib/filter.ts`.

O termo é dobrado uma vez e comparado contra `name` e `description` dobrados. Casa se
qualquer um dos dois contiver o termo. Termo vazio ou só espaço devolve a lista inteira.

```ts
export function filterApplications(apps: Application[], query: string): Application[] {
  const term = fold(query.trim()).text
  if (!term) return apps

  return apps.filter(
    (app) => fold(app.name).text.includes(term) || fold(app.description).text.includes(term),
  )
}
```

Sem correspondência difusa, sem pontuação de relevância. A ordem do arquivo se mantém.

## Estado na URL

O termo vive no query param `?q=`, não em `useState`. Assim o link é compartilhável, e
voltar e avançar no navegador funcionam.

Via `validateSearch` do TanStack Router, na rota `/`:

```ts
export const Route = createFileRoute('/')({
  validateSearch: z.object({ q: z.string().optional() }),
  component: Vitrine,
})
```

Ao digitar, `navigate({ search: { q: value || undefined }, replace: true })`.

`replace: true` é obrigatório: sem ele, cada tecla vira uma entrada no histórico e o botão
Voltar leva o usuário letra por letra até o começo da palavra. `undefined` quando vazio
mantém a URL limpa, sem um `?q=` pendurado.

## O campo

`features/applications/components/search-field.tsx`.

- `<input type="search">` com ícone `search` do Lucide à esquerda, cor `mute`.
- Superfície `panel`, borda 1px `line`, `rounded-field`, altura 40px.
- Placeholder: `Buscar aplicação`. Não "Digite para buscar…" — o placeholder nomeia a
  ação, não instrui o óbvio.
- `<label className="sr-only">Buscar aplicação</label>`. Placeholder não é rótulo.
- Sob foco, borda vira `pink` e o anel de foco global aparece.
- Com termo preenchido, um botão `x` à direita, `aria-label="Limpar busca"`.

### Teclado

- `Esc` dentro do campo limpa o termo e mantém o foco.
- `/` fora de qualquer campo de texto foca a busca. Numa central que serve de lançador,
  chegar ao teclado sem o mouse é função, não enfeite. Ignorado se o alvo do evento já for
  `input`, `textarea` ou `[contenteditable]`.

## O contador

Em `font-mono`, 12px, cor `mute`, logo abaixo do campo.

| Situação | Texto |
|---|---|
| Sem busca | `7 aplicações` |
| Sem busca, uma só | `1 aplicação` |
| Buscando | `3 de 7` |
| Buscando, nenhum resultado | `0 de 7` |

Fica dentro de um `aria-live="polite"`. Quem usa leitor de tela ouve o resultado do filtro
sem ter que sair do campo e varrer a lista.

## Destaque

Os trechos que casaram aparecem em `pink-soft`, dentro de um `<mark>` com fundo
transparente — o padrão do navegador é amarelo e destruiria a paleta.

Vale a regra do acento da spec 02: rosa marca **posição**. O destaque diz "foi aqui que
casou", exatamente como a coordenada diz "é aqui que este app mora".

Usa o mapa da `fold`. Achado o intervalo `[início, fim)` no texto dobrado, os índices no
texto original são `map[início]` e `map[fim - 1] + 1`. Recortar o original direto pelos
índices do dobrado destacaria o trecho errado em qualquer nome com acento.

`pink-soft`, nunca `pink`: texto de 14 e 16px.

## Busca sem resultado

Substitui o grid. Componente em `features/applications/components/`, texto exato:

```
Nenhuma aplicação encontrada
Nada corresponde a "servidor".
[ Limpar busca ]
```

O termo aparece entre aspas curvas, escapado. O botão limpa `?q=` e devolve o foco ao campo.

Distinto do estado de catálogo vazio da spec 04: um diz que a busca não achou, o outro que
não há nada cadastrado. Confundir os dois manda o usuário procurar o problema no lugar errado.

## Testes

`vitest`, sem DOM. As duas funções puras carregam a lógica toda:

**`fold`**
1. `fold('Ação').text === 'acao'`
2. `fold('Ação').map` mapeia cada índice dobrado ao original correto.
3. `fold('CRONIFY').text === 'cronify'`
4. `fold('')` devolve texto vazio e mapa vazio.

**`filterApplications`**
5. Termo vazio devolve a lista inteira.
6. Só espaço em branco devolve a lista inteira.
7. `'acao'` acha uma aplicação cuja descrição contém `Ação`.
8. `'CRON'` acha `Cronify`.
9. Casa em `description`, não só em `name`.
10. Termo sem correspondência devolve `[]`.
11. A ordem do arquivo é preservada.

## Critérios de aceite

1. Digitar filtra a cada tecla, sem atraso perceptível.
2. `?q=cron` numa aba nova já abre filtrado, com o campo preenchido.
3. Digitar cinco letras e apertar Voltar uma vez sai da vitrine — não volta letra por letra.
4. Limpar a busca remove o `?q=` da URL.
5. `acao` acha `Ação`; `CRONIFY` acha `Cronify`.
6. O trecho destacado é o correto mesmo em nome com acento.
7. O contador acompanha o filtro e é anunciado por leitor de tela.
8. `Esc` limpa e mantém o foco; `/` foca o campo de fora dele.
9. Zero resultados mostra o estado da busca, não o de catálogo vazio.
10. Os cards **não** reanimam a entrada a cada tecla.
