# 04 — Exemplos da aplicação

**Depende de:** `01-fundacao.md`.
**Entrega:** a tabela `T003_APPLICATION_EXAMPLES` e o campo `examples` no contrato de
`/api/apps` — leitura e escrita.

## Objetivo

Várias aplicações da casa têm material de apoio: uma pasta do Drive com exemplos de entrada,
outra com o que o app devolve, uma planilha modelo. Hoje esse link não mora em lugar nenhum —
circula em conversa, e quem chega depois não acha. A central passa a ser onde ele mora, ao lado
da aplicação que ele explica.

O módulo `applications` foi implementado sem spec própria (ver a última linha do índice de
`../00-visao-geral.md`). Esta spec toma o módulo como ele está hoje em
`src/modules/applications/` e só o estende.

## Fora de escopo

- **Guardar os arquivos.** A central guarda o link; quem guarda arquivo é o Drive, que já
  resolve versão, permissão e compartilhamento. O único upload do módulo continua sendo a capa
  da aplicação.
- **Verificar se o link abre, ou se quem clicou tem acesso a ele.** Exigiria credencial de
  Google na central e um job periódico de verificação. Link quebrado é problema de cadastro, e
  o cadastro é de quem publicou o app.
- **Classificar o exemplo (`kind`, `type`, `provider`).** Seria coluna redundante: a origem sai
  do hostname da própria `url`, derivada no frontend — ver
  `../frontend/07-exemplos-da-aplicacao.md`.
- **Reordenar arrastando.** `position` existe e é respeitada, mas quem a define é a ordem das
  linhas no formulário.
- **Buscar por exemplo.** `filterApplications` continua olhando só nome e descrição
  (`../frontend/05-busca.md`).
- **`category`, `tags`, `status`, `featured`, `order`.** Continuam vetados por
  `../00-visao-geral.md` — ver a seção seguinte, que explica por que `examples` não abre
  precedente para eles.

## Por que este campo entra e aqueles não

Os campos vetados na visão geral têm todos a mesma natureza: são **metadado de organização da
vitrine**. Categoria, status, destaque e ordenação mudam como o grid agrupa, filtra e ordena —
e cada um exige antes uma decisão de produto sobre taxonomia (quais categorias existem? quem
decide o que é destaque?). Essa decisão é justamente o que foi adiado.

`examples` não é disso. É conteúdo da própria aplicação, aparece só no segundo nível (o
`<dialog>` de detalhe) e não toca em ordenação, agrupamento nem busca. O grid continua
exatamente como está.

A regra que continua valendo, e que esta spec não fura: **nada que altere a ordenação, o
agrupamento ou o filtro da vitrine entra sem spec própria.**

## O modelo

`T003_APPLICATION_EXAMPLES`:

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | `UUID` PK | `default=uuid4`, como em `T001_USERS` |
| `application_id` | `String` FK → `T002_APPLICATIONS.id` | `ondelete="CASCADE"`, `index=True` |
| `label` | `String(40)` | `nullable=False` |
| `url` | `String(2048)` | `nullable=False` |
| `position` | `Integer` | `nullable=False`, base 0, define a ordem de leitura |
| `created_at` | `DateTime(timezone=True)` | `server_default=func.now()` |

Sem `updated_at`: a linha nunca é editada no lugar. Cada salvamento da aplicação reescreve a
coleção inteira (ver "Escrita é substituição"), então uma data de atualização mentiria — diria
"agora" para um exemplo em que ninguém tocou.

**Por que tabela e não uma coluna `JSONB` em `T002_APPLICATIONS`.** A coluna seria mais curta de
escrever e o Postgres não validaria nada dentro dela: nem o tamanho de `label`, nem o tipo de
`position`, nem que `url` existe. A tabela custa uma migration e devolve integridade
referencial, `CASCADE` de verdade, e a possibilidade de o exemplo ganhar um atributo próprio
depois sem reescrever documento nenhum.

**O `CASCADE` precisa existir nos dois níveis.** No banco, via `ondelete="CASCADE"` na
`ForeignKey`. No ORM, via `relationship(..., cascade="all, delete-orphan",
passive_deletes=True)` — `ApplicationRepository.delete` usa `session.delete(orm)`, que é deleção
pelo ORM: sem `cascade` no relacionamento, o SQLAlchemy tentaria órfãs com `application_id =
NULL` e bateria no `NOT NULL`; sem `passive_deletes=True`, ele carregaria todos os filhos só
para apagá-los um a um.

**A entidade de domínio não conhece `position`.** Ordem é a ordem da tupla:

```python
@dataclass(frozen=True, slots=True)
class ApplicationExample:
    label: str
    url: str


@dataclass(frozen=True, slots=True)
class Application:
    ...
    examples: tuple[ApplicationExample, ...]
```

`position` é detalhe de persistência (o Postgres não guarda ordem de linha) e o `id` do exemplo
não é usado por ninguém — nenhuma rota endereça um exemplo isolado. Os dois moram só no ORM.

## O contrato

`GET /api/apps` e `GET /api/apps/{id}` passam a devolver:

```json
{
  "id": "leitor-de-recibos",
  "name": "Leitor de Recibos",
  "examples": [
    { "label": "Cupons processados", "url": "https://drive.google.com/drive/folders/1a2b3c" },
    { "label": "Planilha modelo", "url": "https://docs.google.com/spreadsheets/d/4d5e6f" }
  ]
}
```

`examples` está **sempre presente** e é `[]` quando não há nenhum — nunca `null`. Um consumidor
com dois casos ("ausente" e "vazio") para a mesma situação erra um deles mais cedo ou mais tarde.

### Escrita é substituição

`POST /api/apps` e `PUT /api/apps/{id}` aceitam `examples` no mesmo corpo, e a lista enviada é a
lista final: o que não veio, sumiu. `examples` ausente equivale a `[]`.

Por que não `POST`/`DELETE /api/apps/{id}/examples`: a coleção não tem ciclo de vida próprio —
não existe exemplo sem aplicação, ninguém aponta um link para um exemplo, e a tela que a edita é
o mesmo formulário da aplicação, com um único botão salvar. Rotas separadas obrigariam o
frontend a orquestrar N chamadas por salvamento e a lidar com sucesso parcial (a aplicação
salvou, o terceiro exemplo falhou). A capa é rota separada porque é upload binário — é a
exceção, não o padrão.

### Validação

```python
class ApplicationExampleInput(BaseModel):
    label: str = Field(min_length=1, max_length=40)
    url: HttpUrl

    @field_validator("url")
    @classmethod
    def _within_url_limit(cls, value: HttpUrl) -> HttpUrl:
        if len(str(value)) > 2048:
            raise ValueError("Link longo demais (máximo de 2048 caracteres).")
        return value


class CreateApplicationRequest(BaseModel):
    ...
    examples: list[ApplicationExampleInput] = Field(default_factory=list, max_length=8)
```

| Regra | Valor | Por quê |
|---|---|---|
| `label` | 1–40 caracteres | cabe em uma linha do `<dialog>` de 560px sem truncar na maioria dos casos |
| `url` | `HttpUrl` | só `http`/`https`, sempre absoluta. Diferente do `url` da aplicação, que aceita caminho interno (`/relatorios`): exemplo é sempre material externo |
| `url` | ≤ 2048 caracteres | limite prático de URL em navegadores e proxies |
| `examples` | ≤ 8 por aplicação | acima disso o detalhe vira um índice de pasta, e o lugar do índice é o Drive |

`HttpUrl` normaliza o valor (`https://drive.google.com` vira `https://drive.google.com/`); é o
valor normalizado que vai para o banco e volta na resposta. Violação de qualquer regra é o 422
padrão do FastAPI, com o caminho do item na resposta (`body.examples.2.url`) — nenhum handler
novo.

`ApplicationExampleResponse.url` é `str`, não `HttpUrl`: o que sai é texto de contrato, e `str`
mantém a resposta idêntica ao que o frontend valida com Zod.

## Onde o código vai

- `domain/entities.py` — `ApplicationExample` e o campo `examples` em `Application`.
- `adapters/db/models.py` — `ApplicationExampleORM` e o `relationship` em `ApplicationORM`.
- `adapters/db/repository.py` — `create` e `update` ganham `examples: Sequence[ApplicationExample]`
  e reescrevem a coleção na mesma transação do resto; `_to_domain` monta a tupla.
- `application/dtos/` — os dois DTOs acima, em `requests.py` e `responses.py`.
- `adapters/http/routes.py` — mapeia DTO → `ApplicationExample` e domínio → resposta.

**Não existe `ReplaceExamplesUseCase`.** "Apagar as linhas que sumiram e regravar `position`" é
persistência, não regra de negócio — pela regra registrada em `02-auth.md` ("só use case se
houver regra de negócio"), isso mora no repositório, e as rotas continuam chamando
`repo.create` / `repo.update` direto, como já fazem.

**`list_all` carrega os exemplos com `selectinload(ApplicationORM.examples)`.** Sem isso, a
vitrine com 20 aplicações dispararia 21 queries — e, num repositório `async`, o carregamento
preguiçoso nem chega a disparar: levanta `MissingGreenlet`. Com `selectinload` são duas queries,
sempre.

## Migration

```
uv run alembic revision --autogenerate -m "create T003_APPLICATION_EXAMPLES table"
```

Confira na revisão gerada, antes de aplicar: `ondelete="CASCADE"` na `ForeignKeyConstraint` e o
índice em `application_id`. Nenhum backfill — toda aplicação existente começa com zero exemplos,
que é a resposta certa.

## Critérios de aceite

1. `uv run alembic upgrade head` cria `T003_APPLICATION_EXAMPLES` num banco que já tinha
   `T002_APPLICATIONS` populada, sem tocar nas linhas existentes.
2. `GET /api/apps` devolve `"examples": []` para toda aplicação cadastrada antes desta spec.
3. `POST /api/apps` com dois exemplos devolve 201 e os dois na resposta, na ordem enviada.
4. `PUT /api/apps/{id}` enviando só o segundo exemplo devolve a aplicação com um único exemplo, e
   um `SELECT` em `T003_APPLICATION_EXAMPLES` mostra uma única linha para aquela aplicação.
5. `PUT /api/apps/{id}` sem a chave `examples` no corpo zera a coleção.
6. `POST /api/apps` com `url: "/pasta-interna"` responde 422 apontando `body.examples.0.url`.
7. `POST /api/apps` com nove exemplos responde 422.
8. `DELETE /api/apps/{id}` de uma aplicação com exemplos responde 204 e não deixa linha órfã em
   `T003_APPLICATION_EXAMPLES`.
9. Com três aplicações com exemplos cadastradas, o log de SQL de um `GET /api/apps` mostra duas
   queries, não quatro.
10. `uv run ruff check .` e `uv run mypy src` passam limpos.
