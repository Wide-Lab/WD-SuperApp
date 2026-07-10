import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.auth.domain.entities import User

from .models import UserORM

logger = logging.getLogger(__name__)


class UserRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(
            select(UserORM).where(UserORM.email == email)
        )
        orm = result.scalar_one_or_none()
        return self._to_domain(orm) if orm else None

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self._session.execute(
            select(UserORM).where(UserORM.id == user_id)
        )
        orm = result.scalar_one_or_none()
        return self._to_domain(orm) if orm else None

    async def create(self, email: str, name: str, password_hash: str) -> User:
        logger.info("Criando novo usuário. email=%s", email)
        orm = UserORM(email=email, name=name, password_hash=password_hash)
        self._session.add(orm)
        await self._session.commit()
        await self._session.refresh(orm)
        return self._to_domain(orm)

    def _to_domain(self, orm: UserORM) -> User:
        return User(
            id=orm.id,
            email=orm.email,
            name=orm.name,
            password_hash=orm.password_hash,
            is_active=orm.is_active,
            created_at=orm.created_at,
        )
