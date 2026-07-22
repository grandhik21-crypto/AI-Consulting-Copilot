from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.pdf_service import process_pdf
from app.services.excel_service import process_excel
from app.services.dashboard_store import add_pdf_upload, add_excel_upload

router = APIRouter()


@router.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        bytes_data = await file.read()
        result = process_pdf(bytes_data, file.filename)
        add_pdf_upload(result["document_id"], result["filename"], result["pages"], result["word_count"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


@router.post("/upload/excel")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = file.filename.lower().rsplit(".", 1)[-1]
    if ext not in ("xlsx", "csv"):
        raise HTTPException(
            status_code=400, detail="Only .xlsx and .csv files are accepted"
        )

    try:
        bytes_data = await file.read()
        result = process_excel(bytes_data, file.filename)
        add_excel_upload(result["spreadsheet_id"], result["filename"], result["rows"], result["columns"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
