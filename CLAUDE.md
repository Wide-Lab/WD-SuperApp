# Central de Aplicações Widelab

Vitrine interna que lista as aplicações da Widelab e, a partir da fase 3, é o ponto único
de autenticação para tudo em `*.widelab.com.br`. Monorepo: `backend/` (FastAPI) e
`frontend/` (Vite + React), orquestrados por `docker-compose.yml` atrás de um nginx.

## A fonte da verdade é `.claude/specs/`, não este arquivo

Antes de implementar qualquer coisa não trivial, leia `.claude/specs/00-visao-geral.md` e a
spec numerada relevante. Elas registram não só o que fazer, mas **por que**, o que foi
decidido não fazer ainda, e critérios de aceite explícitos. Este `CLAUDE.md` é um mapa de
navegação rápida — quando ele e uma spec discordarem, a spec vence.

Índice de specs:

| Frontend | Backend |
|---|---|
| `01-fundacao.md` — scaffold, tooling | `01-fundacao.md` — scaffold FastAPI, Postgres async |
| `02-design-system.md` — tokens, tipografia, foco, motion | `02-auth.md` — sessão JWT RS256, cookie, JWKS |
| `03-catalogo-de-aplicacoes.md` — `apps.json`, schema | |
| `04-vitrine.md` — shell, grid, card, estados | |
| `05-busca.md` — filtro, `?q=`, destaque, a11y | |
| `06-detalhe-da-aplicacao.md` — botão de expandir, `<dialog>` de detalhe | |

**Use a skill `nova-spec` para propor uma spec nova e `implementar-spec` para executar uma
existente** — ambas seguem o formato da casa (`Depende de` / `Entrega` / `Objetivo` / `Fora
de escopo` / `Critérios de aceite`).

## Estado atual — verifique o código, não só a tabela de fases

`00-visao-geral.md` descreve 3 fases (vitrine estática → catálogo via API → auth
centralizada) e, na tabela, só a fase 1 está "em especificação". **Na prática o código já
está à frente da tabela**: o módulo `auth` do backend (JWT RS256, cookie, JWKS, CLI de
criação de usuário) e a tela `/login` do frontend já existem e estão implementados segundo
`backend/02-auth.md`. `frontend/public/apps.json` também já diverge do conteúdo semeado na
spec 03 (apps e URLs reais, não mais os placeholders). Trate a tabela de fases como
direção, não como status — confirme sempre lendo `git log` e o código antes de assumir que
algo "ainda não foi feito".

## Arquitetura

### Backend — hexagonal por módulo (`backend/src/`)

```
core/           config.py (pydantic-settings), database.py (engine async + session factory),
                security.py (Argon2id + JWT RS256), exceptions.py, logging.py
api/routes.py   mount_routes(app) — um include_router por módulo
modules/<mod>/
  domain/           entidades e regras puras. NUNCA importa framework, application ou adapters.
  application/
    use_cases/       um caso de uso = uma classe com .execute(); só use case se houver regra de
                      negócio (ver "Não existe X UseCase" em backend/02-auth.md)
    dtos/             requests.py, responses.py (Pydantic)
  adapters/
    db/               models.py (SQLAlchemy ORM) + repository.py
    http/
      routes.py
      dependencies/   providers.py (factories via Depends), types.py (Annotated compartilhados)
```

Regra que não se negocia: `application/` recebe repositórios injetados via `Depends`,
nunca importa `adapters/` diretamente. Adicionar um módulo novo não deve tocar em
`src/core`, só ganhar uma linha em `mount_routes`.

Schema **só** via Alembic (`uv run alembic revision --autogenerate`) — sem
`Base.metadata.create_all`, nem em dev. Tabelas usam prefixo `T0xx` (`T001_USERS`).

### Frontend — por feature (`frontend/src/`)

```
routes/                 rotas por arquivo (TanStack Router), __root.tsx monta o AppShell
components/ui/          só shadcn — nada de domínio aqui
components/layout/      casca da página (app-shell, masthead)
features/<domínio>/     schema.ts (zod) → types.ts (z.infer, nunca à mão) → api.ts →
                         use-<algo>.ts (TanStack Query) → components/ → lib/ (funções puras testadas)
```

Alias `#/*` → `./src/*`, declarado em `package.json` **e** `tsconfig.json` (Vite e TS
resolvem separado). Componente de domínio mora em `features/<domínio>/components`, nunca
solto em `components/`.

## Convenções que valem para o repo inteiro

- E-mail é sempre `CITEXT` no banco — nunca `String` + `.lower()` espalhado.
- Senha: Argon2id (`argon2-cffi`), nunca bcrypt. Sessão: JWT **RS256** assinado só pela
  central; cada app consumidor valida localmente com a chave pública do
  `/auth/.well-known/jwks.json` — nunca HS256, nunca uma chamada de rede por request.
  Detalhe completo em `backend/02-auth.md`.
- A central autentica, não autoriza. Não introduza papel/permissão no schema dela — ver
  "Decisões tomadas" em `00-visao-geral.md`.
- Tipos derivados de schema (`z.infer`), nunca escritos à mão em paralelo ao Zod.
- `id` de aplicação é kebab-case e é chave de várias coisas ao mesmo tempo: chave React,
  coordenada do plotter (`features/applications/lib/coordinate.ts`), e futura PK. Não
  adicione `category`, `status`, `featured`, `tags` ou `order` ao catálogo sem uma spec
  própria — está deliberadamente fora de escopo.

## Design system — regras rígidas (detalhe em `frontend/02-design-system.md`)

Sete cores, nenhuma a mais: `ink #0C0E12` (fundo), `panel #14171E`, `panel-hover #171B23`,
`line #232833`, `mute #8A90A0`, `paper #E8EAF0` (texto — nunca branco puro), `pink
#ED1D54`, `pink-soft #FF7A9C`.

- **`pink` marca posição e foco, nunca superfície**: coordenada, varredura, anel de foco,
  destaque de busca. Proibido `bg-pink` e botão preenchido de rosa.
- **`pink` é proibido em texto abaixo de 18px** (contraste 4,5:1, raspa o AA). Use
  `pink-soft` em texto pequeno.
- Cards: borda 1px `line`, **sem sombra**, sem `translateY` no hover — "instrumentos não
  flutuam". Profundidade vem de luminosidade (`panel` → `panel-hover`), não de blur.
- Display (`Bricolage Grotesque`) só na palavra "Central" do masthead — em nenhum outro
  lugar.
- Duas animações no app inteiro: entrada do grid (uma vez, na montagem, nunca ao filtrar) e
  varredura do plotter no hover/foco. Ambas desligam com `prefers-reduced-motion: reduce`.

## Comandos

Backend (de `backend/`, via `uv`):

| Comando | Ação |
|---|---|
| `uv run uvicorn src.main:app --reload` | sobe em dev (`:8000`) |
| `uv run ruff format .` | formata |
| `uv run ruff check .` | lint |
| `uv run mypy src` | typecheck |
| `uv run alembic revision --autogenerate -m "msg"` | gera migration |
| `uv run alembic upgrade head` | aplica migrations |
| `uv run python -m src.modules.auth.cli create-user --email … --name …` | cria usuário (pede senha via prompt) |

Frontend (de `frontend/`, via `npm`):

| Comando | Ação |
|---|---|
| `npm run dev` | sobe em dev (`:3000`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `npm run format` | ESLint / Prettier + ESLint `--fix` |
| `npm run test` | Vitest (só lib puras, sem DOM) |
| `npm run build` | typecheck + build de produção |

Stack completa (Postgres + backend + frontend + nginx): `docker compose up --build`, exposta
em `:8105`. nginx roteia `/api/*` → backend (prefixo removido) e todo o resto → frontend
estático. O container do backend roda `alembic upgrade head` e
`auth.cli create-default-user` (a partir de `AUTH_DEFAULT_USER_*` no `.env`, se preenchidas)
antes de subir o Uvicorn — não precisa rodar isso manualmente ao fazer deploy.

Para dev local sem Docker: só o Postgres precisa do compose (`docker compose up db`); backend
e frontend rodam nativamente com os comandos acima, apontando `DATABASE_URL` para
`localhost:5432`.

## O que não fazer

- Não crie tabela fora de migration, não use `create_all`.
- Não adicione um oitavo token de cor nem justifique um novo com "só dessa vez".
- Não adicione rate limiting, revogação de sessão antes da expiração, ou
  `POST /auth/register` — são "fora de escopo" explícito em `backend/02-auth.md`, cada um
  ganha spec própria se um dia for necessário.
- Não troque `fetch('/apps.json')` por outra fonte de dados fora de
  `features/applications/api.ts` — é o único ponto que a fase 2 vai reescrever, e o resto
  do app não pode saber de onde os dados vêm.
- Não use `<div onClick>` para o card de aplicação — é um `<a href>` de verdade (Ctrl+clique,
  Tab, leitor de tela, tudo de graça).

## Skills deste projeto

- **`nova-spec`** — escreve uma spec nova em `.claude/specs/` no formato da casa.
- **`implementar-spec`** — implementa uma spec existente e confere cada critério de aceite.
- **`verify`** (usada pela skill global `/verify`) — roda ruff/mypy no backend e
  typecheck/lint/test no frontend.
- **`run`** (usada pela skill global `/run`) — sobe o ambiente local, via Docker completo
  ou standalone.
