from typing import Optional

from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from app.services.gemini_service import get_model
from app.services.dashboard_store import add_email

router = APIRouter()

EMAIL_TYPES = {
    "meeting_follow_up": "Meeting Follow-up",
    "status_update": "Status Update",
    "client_proposal": "Client Proposal",
    "thank_you": "Thank You",
}

TONES = ["professional", "formal", "friendly"]


class EmailGenerateRequest(BaseModel):
    email_type: str = Field(..., pattern="|".join(EMAIL_TYPES.keys()))
    context: Optional[str] = None
    tone: str = Field(default="professional", pattern="|".join(TONES))


class EmailGenerateResponse(BaseModel):
    subject: str
    body: str
    email_type: str


PROMPT_TEMPLATE = (
    "You are a professional business writer. Generate a {tone} business email "
    "of type '{email_type_label}'.\n\n"
    "{context_section}"
    "Output ONLY valid JSON with exactly these keys (no markdown, no code fences):\n"
    "{{\n"
    '  "subject": "concise email subject line",\n'
    '  "body": "full email body with proper salutation, paragraphs, and signature"\n'
    "}}\n\n"
    "The body should include a proper greeting, clear message, and professional closing."
)

CONTEXT_TEMPLATE = "Context / notes to incorporate:\n{context}\n\n"


@router.post("/email/generate", response_model=EmailGenerateResponse)
async def generate_email(body: EmailGenerateRequest):
    model = get_model()
    email_type_label = EMAIL_TYPES[body.email_type]

    context_section = ""
    if body.context and body.context.strip():
        context_section = CONTEXT_TEMPLATE.format(context=body.context.strip())

    prompt = PROMPT_TEMPLATE.format(
        tone=body.tone,
        email_type_label=email_type_label,
        context_section=context_section,
    )

    try:
        raw = model.generate_content(prompt).text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        import json
        data = json.loads(raw)
        add_email(body.email_type, data.get("subject", ""))
        return EmailGenerateResponse(
            subject=data.get("subject", ""),
            body=data.get("body", ""),
            email_type=body.email_type,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Email generation failed: {str(e)}")
