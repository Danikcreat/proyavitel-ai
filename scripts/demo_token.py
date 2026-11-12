"""Issue short-lived demo identities offline; no unauthenticated token endpoint."""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "ai-service"))
from app.config import Settings
from app.demo import issue_demo_session

parser = argparse.ArgumentParser()
parser.add_argument("user", choices=["director", "worker", "other"])
args = parser.parse_args()
settings = Settings()
if settings.auth_mode != "demo":
    parser.error("Demo tokens can only be issued with AI_AUTH_MODE=demo")
print(issue_demo_session(settings, args.user)["token"])
