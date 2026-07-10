from fastapi import FastAPI

from src.modules.auth.adapters.http.routes import router as auth_router


def mount_routes(app: FastAPI) -> None:
    app.include_router(auth_router, prefix="/auth", tags=["Auth"])
