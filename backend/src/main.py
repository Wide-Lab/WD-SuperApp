import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import mount_routes
from src.core.config import get_config
from src.core.database import db
from src.core.logging import setup_logging
from src.core.storage import storage

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    config = get_config()
    setup_logging(config.LOG_LEVEL)
    logger.info("Iniciando Central da Widelab...")
    db.init()
    # O `ensure-bucket` do CMD roda em outro processo: o cliente que ele inicializa
    # morre com ele. Quem serve requisição precisa inicializar o seu.
    storage.init()
    yield
    logger.info("Encerrando Central da Widelab.")


app = FastAPI(lifespan=lifespan, root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_config().CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


mount_routes(app)
