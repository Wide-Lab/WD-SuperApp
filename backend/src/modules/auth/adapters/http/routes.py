from fastapi import APIRouter, HTTPException, Response, status

from src.core.config import get_config
from src.core.exceptions import InvalidCredentialsError
from src.core.security import create_access_token, get_jwks
from src.modules.auth.adapters.http.dependencies.types import (
    CurrentUserDependency,
    UserRepoDependency,
)
from src.modules.auth.application.dtos.requests import LoginRequest
from src.modules.auth.application.dtos.responses import UserResponse
from src.modules.auth.application.use_cases.login import LoginUseCase

router = APIRouter()


@router.post("/login", response_model=UserResponse)
async def login(
    data: LoginRequest, response: Response, user_repo: UserRepoDependency
) -> UserResponse:
    try:
        user = await LoginUseCase(user_repo).execute(data.email, data.password)
    except InvalidCredentialsError:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")

    config = get_config()
    token = create_access_token(
        claims={"sub": str(user.id), "email": user.email, "name": user.name},
        expires_in=config.AUTH_TOKEN_TTL_SECONDS,
    )
    response.set_cookie(
        "session",
        token,
        domain=config.AUTH_COOKIE_DOMAIN,
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=config.AUTH_TOKEN_TTL_SECONDS,
    )
    return UserResponse(id=user.id, email=user.email, name=user.name)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    response.delete_cookie("session", domain=get_config().AUTH_COOKIE_DOMAIN, path="/")


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUserDependency) -> UserResponse:
    return UserResponse(
        id=current_user.id, email=current_user.email, name=current_user.name
    )


@router.get("/.well-known/jwks.json")
async def jwks() -> dict:
    return get_jwks()
