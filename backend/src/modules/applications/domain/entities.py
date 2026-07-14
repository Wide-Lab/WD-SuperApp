from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Application:
    id: str
    name: str
    description: str
    url: str
    icon: str
    image: str | None  # key do objeto no bucket MinIO, não a URL pública
    created_at: datetime
