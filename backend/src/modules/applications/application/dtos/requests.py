from pydantic import BaseModel, Field

_KEBAB_CASE = r"^[a-z0-9]+(-[a-z0-9]+)*$"


class CreateApplicationRequest(BaseModel):
    id: str = Field(pattern=_KEBAB_CASE)
    name: str = Field(min_length=1, max_length=60)
    description: str = Field(min_length=1, max_length=160)
    url: str = Field(min_length=1)
    icon: str = Field(pattern=_KEBAB_CASE)


class UpdateApplicationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    description: str = Field(min_length=1, max_length=160)
    url: str = Field(min_length=1)
    icon: str = Field(pattern=_KEBAB_CASE)
