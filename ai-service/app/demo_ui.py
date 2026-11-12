from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, ConfigDict

from app.demo import issue_demo_session

STATIC = Path(__file__).with_name("static")
LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1"}


def local_demo_only(request: Request):
    if request.url.hostname not in LOCAL_HOSTS:
        raise HTTPException(404, "Страница не найдена")
    if request.method == "POST":
        # Browsers must originate here, rather than on another website or dev server.
        origin = str(request.base_url).rstrip("/")
        if request.headers.get("origin") != origin:
            raise HTTPException(403, "Demo-вход доступен только со страницы этого сервиса")
        if request.headers.get("sec-fetch-site") == "cross-site":
            raise HTTPException(403, "Межсайтовый demo-вход запрещён")


class DemoLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user: Literal["director", "worker", "other"]


router = APIRouter(include_in_schema=False, dependencies=[Depends(local_demo_only)])


@router.get("/")
async def index():
    return FileResponse(
        STATIC / "index.html",
        headers={
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
            "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.post("/demo/session")
async def session(body: DemoLogin, request: Request):
    return JSONResponse(
        issue_demo_session(request.app.state.settings, body.user),
        headers={"Cache-Control": "no-store", "Pragma": "no-cache"},
    )
