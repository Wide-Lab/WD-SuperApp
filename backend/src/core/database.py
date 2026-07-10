from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from src.core.config import get_config


class Base(DeclarativeBase):
    pass


class _DataBase:
    def __init__(self) -> None:
        self._engine: AsyncEngine | None = None
        self._session_factory: async_sessionmaker[AsyncSession] | None = None

    def is_initialized(self) -> bool:
        return self._engine is not None and self._session_factory is not None

    @property
    def engine(self) -> AsyncEngine:
        if self._engine is None:
            raise RuntimeError("Database engine not initialized.")
        return self._engine

    def init(self) -> None:
        if self.is_initialized():
            return

        config = get_config()
        self._engine = create_async_engine(
            config.DATABASE_URL,
            pool_pre_ping=True,
            future=True,
        )
        self._session_factory = async_sessionmaker(
            self._engine,
            expire_on_commit=False,
            class_=AsyncSession,
        )

    async def close(self) -> None:
        if self._engine is None:
            return

        await self._engine.dispose()
        self._engine = None
        self._session_factory = None

    def create_session(self) -> AsyncSession:
        if self._session_factory is None:
            raise RuntimeError("Database engine not initialized.")
        return self._session_factory()

    async def session_context(self) -> AsyncGenerator[AsyncSession]:
        async with self.create_session() as session:
            yield session


db = _DataBase()
