from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class ApplicationExample:
    label: str
    url: str


@dataclass(frozen=True, slots=True)
class Application:
    id: str
    name: str
    description: str
    url: str
    icon: str
    image: str | None  # key do objeto no bucket MinIO, não a URL pública
    examples: tuple[ApplicationExample, ...]  # a ordem da tupla é a ordem de leitura
    created_at: datetime
