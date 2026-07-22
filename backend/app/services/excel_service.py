import uuid
from pathlib import Path

import pandas as pd

from app.services.excel_store import store_dataframe

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def process_excel(file_bytes: bytes, original_filename: str) -> dict:
    ext = Path(original_filename).suffix.lower()
    if ext not in (".xlsx", ".csv"):
        raise ValueError("Only .xlsx and .csv files are accepted")

    stem = Path(original_filename).stem
    safe_name = f"{stem}_{uuid.uuid4().hex[:8]}{ext}"
    save_path = UPLOAD_DIR / safe_name
    save_path.write_bytes(file_bytes)

    if ext == ".csv":
        df = pd.read_csv(save_path)
    else:
        df = pd.read_excel(save_path, engine="openpyxl")

    rows, cols = df.shape
    column_names = df.columns.tolist()
    missing_values = df.isnull().sum().to_dict()
    missing_values = {str(k): int(v) for k, v in missing_values.items()}
    data_types = df.dtypes.astype(str).to_dict()
    data_types = {str(k): v for k, v in data_types.items()}
    preview = df.head(10).fillna("").to_dict(orient="records")

    spreadsheet_id = store_dataframe(df)

    return {
        "spreadsheet_id": spreadsheet_id,
        "filename": original_filename,
        "saved_as": safe_name,
        "rows": rows,
        "columns": cols,
        "column_names": column_names,
        "missing_values": missing_values,
        "data_types": data_types,
        "preview": preview,
    }
