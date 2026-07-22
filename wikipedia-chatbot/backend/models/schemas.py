"""Pydantic schemas for chatbot API request and response bodies."""

from pydantic import BaseModel


class QuestionRequest(BaseModel):
    """Incoming question from the client."""

    question: str


class AnswerResponse(BaseModel):
    """Answer returned to the client."""

    answer: str
