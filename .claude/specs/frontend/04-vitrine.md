# 04 — Vitrine

**Depende de:** `01-fundacao.md`, `02-design-system.md`, `03-catalogo-de-aplicacoes.md`.
**Entrega:** a página `/` completa, exceto a busca (spec 05).

## Objetivo

A tela que responde à única pergunta do usuário: "onde fica a ferramenta que eu vim usar?"

## Rotas

Só uma. `/` renderiza a vitrine. `__root.tsx` carrega o `AppShell`.

A estrutura já acomoda `/login` na fase 3 sem reorganização.

## Anatomia

```
┌────────────────────────────────────────────────────────┐
│ WIDELAB ───────────────────────────────────────────────│  eyebrow + régua
│                                                        │
│ Central                          [ Buscar aplicação ]  │  display + campo
│                                             7 aplicações│  contador (mono)
│                                                        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ ╬ · · · · ·  │ │ · · · · · ·  │ │ · · ╬ · · ·  │    │
│ │ · · ◆ · · ·  │ │ · · ◆ · ╬ ·  │ │ · · ◆ · · ·  │    │
│ ├──────────────┤ ├──────────────┤ ├──────────────┤    │
│ │ Cronify      │ │ QuickFind    │ │ Receipt Rea… │    │
│ │ Agenda e ac… │ │ Busca unifi… │ │ Extrai dado… │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
└────────────────────────────────────────────────────────┘
```

**Não existe hero.** Nada de título centralizado com subtítulo e um campo de busca
embaixo. O cabeçalho é factual e ocupa pouco, porque o conteúdo mais característico desta
página são as próprias aplicações — o grid começa quase imediatamente.

**Não existe rodapé.** A página termina no grid, com 96px de respiro.

## `AppShell`

`components/layout/app-shell.tsx`. Container de 1200px, padding lateral
`clamp(20px, 4vw, 48px)`, `<main>` com o `<Outlet />`. Nada mais. Na fase 3, o cabeçalho
ganha a área do usuário e o logout.

## `Masthead`

`components/layout/masthead.tsx`.

- Eyebrow `WIDELAB` em `font-mono`, 11px, maiúsculas, tracking `0.22em`, cor `mute`.
- Uma régua de 1px em `line` que ocupa o espaço restante da linha do eyebrow.
- Título `Central` em `font-display`, peso 600, escala da spec 02.
- À direita, alinhados pela linha de base do título: o campo de busca e, abaixo dele, o
  contador de aplicações em `font-mono`, 12px, cor `mute`.

Abaixo de 720px o bloco da direita desce para baixo do título e ocupa a largura toda.

O campo de busca e o contador são especificados em `05-busca.md`. Aqui, o Masthead só
recebe `total` e `visible` por prop e desenha.

## `ApplicationGrid`

`features/applications/components/application-grid.tsx`.

```
grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
gap: 12px;
```

Abaixo de 532px vira uma coluna naturalmente, sem media query.

**Entrada:** cada card sobe 8px e aparece, 220ms, escalonado 30ms com teto de 300ms.
Roda só na montagem — **nunca ao filtrar**. Filtrar não é chegar; é esconder.

## `ApplicationCard`

`features/applications/components/application-card.tsx`.

### É uma âncora de verdade

```tsx
<a href={app.url} className="group …">
```

Um `<a>` com `href`, não uma `<div>` com `onClick`. Isso dá de graça: abrir em nova aba
com Ctrl+clique, copiar o endereço com o botão direito, navegação por Tab, e leitura
correta por leitor de tela.

Link absoluto (`/^https?:\/\//`) recebe `target="_blank"` e `rel="noopener noreferrer"` —
a central é um lançador, e ela deve continuar aberta atrás do app. Nesse caso, um
`<span className="sr-only">(abre em nova aba)</span>` fecha o contrato com o leitor de tela.

### Estrutura

```tsx
<a href={url} className="group">
  <ApplicationCardMedia app={app} />
  <div>
    <h3>{name}</h3>
    <p>{description}</p>
  </div>
</a>
```

- Superfície `panel`, borda 1px `line`, `rounded-card`, padding 10px, **sem sombra**.
- `h3`: 16px, peso 500, `paper`.
- `p`: 14px, `mute`, `line-height: 1.5`, truncada em 2 linhas com `line-clamp-2`.

### Hover e foco

Disparados juntos, por `group-hover` **e** `group-focus-visible` — quem navega por teclado
vê exatamente o que quem usa mouse vê.

| Propriedade | Repouso | Ativo |
|---|---|---|
| `background` | `panel` | `panel-hover` |
| `border-color` | `line` | `rgba(237, 29, 84, 0.45)` |
| cor do `h3` | `paper` | `#FFFFFF` |
| "Abrir" | invisível | visível |
| varredura | parada | roda |

**Sem `translateY`.** O card não levanta. Instrumentos não flutuam.

O rótulo "Abrir" mais uma seta `arrow-up-right` fica no canto superior direito do leito,
em `font-mono` 11px, cor `pink-soft` — nunca `pink`, que reprova em texto pequeno. Entra
com `opacity 0→1` e `translateX(-4px)→0`. É `aria-hidden`: o link já tem nome acessível
pelo conteúdo.

## `ApplicationCardMedia` — o leito do plotter

`features/applications/components/application-card-media.tsx`.
Proporção 16:10, `rounded-media`, `overflow: hidden`.

**Com `image`:** `<img>` com `object-cover`, `loading="lazy"`, `decoding="async"`. Se o
carregamento falhar (`onError`), o componente marca `imageFailed` no estado e cai para o
leito. O usuário nunca vê um ícone de imagem quebrada.

**Sem `image`:** o leito.

### O campo milimetrado

```css
background-color: #0f1219;
background-image:
  linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
background-size: 12px 12px;
```

O ícone do app, via `DynamicIcon`, centralizado, 40px, `stroke-width: 1.25`, cor `mute`.
Sob hover, vai para `paper`.

### A coordenada

Uma cruz de 1px em `pink`, 9px de braço, posicionada em porcentagem do leito. A posição é
**derivada do `id`** — fixa e única por aplicação. Cada ferramenta tem seu lugar na bancada.

```ts
export function coordinate(id: string): { x: number; y: number } {
  let h = 0x811c9dc5 // FNV-1a 32 bits
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }

  let x = 14 + (h % 73) // 14..86
  const y = 14 + ((h >>> 11) % 73)

  // Não colide com o ícone, que ocupa o miolo.
  if (x > 34 && x < 66 && y > 34 && y < 66) {
    x = x < 50 ? Math.max(10, x - 24) : Math.min(90, x + 24)
  }

  return { x, y }
}
```

`aria-hidden`. É textura, não informação.

### A varredura

Um `::after` de 1px de largura e altura total, `opacity: 0` em repouso:

```css
background: linear-gradient(to bottom, transparent, #ed1d54 20%, #ed1d54 80%, transparent);
box-shadow: 0 0 12px 1px rgba(237, 29, 84, 0.5);
```

Sob `group-hover` ou `group-focus-visible`, atravessa de `translateX(-8px)` até
`translateX(calc(100% + 8px))`, com `opacity` `0 → 1 → 0`, em 520ms `--ease-plotter`. Como
o cabeçote de um plotter passando sobre o papel.

Some inteira com `prefers-reduced-motion: reduce`.

## Os quatro estados

O texto de cada um faz parte da spec. Erros não pedem desculpa e nunca são vagos sobre o
que aconteceu; uma tela vazia é um convite para agir.

### Carregando

Seis `ApplicationCardSkeleton` no grid, com a mesma proporção do card real, para a página
não pular quando os dados chegarem. Sem animação de pulso — `panel` estático já basta.

### Erro

```
Não foi possível carregar as aplicações
O arquivo apps.json não respondeu ou está inválido.
[ Tentar de novo ]
```

Em desenvolvimento, lista abaixo cada `issue.path` e `issue.message` do Zod. O botão chama
`refetch()`.

### Catálogo vazio

Quando `apps.json` traz zero aplicações:

```
Nenhuma aplicação cadastrada
Adicione a primeira em public/apps.json.
```

`public/apps.json` em `font-mono`. É honesto para a fase 1 e diz exatamente o próximo passo.

### Busca sem resultado

Especificado em `05-busca.md`, mas o componente mora aqui.

## Acessibilidade

1. O grid é uma `<ul>` e cada card uma `<li>`. Um leitor de tela anuncia "lista com 7 itens".
2. O nome acessível do link vem do `h3` mais o `p`; nada de `aria-label` redundante.
3. A coordenada, a varredura e o "Abrir" são `aria-hidden`.
4. Ordem de Tab igual à ordem visual.
5. Contraste conforme a tabela da spec 02.

## Critérios de aceite

1. Cada aplicação do `apps.json` vira exatamente um card, na ordem do arquivo.
2. Clicar em qualquer ponto do card abre a `url`. Ctrl+clique abre em nova aba.
3. Um card sem `image` mostra o leito, e a coordenada dele **não se move** entre recargas.
4. Dois apps diferentes têm coordenadas diferentes; a coordenada nunca fica sobre o ícone.
5. Um `image` apontando para um arquivo inexistente cai para o leito, sem imagem quebrada.
6. Tab até um card mostra o anel de foco **e** dispara a varredura e o "Abrir".
7. Com `prefers-reduced-motion`, nenhum card se desloca e a varredura não roda.
8. Zoom de 200% e viewport de 360px não geram rolagem horizontal.
9. Cortar `apps` para `[]` mostra o estado de catálogo vazio, não um grid vazio.
10. Derrubar o `apps.json` (404) mostra o estado de erro com botão que refaz a requisição.
