from collections import deque

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm import ask_llm 

#Create app FastAPI
app = FastAPI(
    title="AI Team Assistant API",
    description="Backend API for the AI Team Assistant Dashboard.",
    version="1.0.0",
)
#Configure CORS for React frontend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: str 
    mode: str 


class ChatResponse(BaseModel):
    answer: str 


class HistoryItem(BaseModel):
    prompt: str 
    answer: str 


#Store the last 5 chat requests in memory
history: deque[HistoryItem] = deque(maxlen=5)

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a user prompt and return the AI response.
    """
    if not request.prompt.strip():
        raise HTTPException(
            status_code=400,
            detail="Prompt cannot be empty.",
        )

    if request.mode not in {
        "code-reviewer",
        "product-manager",
        "technical-writer",
        "brainstormer",
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid assistant mode."
        )


    try:
        answer = await ask_llm(
            mode=request.mode,
            prompt=request.prompt,
        )

        history.append(
            HistoryItem(
                prompt=request.prompt,
                answer=answer,
           )
        )
        return ChatResponse(answer=answer)

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI service is temporarily unavailable: {exc}",
        )


@app.get("/history", response_model=list[HistoryItem])
async def get_history() -> list[HistoryItem]:
    """
    Return the last five chat interactions.
    """
    return list(reversed(history))
