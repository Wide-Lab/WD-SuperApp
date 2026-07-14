from starlette.concurrency import run_in_threadpool

from src.core.config import get_config
from src.core.exceptions import ResourceNotFoundError
from src.core.storage import storage
from src.modules.applications.adapters.db.repository import ApplicationRepository
from src.modules.applications.domain.entities import Application


class UploadApplicationImageUseCase:
    def __init__(self, repository: ApplicationRepository) -> None:
        self.repository = repository

    async def execute(
        self, application_id: str, content: bytes, content_type: str
    ) -> Application:
        if await self.repository.get_by_id(application_id) is None:
            raise ResourceNotFoundError(f"Aplicação '{application_id}' não encontrada.")

        config = get_config()
        key = application_id  # sempre a mesma key: upload novo sobrescreve, sem órfão
        await run_in_threadpool(
            storage.put_object, config.APPLICATIONS_BUCKET_NAME, key, content, content_type
        )
        return await self.repository.update_image(application_id, key)
