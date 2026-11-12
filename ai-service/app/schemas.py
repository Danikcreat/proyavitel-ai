from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.limits import MAX_MESSAGE_CHARS

Identifier = Annotated[
    str, StringConstraints(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_.:-]+$")
]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class EntityContext(StrictModel):
    type: Identifier
    id: Identifier


class ContextFilters(StrictModel):
    from_date: date | None = Field(default=None, alias="from")
    to: date | None = None
    department: Identifier | None = None
    product: Identifier | None = None

    @model_validator(mode="after")
    def valid_period(self):
        if self.from_date and self.to and self.from_date > self.to:
            raise ValueError("from must be before or equal to to")
        return self


class ModuleContext(StrictModel):
    module: Literal[
        "metrics",
        "decisions",
        "sales",
        "support",
        "production",
        "moderation",
        "tasks",
        "marketing",
        "equipment",
        "hr",
        "recruiting",
        "finance",
        "kb",
        "approvals",
        "data-quality",
        "catalog",
        "orders",
    ]
    screen: Identifier | None = None
    entity: EntityContext | None = None
    filters: ContextFilters = Field(default_factory=ContextFilters)


class ContextState(StrictModel):
    context: ModuleContext | None = None
    origin: Literal["none", "current", "inherited", "cleared"] = "none"
    source_message_id: str | None = None
    topic_start_message_id: str | None = None
    missing_fields: list[str] = Field(default_factory=list)


class ConversationCreate(StrictModel):
    title: str = Field(default="Новый диалог", min_length=1, max_length=120)


class MessageCreate(StrictModel):
    text: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS, pattern=r"\S")
    context: ModuleContext | None = None
    reasoning_mode: Literal["standard", "deep"] = "standard"
    reset_context: bool = False

    @model_validator(mode="after")
    def validate_context_reset(self):
        if self.reset_context and self.context is not None:
            raise ValueError("Context and reset_context cannot be used together")
        return self


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    created_at: datetime
    updated_at: datetime


class AnalysisRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    message_id: str
    conversation_id: str
    trace_id: str
    mode: Literal["demo", "llm"]
    provider: str | None
    model: str | None
    reasoning_mode: Literal["standard", "deep"]
    status: Literal["preparing", "running", "completed", "failed", "cancelled", "interrupted"]
    started_at: datetime
    finished_at: datetime | None
    preparation_ms: int | None
    first_text_ms: int | None
    total_ms: int | None
    provider_calls: int | None
    provider_retries: int | None
    provider_time_ms: int | None
    tool_calls: int | None
    tool_time_ms: int | None
    output_chars: int | None
    reported_prompt_tokens: int | None
    reported_completion_tokens: int | None
    reported_total_tokens: int | None
    usage_status: Literal["unknown", "partial", "complete"]
    error_code: str | None


class AnalysisRunList(BaseModel):
    items: list[AnalysisRunOut]
    limit: int
    offset: int


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    sequence: int
    role: Literal["user", "assistant"]
    text: str
    context: ModuleContext | None
    status: Literal["streaming", "completed", "failed", "cancelled", "interrupted"]
    created_at: datetime
    reasoning_mode: Literal["standard", "deep"] = "standard"
    sources: list[dict] | None = None
    reset_context: bool = False
    effective_context: ContextState | None = None
    diagnostics: AnalysisRunOut | None = None


class TaskProposalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    conversation_id: str
    message_id: str
    payload: dict
    reason: str
    status: Literal["pending", "confirmed", "rejected", "executed", "failed"]
    created_at: datetime
    expires_at: datetime
    result: dict | None
    synthetic: bool = True
    requires_confirmation: bool = True


class ConversationDetail(ConversationOut):
    messages: list[MessageOut]
    proposals: list[TaskProposalOut] = Field(default_factory=list)
    effective_context: ContextState = Field(default_factory=ContextState)


class ConversationList(BaseModel):
    items: list[ConversationOut]
    limit: int
    offset: int


class Problem(BaseModel):
    title: str
    status: int
    detail: str
    traceId: str


class ReasoningModeCapability(StrictModel):
    id: Literal["standard", "deep"]
    timeout_seconds: float
    max_output_tokens: int | None
    simulated: bool


class ToolCapability(StrictModel):
    name: str
    kind: Literal["read", "proposal"]
    data_source: Literal["synthetic", "platform_api"] | None
    contract_status: Literal["supported", "pending"]
    unavailable_reason: str | None = None


class ModuleCapability(StrictModel):
    id: str
    entity_types: list[Literal["station"]] = Field(default_factory=list)
    unsupported_filters_with_entity: list[Literal["department"]] = Field(default_factory=list)
    data_tools: list[str] = Field(default_factory=list)


class ActionCapability(StrictModel):
    id: Literal["create_task"]
    proposal_tool: Literal["propose_task"]
    requires_confirmation: Literal[True] = True
    execution: Literal["synthetic"] = "synthetic"


class CapabilityLimits(StrictModel):
    global_generation_requests_per_minute: int
    global_generation_requests_per_day: int
    global_max_concurrent_generations: int
    generation_requests_per_minute: int
    generation_requests_per_day: int
    max_concurrent_generations_per_user: int
    max_message_chars: int
    max_response_chars: int
    history_max_messages: int
    history_max_chars: int
    max_agent_rounds: int
    max_agent_tool_calls: int
    max_quality_period_days: int = Field(description="Максимальная разница end - start, в днях")


class CapabilityFeatures(StrictModel):
    streaming: bool = True
    conversation_history: bool = True
    reset_context: bool = True
    sources: bool = True
    run_diagnostics: bool = True


class AssistantCapabilities(StrictModel):
    schema_version: Literal["1"] = "1"
    mode: Literal["demo", "llm"]
    model: str | None
    tool_calling: bool
    reasoning_modes: list[ReasoningModeCapability]
    modules: list[ModuleCapability]
    context_filters: list[Literal["from", "to", "department", "product"]]
    tools: list[ToolCapability]
    actions: list[ActionCapability]
    limits: CapabilityLimits
    features: CapabilityFeatures = Field(default_factory=CapabilityFeatures)
