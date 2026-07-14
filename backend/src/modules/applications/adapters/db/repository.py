import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import DuplicateResourceError, ResourceNotFoundError
from src.modules.applications.domain.entities import Application

from .models import ApplicationORM

logger = logging.getLogger(__name__)


class ApplicationRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_all(self) -> list[Application]:
        result = await self._session.execute(
            select(ApplicationORM).order_by(ApplicationORM.created_at.asc())
        )
        return [self._to_domain(orm) for orm in result.scalars().all()]

    async def get_by_id(self, application_id: str) -> Application | None:
        result = await self._session.execute(
            select(ApplicationORM).where(ApplicationORM.id == application_id)
        )
        orm = result.scalar_one_or_none()
        return self._to_domain(orm) if orm else None

    async def create(
        self, *, id: str, name: str, description: str, url: str, icon: str
    ) -> Application:
        logger.info("Criando nova aplicação. id=%s", id)
        orm = ApplicationORM(id=id, name=name, description=description, url=url, icon=icon)
        self._session.add(orm)
        try:
            await self._session.commit()
        except IntegrityError:
            await self._session.rollback()
            raise DuplicateResourceError(f"Já existe uma aplicação com id '{id}'.")
        await self._session.refresh(orm)
        return self._to_domain(orm)

    async def update(
        self, application_id: str, *, name: str, description: str, url: str, icon: str
    ) -> Application:
        orm = await self._get_orm_or_raise(application_id)
        orm.name, orm.description, orm.url, orm.icon = name, description, url, icon
        await self._session.commit()
        await self._session.refresh(orm)
        return self._to_domain(orm)

    async def update_image(self, application_id: str, image: str | None) -> Application:
        orm = await self._get_orm_or_raise(application_id)
        orm.image = image
        await self._session.commit()
        await self._session.refresh(orm)
        return self._to_domain(orm)

    async def delete(self, application_id: str) -> Application:
        orm = await self._get_orm_or_raise(application_id)
        app = self._to_domain(orm)
        await self._session.delete(orm)
        await self._session.commit()
        return app

    async def _get_orm_or_raise(self, application_id: str) -> ApplicationORM:
        result = await self._session.execute(
            select(ApplicationORM).where(ApplicationORM.id == application_id)
        )
        orm = result.scalar_one_or_none()
        if orm is None:
            raise ResourceNotFoundError(f"Aplicação '{application_id}' não encontrada.")
        return orm

    def _to_domain(self, orm: ApplicationORM) -> Application:
        return Application(
            id=orm.id,
            name=orm.name,
            description=orm.description,
            url=orm.url,
            icon=orm.icon,
            image=orm.image,
            created_at=orm.created_at,
        )
