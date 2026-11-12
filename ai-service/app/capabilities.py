"""A permission-filtered configuration snapshot, not a provider health check."""

from typing import get_args

from app.limits import (
    MAX_AGENT_ROUNDS,
    MAX_AGENT_TOOL_CALLS,
    MAX_MESSAGE_CHARS,
    MAX_QUALITY_PERIOD_DAYS,
)
from app.providers import CompatibleLLMProvider
from app.schemas import (
    ActionCapability,
    AssistantCapabilities,
    CapabilityLimits,
    ModuleCapability,
    ModuleContext,
    ReasoningModeCapability,
    ToolCapability,
)

TOOL_MODULES = {
    "get_stations": "equipment",
    "get_defect_summary": "production",
    "search_knowledge": "kb",
    "read_knowledge_article": "kb",
}


def reasoning_modes(settings):
    modes = [
        ReasoningModeCapability(
            id="standard",
            timeout_seconds=settings.stream_timeout_seconds,
            max_output_tokens=settings.llm_max_tokens if settings.mode == "llm" else None,
            simulated=settings.mode == "demo",
        )
    ]
    if settings.mode == "demo" or (settings.llm_model or "").startswith("deepseek"):
        modes.append(
            ReasoningModeCapability(
                id="deep",
                timeout_seconds=settings.deep_timeout_seconds,
                max_output_tokens=settings.deep_max_tokens if settings.mode == "llm" else None,
                simulated=settings.mode == "demo",
            )
        )
    return modes


def build_capabilities(state, user):
    settings = state.settings
    synthetic = settings.auth_mode == "demo"
    agent_enabled = settings.mode == "llm" and isinstance(
        state.orchestrator.provider, CompatibleLLMProvider
    )
    proposals = state.proposals.definitions(user)
    definitions = state.tools.definitions(user) + proposals if agent_enabled else []
    tools = []
    for definition in definitions:
        name = definition["function"]["name"]
        pending = name == "get_defect_summary" and not synthetic
        tools.append(
            ToolCapability(
                name=name,
                kind="proposal" if name == "propose_task" else "read",
                data_source=None if pending else "synthetic" if synthetic else "platform_api",
                contract_status="pending" if pending else "supported",
                unavailable_reason="quality_aggregate_contract_not_configured" if pending else None,
            )
        )
    modules = []
    for module in get_args(ModuleContext.model_fields["module"].annotation):
        if f"{module}:read" not in user.permissions:
            continue
        station_context = module in {"production", "equipment"}
        modules.append(
            ModuleCapability(
                id=module,
                entity_types=["station"] if station_context else [],
                unsupported_filters_with_entity=["department"]
                if station_context and not synthetic
                else [],
                data_tools=[tool.name for tool in tools if TOOL_MODULES.get(tool.name) == module],
            )
        )
    return AssistantCapabilities(
        mode=settings.mode,
        model=settings.llm_model if settings.mode == "llm" else None,
        tool_calling=agent_enabled,
        reasoning_modes=reasoning_modes(settings),
        modules=modules,
        context_filters=["from", "to", "department", "product"],
        tools=tools,
        actions=[ActionCapability(id="create_task", proposal_tool="propose_task")]
        if proposals
        else [],
        limits=CapabilityLimits(
            global_generation_requests_per_minute=settings.global_generation_requests_per_minute,
            global_generation_requests_per_day=settings.global_generation_requests_per_day,
            global_max_concurrent_generations=settings.global_max_concurrent_generations,
            generation_requests_per_minute=settings.generation_requests_per_minute,
            generation_requests_per_day=settings.generation_requests_per_day,
            max_concurrent_generations_per_user=settings.max_concurrent_generations_per_user,
            max_message_chars=MAX_MESSAGE_CHARS,
            max_response_chars=settings.max_output_chars,
            history_max_messages=settings.history_max_messages,
            history_max_chars=settings.history_max_chars,
            max_agent_rounds=MAX_AGENT_ROUNDS,
            max_agent_tool_calls=MAX_AGENT_TOOL_CALLS,
            max_quality_period_days=MAX_QUALITY_PERIOD_DAYS,
        ),
    )
