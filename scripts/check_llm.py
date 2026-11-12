"""Check provider credentials and model catalog without requiring platform JWT configuration."""

import argparse
import asyncio
import logging
import os

import httpx
from app.config import Settings
from app.providers import CompatibleLLMProvider
from dotenv import load_dotenv
from pydantic import SecretStr


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--list", action="store_true", help="List models without a paid generation"
    )
    args = parser.parse_args()
    load_dotenv(".env")
    load_dotenv("ai-service/.env", override=True)
    key = os.environ.get("AIAI_API_KEY", "")
    if not key.strip():
        parser.exit(
            2, "Добавьте AIAI_API_KEY в ai-service/.env. Ключ не выводится в консоль.\n"
        )
    settings = Settings.model_construct(
        provider="aiai",
        llm_base_url=os.environ.get("AI_BASE_URL", "https://api.aiai.by/v1"),
        llm_api_key=SecretStr(key),
        llm_model=os.environ.get("AI_MODEL", ""),
    )
    logging.disable(logging.CRITICAL)
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=False) as http:
            provider = CompatibleLLMProvider(settings, http)
            models = await provider.available_models()
            if args.list:
                for model in sorted(models):
                    print(model)
                return
            if not settings.llm_model or settings.llm_model not in models:
                parser.exit(
                    2,
                    "AI_MODEL не найден в каталоге. Выполните --list и укажите точный ID.\n",
                )
            async with asyncio.timeout(120):
                async for chunk in provider.stream(
                    [
                        {
                            "role": "user",
                            "content": "Ответь кратко по-русски: подключение работает.",
                        }
                    ]
                ):
                    print(chunk, end="", flush=True)
            print("\nOK: модель ответила через SSE.")
    except httpx.HTTPStatusError as exc:
        parser.exit(
            1,
            f"Провайдер вернул HTTP {exc.response.status_code}; проверьте ключ, баланс и endpoint.\n",
        )
    except (
        httpx.HTTPError,
        ValueError,
        KeyError,
        TypeError,
        RuntimeError,
        TimeoutError,
    ):
        parser.exit(
            1,
            "Проверка не завершена: ошибка соединения или формата SSE. Секреты и тело ошибки скрыты.\n",
        )


if __name__ == "__main__":
    asyncio.run(main())
