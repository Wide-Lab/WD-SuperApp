from fastapi import APIRouter, HTTPException, UploadFile, status

from src.core.config import get_config
from src.core.exceptions import DuplicateResourceError, ResourceNotFoundError
from src.modules.applications.adapters.http.dependencies.types import (
    ApplicationRepoDependency,
)
from src.modules.applications.application.dtos.requests import (
    CreateApplicationRequest,
    UpdateApplicationRequest,
)
from src.modules.applications.application.dtos.responses import (
    ApplicationListResponse,
    ApplicationResponse,
)
from src.modules.applications.application.use_cases.delete_application import (
    DeleteApplicationUseCase,
)
from src.modules.applications.application.use_cases.remove_application_image import (
    RemoveApplicationImageUseCase,
)
from src.modules.applications.application.use_cases.upload_application_image import (
    UploadApplicationImageUseCase,
)
from src.modules.applications.domain.entities import Application
from src.modules.auth.adapters.http.dependencies.types import CurrentUserDependency

router = APIRouter()

_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
_ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp", "image/svg+xml"}


def _to_response(app: Application) -> ApplicationResponse:
    config = get_config()
    image = f"{config.APPLICATIONS_MEDIA_BASE_URL}/{app.image}" if app.image else None
    return ApplicationResponse(
        id=app.id,
        name=app.name,
        description=app.description,
        url=app.url,
        icon=app.icon,
        image=image,
    )


@router.get("", response_model=ApplicationListResponse)
async def list_applications(repo: ApplicationRepoDependency) -> ApplicationListResponse:
    apps = await repo.list_all()
    return ApplicationListResponse(apps=[_to_response(a) for a in apps])


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str, repo: ApplicationRepoDependency
) -> ApplicationResponse:
    app = await repo.get_by_id(application_id)
    if app is None:
        raise HTTPException(status_code=404, detail="Aplicação não encontrada.")
    return _to_response(app)


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: CreateApplicationRequest,
    repo: ApplicationRepoDependency,
    _: CurrentUserDependency,
) -> ApplicationResponse:
    try:
        app = await repo.create(
            id=data.id,
            name=data.name,
            description=data.description,
            url=data.url,
            icon=data.icon,
        )
    except DuplicateResourceError:
        raise HTTPException(
            status_code=409, detail=f"Já existe uma aplicação com id '{data.id}'."
        )
    return _to_response(app)


@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    data: UpdateApplicationRequest,
    repo: ApplicationRepoDependency,
    _: CurrentUserDependency,
) -> ApplicationResponse:
    try:
        app = await repo.update(
            application_id,
            name=data.name,
            description=data.description,
            url=data.url,
            icon=data.icon,
        )
    except ResourceNotFoundError:
        raise HTTPException(status_code=404, detail="Aplicação não encontrada.")
    return _to_response(app)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: str,
    repo: ApplicationRepoDependency,
    _: CurrentUserDependency,
) -> None:
    try:
        await DeleteApplicationUseCase(repo).execute(application_id)
    except ResourceNotFoundError:
        raise HTTPException(status_code=404, detail="Aplicação não encontrada.")


@router.post("/{application_id}/image", response_model=ApplicationResponse)
async def upload_application_image(
    application_id: str,
    file: UploadFile,
    repo: ApplicationRepoDependency,
    _: CurrentUserDependency,
) -> ApplicationResponse:
    content_type = file.content_type
    if content_type is None or content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Formato de imagem não suportado.")
    content = await file.read()
    if len(content) > _MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Imagem maior que 5 MB.")
    try:
        app = await UploadApplicationImageUseCase(repo).execute(
            application_id, content, content_type
        )
    except ResourceNotFoundError:
        raise HTTPException(status_code=404, detail="Aplicação não encontrada.")
    return _to_response(app)


@router.delete("/{application_id}/image", response_model=ApplicationResponse)
async def remove_application_image(
    application_id: str,
    repo: ApplicationRepoDependency,
    _: CurrentUserDependency,
) -> ApplicationResponse:
    try:
        app = await RemoveApplicationImageUseCase(repo).execute(application_id)
    except ResourceNotFoundError:
        raise HTTPException(status_code=404, detail="Aplicação não encontrada.")
    return _to_response(app)
