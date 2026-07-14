from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = []

    AUTH_JWT_PRIVATE_KEY: str
    AUTH_JWT_PUBLIC_KEY: str
    AUTH_TOKEN_TTL_SECONDS: int = 604800

    # Vazio emite cookie host-only — é o que permite testar em `localhost`, onde
    # nenhum cookie de `.widelab.com.br` jamais seria aceito. Em produção, o
    # domínio pai é o que faz a sessão valer para todos os subdomínios.
    AUTH_COOKIE_DOMAIN: str = ".widelab.com.br"
    # `Secure` sobre http é recusado pelo navegador fora de `localhost`. Desligar
    # é para desenvolvimento; em produção, ligado — senão a sessão viaja em claro.
    AUTH_COOKIE_SECURE: bool = True

    AUTH_DEFAULT_USER_EMAIL: str = ""
    AUTH_DEFAULT_USER_NAME: str = ""
    AUTH_DEFAULT_USER_PASSWORD: str = ""

    # Endpoint interno (rede docker) usado pelo backend para autenticar chamadas
    # S3 no MinIO — nunca chega ao browser.
    APPLICATIONS_STORAGE_ENDPOINT_URL: str = "http://minio:9000"
    APPLICATIONS_STORAGE_ACCESS_KEY: str = "minioadmin"
    APPLICATIONS_STORAGE_SECRET_KEY: str = "minioadmin"
    APPLICATIONS_BUCKET_NAME: str = "applications"
    # Prefixo público usado para montar o campo `image` de GET /apps — nunca
    # toca o MinIO, é só o texto que vira parte da URL na resposta JSON.
    APPLICATIONS_MEDIA_BASE_URL: str = "/media"


@lru_cache(maxsize=1)
def get_config() -> Config:
    return Config()  # type: ignore
