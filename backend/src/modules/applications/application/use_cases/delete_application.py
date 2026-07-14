from starlette.concurrency import run_in_threadpool

from src.core.config import get_config
from src.core.storage import storage
from src.modules.applications.adapters.db.repository import ApplicationRepository


class DeleteApplicationUseCase:
    def __init__(self, repository: ApplicationRepository) -> None:
        self.repository = repository

    async def execute(self, application_id: str) -> None:
        app = await self.repository.delete(application_id)
        if app.image is not None:
            config = get_config()
            await run_in_threadpool(
                storage.delete_object, config.APPLICATIONS_BUCKET_NAME, app.image
            )
