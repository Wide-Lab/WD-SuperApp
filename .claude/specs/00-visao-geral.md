# Central de Aplicações Widelab — Visão geral

> Documento raiz. Registra o que estamos construindo, em que ordem, e quais decisões
> já foram tomadas — inclusive as que decidimos **não** tomar ainda.
> Última revisão: 2026-07-10.

## O que é

Uma aplicação web que lista todas as aplicações internas da Widelab. Cada aplicação
aparece como um card com imagem, título e descrição, e o card inteiro é um link para
a aplicação.

No futuro, a central também será o ponto único de autenticação das aplicações
hospedadas em subdomínios de `widelab.com.br`. Hoje, nenhuma delas tem lógica de
permissões, o que torna a centralização viável sem um modelo de autorização.

## Fases

| Fase | Escopo | Estado |
|---|---|---|
| **1** | Vitrine: grid de cards lendo um JSON estático. Sem autenticação. | **Em especificação** |
| 2 | Backend FastAPI + Postgres: o catálogo passa a vir de `GET /api/apps`. | Não iniciada |
| 3 | Autenticação centralizada por e-mail e senha, consumida pelas aplicações em `*.widelab.com.br`. | Não iniciada |

O faseamento é desenhado para que a fase 2 **não toque em nenhuma tela**: a fase 1 já
carrega o catálogo de forma assíncrona, com estados de carregando, erro e vazio. A
migração troca o corpo de uma única função. Ver `frontend/03-catalogo-de-aplicacoes.md`.

## Decisões tomadas

**Frontend é uma SPA em Vite + React 19 + TanStack Router.** Sem SSR. Quem vai emitir o
cookie de sessão na fase 3 é o FastAPI, então a central não precisa de servidor próprio.
Escolhemos o mesmo ecossistema do `receipt-reader`, menos o TanStack Start — evita a
dependência de `nitro-nightly` sem criar uma segunda cultura de frontend na casa.

**O SSO da fase 3 cobre só `*.widelab.com.br`.** Um cookie de sessão com
`Domain=.widelab.com.br` é enviado automaticamente para qualquer subdomínio, mas não
atravessa domínios diferentes — é restrição do navegador, não de configuração. Aplicações
em domínio próprio (hoje, só o Cronify, em `app.cronify.com.br`) ficam fora da fase 3 e
continuam com o login que já têm. Se um dia isso precisar mudar, o caminho é um fluxo de
redirect com código de uso único trocado por sessão no backend de cada app — um OIDC
enxuto. Não está planejado agora.

**A central autentica, não autoriza.** Ela expõe só identidade (`id`, `email`, `name`)
via cookie de sessão + `GET /auth/me`. Nenhum modelo de permissão ou papel entra no schema
dela. Cada aplicação trata autorização localmente — provisiona seu próprio registro (ex.:
`app_user`) na primeira vez que recebe aquele `user_id`, com as regras de negócio que
fizerem sentido pra ela. Isso evita acoplar a central às regras de cada app, que já
sabemos que serão diferentes entre si.

**Autenticação por e-mail e senha, gerenciada pela própria central.** Implica, na fase 3:
hash de senha, política de senha e fluxo de recuperação. Nada disso existe na fase 1.

**O catálogo é um JSON estático servido de `public/apps.json`,** validado com Zod em
runtime e acompanhado de um JSON Schema irmão que dá autocomplete no editor.

**Tema escuro, sem alternância.** `#0C0E12` é quase preto: a paleta já pede uma interface
escura, e `#ED1D54` rende muito mais sobre ela.

**A única funcionalidade além do grid é a busca.** Nada de categoria, status, destaque
ou ordenação. Cada um desses campos ganha uma spec própria no dia em que fizer falta.

**Direção visual: "bancada".** A Widelab constrói ferramentas que *rodam* — agendadores,
RPAs, leitores de documento. A central é o índice de uma bancada de laboratório, não uma
prateleira de produtos. Consequências concretas em `frontend/02-design-system.md` e
`frontend/04-vitrine.md`:

- Cabeçalho assimétrico e factual, sem hero de marketing. O conteúdo mais característico
  da página são as próprias aplicações, então o grid começa quase imediatamente.
- Cards com borda de 1px e **sem sombra**. Profundidade vem de luminosidade, não de blur.
- **Assinatura:** quando um app não tem imagem, o espaço dela vira um campo de papel
  milimetrado com o ícone ao centro e uma marca de coordenada em `#ED1D54` cuja posição é
  derivada do `id` — fixa e única por aplicação. No hover, uma linha rosa atravessa o
  campo como o cabeçote de um plotter.
- **Regra do acento:** o rosa marca posição e foco, nunca superfície. Coordenada,
  varredura, anel de foco e destaque de busca. Em nenhum fundo, em nenhum botão preenchido.

## Decisões adiadas

Estão aqui para não serem redecididas do zero daqui a três semanas.

**Hospedagem definitiva de cada aplicação.** As `url` do `apps.json` que hoje não estão
em `*.widelab.com.br` (caso do Cronify) são **placeholders** e precisam ser corrigidas. A
estratégia de SSO pra fora desse domínio (ver "Decisões tomadas") só entra em pauta se
isso mudar.

## Convenções herdadas

Da casa, não inventadas aqui:

- **Frontend** (`receipt-reader/frontend`): Vite, React 19, TypeScript strict, Tailwind v4,
  shadcn/Radix, TanStack Query, fonte Geist, alias de import `#/*`, ESLint + Prettier.
- **Backend** (`receipt-reader/backend`, para a fase 2): `src/core`, `src/modules/<módulo>`,
  `src/api`, Alembic, `uv`, `ruff format`, `ruff check`, Postgres async, arquitetura
  hexagonal em camadas.

## Índice de specs

Implementáveis nesta ordem. Cada uma declara suas dependências.

1. [`frontend/01-fundacao.md`](frontend/01-fundacao.md) — scaffold, tooling, estrutura de pastas.
2. [`frontend/02-design-system.md`](frontend/02-design-system.md) — tokens, tipografia, foco, motion.
3. [`frontend/03-catalogo-de-aplicacoes.md`](frontend/03-catalogo-de-aplicacoes.md) — `apps.json`, schema, camada de dados.
4. [`frontend/04-vitrine.md`](frontend/04-vitrine.md) — shell, grid, card, estados.
5. [`frontend/05-busca.md`](frontend/05-busca.md) — filtro, `?q=`, destaque, acessibilidade.

Backend (fases 2 e 3):

1. [`backend/01-fundacao.md`](backend/01-fundacao.md) — scaffold FastAPI, estrutura de módulo, Postgres async.
2. [`backend/02-auth.md`](backend/02-auth.md) — sessão via JWT, cookie compartilhado, contrato para os outros apps.

O catálogo via `GET /api/apps` (fase 2) ainda não tem spec própria — entra como módulo
`applications` seguindo a convenção de `backend/01-fundacao.md`.
