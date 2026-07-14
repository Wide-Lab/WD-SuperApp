from pydantic import BaseModel


class ApplicationResponse(BaseModel):
    id: str
    name: str
    description: str
    url: str
    icon: str
    image: str | None = None


class ApplicationListResponse(BaseModel):
    apps: list[ApplicationResponse]
