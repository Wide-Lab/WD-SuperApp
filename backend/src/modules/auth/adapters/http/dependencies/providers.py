from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import db
from src.core.security import decode_access_token
from src.modules.auth.adapters.db.repository import UserRepository
from src.modules.auth.domain.entities import AuthenticatedUser


def get_user_repo(
    session: AsyncSession = Depends(db.session_context),
) -> UserRepository:
    return UserRepository(session)


def get_current_user(request: Request) -> AuthenticatedUser:
    token = request.cookies.get("session")
    if token is None:
        raise HTTPException(status_code=401, detail="Não autenticado.")
    try:
        claims = decode_access_token(token)
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")
    return AuthenticatedUser(
        id=UUID(claims["sub"]), email=claims["email"], name=claims["name"]
    )
