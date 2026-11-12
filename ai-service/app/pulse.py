"""Typed, read-only Pulse integration; fixtures and real HTTP share one interface."""

from datetime import date, datetime
from typing import Literal, Protocol

import httpx
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.access import DEMO_STATIONS
from app.auth import Principal


class PulseUnavailable(RuntimeError):
    pass


class PulseForbidden(RuntimeError):
    pass


class Station(BaseModel):
    model_config = ConfigDict(extra="ignore", allow_inf_nan=False)
    id: str = Field(max_length=100)
    name: str = Field(max_length=256)
    state: Literal["ok", "degraded", "maintenance", "down"]
    loadPercent: float = Field(ge=0, le=100)
    defectRate: float = Field(ge=0, le=100)


class QualityPeriod(BaseModel):
    start: date
    end: date
    total_orders: int = Field(ge=0)
    defective_orders: int = Field(ge=0)

    @model_validator(mode="after")
    def validate_counts(self):
        if self.start > self.end or self.defective_orders > self.total_orders:
            raise ValueError("Invalid quality period")
        return self


class QualitySummary(BaseModel):
    station_id: str
    current: QualityPeriod
    previous: QualityPeriod


class Source(BaseModel):
    id: str
    endpoint: str
    synthetic: bool
    updated_at: datetime | None = None
    note: str | None = None


class StationsResult(BaseModel):
    items: list[Station]
    source: Source


class QualityResult(BaseModel):
    summary: QualitySummary | None
    source: Source


class PulseReader(Protocol):
    async def stations(self, user: Principal) -> StationsResult: ...

    async def quality(
        self, user: Principal, station_id: str, start: date, end: date
    ) -> QualityResult: ...


class SyntheticPulseClient:
    def __init__(
        self, scenario: Literal["growth", "normal", "insufficient", "unavailable"] = "growth"
    ):
        self.scenario = scenario

    def _ready(self):
        if self.scenario == "unavailable":
            raise PulseUnavailable("synthetic_source_unavailable")

    def _station_allowed(self, user, station_id):
        station = DEMO_STATIONS.get(station_id)
        if not station or (
            "*" not in user.departments and station["department"] not in user.departments
        ):
            raise PulseForbidden("station_access_denied")

    def _source(self, endpoint):
        return Source(
            id="demo-production-v1",
            endpoint=endpoint,
            synthetic=True,
            updated_at="2026-11-11T09:00:00Z",
        )

    async def stations(self, user):
        self._ready()
        items = []
        for station_id, station in DEMO_STATIONS.items():
            if "*" in user.departments or station["department"] in user.departments:
                rate = 2 if self.scenario == "normal" or station_id != "st-03" else 6
                items.append(
                    Station(
                        id=station_id,
                        name=station["name"],
                        state="degraded" if rate > 2 else "ok",
                        loadPercent=80,
                        defectRate=rate,
                    )
                )
        return StationsResult(items=items, source=self._source("/equipment/stations"))

    async def quality(self, user, station_id, start, end):
        self._station_allowed(user, station_id)
        self._ready()
        source = self._source("/production/defects")
        if self.scenario == "insufficient" or (start, end) != (
            date(2026, 11, 1),
            date(2026, 11, 11),
        ):
            source.note = "No synthetic observations for this scenario or period"
            return QualityResult(summary=None, source=source)
        defects = 80 if self.scenario == "normal" or station_id != "st-03" else 240
        return QualityResult(
            summary=QualitySummary(
                station_id=station_id,
                current=QualityPeriod(
                    start=start, end=end, total_orders=4000, defective_orders=defects
                ),
                previous=QualityPeriod(
                    start=date(2026, 10, 21),
                    end=date(2026, 10, 31),
                    total_orders=4000,
                    defective_orders=80,
                ),
            ),
            source=source,
        )


class PulseClient:
    def __init__(self, base_url: str, http: httpx.AsyncClient):
        self.base_url = base_url.rstrip("/")
        self.http = http

    async def stations(self, user):
        # The platform MUST apply its own ACL and department scope for this JWT.
        try:
            response = await self.http.get(
                self.base_url + "/equipment/stations",
                headers={"Authorization": f"Bearer {user.token}"},
                timeout=10,
                follow_redirects=False,
            )
            if response.status_code in (401, 403):
                raise PulseForbidden("platform_access_denied")
            response.raise_for_status()
            raw = response.json()
            if not isinstance(raw, list) or len(raw) > 1000:
                raise ValueError("Unexpected station list")
            return StationsResult(
                items=[Station.model_validate(item) for item in raw],
                source=Source(
                    id="pulse-equipment-stations",
                    endpoint="/equipment/stations",
                    synthetic=False,
                    note="Source freshness is not specified in the platform contract",
                ),
            )
        except (httpx.HTTPError, ValueError):
            raise PulseUnavailable("platform_unavailable_or_invalid_response") from None

    async def quality(self, user, station_id, start, end):
        # Defect is not a defective-order count, and the contract has no denominator.
        # Implement after agreeing a scoped aggregate with the platform team.
        raise PulseUnavailable("quality_aggregate_contract_not_configured")
