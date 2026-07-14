from typing import Annotated

from fastapi import Depends

from src.modules.applications.adapters.db.repository import ApplicationRepository
from src.modules.applications.adapters.http.dependencies.providers import (
    get_application_repo,
)

ApplicationRepoDependency = Annotated[ApplicationRepository, Depends(get_application_repo)]
