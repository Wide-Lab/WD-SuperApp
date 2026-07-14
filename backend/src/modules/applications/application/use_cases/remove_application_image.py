from starlette.concurrency import run_in_threadpool

from src.core.config import get_config
from src.core.exceptions import ResourceNotFoundError
from src.core.storage import storage
from src.modules.applications.adapters.db.repository import ApplicationRepository
from src.modules.applications.domain.entities import Application


class RemoveApplicationImageUseCase:
    def __init__(self, repository: ApplicationRepository) -> None:
        self.repository = repository

    async def execute(self, application_id: str) -> Application:
        app = await self.repository.get_by_id(application_id)
        if app is None:
            raise ResourceNotFoundError(f"Aplicação '{application_id}' não encontrada.")
        if app.image is not None:
            config = get_config()
            await run_in_threadpool(
                storage.delete_object, config.APPLICATIONS_BUCKET_NAME, app.image
            )
        return await self.repository.update_image(application_id, None)
