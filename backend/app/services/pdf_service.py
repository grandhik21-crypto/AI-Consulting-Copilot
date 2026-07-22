import uuid
from pathlib import Path

import pdfplumber

from app.services.document_store import store_document

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def process_pdf(file_bytes: bytes, original_filename: str) -> dict:
    ext = Path(original_filename).suffix.lower()
    if ext != ".pdf":
        raise ValueError("Only PDF files are accepted")

    stem = Path(original_filename).stem
    safe_name = f"{stem}_{uuid.uuid4().hex[:8]}.pdf"
    save_path = UPLOAD_DIR / safe_name

    save_path.write_bytes(file_bytes)

    with pdfplumber.open(save_path) as pdf:
        pages = len(pdf.pages)
        all_text = "".join(p.extract_text() or "" for p in pdf.pages)
        word_count = len(all_text.split())

    preview = all_text[:800].strip()

    document_id = store_document(all_text)

    return {
        "document_id": document_id,
        "filename": original_filename,
        "saved_as": safe_name,
        "pages": pages,
        "word_count": word_count,
        "preview": preview,
    }
