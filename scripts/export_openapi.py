"""Export AI-owned routes while preserving unrelated platform routes."""

import json
import re
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "ai-service"))
from app.config import Settings
from app.main import create_app

root = Path(__file__).resolve().parents[1]
settings = Settings(
    _env_file=None,
    auth_mode="demo",
    demo_jwt_secret="contract-export-only-" + "x" * 32,
)
schema = create_app(settings).openapi()
(root / "docs/assistant.openapi.json").write_text(
    json.dumps(schema, ensure_ascii=False, indent=2) + "\n"
)


def to_openapi30(value):
    """Convert nullable unions while preserving the platform's existing 3.0.3 contract."""
    if isinstance(value, list):
        return [to_openapi30(item) for item in value]
    if not isinstance(value, dict):
        return value
    value = {key: to_openapi30(item) for key, item in value.items()}
    if "const" in value:
        value["enum"] = [value.pop("const")]
    if "anyOf" in value and {"type": "null"} in value["anyOf"]:
        choices = [item for item in value.pop("anyOf") if item != {"type": "null"}]
        value["nullable"] = True
        if len(choices) == 1:
            if "$ref" in choices[0]:
                value["allOf"] = choices
            else:
                value.update(choices[0])
        else:
            value["anyOf"] = choices
    return value


source = (root / "docs/platform.openapi.original.yaml").read_text()
# Quote tag descriptions: ': ' breaks parsing, commas silently create extra mapping keys.
source = re.sub(
    r"^(\s+- \{ name: [^,]+,\s+description: )(.+)( \})$",
    lambda match: match[1] + json.dumps(match[2], ensure_ascii=False) + match[3],
    source,
    flags=re.MULTILINE,
)
source = source.replace(
    "description: экран, с которого вызван ассистент }",
    'description: "экран, с которого вызван ассистент" }',
)
source = source.replace(
    "example: Фотокнига 20×20, 20 разворотов }",
    'example: "Фотокнига 20×20, 20 разворотов" }',
)
source = re.sub(
    r"^(\s+summary: )([^\"'{\n][^\n]*: [^\n]*)$",
    lambda match: match[1] + json.dumps(match[2], ensure_ascii=False),
    source,
    flags=re.MULTILINE,
)
platform = yaml.safe_load(source)
(root / "docs/platform.openapi.normalized.yaml").write_text(source)
platform["paths"].pop("/assistant/chat", None)
for legacy_path in (
    "/assistant/proposals/{id}/confirm",
    "/assistant/proposals/{id}/reject",
):
    platform["paths"].pop(legacy_path, None)
for path, definition in schema["paths"].items():
    if path.startswith("/assistant/"):
        platform["paths"][path] = to_openapi30(definition)
platform["components"]["schemas"].update(to_openapi30(schema["components"]["schemas"]))
platform["components"]["securitySchemes"].update(
    schema["components"]["securitySchemes"]
)
platform["info"]["version"] = "0.10.0"
platform["info"]["description"] += (
    "\nAI-сервис: маршруты conversations проксируются на localhost:8081. /assistant/chat заменён.\n"
)
(root / "openapi.yaml").write_text(
    yaml.safe_dump(platform, allow_unicode=True, sort_keys=False)
)
print("Updated docs/assistant.openapi.json and openapi.yaml")
