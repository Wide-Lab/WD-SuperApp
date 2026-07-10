# 06 — Detalhe da aplicação

**Depende de:** `02-design-system.md`, `04-vitrine.md`.
**Entrega:** o botão de expandir no card e o `<dialog>` de detalhe — descrição
completa, imagem sem recorte, destino.

## Objetivo

O card mostra a descrição cortada em 2 linhas e a imagem recortada 16:10 — o suficiente
para reconhecer a aplicação, não para inspecioná-la. Este spec dá um segundo nível: ver a
descrição inteira e a imagem sem corte, sem sair da vitrine.

Não é um segundo lançador. O card continua sendo o jeito de abrir a aplicação; o detalhe
só existe para decidir se vale abrir.

## Fora de escopo

Nenhum campo novo no catálogo. O `apps.json` não ganha `category`, `tags` ou qualquer
outro atributo — ver `../00-visao-geral.md`. "Informação adicional" aqui significa **o que
o card já teria mostrado sem os limites de espaço do grid**: descrição sem `line-clamp`,
imagem sem `object-cover`, e o domínio do `url` (hoje escondido — o card não diz para onde
o clique leva). Nada que exija um campo que o schema não tem.

## Por que não é o próprio card

O card é uma âncora — clicar em qualquer ponto dele abre a aplicação (`04-vitrine.md`).
Um botão dentro de um `<a>` é aninhamento inválido em HTML, e sobrepor um `onClick` no
próprio card quebraria o contrato "o card inteiro é o link". A saída: o botão de expandir
é **irmão** da âncora, não filho — os dois vivem dentro de um
`<div className="relative h-full">` que substitui `<a className="group">` como raiz do
card. A âncora continua carregando `group` e todo o conteúdo de `04-vitrine.md` sem
nenhuma mudança por dentro.

```tsx
<div className="relative h-full">
  <a href={url} className="group block h-full …">
    <ApplicationCardMedia app={app} />
    <div>…</div>
  </a>

  <button aria-label={`Ver detalhes de ${app.name}`} aria-haspopup="dialog" …>
    <Maximize2 />
  </button>

  <ApplicationDetailDialog ref={dialogRef} app={app} />
</div>
```

Isso substitui a "Estrutura" de `04-vitrine.md` (que tinha `<a>` como raiz) por esta árvore.
Nenhum outro comportamento do card muda: clique em qualquer ponto da âncora ainda abre a
aplicação, o botão de expandir não intercepta esse clique porque está fora dela, e nenhum
seletor `group-hover`/`group-focus-visible` existente muda — `group` continua exatamente
onde estava. O botão de expandir e o `<dialog>` ficam fora da âncora, então nunca disparam
o `group-hover` dela nem herdam a varredura do leito.

## O botão de expandir

`aria-label="Ver detalhes de {nome}"`, `aria-haspopup="dialog"`, ícone `maximize-2` do
Lucide, 14px. Reaproveita o `Button` de `components/ui/button.tsx`, variante `outline`,
tamanho `icon`, redimensionado para 28px via `className`.

Posição: canto superior esquerdo do leito, mesmo recuo do rótulo "Abrir" no canto oposto
(`top-2 left-2` dentro do leito, que fica a `padding: 10px` da borda do card — por isso
`top-[18px] left-[18px]` a partir da raiz).

**Não fica invisível em repouso.** O rótulo "Abrir" pode ficar `opacity-0` até o hover
porque ele é reforço de uma ação que já funciona sem ele (clicar no card). O botão de
expandir é diferente: é a **única** forma de abrir o detalhe, e em touch não existe hover
— um controle invisível até o toque é um controle que ninguém acha. Fica em `opacity-80`
em repouso, `opacity-100` no hover e no foco.

## O `<dialog>`

`features/applications/components/application-detail-dialog.tsx`. `<dialog>` nativo, não
um componente de terceiro — foco preso, `Esc` fecha e clique fora fecha já vêm do
navegador, e o projeto não tem Radix nem nenhuma lib de dialog instalada.

Aberto via `ref.current.showModal()` a partir do clique no botão de expandir. Fechado por
`Esc` (nativo), clique no `::backdrop` (`onClick` comparando `event.target ===
event.currentTarget`) ou o botão fechar.

### Sem animação de entrada

A spec 02 fecha o orçamento de movimento da aplicação inteira em dois: entrada do grid e
varredura do card. O `<dialog>` não ganha um terceiro. Ele aparece — sem
`transform`/`opacity` de entrada — exatamente como o resto do app se comporta sob
`prefers-reduced-motion: reduce`. Isso não é uma lacuna a preencher depois: é a leitura
literal de "mais que isso vira ruído".

### Conteúdo

```
┌──────────────────────────────┐
│  ┌ leito, object-contain ┐ [x]│
│  │   ╬        ◆          │   │
│  └────────────────────────┘   │
│                                │
│  Nome da aplicação             │
│  Descrição completa, sem       │
│  cortar em 2 linhas.           │
│  ──────────────────────────    │
│  dominio.widelab.com.br [Abrir]│
└──────────────────────────────┘
```

- **Leito:** mesma classe `plot-bed` do card — papel milimetrado, `aspect-[16/10]`. Com
  `image`, `object-contain` (não `object-cover`): nada é recortado, e a moldura do leito ao
  redor de uma imagem com proporção diferente não é acidente, é o mesmo vocabulário visual
  do card aplicado à letra. Sem `image`, mostra o ícone (56px) e a coordenada do app — a
  mesma função `coordinate(id)` de `04-vitrine.md`, então é o mesmo lugar, só ampliado.
- **Nome:** `font-display`, 24px, peso 600. Único segundo lugar onde `Bricolage Grotesque`
  aparece — ver nota abaixo sobre o critério de aceite 4 da spec 02.
- **Descrição:** `mute`, 14px, sem `line-clamp`.
- **Rodapé:** domínio do `url` (via `new URL(url).hostname`; se não for absoluto, o `url`
  cru) em `font-mono`, `mute`, texto simples — não é um segundo link para o mesmo destino.
  Botão "Abrir" à direita, mesmo visual do rótulo do card (borda `line`, hover
  `rgba(237,29,84,.45)`), `target="_blank"` quando absoluto.
- **Fechar:** `Button` `outline`/`icon` reaproveitado (mesma variante do botão de expandir),
  canto superior direito, `aria-label="Fechar"`.

### Nota sobre o critério de aceite 4 da spec 02

"`Bricolage Grotesque` aparece em exatamente um seletor" deixa de valer ao pé da letra —
agora aparece em dois: o `h1` do masthead e o `h2` do detalhe. A leitura que continua
valendo é a intenção por trás do critério: display **com restrição**, nunca em texto de
corpo ou de card. O `h2` do detalhe é um título de página em miniatura (mesma função que o
`h1`), não uma terceira aplicação da fonte a esmo — por isso conta como extensão da regra,
não violação dela. Se um dia a `Bricolage Grotesque` aparecer num terceiro lugar sem essa
mesma justificativa, aí sim é o critério sendo furado.

## Acessibilidade

1. `aria-labelledby` do `<dialog>` aponta para o `h2` do nome.
2. Foco preso dentro do `<dialog>` enquanto aberto (nativo do `showModal()`).
3. `Esc` fecha e devolve o foco ao botão que abriu (comportamento nativo do `<dialog>`).
4. O botão de expandir tem `aria-label` próprio — não depende de texto visível.
5. A coordenada do leito, quando não há imagem, continua `aria-hidden`: é textura, não
   informação, igual ao card.

## Critérios de aceite

1. Clicar no botão de expandir abre o detalhe sem navegar para a `url` da aplicação.
2. Clicar em qualquer outro ponto do card continua abrindo a `url`, como antes.
3. `Tab` até o botão de expandir mostra o anel de foco; `Enter`/`Espaço` abre o detalhe.
4. Dentro do detalhe aberto, `Esc` fecha e o foco volta para o botão de expandir.
5. Clicar fora do painel (no `::backdrop`) fecha o detalhe.
6. Uma aplicação com `image` mostra a imagem inteira, sem recorte, no detalhe.
7. Uma aplicação sem `image` mostra o mesmo ícone e a mesma coordenada do card, ampliados.
8. A descrição no detalhe nunca corta com reticências, mesmo perto do limite de 160
   caracteres do schema.
9. Nenhuma animação de entrada roda ao abrir o `<dialog>` — o orçamento de movimento da
   spec 02 continua em dois.
10. Zoom de 200% e viewport de 360px não geram rolagem horizontal no `<dialog>` aberto.
