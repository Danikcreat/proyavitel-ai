from dataclasses import dataclass, field
from typing import Annotated

import httpx
import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.concurrency import run_in_threadpool

bearer = HTTPBearer(auto_error=False)


@dataclass
class Principal:
    id: str
    permissions: frozenset[str]
    departments: frozenset[str]
    token: str = field(repr=False)


def string_set(value: object) -> frozenset[str]:
    if not isinstance(value, list) or not all(isinstance(x, str) for x in value):
        raise ValueError("Expected a string array")
    return frozenset(value)


async def get_principal(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> Principal:
    if credentials is None:
        raise HTTPException(401, "Требуется Bearer JWT", headers={"WWW-Authenticate": "Bearer"})
    settings = request.app.state.settings
    token = credentials.credentials
    try:
        if settings.auth_mode == "demo":
            key = settings.demo_jwt_secret.get_secret_value()
            algorithms = ["HS256"]
        else:
            algorithms = ["RS256"]
            if request.app.state.jwks:
                signing_key = await run_in_threadpool(
                    request.app.state.jwks.get_signing_key_from_jwt, token
                )
                key = signing_key.key
            else:
                key = settings.jwt_public_key
        claims = jwt.decode(
            token,
            key,
            algorithms=algorithms,
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
            options={"require": ["exp", "iat", "sub", "iss", "aud"]},
        )
        subject = claims["sub"]
        if not isinstance(subject, str) or not 1 <= len(subject) <= 200:
            raise ValueError("Invalid subject")
    except jwt.PyJWKClientConnectionError:
        raise HTTPException(503, "Сервис проверки JWT временно недоступен") from None
    except (jwt.PyJWTError, ValueError, TypeError):
        raise HTTPException(
            401, "Недействительный JWT", headers={"WWW-Authenticate": "Bearer"}
        ) from None

    profile = claims
    if settings.auth_mode == "jwt":
        try:
            response = await request.app.state.http.get(
                settings.platform_base_url.rstrip("/") + "/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            if response.status_code in (401, 403):
                raise HTTPException(response.status_code, "Платформа отклонила доступ")
            response.raise_for_status()
            profile = response.json()
            if profile.get("id") != subject:
                raise ValueError("Profile subject mismatch")
        except (httpx.HTTPError, ValueError, AttributeError):
            raise HTTPException(503, "Не удалось проверить актуальные права платформы") from None
    try:
        principal = Principal(
            subject,
            string_set(profile.get("permissions", [])),
            string_set(profile.get("departmentScope", [])),
            token,
        )
    except ValueError:
        raise HTTPException(403, "Некорректный профиль доступа") from None
    if "assistant:use" not in principal.permissions:
        await request.app.state.repository.audit_denied(principal.id, request.state.trace_id)
        raise HTTPException(403, "Нет права assistant:use")
    return principal
