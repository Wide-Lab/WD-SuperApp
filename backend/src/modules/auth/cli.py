import argparse
import asyncio
import getpass

from src.core.database import db
from src.core.security import hash_password
from src.modules.auth.adapters.db.repository import UserRepository

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


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m src.modules.auth.cli")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_user_parser = subparsers.add_parser("create-user")
    create_user_parser.add_argument("--email", required=True)
    create_user_parser.add_argument("--name", required=True)

    args = parser.parse_args()

    if args.command == "create-user":
        asyncio.run(create_user(args.email, args.name))


if __name__ == "__main__":
    main()
