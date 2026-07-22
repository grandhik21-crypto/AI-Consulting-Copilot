import uuid
from datetime import datetime

_dashboard = {
    "uploads": [],
    "spreadsheets": [],
    "chats": [],
    "swot": [],
    "slides": [],
    "charts": [],
    "emails": [],
    "summaries": [],
}


def _ts():
    return datetime.utcnow().isoformat() + "Z"


def add_pdf_upload(document_id: str, filename: str, pages: int, word_count: int):
    _dashboard["uploads"].insert(0, {
        "id": document_id,
        "type": "pdf",
        "filename": filename,
        "pages": pages,
        "word_count": word_count,
        "timestamp": _ts(),
    })


def add_excel_upload(spreadsheet_id: str, filename: str, rows: int, columns: int):
    _dashboard["spreadsheets"].insert(0, {
        "id": spreadsheet_id,
        "filename": filename,
        "rows": rows,
        "columns": columns,
        "timestamp": _ts(),
    })


def add_chat(message: str):
    _dashboard["chats"].insert(0, {
        "id": uuid.uuid4().hex[:8],
        "last_message": message[:120],
        "timestamp": _ts(),
    })


def add_swot(source_type: str, strengths_count: int):
    _dashboard["swot"].insert(0, {
        "id": uuid.uuid4().hex[:8],
        "source_type": source_type,
        "strengths_count": strengths_count,
        "timestamp": _ts(),
    })


def add_slides(title: str, slide_count: int, filename: str):
    _dashboard["slides"].insert(0, {
        "id": uuid.uuid4().hex[:8],
        "title": title,
        "slide_count": slide_count,
        "filename": filename,
        "timestamp": _ts(),
    })


def add_chart(chart_type: str, filename: str):
    _dashboard["charts"].insert(0, {
        "id": uuid.uuid4().hex[:8],
        "chart_type": chart_type,
        "filename": filename,
        "timestamp": _ts(),
    })


def add_email(email_type: str, subject: str):
    _dashboard["emails"].insert(0, {
        "id": uuid.uuid4().hex[:8],
        "email_type": email_type,
        "subject": subject,
        "timestamp": _ts(),
    })


def add_summary():
    _dashboard["summaries"].insert(0, {
        "id": uuid.uuid4().hex[:8],
        "timestamp": _ts(),
    })


def get_all():
    return {
        "uploads": _dashboard["uploads"][:10],
        "spreadsheets": _dashboard["spreadsheets"][:10],
        "chats": _dashboard["chats"][:10],
        "swot": _dashboard["swot"][:10],
        "slides": _dashboard["slides"][:10],
        "charts": _dashboard["charts"][:10],
        "emails": _dashboard["emails"][:10],
        "summaries": _dashboard["summaries"][:10],
    }
