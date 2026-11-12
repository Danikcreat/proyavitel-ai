import httpx
import pytest

from app.auth import Principal
from app.pulse import PulseClient, SyntheticPulseClient
from app.tools import ToolError, ToolExecutor


def user(*permissions):
    return Principal(
        "test",
        frozenset({"assistant:use", *permissions}),
        frozenset({"production"}),
        "test-only-token",
    )


async def test_quality_is_calculated_from_counts_and_source_is_synthetic():
    executor = ToolExecutor(SyntheticPulseClient())
    actor = user("production:read")
    result = await executor.execute(
        actor,
        "get_defect_summary",
        {"station_id": "st-03", "start": "2026-11-01", "end": "2026-11-11"},
    )
    assert result.status == "ok"
    assert result.data["current_rate_percent"] == 6
    assert result.data["previous_rate_percent"] == 2
    assert result.data["change_percentage_points"] == 4
    assert result.sources[0]["synthetic"] is True
    with pytest.raises(ToolError, match="entity_access_denied"):
        await executor.execute(
            actor,
            "get_defect_summary",
            {"station_id": "st-private", "start": "2026-11-01", "end": "2026-11-11"},
        )
    assert [item["function"]["name"] for item in executor.definitions(actor)] == [
        "get_defect_summary"
    ]
    with pytest.raises(ToolError, match="tool_access_denied"):
        await executor.execute(actor, "get_stations", {})
    with pytest.raises(ToolError, match="invalid_tool_arguments"):
        await executor.execute(
            actor,
            "get_defect_summary",
            {"station_id": "st-03", "start": "2026-11-12", "end": "2026-11-01"},
        )


async def test_missing_data_and_failed_source_are_not_zero_defects():
    args = {"station_id": "st-03", "start": "2026-11-01", "end": "2026-11-11"}
    actor = user("production:read")
    missing = await ToolExecutor(SyntheticPulseClient("insufficient")).execute(
        actor, "get_defect_summary", args
    )
    assert missing.status == "insufficient_data" and missing.data is None
    failed = await ToolExecutor(SyntheticPulseClient("unavailable")).execute(
        actor, "get_defect_summary", args
    )
    assert failed.status == "unavailable" and failed.data is None
    normal = await ToolExecutor(SyntheticPulseClient("normal")).execute(
        actor, "get_defect_summary", args
    )
    assert normal.data["change_percentage_points"] == 0


async def test_real_station_adapter_and_contract_gap_fail_closed():
    def platform(request):
        assert request.url.path == "/equipment/stations"
        assert request.headers["authorization"] == "Bearer test-only-token"
        return httpx.Response(
            200,
            json=[
                {
                    "id": "st-03",
                    "name": "Station",
                    "state": "ok",
                    "loadPercent": 80,
                    "defectRate": 2,
                }
            ],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(platform)) as http:
        executor = ToolExecutor(PulseClient("http://platform", http))
        result = await executor.execute(user("equipment:read"), "get_stations", {})
        assert result.status == "ok" and result.data["stations"][0]["id"] == "st-03"
        assert result.sources[0]["synthetic"] is False
        result = await executor.execute(
            user("production:read"),
            "get_defect_summary",
            {"station_id": "st-03", "start": "2026-11-01", "end": "2026-11-11"},
        )
        assert result.status == "unavailable"
        assert result.code == "quality_aggregate_contract_not_configured"
