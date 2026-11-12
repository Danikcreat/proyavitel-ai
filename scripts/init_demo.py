"""Create local-only credentials without printing or committing them. Python 3.9+."""

import os
import secrets
from pathlib import Path

root = Path(__file__).resolve().parents[1]
path = root / ".env"
if path.exists():
    print(".env уже существует; сохранён без изменений.")
else:
    template = (root / ".env.example").read_text()
    content = template.replace("GENERATE_PASSWORD", secrets.token_hex(24)).replace(
        "GENERATE_SECRET", secrets.token_hex(32)
    )
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w") as output:
        output.write(content)
    print("Создан .env с локальными demo-секретами (права 0600).")
