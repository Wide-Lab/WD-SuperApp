from pydantic import BaseModel


class ApplicationExampleResponse(BaseModel):
    label: str
    # `str`, não `HttpUrl`: o que sai é texto de contrato, idêntico ao que o frontend
    # valida com Zod.
    url: str


class ApplicationResponse(BaseModel):
    id: str
    name: str
    description: str
    url: str
    icon: str
    image: str | None = None
    # Sempre presente, `[]` quando não há nenhum — nunca `null`. Um consumidor com dois
    # casos para a mesma situação erra um deles mais cedo ou mais tarde.
    examples: list[ApplicationExampleResponse]


class ApplicationListResponse(BaseModel):
    apps: list[ApplicationResponse]
