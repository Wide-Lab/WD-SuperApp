from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True, slots=True)
class User:
    id: UUID
    email: str
    name: str
    password_hash: str
    is_active: bool
    created_at: datetime


@dataclass(frozen=True, slots=True)
class AuthenticatedUser:
    """O que sai do token e do /auth/me — nunca carrega password_hash."""

    id: UUID
    email: str
    name: str
