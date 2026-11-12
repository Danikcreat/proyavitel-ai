"""ACL-filtered knowledge retrieval. Document text is untrusted source material."""

import re
from typing import Literal, Protocol

import httpx
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field

from app.pulse import PulseForbidden, PulseUnavailable
from app.schemas import Identifier


class KnowledgeDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Identifier
    title: str = Field(min_length=1, max_length=300)
    aclLevel: Literal["public", "department", "management", "finance"]
    version: int = Field(ge=1, strict=True)
    updatedAtUtc: AwareDatetime

    def source(self, synthetic):
        return {
            "id": self.id,
            "type": "knowledge",
            "title": self.title,
            "version": self.version,
            "updated_at": self.updatedAtUtc.isoformat(),
            "endpoint": f"/kb/articles/{self.id}",
            "synthetic": synthetic,
        }


class KnowledgeHit(BaseModel):
    model_config = ConfigDict(extra="ignore", allow_inf_nan=False)
    document: KnowledgeDocument
    fragment: str = Field(min_length=1, max_length=12000)
    score: float


class KnowledgeArticle(BaseModel):
    document: KnowledgeDocument
    content: str = Field(min_length=1, max_length=12000)


class KnowledgeReader(Protocol):
    supports_articles: bool
    synthetic: bool

    async def search(self, user, query: str) -> list[KnowledgeHit]: ...

    async def article(self, user, document_id: str) -> KnowledgeArticle: ...

    async def authorize(self, user, document_id: str) -> None: ...


class SyntheticKnowledgeClient:
    supports_articles = True
    synthetic = True

    def __init__(self):
        # Synthetic instructions deliberately contain no operating temperatures or setpoints.
        self.articles = {
            "demo-thermobinding-check": (
                "production",
                KnowledgeArticle(
                    document=KnowledgeDocument(
                        id="demo-thermobinding-check",
                        title="Проверка качества термопереплёта — тестовая инструкция",
                        aclLevel="department",
                        version=1,
                        updatedAtUtc="2026-11-11T09:00:00Z",
                    ),
                    content=(
                        "Синтетическая инструкция для демонстрации ассистента, не рабочий регламент. "
                        "При росте брака термопереплёта на станке st-03: "
                        "1. Сопоставить бракованные заказы с общим числом заказов за одинаковые периоды. "
                        "2. Проверить журнал обслуживания и зафиксировать наблюдаемые дефекты склейки. "
                        "3. Поручить технологу сверить настройки с действующим паспортом оборудования. "
                        "4. После согласованной проверки оценить качество контрольных образцов. "
                        "Не менять параметры по этой тестовой инструкции; числовые настройки здесь не заданы."
                    ),
                ),
            ),
            "demo-restricted-maintenance": (
                "restricted",
                KnowledgeArticle(
                    document=KnowledgeDocument(
                        id="demo-restricted-maintenance",
                        title="Обслуживание закрытого участка — тестовый документ",
                        aclLevel="department",
                        version=1,
                        updatedAtUtc="2026-11-11T09:00:00Z",
                    ),
                    content="Синтетический регламент закрытого участка. Доступ ограничен подразделением.",
                ),
            ),
        }

    def _visible(self, user, document_id):
        item = self.articles.get(document_id)
        return bool(
            "kb:read" in user.permissions
            and item
            and ("*" in user.departments or item[0] in user.departments)
        )

    async def authorize(self, user, document_id):
        if not self._visible(user, document_id):
            raise PulseForbidden("knowledge_access_denied")

    async def search(self, user, query):
        if "kb:read" not in user.permissions:
            raise PulseForbidden("knowledge_access_denied")
        terms = re.findall(r"[\w-]{3,}", query.casefold())
        hits = []
        for document_id, (_, article) in self.articles.items():
            if not self._visible(user, document_id):
                continue
            text = (article.document.title + " " + article.content).casefold()
            matches = sum(term in text for term in terms)
            if matches:
                hits.append(
                    KnowledgeHit(
                        document=article.document,
                        fragment=article.content,
                        score=matches / max(len(terms), 1),
                    )
                )
        return sorted(hits, key=lambda item: item.score, reverse=True)[:5]

    async def article(self, user, document_id):
        await self.authorize(user, document_id)
        return self.articles[document_id][1]


class KnowledgeClient:
    supports_articles = False  # /kb/articles/{id} has no response body schema yet.
    synthetic = False

    def __init__(self, base_url, http: httpx.AsyncClient):
        self.base_url, self.http = base_url.rstrip("/"), http

    async def _get(self, user, path, params=None):
        if "kb:read" not in user.permissions:
            raise PulseForbidden("knowledge_access_denied")
        try:
            response = await self.http.get(
                self.base_url + path,
                params=params,
                headers={"Authorization": f"Bearer {user.token}"},
                timeout=10,
                follow_redirects=False,
            )
            if response.status_code in (401, 403, 404):
                raise PulseForbidden("knowledge_access_denied")
            response.raise_for_status()
            return response
        except httpx.HTTPError:
            raise PulseUnavailable("knowledge_source_unavailable") from None

    async def search(self, user, query):
        # Platform enforces document ACL for the user's JWT before returning snippets.
        response = await self._get(user, "/kb/search", {"q": query, "ai": "true"})
        try:
            if len(response.content) > 1_000_000:
                raise ValueError()
            raw = response.json()
            if not isinstance(raw, list) or len(raw) > 100:
                raise ValueError()
            hits = [KnowledgeHit.model_validate(item) for item in raw]
            return sorted(hits, key=lambda item: item.score, reverse=True)[:5]
        except ValueError:
            raise PulseUnavailable("knowledge_response_invalid") from None

    async def authorize(self, user, document_id):
        # Recheck current ACL before replaying stored fragments/history. Body is ignored.
        if not re.fullmatch(r"[a-zA-Z0-9_.:-]{1,100}", document_id):
            raise PulseForbidden("knowledge_access_denied")
        await self._get(user, f"/kb/articles/{document_id}")

    async def article(self, user, document_id):
        raise PulseUnavailable("knowledge_article_contract_not_configured")
