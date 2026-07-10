# 02 — Autenticação

**Depende de:** `01-fundacao.md`.
**Entrega:** o módulo `src/modules/auth`, a tabela `T001_USERS`, e o contrato que os
outros apps em `*.widelab.com.br` consomem para validar sessão.

## Objetivo

A central autentica; ela não autoriza. Este módulo expõe só identidade — `id`, `email`,
`name` — via cookie de sessão e `GET /auth/me`. Nenhum modelo de permissão ou papel entra
no schema. Autorização é responsabilidade de cada app, localmente, a partir do `id`
recebido. Ver "Decisões tomadas" em `../00-visao-geral.md`.

## Fora de escopo

- **Fluxo de recuperação de senha.** Ganha uma spec própria quando for implementado.
- **Revogação de sessão antes da expiração.** Aceito deliberadamente — ver "Sessão sem
  estado" abaixo.
- **Rate limiting no login.** Não há proteção contra força bruta nesta spec. Se o volume
  de uso justificar, entra como spec própria (ex.: limite por IP/e-mail via Redis).
- **Cadastro público (`POST /auth/register`).** Ferramentas internas não têm auto-cadastro
  — ver "Provisionamento de usuário".
- **Qualquer app fora de `*.widelab.com.br`.** Fica fora do SSO da fase 3 por decisão já
  registrada; mantém login próprio.

## Sessão sem estado

Sessão é um JWT assinado com **RS256** (par assimétrico), não HS256. A central guarda a
chave privada e só ela assina, no login. A chave pública é publicada em
`GET /auth/.well-known/jwks.json` — cada app em `*.widelab.com.br` busca essa chave (com
cache) e valida o token **localmente**, sem chamar a central a cada request. Só o login
depende da central estar no ar; a validação, não.

Consequência aceita: **logout não invalida o token em si**, só apaga o cookie do
navegador que chamou `/auth/logout`. Um token copiado antes do logout continua válido até
expirar. Para manter essa janela pequena sem reintroduzir estado, o token dura **7 dias**
e não há renovação silenciosa — expira, o usuário loga de novo. É uma env var
(`AUTH_TOKEN_TTL_SECONDS`), não uma decisão estrutural: se a fricção incomodar, sobe o
valor sem redesenhar nada.

### Claims

```json
{
  "sub": "<user_id>",
  "email": "user@widelab.com.br",
  "name": "Nome Sobrenome",
  "iat": 1752105600,
  "exp": 1752710400,
  "iss": "central.widelab.com.br"
}
```

`iss` deixa explícito quem emitiu o token — importa se um dia houver mais de um emissor.

### Chaves

Geradas uma vez, fora do código:

```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

Carregadas via env var (conteúdo PEM direto, não caminho de arquivo — evita montar volume
em contêiner):

```
AUTH_JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
AUTH_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
AUTH_TOKEN_TTL_SECONDS=604800
AUTH_COOKIE_DOMAIN=".widelab.com.br"
```

Rotacionar a chave invalida instantaneamente todos os tokens emitidos — é o mecanismo de
"revogar tudo" de emergência, mesmo sem lista de revogação.

## Cookie

```
Set-Cookie: session=<jwt>; Domain=.widelab.com.br; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

Nota sobre `SameSite`: subdomínios de `widelab.com.br` são o **mesmo site** para efeito de
`SameSite` (que opera sobre domínio registrável, não sobre host completo) — navegar de
`central.widelab.com.br` para `quickfind.widelab.com.br` não é cross-site. `Lax` é
escolhido por segurança defensiva, não porque `Strict` quebraria o fluxo.

## `src/core/security.py`

Estende a fundação com o que a `01-fundacao.md` deixou como placeholder:

```python
import jwt  # PyJWT
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def create_access_token(claims: dict, expires_in: int) -> str: ...
def decode_access_token(token: str) -> dict: ...  # levanta jwt.InvalidTokenError
def get_jwks() -> dict: ...  # chave pública em formato JWK Set
```

Argon2id em vez de bcrypt: é a recomendação atual da OWASP, mais resistente a cracking
por GPU.

## Domínio: `src/modules/auth/domain/entities.py`

```python
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True)
class User:
    id: UUID
    email: str
    name: str
    password_hash: str
    is_active: bool
    created_at: datetime


@dataclass(frozen=True, slots=True)
class AuthenticatedUser:
    """O que sai do token e do /auth/me — nunca carrega password_hash."""
    id: UUID
    email: str
    name: str
```

`InvalidCredentialsError` entra em `src/core/exceptions.py`, ao lado de
`ResourceNotFoundError` (convenção já existente no `receipt-reader`).

## Persistência: `src/modules/auth/adapters/db/`

`models.py`:

```python
class UserORM(Base):
    __tablename__ = "T001_USERS"

    id: Mapped[UUID] = mapped_column(UUID, primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(CITEXT, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

`CITEXT` (extensão do Postgres) em vez de `String` puro: e-mail é comparado
case-insensitive sem espalhar `lower()` em toda query. A primeira migration precisa
habilitar a extensão:

```python
op.execute("CREATE EXTENSION IF NOT EXISTS citext")
```

`repository.py` — `UserRepository(session)` com `get_by_email`, `get_by_id`, `create`,
seguindo o mesmo formato de `_to_domain` que o `ReceiptRepository` já usa.

## Aplicação: `src/modules/auth/application/use_cases/login.py`

```python
class LoginUseCase:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def execute(self, email: str, password: str) -> AuthenticatedUser:
        user = await self.repository.get_by_email(email)
        if user is None or not user.is_active or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()
        return AuthenticatedUser(id=user.id, email=user.email, name=user.name)
```

**Não existe `GetCurrentUserUseCase`.** Resolver o usuário atual é decodificar o JWT do
cookie — nenhuma consulta ao banco envolvida, que é justamente o ganho de usar JWT em vez
de sessão opaca. Isso mora direto na dependency HTTP, não numa camada de aplicação.

**Não existe `LogoutUseCase`.** Logout não tem regra de negócio — é apagar um cookie.
Fica direto na rota.

## HTTP: `src/modules/auth/adapters/http/`

`dependencies/providers.py`:

```python
def get_user_repo(session: AsyncSession = Depends(db.session_context)) -> UserRepository:
    return UserRepository(session)


def get_current_user(request: Request) -> AuthenticatedUser:
    token = request.cookies.get("session")
    if token is None:
        raise HTTPException(status_code=401, detail="Não autenticado.")
    try:
        claims = decode_access_token(token)
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")
    return AuthenticatedUser(id=UUID(claims["sub"]), email=claims["email"], name=claims["name"])
```

`dependencies/types.py`:

```python
CurrentUserDependency = Annotated[AuthenticatedUser, Depends(get_current_user)]
UserRepoDependency = Annotated[UserRepository, Depends(get_user_repo)]
```

`routes.py`:

```python
router = APIRouter()


@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest, response: Response, user_repo: UserRepoDependency) -> UserResponse:
    try:
        user = await LoginUseCase(user_repo).execute(data.email, data.password)
    except InvalidCredentialsError:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")

    config = get_config()
    token = create_access_token(
        claims={"sub": str(user.id), "email": user.email, "name": user.name},
        expires_in=config.AUTH_TOKEN_TTL_SECONDS,
    )
    response.set_cookie(
        "session", token,
        domain=config.AUTH_COOKIE_DOMAIN, path="/",
        httponly=True, secure=True, samesite="lax",
        max_age=config.AUTH_TOKEN_TTL_SECONDS,
    )
    return UserResponse(id=user.id, email=user.email, name=user.name)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    response.delete_cookie("session", domain=get_config().AUTH_COOKIE_DOMAIN, path="/")


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUserDependency) -> UserResponse:
    return UserResponse(id=current_user.id, email=current_user.email, name=current_user.name)


@router.get("/.well-known/jwks.json")
async def jwks() -> dict:
    return get_jwks()
```

`mount_routes` ganha uma linha: `app.include_router(auth_router, prefix="/auth", tags=["Auth"])`.

`/auth/.well-known/jwks.json` fica sob o prefixo do módulo, não na raiz do domínio — não
estamos implementando descoberta OIDC completa, só publicando uma chave num formato
reconhecível. Nenhum app precisa adivinhar a URL: ela é combinada uma vez, na integração.

## Provisionamento de usuário

Sem endpoint HTTP. A central não tem modelo de autorização — não existe um papel "admin"
que possa validamente proteger um `POST /auth/users`, e criar esse papel só para esse fim
contradiria a decisão de manter a central sem autorização. A criação de usuário é um
comando de linha, rodado por quem tem acesso à infra:

```
uv run python -m src.modules.auth.cli create-user --email a@widelab.com.br --name "Nome"
```

Pede a senha via `getpass` (nunca como argumento visível em `ps`/histórico do shell), valida
mínimo de 8 caracteres, chama `UserRepository.create` com `hash_password(senha)` direto —
sem passar por HTTP.

## Como os outros apps consomem

Cada app em `*.widelab.com.br`, no próprio backend:

1. Busca `GET https://central.widelab.com.br/api/auth/.well-known/jwks.json` uma vez,
   cacheia a chave pública (TTL de algumas horas — permite rotação sem redeploy manual em
   cada app).
2. Lê o cookie `session` (o navegador já manda automaticamente, mesmo domínio pai).
3. Valida localmente: assinatura RS256 com a chave pública, `exp` não expirado, `iss ==
   "central.widelab.com.br"`.
4. Usa `sub` como identificador do usuário — provisiona um registro local (`app_user` ou
   equivalente) no primeiro login visto, com as regras de autorização daquele app.

Nenhuma chamada de rede à central por request — só a busca da JWKS, esporádica.

## Critérios de aceite

1. `POST /auth/login` com credencial válida devolve 200, `Set-Cookie` presente, corpo
   `{id, email, name}`.
2. `POST /auth/login` com senha errada devolve 401 e não seta cookie.
3. `GET /auth/me` com cookie válido devolve o usuário; sem cookie, ou com cookie expirado
   ou adulterado, devolve 401.
4. `POST /auth/logout` devolve 204 e o `Set-Cookie` da resposta expira o cookie.
5. `GET /auth/.well-known/jwks.json` devolve a chave pública em formato JWK, sem exigir
   autenticação.
6. Um token assinado com uma chave privada diferente da publicada é rejeitado por
   `decode_access_token`.
7. `uv run alembic upgrade head` cria a extensão `citext` e a tabela `T001_USERS`, com
   `email` único case-insensitive.
8. O CLI cria um usuário com `password_hash` no banco — nunca a senha em texto puro.
