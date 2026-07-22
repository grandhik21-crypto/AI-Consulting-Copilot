from typing import Optional

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.services.gemini_service import (
    get_gemini_response,
    get_gemini_response_with_context,
)
from app.services.document_store import get_document
from app.services.dashboard_store import add_chat

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    document_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    try:
        if body.document_id:
            doc_text = get_document(body.document_id)
            if doc_text is None:
                raise HTTPException(
                    status_code=404,
                    detail="Document not found. It may have expired.",
                )
            reply = get_gemini_response_with_context(body.message, doc_text)
        else:
            reply = get_gemini_response(body.message)

        add_chat(body.message)
        return ChatResponse(reply=reply)

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {str(e)}",
        )
