import argparse
import asyncio
import getpass
import logging

from sqlalchemy.exc import IntegrityError

from src.core.config import get_config
from src.core.database import db
from src.core.logging import setup_logging
from src.core.security import hash_password
from src.modules.auth.adapters.db.repository import UserRepository

logger = logging.getLogger(__name__)

_MIN_PASSWORD_LENGTH = 8


async def create_user(email: str, name: str) -> None:
    password = getpass.getpass("Senha: ")
    if len(password) < _MIN_PASSWORD_LENGTH:
        raise SystemExit(
            f"A senha precisa ter no mínimo {_MIN_PASSWORD_LENGTH} caracteres."
        )
    if password != getpass.getpass("Confirme a senha: "):
        raise SystemExit("As senhas não coincidem.")

    db.init()
    async with db.create_session() as session:
        repository = UserRepository(session)
        user = await repository.create(
            email=email, name=name, password_hash=hash_password(password)
        )
        print(f"Usuário criado: {user.id} <{user.email}>")


async def create_default_user() -> None:
    config = get_config()
    setup_logging(config.LOG_LEVEL)

    if not config.AUTH_DEFAULT_USER_EMAIL or not config.AUTH_DEFAULT_USER_PASSWORD:
        logger.info("Usuário padrão não configurado, pulando criação.")
        return

    db.init()
    async with db.create_session() as session:
        repository = UserRepository(session)
        try:
            await repository.create(
                email=config.AUTH_DEFAULT_USER_EMAIL,
                name=config.AUTH_DEFAULT_USER_NAME,
                password_hash=hash_password(config.AUTH_DEFAULT_USER_PASSWORD),
            )
        except IntegrityError:
            await session.rollback()
            logger.info(
                "Usuário padrão já está criado. email=%s",
                config.AUTH_DEFAULT_USER_EMAIL,
            )
        else:
            logger.info(
                "Usuário padrão criado. email=%s", config.AUTH_DEFAULT_USER_EMAIL
            )


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m src.modules.auth.cli")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_user_parser = subparsers.add_parser("create-user")
    create_user_parser.add_argument("--email", required=True)
    create_user_parser.add_argument("--name", required=True)

    subparsers.add_parser("create-default-user")

    args = parser.parse_args()

    if args.command == "create-user":
        asyncio.run(create_user(args.email, args.name))
    elif args.command == "create-default-user":
        asyncio.run(create_default_user())


if __name__ == "__main__":
    main()
