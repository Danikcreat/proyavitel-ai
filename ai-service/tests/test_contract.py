import json
from pathlib import Path

import yaml
from openapi_spec_validator import validate

ROOT = Path(__file__).resolve().parents[2]


def test_contracts_validate_and_preserve_other_platform_paths():
    platform = yaml.safe_load((ROOT / "openapi.yaml").read_text())
    original = yaml.safe_load((ROOT / "docs/platform.openapi.normalized.yaml").read_text())
    service = json.loads((ROOT / "docs/assistant.openapi.json").read_text())
    validate(platform)
    validate(service)
    assert "/assistant/chat" not in platform["paths"]
    replaced = {
        "/assistant/chat",
        "/assistant/proposals",
        "/assistant/proposals/{id}/confirm",
        "/assistant/proposals/{id}/reject",
    }
    assert "/assistant/proposals/{id}/confirm" not in platform["paths"]
    assert "/assistant/proposals/{proposal_id}/confirm" in platform["paths"]
    for path, value in original["paths"].items():
        if path not in replaced:
            assert platform["paths"][path] == value
    path = service["paths"]["/assistant/conversations/{conversation_id}/messages"]["post"]
    assert set(path["responses"]["200"]["content"]) == {"text/event-stream"}
    assert "application/problem+json" in path["responses"]["403"]["content"]
