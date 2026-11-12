import json

import httpx
import pytest
from conftest import auth, events
from pydantic import SecretStr

from app.auth import Principal
from app.knowledge import KnowledgeClient, SyntheticKnowledgeClient
from app.main import create_app
from app.pulse import SyntheticPulseClient
from app.tools import ToolError, ToolExecutor


def actor(*permissions):
    return Principal(
        "alice",
        frozenset({"assistant:use", *permissions}),
        frozenset({"production"}),
        "test-only-token",
    )


async def test_knowledge_search_article_and_access_denials():
    tools = ToolExecutor(SyntheticPulseClient(), SyntheticKnowledgeClient())
    user = actor("kb:read")
    result = await tools.execute(user, "search_knowledge", {"query": "термопереплёта"})
    document = result.data["matches"][0]["document"]
    assert result.status == "ok" and document["version"] == 1
    assert result.sources[0]["synthetic"] is True
    article = await tools.execute(user, "read_knowledge_article", {"document_id": document["id"]})
    assert "не рабочий регламент" in article.data["content"]
    hidden = await tools.execute(user, "search_knowledge", {"query": "закрытого участка"})
    assert hidden.status == "insufficient_data" and hidden.sources == []
    with pytest.raises(ToolError, match="entity_access_denied"):
        await tools.execute(
            user, "read_knowledge_article", {"document_id": "demo-restricted-maintenance"}
        )
    with pytest.raises(ToolError, match="tool_access_denied"):
        await tools.execute(actor(), "search_knowledge", {"query": "термопереплёт"})
    with pytest.raises(ToolError, match="invalid_tool_arguments"):
        await tools.execute(user, "read_knowledge_article", {"document_id": "../secret"})


async def test_platform_search_contract_and_unavailable_article_body():
    requests = []

    def platform(request):
        requests.append(request)
        assert request.headers["authorization"] == "Bearer test-only-token"
        if request.url.path == "/kb/articles/doc-1":
            return httpx.Response(403)
        assert request.url.path == "/kb/search" and request.url.params["ai"] == "true"
        if request.url.params["q"] == "invalid":
            return httpx.Response(200, json=[{"fragment": "No document metadata"}])
        if request.url.params["q"] == "denied":
            return httpx.Response(403)
        return httpx.Response(
            200,
            json=[
                {
                    "document": {
                        "id": "doc-1",
                        "title": "Approved instruction",
                        "aclLevel": "department",
                        "version": 3,
                        "updatedAtUtc": "2026-11-11T09:00:00Z",
                    },
                    "fragment": "Retrieved instruction fragment",
                    "score": 0.9,
                }
            ],
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(platform)) as http:
        knowledge = KnowledgeClient("http://platform", http)
        tools = ToolExecutor(SyntheticPulseClient(), knowledge)
        user = actor("kb:read")
        assert [tool["function"]["name"] for tool in tools.definitions(user)] == [
            "search_knowledge"
        ]
        result = await tools.execute(user, "search_knowledge", {"query": "instruction"})
        assert result.sources[0]["version"] == 3
        assert result.sources[0]["synthetic"] is False
        result = await tools.execute(user, "search_knowledge", {"query": "invalid"})
        assert result.status == "unavailable" and result.code == "knowledge_response_invalid"
        with pytest.raises(ToolError, match="entity_access_denied"):
            await tools.execute(user, "search_knowledge", {"query": "denied"})
        with pytest.raises(ToolError, match="tool_not_available"):
            await tools.execute(user, "read_knowledge_article", {"document_id": "doc-1"})
        from app.pulse import PulseForbidden

        with pytest.raises(PulseForbidden):
            await knowledge.authorize(user, "doc-1")
    assert len(requests) == 4


async def test_agent_knowledge_sources_survive_reload_but_revoked_document_blocks_history(
    app, settings
):
    requests = []

    def model(request):
        body = json.loads(request.content)
        requests.append(body)
        if len(requests) == 1:
            delta = {
                "tool_calls": [
                    {
                        "index": 0,
                        "id": "kb-search",
                        "function": {
                            "name": "search_knowledge",
                            "arguments": json.dumps({"query": "термопереплёта"}),
                        },
                    }
                ]
            }
        elif len(requests) == 2:
            result = json.loads(body["messages"][-1]["content"])
            document_id = result["data"]["matches"][0]["document"]["id"]
            delta = {
                "tool_calls": [
                    {
                        "index": 0,
                        "id": "kb-article",
                        "function": {
                            "name": "read_knowledge_article",
                            "arguments": json.dumps({"document_id": document_id}),
                        },
                    }
                ]
            }
        else:
            result = json.loads(body["messages"][-1]["content"])
            assert "не рабочий регламент" in result["data"]["content"]
            delta = {"content": "Тестовая инструкция demo-thermobinding-check, версия 1."}
        frame = {"choices": [{"delta": delta, "finish_reason": "stop"}]}
        return httpx.Response(200, text="data: " + json.dumps(frame) + "\n\ndata: [DONE]\n\n")

    configured = settings.model_copy(
        update={
            "mode": "llm",
            "allow_demo_llm": True,
            "llm_model": "test-model",
            "llm_api_key": SecretStr("test-only"),
        }
    )
    integrated = create_app(configured, transport=httpx.MockTransport(model))
    headers = auth(permissions=["assistant:use", "kb:read"])
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as client:
            cid = (await client.post("/assistant/conversations", headers=headers, json={})).json()[
                "id"
            ]
            response = await client.post(
                f"/assistant/conversations/{cid}/messages",
                headers=headers,
                json={"text": "Найди инструкцию по термопереплёту"},
            )
            assert events(response)[-1][1]["status"] == "completed"
            saved = (await client.get(f"/assistant/conversations/{cid}", headers=headers)).json()
            sources = saved["messages"][-1]["sources"]
            assert {source["tool"] for source in sources} == {
                "search_knowledge",
                "read_knowledge_article",
            }
            assert all(
                source["version"] == 1 and source["type"] == "knowledge" for source in sources
            )
            # Same user, permissions and department scope; document ACL alone changes.
            del integrated.state.knowledge.articles["demo-thermobinding-check"]
            denied = await client.get(f"/assistant/conversations/{cid}", headers=headers)
            assert denied.status_code == 403
            denied = await client.post(
                f"/assistant/conversations/{cid}/messages",
                headers=headers,
                json={"text": "Продолжи анализ по инструкции"},
            )
            assert denied.status_code == 403
    assert len(requests) == 3
