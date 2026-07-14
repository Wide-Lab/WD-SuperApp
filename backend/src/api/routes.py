from fastapi import FastAPI

from src.modules.applications.adapters.http.routes import router as applications_router
from src.modules.auth.adapters.http.routes import router as auth_router


def mount_routes(app: FastAPI) -> None:
    app.include_router(auth_router, prefix="/auth", tags=["Auth"])
    app.include_router(applications_router, prefix="/apps", tags=["Applications"])
