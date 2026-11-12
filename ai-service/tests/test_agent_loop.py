import json

import httpx
from conftest import auth, events
from pydantic import SecretStr
from sqlalchemy import func, select

from app.main import create_app
from app.models import ToolCall


def sse_frames(*payloads):
    return httpx.Response(
        200,
        text="".join("data: " + json.dumps(payload) + "\n\n" for payload in payloads)
        + "data: [DONE]\n\n",
    )


async def test_agent_calls_tool_then_streams_answer_and_persists_sources(app, settings):
    requests = []

    def gateway(request):
        body = json.loads(request.content)
        requests.append(body)
        assert [item["function"]["name"] for item in body["tools"]] == ["get_defect_summary"]
        if len(requests) == 1:
            return sse_frames(
                {
                    "choices": [
                        {
                            "delta": {
                                "reasoning_content": "internal-private-reasoning",
                                "tool_calls": [
                                    {
                                        "index": 0,
                                        "id": "call-1",
                                        "function": {
                                            "name": "get_defect_summary",
                                            "arguments": '{"station_id":"st-',
                                        },
                                    }
                                ],
                            }
                        }
                    ]
                },
                {
                    "choices": [
                        {
                            "delta": {
                                "tool_calls": [
                                    {
                                        "index": 0,
                                        "function": {
                                            "arguments": '03","start":"2026-11-01","end":"2026-11-11"}'
                                        },
                                    }
                                ]
                            },
                            "finish_reason": "tool_calls",
                        }
                    ]
                },
            )
        result = json.loads(body["messages"][-1]["content"])
        assert result["data"]["change_percentage_points"] == 4
        assert body["messages"][-2]["reasoning_content"] == "internal-private-reasoning"
        return sse_frames(
            {
                "choices": [
                    {
                        "delta": {"content": "Синтетические данные: 6% против 2%, рост 4 п.п."},
                        "finish_reason": "stop",
                    }
                ]
            }
        )

    configured = settings.model_copy(
        update={
            "mode": "llm",
            "provider": "compatible",
            "allow_demo_llm": True,
            "llm_model": "deepseek-v4-flash",
            "llm_api_key": SecretStr("test-only"),
        }
    )
    integrated = create_app(configured, transport=httpx.MockTransport(gateway))
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as client:
            cid = (await client.post("/assistant/conversations", headers=auth(), json={})).json()[
                "id"
            ]
            response = await client.post(
                f"/assistant/conversations/{cid}/messages",
                headers=auth(),
                json={"text": "Сравни брак", "reasoning_mode": "deep"},
            )
            frames = events(response)
            assert frames[-1][1]["status"] == "completed"
            assert any(kind == "tool_start" for kind, _ in frames)
            assert any(kind == "sources" and payload["items"] for kind, payload in frames)
            assert "internal-private-reasoning" not in response.text
            saved = (await client.get(f"/assistant/conversations/{cid}", headers=auth())).json()
            assert saved["messages"][-1]["sources"][0]["tool"] == "get_defect_summary"
            denied = await client.get(
                f"/assistant/conversations/{cid}", headers=auth(permissions=["assistant:use"])
            )
            assert denied.status_code == 403
        async with integrated.state.database.sessions() as session:
            assert await session.scalar(select(func.count()).select_from(ToolCall)) == 1
    assert len(requests) == 2
