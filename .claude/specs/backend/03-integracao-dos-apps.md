# 03 — Integração dos apps consumidores

**Depende de:** `02-auth.md`.
**Entrega:** o contrato que todo app em `*.widelab.com.br` implementa para consumir a sessão
da central, e o módulo de referência que cada backend copia.

## Objetivo

`02-auth.md` descreve o contrato do lado de quem emite. Esta spec descreve o lado de quem
consome, e existe porque a integração já foi feita quatro vezes: `whatsflow`,
`disparador-mensagens`, `leitor-recibos` e `cupomweb` (front `WD-leitorDadosCupomFiscalFront`
+ back `WD-leitorDadosCupomFiscalBack`). O quinto app não deve redescobrir nada disto.

O app não tem tela de login, não tem tabela de usuário e não guarda senha. Ele lê um cookie,
valida um JWT localmente e sabe quem é o usuário. Só isso.

## Fora de escopo

- **Autorização.** A central só diz *quem é*. Papel e permissão, se um dia existirem, são
  locais ao app — ver "Decisões tomadas" em `../00-visao-geral.md`.
- **Provisionar `app_user` local.** `02-auth.md` prevê isso, mas nenhum dos quatro apps tem
  dado pertencente a usuário (sem `user_id` em lugar nenhum). Criar a tabela agora seria
  escrever schema para um requisito que não existe. Quando um app precisar de dado por dono,
  ele cria a tabela dele, chaveada pelo `sub`.
- **Refresh de token e revogação.** Herdados de `02-auth.md`: não existem. Expira, loga de novo.
- **Apps fora de `*.widelab.com.br`.** O cookie não chega lá. Cronify segue com login próprio.

## O contrato

| | |
|---|---|
| Cookie | `session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Domain=.widelab.com.br` |
| Algoritmo | RS256, chave pública em `https://central.widelab.com.br/api/auth/.well-known/jwks.json` |
| `kid` | `central-1`, presente no header do token e no JWKS |
| Claims | `sub` (UUID), `email`, `name`, `iat`, `exp`, `iss` |
| `iss` | `central.widelab.com.br` — **conferir sempre** |
| Login | `https://central.widelab.com.br/login?redirect=<url absoluta de volta>` |

O navegador manda o cookie sozinho: mesmo domínio pai, nenhuma configuração no front. E
nenhuma chamada de rede à central por request — só a busca do JWKS, que o cliente cacheia.

## Backend: o módulo `central_auth`

Um arquivo autocontido por repo, adaptado à arquitetura de cada um (em `core/`, `app/`, onde
o app já põe infraestrutura). Não é uma lib compartilhada: são quatro repos sem monorepo, e o
contrato acima muda quase nunca.

```python
@lru_cache(maxsize=1)
def _jwk_client() -> PyJWKClient:
    return PyJWKClient(settings.CENTRAL_AUTH_JWKS_URL, cache_keys=True, lifespan=3600)


def get_current_user(request: Request) -> AuthenticatedUser:   # <- `def`, não `async def`
    if settings.AUTH_DEV_BYPASS:
        return AuthenticatedUser(id="dev", email="dev@widelab.com.br", name="Dev")

    token = request.cookies.get("session")
    if not token:
        raise HTTPException(401, "Não autenticado.")
    try:
        key = _jwk_client().get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token, key, algorithms=["RS256"],
            issuer=settings.CENTRAL_AUTH_ISSUER,
            options={"require": ["exp", "iss", "sub"]},
        )
    except (jwt.InvalidTokenError, PyJWKClientError):
        raise HTTPException(401, "Sessão inválida ou expirada.")
    return AuthenticatedUser(id=claims["sub"], email=claims["email"], name=claims["name"])
```

Três detalhes que não são estilo, são correção:

1. **`def`, nunca `async def`.** `PyJWKClient` faz I/O bloqueante (`urlopen`) na primeira
   chamada e a cada expiração do cache. Numa dependency `async`, isso trava o event loop
   inteiro; numa dependency síncrona, o FastAPI a joga no threadpool sozinho.
2. **`algorithms=["RS256"]` explícito.** Sem isso, um token com `"alg": "none"` — ou HS256
   assinado com a chave *pública*, que é pública — passa. É a falha clássica de JWT.
3. **`issuer=` conferido.** Um token válido emitido por outro emissor não é sessão nossa.

`PyJWKClientError` é irmão de `InvalidTokenError`, não subclasse: o `except` precisa dos dois,
senão um JWKS fora do ar vira 500 em vez de 401.

## Backend: as duas rotas de cada app

`GET /api/auth/me` — o front não lê o cookie (é `HttpOnly`), então pergunta ao próprio backend.
Mesma origem: sem CORS, e um app novo não exige redeploy da central.

- **200** `{id, email, name}`
- **401** `{detail, login_url}` — `login_url` vem do env do backend. É o que evita ter a URL da
  central compilada dentro do bundle do front, onde corrigi-la exigiria rebuild.

`POST /api/auth/logout` — apaga o cookie com `domain=.widelab.com.br, path="/"`. Um subdomínio
pode apagar o cookie do domínio pai: sai de um app, sai de todos. É o que "sessão centralizada"
quer dizer, e é intencional.

## Frontend

Um guard na raiz das rotas privadas. Em 401, sai do SPA:

```ts
window.location.assign(`${loginUrl}?redirect=${encodeURIComponent(window.location.href)}`)
```

`window.location`, não o router: a central é outra origem. Toda chamada à API do próprio app vai
com `credentials: 'include'`.

Some a tela de login, o formulário, o storage do token e o header `Authorization` — o cookie
viaja sozinho. Não sobra caminho de autenticação local em app nenhum.

## Env vars

```
CENTRAL_AUTH_JWKS_URL=https://central.widelab.com.br/api/auth/.well-known/jwks.json
CENTRAL_AUTH_ISSUER=central.widelab.com.br
CENTRAL_AUTH_LOGIN_URL=https://central.widelab.com.br/login
AUTH_COOKIE_DOMAIN=.widelab.com.br
AUTH_DEV_BYPASS=false
```

`AUTH_DEV_BYPASS=true` devolve um usuário fixo sem olhar o cookie — o cookie é `Secure` e
`Domain=.widelab.com.br`, então nunca chega em `localhost`. Default `false`, e em produção fica
`false`: ligada, ela é a autenticação inteira desligada.

## Critérios de aceite

Por app:

1. Request sem cookie a uma rota protegida devolve 401 — nunca 200, nunca 500.
2. Request com cookie válido da central devolve 200 e o handler enxerga `sub`, `email`, `name`.
3. Token assinado com outra chave, expirado, com `iss` diferente, ou com `alg: none` devolve 401.
4. JWKS fora do ar devolve 401, não 500.
5. `GET /api/auth/me` sem cookie devolve 401 com `login_url` no corpo.
6. `POST /api/auth/logout` expira o cookie no domínio pai.
7. O front, ao receber 401, vai para a central com `?redirect=` da URL corrente, e volta para
   ela depois do login.
8. Não existe mais no repo: tela de login, endpoint de login, `users.json`, `ADMIN_USERNAME`,
   `ADMIN_PASSWORD`, `SECRET_KEY` de HS256, nem token em `localStorage`.
9. `AUTH_DEV_BYPASS=true` sobe o app localmente sem central.
