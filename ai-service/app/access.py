import httpx
from fastapi import HTTPException

from app.auth import Principal
from app.schemas import ModuleContext

# Server-side ACL and synthetic fixture. Never accept entity ownership from the client.
DEMO_STATIONS = {
    "st-01": {"department": "production", "name": "Станок №1"},
    "st-03": {"department": "production", "name": "Станок №3 (термопереплёт)"},
    "st-private": {"department": "restricted", "name": "Закрытый участок"},
}


class ContextAccess:
    """A narrow, read-only integration seam; unknown entity types fail closed."""

    def __init__(self, settings, http: httpx.AsyncClient):
        self.settings = settings
        self.http = http

    async def validate(self, principal: Principal, context: ModuleContext | None) -> None:
        if context is None:
            return
        if f"{context.module}:read" not in principal.permissions:
            raise HTTPException(403, "Нет доступа к модулю контекста")
        department = context.filters.department
        if (
            department
            and "*" not in principal.departments
            and department not in principal.departments
        ):
            raise HTTPException(403, "Нет доступа к подразделению")
        if context.filters.product:
            if self.settings.auth_mode == "demo":
                if context.filters.product != "photobook":
                    raise HTTPException(403, "Продукт недоступен")
            else:
                products = await self._platform_get("/catalog/products", principal)
                if not isinstance(products, list) or not any(
                    isinstance(item, dict) and item.get("id") == context.filters.product
                    for item in products
                ):
                    raise HTTPException(403, "Продукт недоступен")
        if context.entity is None:
            return
        entity = context.entity
        if entity.type != "station" or context.module not in ("production", "equipment"):
            raise HTTPException(403, "Проверка доступа к этому типу сущности ещё не подключена")
        if self.settings.auth_mode == "demo":
            station = DEMO_STATIONS.get(entity.id)
            if not station or (
                "*" not in principal.departments
                and station["department"] not in principal.departments
            ):
                raise HTTPException(403, "Сущность недоступна")
            if department and department != station["department"]:
                raise HTTPException(403, "Сущность не принадлежит подразделению")
        else:
            # /equipment/stations MUST return only stations accessible to this Bearer token.
            stations = await self._platform_get("/equipment/stations", principal)
            if not isinstance(stations, list) or not any(
                isinstance(item, dict) and item.get("id") == entity.id for item in stations
            ):
                raise HTTPException(403, "Сущность недоступна")
            # The source contract has no station -> department mapping: do not guess it.
            if department:
                raise HTTPException(403, "Проверка подразделения станка не поддержана контрактом")

    async def _platform_get(self, path: str, principal: Principal):
        try:
            response = await self.http.get(
                self.settings.platform_base_url.rstrip("/") + path,
                headers={"Authorization": f"Bearer {principal.token}"},
            )
            if response.status_code in (401, 403, 404):
                raise HTTPException(403, "Платформа отклонила доступ к контексту")
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, ValueError):
            raise HTTPException(503, "Проверка доступа к контексту временно недоступна") from None
