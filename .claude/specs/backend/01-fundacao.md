# 01 — Fundação do backend

**Depende de:** nada dentro do backend.
**Entrega:** um projeto FastAPI que sobe, conecta no Postgres, expõe `GET /health`, tipa
e linta — com a estrutura de pastas que todo módulo futuro (catálogo na fase 2, `auth` na
`02-auth.md`) vai seguir.

## Objetivo

Montar o esqueleto do backend da central seguindo a convenção do `receipt-reader/backend`,
com um ajuste combinado: dentro de cada módulo, `adapters/` agrupa `http/` e `db/`, em vez
de `api/` e `infrastructure/` soltos ao lado de `domain/` e `application/`.

## Fora de escopo

Qualquer módulo de negócio. Esta spec entrega a casca — `core`, `api`, a convenção de
módulo — sem nada dentro de `src/modules/`. O catálogo é da fase 2; a autenticação é da
`02-auth.md`.

## Stack

| Papel | Escolha |
|---|---|
| Framework | FastAPI |
| Servidor ASGI | Uvicorn |
| ORM | SQLAlchemy 2 (async) |
| Driver Postgres | `asyncpg` |
| Migrations | Alembic |
| Config | `pydantic-settings` |
| Gerenciador de pacotes | `uv` |
| Qualidade | `ruff` (lint + format), `mypy` |

Python >= 3.14, como no `receipt-reader`.

### Dependências

```
fastapi[standard]
sqlalchemy[asyncio]
asyncpg
alembic
pydantic-settings
python-dotenv
```

Dev:

```
ruff
mypy
```

## Estrutura de pastas

```
backend/
  alembic/
    versions/
    env.py
  src/
    main.py                # cria o FastAPI, lifespan, CORS, monta rotas
    api/
      routes.py             # mount_routes(app) — um include_router por módulo
    core/
      config.py             # Config (pydantic-settings), get_config()
      database.py           # engine + session factory async
      security.py           # hash de senha e JWT — conteúdo chega em 02-auth.md
      exceptions.py         # exceções de domínio compartilhadas entre módulos
      logging.py
    modules/
      <modulo>/
        domain/              # entidades e regras puras — sem import de framework
        application/
          use_cases/
          dtos/
        adapters/
          db/                 # models.py (ORM) + repository.py
          http/
            routes.py
            dependencies/
              providers.py     # factories injetadas via Depends
              types.py         # Annotated[...] compartilhados
  pyproject.toml
  alembic.ini
  Dockerfile
  .env.example
```

**Regra herdada, com o ajuste combinado:** dentro de um módulo, tudo que fala com o mundo
externo (HTTP, banco) mora em `adapters/`. `domain/` não importa nada de `application/`,
`adapters/` ou de FastAPI/SQLAlchemy. `application/` importa `domain/`, nunca `adapters/`
diretamente — recebe repositórios como argumento, injetados pelas dependencies de
`adapters/http/`.

## `src/core/config.py`

```python
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = []


@lru_cache(maxsize=1)
def get_config() -> Config:
    return Config()  # type: ignore
```

## `src/core/database.py`

Igual ao `receipt-reader`: uma classe `_DataBase` com `init()`, `engine`,
`create_session()` e `session_context()` como dependency assíncrona
(`AsyncGenerator[AsyncSession]`). Reaproveitar o arquivo quase sem alteração.

## `src/main.py`

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import mount_routes
from src.core.config import get_config
from src.core.database import db


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.init()
    yield


app = FastAPI(lifespan=lifespan, root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_config().CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


mount_routes(app)
```

`root_path="/api"` reproduz o contrato já assumido pelo frontend: a migração da fase 2
troca `fetch('/apps.json')` por `fetch('/api/apps', { credentials: 'include' })` — ver
`frontend/03-catalogo-de-aplicacoes.md`.

**`allow_origins` nunca pode ser `"*"` aqui**, diferente do `receipt-reader`. A fase 3
depende de cookie de sessão (`allow_credentials=True`), e o navegador rejeita a combinação
de origem coringa com credenciais. `CORS_ORIGINS` lista explicitamente os subdomínios de
`widelab.com.br` autorizados, via `.env`.

## Schema via Alembic, não `create_all`

O `receipt-reader` cria tabelas com `Base.metadata.create_all` dentro do `lifespan`, além
de manter migrations. Aqui, só migrations: toda mudança de schema nasce como
`uv run alembic revision --autogenerate -m "..."`, e o deploy roda
`uv run alembic upgrade head` antes de subir o servidor — mesmo passo que já existe no
`Dockerfile` do `receipt-reader`, mas como único caminho, não como reforço.

## Scripts (via `uv run`)

| Comando | Ação |
|---|---|
| `uvicorn src.main:app --reload` | sobe em desenvolvimento |
| `ruff format .` | formata |
| `ruff check .` | lint |
| `mypy src` | typecheck |
| `alembic revision --autogenerate -m "msg"` | gera migration |
| `alembic upgrade head` | aplica migrations |

## Critérios de aceite

1. `uv run uvicorn src.main:app --reload` sobe e `GET /health` responde `{"status": "ok"}`.
2. `uv run alembic upgrade head` roda sem erro contra um Postgres vazio.
3. `uv run ruff check .` e `uv run mypy src` passam num checkout limpo.
4. `src/modules/` existe e está vazio — nenhum módulo de negócio nesta spec.
5. Adicionar um módulo novo seguindo `domain/`, `application/`, `adapters/{db,http}` não
   exige tocar em `src/core`, além de uma linha em `mount_routes`.
