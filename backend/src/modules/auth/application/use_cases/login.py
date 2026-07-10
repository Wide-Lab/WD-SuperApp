from src.core.exceptions import InvalidCredentialsError
from src.core.security import verify_password
from src.modules.auth.adapters.db.repository import UserRepository
from src.modules.auth.domain.entities import AuthenticatedUser


class LoginUseCase:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def execute(self, email: str, password: str) -> AuthenticatedUser:
        user = await self.repository.get_by_email(email)
        if (
            user is None
            or not user.is_active
            or not verify_password(password, user.password_hash)
        ):
            raise InvalidCredentialsError()
        return AuthenticatedUser(id=user.id, email=user.email, name=user.name)
