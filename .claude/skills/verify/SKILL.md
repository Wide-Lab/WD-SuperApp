---
name: verify
description: Project-specific checks for the Central de Aplicações Widelab monorepo (backend FastAPI + frontend Vite/React). Used to verify a change compiles, lints, and passes tests before considering it done.
---

# Verify — Central de Aplicações Widelab

Comandos de verificação estática deste repo. Rodar isso é necessário mas não suficiente —
para mudanças com superfície de execução real (endpoint, tela, interação), acione o fluxo
de verdade também (requisição HTTP real, browser), não só os comandos abaixo.

## Backend (`backend/`)

Só roda o que mudou; se a mudança não tocou em `backend/`, pule esta seção.

```
uv run ruff format --check .
uv run ruff check .
uv run mypy src
```

Não há suíte de testes automatizada no backend hoje (sem `pytest` em `pyproject.toml`).
Critérios de aceite de uma spec de backend (ex.: `POST /auth/login` devolve 401 com senha
errada) são verificados subindo o servidor e fazendo a requisição de verdade:

```
uv run uvicorn src.main:app --reload
curl -i -X POST http://localhost:8000/auth/login -H 'Content-Type: application/json' -d '{"email":"...","password":"..."}'
```

Migration nova: confira que `uv run alembic upgrade head` roda limpo contra um Postgres
vazio (`docker compose up db` sobe um).

## Frontend (`frontend/`)

Só roda o que mudou; se a mudança não tocou em `frontend/`, pule esta seção.

```
npm run typecheck
npm run lint
npm run test
npm run check
```

`npm run test` cobre só funções puras em `lib/` (`fold`, `filterApplications`,
`coordinate`) — sem DOM. Qualquer critério de aceite sobre hover, foco, animação,
responsividade ou `prefers-reduced-motion` **não é coberto por esses comandos** e precisa
ser observado com `npm run dev` e um browser real.

## Antes de considerar uma spec concluída

Rode as seções acima que se aplicam, e depois confira os `Critérios de aceite` da spec um a
um (ver skill `implementar-spec`) — passar lint e typecheck não é o mesmo que a spec estar
implementada corretamente.
