# 02 — Design system

**Depende de:** `01-fundacao.md`.
**Entrega:** `src/styles.css` com os tokens, as fontes carregadas e as regras de foco e movimento.

## Objetivo

Traduzir a direção visual "bancada" (ver `../00-visao-geral.md`) em tokens que o resto do
código consome. Nenhum componente desta spec — só o vocabulário.

## Cores

Sete valores. Não invente um oitavo sem justificar.

| Token | Hex | Papel |
|---|---|---|
| `ink` | `#0C0E12` | Fundo da página. Cor primária da marca. |
| `panel` | `#14171E` | Superfície do card. |
| `panel-hover` | `#171B23` | Superfície do card sob hover ou foco. |
| `line` | `#232833` | Hairlines, bordas, réguas. |
| `mute` | `#8A90A0` | Texto secundário, descrições, metadados. |
| `paper` | `#E8EAF0` | Texto primário. **Não é branco puro** — branco cansa no escuro. |
| `pink` | `#ED1D54` | Acento da marca. Posição e foco. |
| `pink-soft` | `#FF7A9C` | Rosa legível em texto pequeno. |

### Contraste medido

Calculado contra `ink`, exceto onde indicado:

| Par | Razão | Veredito |
|---|---|---|
| `paper` sobre `ink` | 16,1:1 | AAA |
| `paper` sobre `panel` | 15,2:1 | AAA |
| `mute` sobre `ink` | 6,0:1 | AA |
| `mute` sobre `panel` | 5,7:1 | AA |
| `pink-soft` sobre `ink` | 7,8:1 | AAA |
| **`pink` sobre `ink`** | **4,5:1** | AA raspando, reprova AAA |

### Regra do acento

O rosa marca **posição e foco, nunca superfície**. Ele aparece em exatamente quatro
lugares, e todos significam a mesma coisa — "é aqui que a atenção está":

1. A marca de coordenada no leito do plotter.
2. A linha de varredura que atravessa o card sob hover.
3. O anel de foco do teclado.
4. O destaque dos trechos que casaram com a busca.

Proibido: fundo rosa, botão rosa preenchido, borda rosa permanente.

**`pink` é proibido em texto abaixo de 18px.** Os 4,5:1 passam no AA por uma casa decimal
e não sobram para ninguém. Onde precisar de texto em rosa — o "Abrir" do card, o destaque
da busca — use `pink-soft`. `pink` fica para linhas, ícones e o anel de foco, que não são
texto e obedecem a um limiar mais baixo.

## Tipografia

Três famílias, três papéis. A display é usada **com restrição**: só na palavra "Central"
do cabeçalho. Se ela aparecer num segundo lugar, alguém errou.

| Papel | Família | Onde |
|---|---|---|
| Display | Bricolage Grotesque Variable | Só o título do masthead. |
| Corpo | Geist Variable | Títulos de card, descrições, tudo. |
| Utilitário | Geist Mono Variable | Eyebrow, contador, "Abrir". |

O mono não é decoração. É a fonte nativa do assunto: a Widelab constrói agendadores,
RPAs e leitores de documento — o vocabulário desse mundo é identificador e timestamp.

### Escala

| Papel | Tamanho | Peso | Tracking | Line-height |
|---|---|---|---|---|
| Display | `clamp(2.75rem, 7vw, 5.5rem)` | 600 | `-0.03em` | `0.95` |
| Eyebrow | `0.6875rem` (11px) | 500 | `0.22em`, maiúsculas | `1` |
| Título de card | `1rem` (16px) | 500 | `-0.005em` | `1.3` |
| Descrição | `0.875rem` (14px) | 400 | `0` | `1.5` |
| Meta / mono | `0.75rem` (12px) | 400 | `0.08em` | `1.2` |

## `src/styles.css`

```css
@import 'tailwindcss';

@import '@fontsource-variable/geist';
@import '@fontsource-variable/geist-mono';
@import '@fontsource-variable/bricolage-grotesque';

@theme {
  --color-ink: #0c0e12;
  --color-panel: #14171e;
  --color-panel-hover: #171b23;
  --color-line: #232833;
  --color-mute: #8a90a0;
  --color-paper: #e8eaf0;
  --color-pink: #ed1d54;
  --color-pink-soft: #ff7a9c;

  --font-display: 'Bricolage Grotesque Variable', ui-sans-serif, system-ui, sans-serif;
  --font-sans: 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Geist Mono Variable', ui-monospace, monospace;

  --radius-card: 10px;
  --radius-media: 6px;
  --radius-field: 6px;

  --ease-plotter: cubic-bezier(0.22, 1, 0.36, 1);
}

html {
  color-scheme: dark;
}

body {
  background-color: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

Tailwind v4 gera as utilidades a partir do `@theme`: `bg-ink`, `text-mute`,
`border-line`, `font-mono`, `rounded-card`.

## Foco

Nenhum `outline: none` sem substituto. Regra global:

```css
:focus-visible {
  outline: 2px solid var(--color-pink);
  outline-offset: 2px;
  border-radius: 2px;
}
```

O anel usa `pink` puro. É uma linha, não texto — os 4,5:1 são folgados para o limiar de
3:1 de componentes de interface.

## Movimento

Dois movimentos na aplicação inteira. Mais que isso vira ruído.

**Entrada do grid.** Ao montar, cada card sobe 8px e aparece: `opacity 0→1`,
`translateY(8px)→0`, 220ms, `--ease-plotter`. Escalonamento de 30ms por card, **teto de
300ms** — com 20 aplicações o último card não pode demorar 600ms para existir. Roda uma
única vez, na montagem; nunca ao filtrar.

**Varredura do plotter.** No hover ou foco do card, uma linha de 1px atravessa o leito da
esquerda para a direita: 520ms, `--ease-plotter`. Detalhada na spec 04.

### Movimento reduzido

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

A varredura e o escalonamento somem. O card ainda muda de borda e de superfície no hover
— isso é transição de cor, não movimento, e é o que sinaliza a interatividade.

## Layout

- Container: `max-width: 1200px`, padding lateral `clamp(20px, 4vw, 48px)`, centralizado.
- Base de espaçamento: 4px. Use a escala do Tailwind.
- Grid da vitrine: `repeat(auto-fill, minmax(260px, 1fr))`, `gap: 12px`.
- Cards têm borda de 1px em `line` e **nenhuma sombra**. Profundidade vem da luminosidade
  da superfície. Instrumentos não flutuam.

## Critérios de aceite

1. Todos os pares de cor da tabela batem com as razões medidas, verificados com uma
   ferramenta de contraste.
2. Nenhuma ocorrência de `text-pink` em texto abaixo de 18px no código.
3. Nenhum `bg-pink` em superfície. Uma busca por `bg-pink` no `src/` não retorna nada.
4. `Bricolage Grotesque` aparece em exatamente um seletor.
5. Navegar a página inteira com Tab mostra anel de foco visível em todo elemento interativo.
6. Com `prefers-reduced-motion: reduce` ativo no sistema, nenhum elemento se desloca.
7. As três fontes carregam do pacote local, sem requisição para o Google Fonts.
