import json
from typing import Optional

import pandas as pd
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.services.gemini_service import get_model
from app.services.document_store import get_document
from app.services.excel_store import get_dataframe
from app.services.dashboard_store import add_swot

router = APIRouter()


class SwotRequest(BaseModel):
    source_type: str  # "pdf" | "excel" | "chat"
    source_id: Optional[str] = None
    chat_history: Optional[list[dict]] = None


class SwotResponse(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    opportunities: list[str]
    threats: list[str]


def _build_chat_context(history: list[dict]) -> str:
    lines = []
    for msg in history:
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        lines.append(f"[{role.upper()}]: {content}")
    return "\n".join(lines)


def _build_excel_context(df: pd.DataFrame) -> str:
    desc = df.describe(include="all", datetime_is_numeric=True).to_string()
    missing = df.isnull().sum().to_dict()
    missing_str = "\n".join(f"  {k}: {v}" for k, v in missing.items() if v > 0) or "  None"
    return (
        f"Dataset: {len(df)} rows x {len(df.columns)} columns\n"
        f"Columns: {', '.join(df.columns)}\n"
        f"Data types: {dict(df.dtypes.astype(str))}\n\n"
        f"Descriptive statistics:\n{desc}\n\n"
        f"Missing values:\n{missing_str}\n\n"
        f"First 5 rows:\n{df.head(5).to_string(index=False)}"
    )


SWOT_PROMPT = (
    "You are a senior management consultant conducting a strategic SWOT analysis. "
    "Analyze the provided context and produce a professional, insightful SWOT analysis "
    "tailored to the specific data. Output ONLY valid JSON with exactly these keys "
    "(no markdown, no code fences, no explanation):\n"
    "- strengths: array of 4-8 specific bullet points\n"
    "- weaknesses: array of 4-8 specific bullet points\n"
    "- opportunities: array of 4-8 specific bullet points\n"
    "- threats: array of 4-8 specific bullet points\n\n"
    "Context:\n{context}"
)


@router.post("/swot", response_model=SwotResponse)
async def swot_analysis(body: SwotRequest):
    if body.source_type not in ("pdf", "excel", "chat"):
        raise HTTPException(status_code=400, detail="source_type must be 'pdf', 'excel', or 'chat'")

    try:
        if body.source_type == "pdf":
            if not body.source_id:
                raise HTTPException(status_code=400, detail="source_id is required for pdf source")
            doc_text = get_document(body.source_id)
            if doc_text is None:
                raise HTTPException(status_code=404, detail="Document not found")
            context = doc_text[:8000]

        elif body.source_type == "excel":
            if not body.source_id:
                raise HTTPException(status_code=400, detail="source_id is required for excel source")
            df = get_dataframe(body.source_id)
            if df is None:
                raise HTTPException(status_code=404, detail="Spreadsheet not found")
            context = _build_excel_context(df)

        else:  # chat
            if not body.chat_history or len(body.chat_history) == 0:
                raise HTTPException(status_code=400, detail="chat_history is required for chat source")
            context = _build_chat_context(body.chat_history[-20:])

        model = get_model()
        prompt = SWOT_PROMPT.format(context=context)
        raw = model.generate_content(prompt).text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)

        strengths = data.get("strengths", [])
        add_swot(body.source_type, len(strengths))
        return SwotResponse(
            strengths=strengths,
            weaknesses=data.get("weaknesses", []),
            opportunities=data.get("opportunities", []),
            threats=data.get("threats", []),
        )

    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Failed to parse SWOT response as JSON")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SWOT analysis failed: {str(e)}")
