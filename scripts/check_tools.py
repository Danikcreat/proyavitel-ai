"""Synthetic, local tool check. No model, key, DB or running platform required."""

import asyncio
import json

from app.auth import Principal
from app.pulse import SyntheticPulseClient
from app.tools import ToolExecutor


async def main():
    user = Principal(
        "demo-tool-check",
        frozenset({"assistant:use", "production:read"}),
        frozenset({"production"}),
        "not-a-real-token",
    )
    executor = ToolExecutor(SyntheticPulseClient())
    result = await executor.execute(
        user,
        "get_defect_summary",
        {"station_id": "st-03", "start": "2026-11-01", "end": "2026-11-11"},
    )
    print(json.dumps(result.model_dump(mode="json"), ensure_ascii=False, indent=2))


asyncio.run(main())
