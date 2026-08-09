"""HTTP API for the AI Team Assistant."""

import logging
import os
from collections import deque
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    RateLimitError,
)
from pydantic import BaseModel, Field

from llm import ask_llm

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("ai_team_assistant")

AssistantMode = Literal[
    "code-reviewer",
    "product-manager",
    "technical-writer",
    "brainstormer",
]

app = FastAPI(
    title="AI Team Assistant API",
    description="Backend API for the AI Team Assistant Dashboard.",
    version="1.1.0",
)

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=8_000)
    mode: AssistantMode


class ChatResponse(BaseModel):
    answer: str


class HistoryItem(BaseModel):
    id: str
    mode: AssistantMode
    prompt: str
    answer: str
    created_at: datetime


class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: str


class ErrorResponse(BaseModel):
    error: ErrorDetail


history: deque[HistoryItem] = deque(maxlen=5)


def _request_id(request: Request) -> str:
    """Return a bounded caller id or generate one for this request."""
    provided_id = request.headers.get("X-Request-ID", "").strip()
    return provided_id[:64] or str(uuid4())


def _error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    request_id: str,
) -> JSONResponse:
    response = JSONResponse(
        status_code=status_code,
        content=ErrorResponse(
            error=ErrorDetail(
                code=code,
                message=message,
                request_id=request_id,
            )
        ).model_dump(mode="json"),
    )
    response.headers["X-Request-ID"] = request_id
    return response


def _success_response(answer: str, request_id: str) -> JSONResponse:
    response = JSONResponse(
        status_code=200,
        content=ChatResponse(answer=answer).model_dump(mode="json"),
    )
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    request_id = _request_id(request)
    fields = [".".join(str(item) for item in error["loc"]) for error in exc.errors()]
    logger.warning(
        "validation_error request_id=%s fields=%s",
        request_id,
        fields,
    )
    return _error_response(
        status_code=400,
        code="VALIDATION_ERROR",
        message="Request validation failed.",
        request_id=request_id,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    """Return application health without calling the LLM provider."""
    return {"status": "ok"}


@app.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)
async def chat(request: ChatRequest, http_request: Request) -> JSONResponse:
    """Validate a prompt, call the provider and store a successful exchange."""
    request_id = _request_id(http_request)
    prompt = request.prompt.strip()

    if not prompt:
        return _error_response(
            status_code=400,
            code="VALIDATION_ERROR",
            message="Prompt cannot be empty.",
            request_id=request_id,
        )

    try:
        answer = await ask_llm(mode=request.mode, prompt=prompt)
    except AuthenticationError:
        logger.exception("provider_authentication_error request_id=%s", request_id)
        return _error_response(
            status_code=502,
            code="LLM_AUTHENTICATION_FAILED",
            message="AI provider authentication failed.",
            request_id=request_id,
        )
    except RateLimitError:
        logger.warning("provider_rate_limit request_id=%s", request_id)
        return _error_response(
            status_code=429,
            code="LLM_RATE_LIMITED",
            message="AI provider rate limit reached. Please try again later.",
            request_id=request_id,
        )
    except APITimeoutError:
        logger.warning("provider_timeout request_id=%s", request_id)
        return _error_response(
            status_code=504,
            code="LLM_TIMEOUT",
            message="AI provider took too long to respond.",
            request_id=request_id,
        )
    except APIConnectionError:
        logger.exception("provider_connection_error request_id=%s", request_id)
        return _error_response(
            status_code=503,
            code="LLM_PROVIDER_UNAVAILABLE",
            message="AI provider is temporarily unavailable.",
            request_id=request_id,
        )
    except APIStatusError as exc:
        logger.exception(
            "provider_status_error request_id=%s status_code=%s",
            request_id,
            exc.status_code,
        )
        return _error_response(
            status_code=502,
            code="LLM_PROVIDER_ERROR",
            message="AI provider returned an error.",
            request_id=request_id,
        )
    except Exception:
        logger.exception("unexpected_chat_error request_id=%s", request_id)
        return _error_response(
            status_code=502,
            code="LLM_PROVIDER_ERROR",
            message="AI service is temporarily unavailable.",
            request_id=request_id,
        )

    item = HistoryItem(
        id=str(uuid4()),
        mode=request.mode,
        prompt=prompt,
        answer=answer,
        created_at=datetime.now(timezone.utc),
    )
    history.append(item)
    return _success_response(answer, request_id)


@app.get("/history", response_model=list[HistoryItem])
async def get_history() -> list[HistoryItem]:
    """Return the last five successful chat interactions, newest first."""
    return list(reversed(history))
