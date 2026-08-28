from pydantic import BaseModel, Field, HttpUrl, field_validator

_KEBAB_CASE = r"^[a-z0-9]+(-[a-z0-9]+)*$"

# Acima disso o detalhe vira um índice de pasta, e o lugar do índice é o Drive.
_MAX_EXAMPLES = 8
# Limite prático de URL em navegadores e proxies.
_MAX_URL_LENGTH = 2048


class ApplicationExampleInput(BaseModel):
    label: str = Field(min_length=1, max_length=40)
    # `HttpUrl`, e não `str` como o `url` da aplicação: aplicação pode ser um caminho
    # interno (`/relatorios`), exemplo é sempre material externo e absoluto.
    url: HttpUrl

    @field_validator("url")
    @classmethod
    def _within_url_limit(cls, value: HttpUrl) -> HttpUrl:
        if len(str(value)) > _MAX_URL_LENGTH:
            raise ValueError("Link longo demais (máximo de 2048 caracteres).")
        return value


class CreateApplicationRequest(BaseModel):
    id: str = Field(pattern=_KEBAB_CASE)
    name: str = Field(min_length=1, max_length=60)
    description: str = Field(min_length=1, max_length=160)
    url: str = Field(min_length=1)
    icon: str = Field(pattern=_KEBAB_CASE)
    examples: list[ApplicationExampleInput] = Field(
        default_factory=list, max_length=_MAX_EXAMPLES
    )


class UpdateApplicationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    description: str = Field(min_length=1, max_length=160)
    url: str = Field(min_length=1)
    icon: str = Field(pattern=_KEBAB_CASE)
    examples: list[ApplicationExampleInput] = Field(
        default_factory=list, max_length=_MAX_EXAMPLES
    )
