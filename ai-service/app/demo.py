"""Local demo identities. These credentials never authorize access to real company data."""

from datetime import timedelta
from typing import get_args

import jwt

from app.models import utcnow
from app.schemas import ModuleContext

DEMO_USERS = {
    "director": "Директор",
    "worker": "Сотрудник производства",
    "other": "Другой сотрудник",
}


def issue_demo_session(settings, user: str) -> dict:
    if settings.auth_mode != "demo" or user not in DEMO_USERS:
        raise ValueError("Demo identity is unavailable")
    permissions = ["assistant:use", "production:read", "kb:read"]
    departments = ["production"]
    if user == "director":
        modules = get_args(ModuleContext.model_fields["module"].annotation)
        permissions = ["assistant:use", "tasks:create", *[f"{module}:read" for module in modules]]
        departments = ["*"]
    now = utcnow()
    expires = now + timedelta(hours=1)
    token = jwt.encode(
        {
            "sub": f"demo-{user}",
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
            "iat": now,
            "exp": expires,
            "permissions": permissions,
            "departmentScope": departments,
        },
        settings.demo_jwt_secret.get_secret_value(),
        algorithm="HS256",
    )
    return {
        "token": token,
        "user": user,
        "name": DEMO_USERS[user],
        "expires_at": expires.isoformat(),
    }
