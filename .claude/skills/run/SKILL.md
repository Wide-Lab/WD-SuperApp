---
name: run
description: Project-specific instructions for launching the Central de Aplicações Widelab app locally (backend FastAPI + frontend Vite + Postgres), full Docker stack or standalone dev servers.
---

# Rodar o projeto localmente

Duas formas de subir o app. Prefira **standalone** ao iterar em código — tem hot reload nas
duas pontas. Use **stack completa** para reproduzir o comportamento de produção (nginx
roteando `/api`, build estático do frontend, migrations rodando no start do container).

## Standalone (hot reload, uso do dia a dia)

1. Sobe só o Postgres: `docker compose up db` (fica ocupando o terminal; rode em background
   ou outro terminal).
2. Backend, de `backend/`: confirme `.env` a partir de `.env.example` (precisa de
   `DATABASE_URL` apontando pra `localhost:5432`, e um par de chaves RSA em
   `AUTH_JWT_PRIVATE_KEY`/`AUTH_JWT_PUBLIC_KEY` — gerar com `openssl genrsa -out
   private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem` se ainda não
   existir). Depois:
   ```
   uv run alembic upgrade head
   uv run uvicorn src.main:app --reload
   ```
   Sobe em `http://localhost:8000`. `GET /health` confirma que está no ar.
3. Frontend, de `frontend/`: `npm run dev`, sobe em `http://localhost:3000`.
4. Sem nginx nessa forma, mas `vite.config.ts` já tem um proxy de dev: requisições do
   frontend para `/api/*` são reescritas (prefixo removido) e encaminhadas para
   `localhost:8000`. Não precisa de configuração extra; para testar um endpoint isolado,
   acesse o backend diretamente em `localhost:8000` via `curl`.

## Stack completa (Docker, mais fiel à produção)

Da raiz do repo:

```
docker compose up --build
```

Sobe Postgres + backend + frontend + nginx. App completo em `http://localhost:8105`. O
container do backend roda `alembic upgrade head` e (se `AUTH_DEFAULT_USER_EMAIL` e
`AUTH_DEFAULT_USER_PASSWORD` estiverem preenchidos no `.env` da raiz) cria o usuário padrão
antes de subir o Uvicorn — sem passo manual.

Para reconstruir só um serviço depois de uma mudança: `docker compose up --build backend`
ou `docker compose up --build frontend`.

## Confirmando que subiu

- `curl http://localhost:8000/health` (standalone) — `{"status": "ok"}`.
- `curl http://localhost:8105/api/health` (stack completa, via nginx).
- Abrir a URL correspondente no browser e checar o console por erro.

## Variáveis de ambiente necessárias

`.env` da raiz (Postgres) e `backend/.env` (app) — ambos têm `.env.example` ao lado.
Standalone lê `backend/.env` diretamente; a stack Docker lê `.env` da raiz para as
credenciais do Postgres e injeta `DATABASE_URL` via `docker-compose.yml`.
