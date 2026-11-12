import asyncio
import logging
import time
from contextlib import asynccontextmanager, suppress
from typing import Annotated
from uuid import UUID, uuid4

import anyio
import httpx
import jwt
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.access import ContextAccess
from app.auth import Principal, get_principal
from app.capabilities import build_capabilities, reasoning_modes
from app.config import Settings
from app.context_manager import ContextManager
from app.db import Database
from app.demo_ui import STATIC
from app.demo_ui import router as demo_router
from app.diagnostics import RunMetrics
from app.knowledge import KnowledgeClient, SyntheticKnowledgeClient
from app.models import utcnow
from app.orchestrator import Orchestrator
from app.proposals import ProposalService
from app.providers import CompatibleLLMProvider, DemoProvider
from app.pulse import PulseClient, SyntheticPulseClient
from app.repository import Repository
from app.schemas import (
    AnalysisRunList,
    AssistantCapabilities,
    ConversationCreate,
    ConversationDetail,
    ConversationList,
    ConversationOut,
    MessageCreate,
    MessageOut,
    ModuleContext,
    Problem,
    TaskProposalOut,
)
from app.streaming import stream_turn
from app.tools import ToolExecutor

User = Annotated[Principal, Depends(get_principal)]
IdempotencyKey = Annotated[
    str | None,
    Header(alias="Idempotency-Key", min_length=8, max_length=128, pattern=r"^[a-zA-Z0-9_-]+$"),
]


def create_app(settings: Settings | None = None, *, provider=None, transport=None) -> FastAPI:
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app):
        database = Database(settings.database_url)
        async with httpx.AsyncClient(
            timeout=10,
            transport=transport,
            follow_redirects=False,
            limits=httpx.Limits(
                max_connections=100, max_keepalive_connections=20, keepalive_expiry=120
            ),
        ) as http:
            app.state.settings = settings
            app.state.database = database
            app.state.http = http
            app.state.repository = Repository(database)
            app.state.access = ContextAccess(settings, http)
            app.state.contexts = ContextManager(settings, app.state.access)
            app.state.proposals = ProposalService(database, settings, app.state.access)
            pulse = (
                SyntheticPulseClient()
                if settings.auth_mode == "demo"
                else PulseClient(settings.platform_base_url, http)
            )
            app.state.knowledge = (
                SyntheticKnowledgeClient()
                if settings.auth_mode == "demo"
                else KnowledgeClient(settings.platform_base_url, http)
            )
            app.state.tools = ToolExecutor(pulse, app.state.knowledge)
            app.state.jwks = (
                jwt.PyJWKClient(settings.jwt_jwks_url, timeout=5) if settings.jwt_jwks_url else None
            )
            selected = provider or (
                DemoProvider(settings.demo_chunk_delay_seconds)
                if settings.mode == "demo"
                else CompatibleLLMProvider(settings, http)
            )
            app.state.orchestrator = Orchestrator(settings, selected, app.state.contexts)

            async def warm_provider():
                try:
                    await selected.validate_model()
                except (httpx.HTTPError, ValueError, KeyError, TypeError):
                    logging.getLogger("proyavitel").warning("provider_warmup_failed")

            warmup = (
                asyncio.create_task(warm_provider())
                if provider is None and settings.mode == "llm" and settings.provider == "aiai"
                else None
            )
            try:
                yield
            finally:
                if warmup:
                    warmup.cancel()
                    with suppress(asyncio.CancelledError):
                        await warmup
                await database.engine.dispose()

    app = FastAPI(
        title="Проявитель — AI Backend",
        version="0.1.0",
        lifespan=lifespan,
        description="Диалоги ассистента платформы «Пульс». SSE: meta, sources, context, status, tool_start/tool_end, proposal, delta, error, diagnostics, done.",
        responses={
            code: {"model": Problem, "content": {"application/problem+json": {}}}
            for code in (401, 403, 404, 409, 422, 429, 503)
        },
    )
    if settings.auth_mode == "demo" and settings.demo_ui_enabled:
        app.include_router(demo_router)
        app.mount("/demo-assets", StaticFiles(directory=STATIC), name="demo-assets")
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=False,
            allow_methods=["GET", "POST"],
            allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
            expose_headers=["X-Trace-ID", "Retry-After"],
        )

    @app.middleware("http")
    async def trace(request, call_next):
        request.state.trace_id = str(uuid4())
        request.state.started_at = utcnow()
        request.state.started_monotonic = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception as exc:
            response = await handle_unexpected(request, exc)
        response.headers["X-Trace-ID"] = request.state.trace_id
        return response

    def problem(request, status, detail, headers=None):
        return JSONResponse(
            status_code=status,
            media_type="application/problem+json",
            headers=headers,
            content={
                "title": "Ошибка запроса",
                "status": status,
                "detail": detail,
                "traceId": getattr(request.state, "trace_id", str(uuid4())),
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http(request, exc):
        return problem(request, exc.status_code, str(exc.detail), exc.headers)

    @app.exception_handler(RequestValidationError)
    async def handle_validation(request, exc):
        # Validation exceptions can contain the entire user message or Bearer header.
        return problem(request, 422, "Некорректные параметры запроса")

    @app.exception_handler(Exception)
    async def handle_unexpected(request, exc):
        logging.getLogger("proyavitel").error("request_failed trace_id=%s", request.state.trace_id)
        return problem(request, 500, "Внутренняя ошибка сервиса")

    async def check_access(request, user, contexts):
        verified = getattr(request.state, "verified_contexts", set())
        try:
            await request.app.state.contexts.validate(user, contexts, verified)
            request.state.verified_contexts = verified
        except HTTPException as exc:
            if exc.status_code == 403:
                await request.app.state.repository.audit_denied(user.id, request.state.trace_id)
            raise

    async def owned(request, user, conversation_id):
        try:
            conversation = await request.app.state.repository.owned(user.id, str(conversation_id))
            request.state.verified_documents = set()
            await request.app.state.repository.assert_tool_access(
                user,
                str(conversation_id),
                request.app.state.knowledge,
                request.state.verified_documents,
            )
            return conversation
        except HTTPException:
            await request.app.state.repository.audit_denied(user.id, request.state.trace_id)
            raise

    @app.get("/health/live", tags=["Health"])
    async def live():
        return {"status": "ok", "mode": settings.mode, "auth_mode": settings.auth_mode}

    @app.get("/health/ready", tags=["Health"])
    async def ready(request: Request):
        try:
            async with request.app.state.database.sessions() as session:
                await session.execute(text("SELECT 1 FROM conversations LIMIT 1"))
                await session.execute(text("SELECT 1 FROM analysis_runs LIMIT 1"))
                await session.execute(text("SELECT 1 FROM generation_guards LIMIT 1"))
                await session.execute(text("SELECT 1 FROM global_generation_guard LIMIT 1"))
        except Exception:
            raise HTTPException(503, "База данных или миграции не готовы") from None
        return {"status": "ready"}

    @app.get("/assistant/capabilities", response_model=AssistantCapabilities, tags=["Assistant"])
    async def capabilities(request: Request, response: Response, user: User):
        response.headers["Cache-Control"] = "private, no-store"
        response.headers["Vary"] = "Authorization"
        return build_capabilities(request.app.state, user)

    @app.post(
        "/assistant/conversations",
        response_model=ConversationOut,
        status_code=201,
        tags=["Assistant"],
    )
    async def create_conversation(
        body: ConversationCreate,
        request: Request,
        user: User,
        idempotency_key: IdempotencyKey = None,
    ):
        return await request.app.state.repository.create(user.id, body.title, idempotency_key)

    @app.get("/assistant/conversations", response_model=ConversationList, tags=["Assistant"])
    async def list_conversations(
        request: Request,
        user: User,
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
    ):
        items = await request.app.state.repository.list(user.id, limit, offset)
        return {"items": items, "limit": limit, "offset": offset}

    @app.get(
        "/assistant/conversations/{conversation_id}",
        response_model=ConversationDetail,
        tags=["Assistant"],
    )
    async def get_conversation(
        conversation_id: UUID,
        request: Request,
        user: User,
        message_limit: int = Query(100, ge=1, le=500),
        message_offset: int = Query(0, ge=0),
    ):
        conversation = await owned(request, user, conversation_id)
        await request.app.state.repository.recover_expired(str(conversation_id), user.id)
        history = await request.app.state.repository.history(
            str(conversation_id), message_limit, message_offset
        )
        # Recheck current permissions before exposing saved UI context or derived answers.
        # All contexts in the conversation are checked, including those outside this page.
        full_history = await request.app.state.repository.history(str(conversation_id))
        await check_access(
            request,
            user,
            [ModuleContext.model_validate(m.context) for m in full_history if m.context],
        )
        runs = await request.app.state.repository.runs(
            str(conversation_id), limit=message_limit, message_ids=[m.id for m in history]
        )
        by_message = {run.message_id: run for run in runs}
        for message in history:
            message.diagnostics = by_message.get(message.id)
        return {
            **ConversationOut.model_validate(conversation).model_dump(),
            "messages": [MessageOut.model_validate(m) for m in history],
            "proposals": await request.app.state.proposals.list(user, str(conversation_id)),
            "effective_context": request.app.state.contexts.resolve(full_history),
        }

    @app.get(
        "/assistant/conversations/{conversation_id}/runs",
        response_model=AnalysisRunList,
        tags=["Assistant"],
    )
    async def list_runs(
        conversation_id: UUID,
        request: Request,
        user: User,
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
    ):
        await owned(request, user, conversation_id)
        await request.app.state.repository.recover_expired(str(conversation_id), user.id)
        history = await request.app.state.repository.history(str(conversation_id))
        await check_access(
            request,
            user,
            [
                ModuleContext.model_validate(message.context)
                for message in history
                if message.context
            ],
        )
        return {
            "items": await request.app.state.repository.runs(str(conversation_id), limit, offset),
            "limit": limit,
            "offset": offset,
        }

    @app.get("/assistant/proposals", response_model=list[TaskProposalOut], tags=["Assistant"])
    async def list_proposals(request: Request, user: User, conversation_id: UUID | None = None):
        if conversation_id:
            await owned(request, user, conversation_id)
        return await request.app.state.proposals.list(
            user, str(conversation_id) if conversation_id else None
        )

    @app.post(
        "/assistant/proposals/{proposal_id}/confirm",
        response_model=TaskProposalOut,
        tags=["Assistant"],
    )
    async def confirm_proposal(proposal_id: UUID, request: Request, user: User):
        return await request.app.state.proposals.decide(
            user, str(proposal_id), True, request.state.trace_id
        )

    @app.post(
        "/assistant/proposals/{proposal_id}/reject",
        response_model=TaskProposalOut,
        tags=["Assistant"],
    )
    async def reject_proposal(proposal_id: UUID, request: Request, user: User):
        return await request.app.state.proposals.decide(
            user, str(proposal_id), False, request.state.trace_id
        )

    @app.post(
        "/assistant/conversations/{conversation_id}/messages",
        tags=["Assistant"],
        response_class=StreamingResponse,
        responses={
            200: {
                "description": "SSE: meta → sources → context → status/tool_start/tool_end/sources/proposal/delta* → error? → diagnostics → done. diagnostics и done отправляются после сохранения.",
                "content": {"text/event-stream": {"schema": {"type": "string"}}},
            }
        },
    )
    async def send_message(
        conversation_id: UUID,
        body: MessageCreate,
        request: Request,
        user: User,
        idempotency_key: IdempotencyKey = None,
    ):
        state = request.app.state
        if body.reasoning_mode not in {mode.id for mode in reasoning_modes(settings)}:
            raise HTTPException(422, "Подробные рассуждения для выбранной модели ещё не подключены")
        await owned(request, user, conversation_id)
        history = await state.repository.history(str(conversation_id))
        contexts = [ModuleContext.model_validate(m.context) for m in history if m.context]
        await check_access(request, user, [*contexts, body.context])
        payload = body.model_dump(mode="json", by_alias=True, exclude_none=True)
        if not body.reset_context:
            payload.pop("reset_context", None)  # Keep existing request fingerprints stable.
        if body.reasoning_mode == "standard":
            payload.pop("reasoning_mode", None)  # Preserve hashes of pre-existing standard sends.
        timeout = (
            settings.deep_timeout_seconds
            if body.reasoning_mode == "deep"
            else settings.stream_timeout_seconds
        )
        turn = await state.repository.claim(
            user.id,
            str(conversation_id),
            payload,
            idempotency_key,
            timeout,
            admission_settings=settings,
            metrics=RunMetrics(
                started_at=request.state.started_at,
                started_monotonic=request.state.started_monotonic,
            ),
            run_info={
                "trace_id": request.state.trace_id,
                "mode": settings.mode,
                "provider": settings.provider if settings.mode == "llm" else None,
                "model": settings.llm_model if settings.mode == "llm" else None,
            },
        )
        try:
            # Resolve structured context from all messages before bounding text for the LLM.
            history = await state.repository.history(str(conversation_id))
            # A preceding turn may have committed after the first access check.
            await check_access(
                request,
                user,
                [ModuleContext.model_validate(m.context) for m in history if m.context],
            )
            await state.repository.assert_tool_access(
                user, str(conversation_id), state.knowledge, request.state.verified_documents
            )
            if not turn.replay:
                await state.repository.renew(turn, timeout)
            messages, sources, resolved = state.orchestrator.prepare(
                history, reasoning_mode=turn.assistant.reasoning_mode
            )
            if settings.mode == "llm":
                messages[1]["content"] = (
                    '{"available": false, "reason": "Request current business data via the available tools"}'
                )
                sources = []
            if not turn.replay:
                await state.repository.save_context(turn, resolved, sources)
        except BaseException as exc:
            if not turn.replay:
                turn.metrics.error_code = (
                    "request_cancelled"
                    if isinstance(exc, asyncio.CancelledError)
                    else "preparation_access_denied"
                    if isinstance(exc, HTTPException) and exc.status_code == 403
                    else "preparation_failed"
                )
                with anyio.CancelScope(shield=True):
                    await state.repository.finish(
                        turn,
                        "",
                        "cancelled" if isinstance(exc, asyncio.CancelledError) else "failed",
                    )
            raise
        return StreamingResponse(
            stream_turn(request, turn, messages, sources, user=user),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
        )

    # Keep the RFC 7807 schema on its actual media type only.
    original_openapi = app.openapi

    def openapi():
        schema = original_openapi()
        for path in schema["paths"].values():
            for operation in path.values():
                if not isinstance(operation, dict):
                    continue
                for code, response in operation.get("responses", {}).items():
                    if code in {"401", "403", "404", "409", "422", "429", "503"}:
                        response["content"] = {
                            "application/problem+json": {
                                "schema": {"$ref": "#/components/schemas/Problem"}
                            }
                        }
        return jsonable_encoder(schema)

    app.openapi = openapi
    return app
