from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from src.core.config import get_config

_hasher = PasswordHasher()

_ISSUER = "central.widelab.com.br"
_JWK_KEY_ID = "central-1"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def create_access_token(claims: dict[str, Any], expires_in: int) -> str:
    config = get_config()
    now = datetime.now(UTC)
    payload = {
        **claims,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
        "iss": _ISSUER,
    }
    # O `kid` no header é o que permite ao consumidor casar o token com a chave
    # certa do JWKS sem tentativa e erro — sem ele, `PyJWKClient` não encontra
    # chave nenhuma, mesmo havendo só uma publicada.
    return jwt.encode(
        payload,
        config.AUTH_JWT_PRIVATE_KEY,
        algorithm="RS256",
        headers={"kid": _JWK_KEY_ID},
    )


def decode_access_token(token: str) -> dict[str, Any]:
    config = get_config()
    return jwt.decode(
        token,
        config.AUTH_JWT_PUBLIC_KEY,
        algorithms=["RS256"],
        issuer=_ISSUER,
    )


def get_jwks() -> dict[str, Any]:
    config = get_config()
    algorithm = jwt.algorithms.RSAAlgorithm(jwt.algorithms.RSAAlgorithm.SHA256)
    public_key = algorithm.prepare_key(config.AUTH_JWT_PUBLIC_KEY)
    jwk = algorithm.to_jwk(public_key, as_dict=True)
    jwk.update({"use": "sig", "alg": "RS256", "kid": _JWK_KEY_ID})
    return {"keys": [jwk]}
