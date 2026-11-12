from typing import Literal

from pydantic import AliasChoices, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AI_",
        env_file=(".env", "ai-service/.env"),
        extra="ignore",
        populate_by_name=True,
    )
    provider: Literal["compatible", "aiai"] = "compatible"

    database_url: str = "postgresql+asyncpg://proyavitel@localhost:5432/proyavitel"
    mode: Literal["demo", "llm"] = "demo"
    auth_mode: Literal["demo", "jwt"] = "jwt"
    demo_ui_enabled: bool = True
    allow_demo_llm: bool = False
    demo_chunk_delay_seconds: float = Field(default=0.06, ge=0, le=1, allow_inf_nan=False)
    jwt_issuer: str = "pulse"
    jwt_audience: str = "pulse-ai"
    jwt_public_key: str | None = None
    jwt_jwks_url: str | None = None
    demo_jwt_secret: SecretStr | None = None
    platform_base_url: str | None = None
    llm_base_url: str = Field(
        default="https://api.openai.com/v1",
        validation_alias=AliasChoices("AI_BASE_URL", "AI_LLM_BASE_URL"),
    )
    llm_api_key: SecretStr | None = Field(
        default=None, validation_alias=AliasChoices("AIAI_API_KEY", "AI_LLM_API_KEY")
    )
    llm_model: str | None = Field(
        default=None, validation_alias=AliasChoices("AI_MODEL", "AI_LLM_MODEL")
    )
    llm_thinking: Literal["enabled", "disabled"] | None = None
    llm_max_tokens: int | None = Field(default=None, ge=32, le=8192)
    llm_read_timeout_seconds: float = Field(default=60, gt=0, allow_inf_nan=False)
    deep_max_tokens: int = Field(default=8192, ge=1024, le=32768)
    deep_timeout_seconds: float = Field(default=300, gt=0, allow_inf_nan=False)
    stream_timeout_seconds: float = Field(default=120, gt=0, allow_inf_nan=False)
    heartbeat_seconds: float = Field(default=10, gt=0, allow_inf_nan=False)
    max_output_chars: int = Field(default=40000, ge=1)
    history_max_messages: int = Field(default=40, ge=1)
    history_max_chars: int = Field(default=80000, ge=16000)
    cors_origins: list[str] = []
    generation_requests_per_minute: int = Field(default=20, ge=1, le=10000)
    generation_requests_per_day: int = Field(default=200, ge=1, le=1000000)
    max_concurrent_generations_per_user: int = Field(default=2, ge=1, le=100)
    global_generation_requests_per_minute: int = Field(default=60, ge=1, le=100000)
    global_generation_requests_per_day: int = Field(default=1000, ge=1, le=10000000)
    global_max_concurrent_generations: int = Field(default=8, ge=1, le=1000)

    @model_validator(mode="after")
    def validate_configuration(self):
        if self.provider == "aiai" and self.llm_base_url == "https://api.openai.com/v1":
            self.llm_base_url = "https://api.aiai.by/v1"
        if self.auth_mode == "demo":
            if not self.demo_jwt_secret or len(self.demo_jwt_secret.get_secret_value()) < 32:
                raise ValueError("Demo auth requires AI_DEMO_JWT_SECRET of at least 32 characters")
            if self.mode != "demo" and not (self.allow_demo_llm and self.demo_ui_enabled):
                raise ValueError("Demo identities cannot be used with an external LLM")
        elif not (bool(self.jwt_public_key) ^ bool(self.jwt_jwks_url)):
            raise ValueError(
                "JWT auth requires exactly one of AI_JWT_PUBLIC_KEY or AI_JWT_JWKS_URL"
            )
        if self.auth_mode == "jwt" and not self.platform_base_url:
            raise ValueError("JWT auth requires AI_PLATFORM_BASE_URL for current permissions")
        if self.mode == "llm" and not (self.llm_api_key and self.llm_model):
            raise ValueError("LLM mode requires AI_LLM_API_KEY and AI_LLM_MODEL")
        return self
