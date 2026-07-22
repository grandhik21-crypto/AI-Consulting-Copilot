import json

import pandas as pd
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.services.gemini_service import get_model
from app.services.excel_store import get_dataframe
from app.services.dashboard_store import add_summary

router = APIRouter()


class ExcelAskRequest(BaseModel):
    spreadsheet_id: str
    question: str


class ExcelAskResponse(BaseModel):
    answer: str
    calculation: str


class ExcelSummarizeRequest(BaseModel):
    spreadsheet_id: str


class ExcelSummarizeResponse(BaseModel):
    executive_summary: str
    key_findings: list[str]
    risks: list[str]
    recommendations: list[str]
    next_steps: list[str]


def _build_context(df: pd.DataFrame) -> str:
    lines = [f"Columns: {', '.join(df.columns)}"]
    lines.append(f"Data types: {dict(df.dtypes.astype(str))}")
    lines.append(f"Rows: {len(df)}")
    lines.append(f"\nFirst 5 rows:\n{df.head(5).to_string(index=False)}")
    return "\n".join(lines)


def _build_summary_context(df: pd.DataFrame) -> str:
    desc = df.describe(include="all", datetime_is_numeric=True).to_string()
    missing = df.isnull().sum().to_dict()
    missing_str = "\n".join(f"  {k}: {v}" for k, v in missing.items() if v > 0)
    if not missing_str:
        missing_str = "  None"

    return (
        f"Dataset: {len(df)} rows x {len(df.columns)} columns\n"
        f"Columns: {', '.join(df.columns)}\n"
        f"Data types: {dict(df.dtypes.astype(str))}\n\n"
        f"Descriptive statistics:\n{desc}\n\n"
        f"Missing values:\n{missing_str}\n\n"
        f"First 5 rows:\n{df.head(5).to_string(index=False)}"
    )


def _execute_expression(expr: str, df: pd.DataFrame) -> str:
    namespace = {"df": df, "pd": pd}
    result = eval(expr, {"__builtins__": {}}, namespace)
    return str(result)


@router.post("/excel/ask", response_model=ExcelAskResponse)
async def ask_excel(body: ExcelAskRequest):
    df = get_dataframe(body.spreadsheet_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Spreadsheet not found")

    model = get_model()

    code_prompt = (
        "You are a pandas expert. Given a DataFrame and a user question, "
        "output ONLY a single Python expression that uses pandas to answer the question.\n"
        "The expression must use the variable name 'df'.\n"
        "Do NOT include any explanation, markdown, or code fences.\n"
        "Example: df['Revenue'].max()\n"
        "Example: df[df['Region'] == 'North']['Sales'].sum()\n"
        "Example: df.groupby('Region')['Profit'].mean()\n\n"
        f"{_build_context(df)}\n\n"
        f"Question: {body.question}\n\n"
        "Expression:"
    )

    try:
        expr = model.generate_content(code_prompt).text.strip()
        calculation = _execute_expression(expr, df)

        explain_prompt = (
            "You are a data analyst. Explain the following calculation result in one clear sentence.\n"
            f"Original question: {body.question}\n"
            f"Pandas expression used: {expr}\n"
            f"Result: {calculation}\n\n"
            "Your explanation:"
        )
        explanation = model.generate_content(explain_prompt).text.strip()

        return ExcelAskResponse(answer=explanation, calculation=calculation)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Analysis error: {str(e)}",
        )


@router.post("/excel/summarize", response_model=ExcelSummarizeResponse)
async def summarize_excel(body: ExcelSummarizeRequest):
    df = get_dataframe(body.spreadsheet_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Spreadsheet not found")

    model = get_model()

    prompt = (
        "You are a senior management consultant. Analyze the dataset below and "
        "produce a professional executive summary. Output ONLY valid JSON with "
        "exactly these keys (no markdown, no code fences):\n"
        "- executive_summary: 2-3 sentence overview\n"
        "- key_findings: array of 3-6 bullet points\n"
        "- risks: array of 2-4 risks\n"
        "- recommendations: array of 3-5 actionable recommendations\n"
        "- next_steps: array of 2-4 concrete next steps\n\n"
        f"{_build_summary_context(df)}"
    )

    try:
        raw = model.generate_content(prompt).text.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(raw)
        add_summary()
        return ExcelSummarizeResponse(
            executive_summary=data.get("executive_summary", ""),
            key_findings=data.get("key_findings", []),
            risks=data.get("risks", []),
            recommendations=data.get("recommendations", []),
            next_steps=data.get("next_steps", []),
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Summary generation failed: {str(e)}",
        )
