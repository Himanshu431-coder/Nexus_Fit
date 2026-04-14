from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_engine import rag

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"


class ChatResponse(BaseModel):
    response: str
    sources: list[str]
    confidence: float
    ml_prediction: dict | None = None
    retrieved_docs: int


@router.post("/coach/chat", response_model=ChatResponse)
def chat(msg: ChatMessage):
    """RAG-powered AI Coach chat endpoint."""
    result = rag.query(msg.message)
    return result