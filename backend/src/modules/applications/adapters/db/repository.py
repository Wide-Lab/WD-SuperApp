import logging
from collections.abc import Sequence

from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.core.exceptions import DuplicateResourceError, ResourceNotFoundError
from src.modules.applications.domain.entities import Application, ApplicationExample

from .models import ApplicationExampleORM, ApplicationORM

logger = logging.getLogger(__name__)


class ApplicationRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_all(self) -> list[Application]:
        result = await self._session.execute(
            self._select_with_examples().order_by(ApplicationORM.created_at.asc())
        )
        return [self._to_domain(orm) for orm in result.scalars().all()]

    async def get_by_id(self, application_id: str) -> Application | None:
        orm = await self._get_orm(application_id)
        return self._to_domain(orm) if orm else None

    async def create(
        self,
        *,
        id: str,
        name: str,
        description: str,
        url: str,
        icon: str,
        examples: Sequence[ApplicationExample],
    ) -> Application:
        logger.info("Criando nova aplicação. id=%s", id)
        orm = ApplicationORM(id=id, name=name, description=description, url=url, icon=icon)
        orm.examples = self._to_orm_examples(examples)
        self._session.add(orm)
        try:
            await self._session.commit()
        except IntegrityError:
            await self._session.rollback()
            raise DuplicateResourceError(f"Já existe uma aplicação com id '{id}'.")
        return self._to_domain(await self._get_orm_or_raise(id))

    async def update(
        self,
        application_id: str,
        *,
        name: str,
        description: str,
        url: str,
        icon: str,
        examples: Sequence[ApplicationExample],
    ) -> Application:
        orm = await self._get_orm_or_raise(application_id)
        orm.name, orm.description, orm.url, orm.icon = name, description, url, icon
        # Substituição, não merge: a lista recebida é a lista final. `delete-orphan`
        # apaga as linhas que ficaram de fora, na mesma transação do resto.
        orm.examples = self._to_orm_examples(examples)
        await self._session.commit()
        return self._to_domain(await self._get_orm_or_raise(application_id))

    async def update_image(self, application_id: str, image: str | None) -> Application:
        orm = await self._get_orm_or_raise(application_id)
        orm.image = image
        await self._session.commit()
        return self._to_domain(await self._get_orm_or_raise(application_id))

    async def delete(self, application_id: str) -> Application:
        orm = await self._get_orm_or_raise(application_id)
        app = self._to_domain(orm)
        await self._session.delete(orm)
        await self._session.commit()
        return app

    # `position` é o que devolve ordem a uma tabela que não tem: o Postgres não guarda
    # ordem de linha, e a tupla do domínio guarda.
    def _to_orm_examples(
        self, examples: Sequence[ApplicationExample]
    ) -> list[ApplicationExampleORM]:
        return [
            ApplicationExampleORM(label=e.label, url=e.url, position=position)
            for position, e in enumerate(examples)
        ]

    # Toda leitura passa por aqui: `examples` é lazy e, num repositório async, ler um
    # lazy não carregado levanta MissingGreenlet em vez de disparar a query. Com
    # `selectinload` são duas queries por leitura, independente de quantas aplicações
    # voltem — nunca uma por linha.
    def _select_with_examples(self) -> Select[tuple[ApplicationORM]]:
        return select(ApplicationORM).options(selectinload(ApplicationORM.examples))

    async def _get_orm(self, application_id: str) -> ApplicationORM | None:
        result = await self._session.execute(
            self._select_with_examples().where(ApplicationORM.id == application_id)
        )
        return result.scalar_one_or_none()

    async def _get_orm_or_raise(self, application_id: str) -> ApplicationORM:
        orm = await self._get_orm(application_id)
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
            examples=tuple(
                ApplicationExample(label=e.label, url=e.url) for e in orm.examples
            ),
            created_at=orm.created_at,
        )
