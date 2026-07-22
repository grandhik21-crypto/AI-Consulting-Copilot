"""FastAPI application entry point."""

from pathlib import Path
from typing import Annotated, Callable

from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles

from models.schemas import AnswerResponse, QuestionRequest
from services.wikipedia_service import get_summary

app = FastAPI()

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"

WikipediaSummaryFn = Callable[[str], str]


def get_wikipedia_summary() -> WikipediaSummaryFn:
    """Provide the Wikipedia lookup function to route handlers."""
    return get_summary


@app.get("/health")
def health_check():
    return {"status": "running"}


@app.post("/ask", response_model=AnswerResponse)
def ask(
    request: QuestionRequest,
    summary_fn: Annotated[WikipediaSummaryFn, Depends(get_wikipedia_summary)],
) -> AnswerResponse:
    answer = summary_fn(request.question)
    return AnswerResponse(answer=answer)


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
