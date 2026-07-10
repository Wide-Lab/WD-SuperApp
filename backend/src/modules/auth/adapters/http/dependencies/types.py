from typing import Annotated

from fastapi import Depends

from src.modules.auth.adapters.db.repository import UserRepository
from src.modules.auth.adapters.http.dependencies.providers import (
    get_current_user,
    get_user_repo,
)
from src.modules.auth.domain.entities import AuthenticatedUser

CurrentUserDependency = Annotated[AuthenticatedUser, Depends(get_current_user)]
UserRepoDependency = Annotated[UserRepository, Depends(get_user_repo)]
