from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import db
from src.modules.applications.adapters.db.repository import ApplicationRepository


def get_application_repo(
    session: AsyncSession = Depends(db.session_context),
) -> ApplicationRepository:
    return ApplicationRepository(session)
