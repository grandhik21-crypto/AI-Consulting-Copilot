from pathlib import Path

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.chart_service import generate_chart
from app.services.excel_store import get_dataframe
from app.services.dashboard_store import add_chart

CHART_DIR = Path(__file__).resolve().parent.parent.parent / "uploads" / "charts"

router = APIRouter()


class ChartRequest(BaseModel):
    spreadsheet_id: str
    chart_type: str
    x_column: str
    y_column: str | None = None


class ChartResponse(BaseModel):
    filename: str
    url: str


@router.post("/charts/generate", response_model=ChartResponse)
async def create_chart(body: ChartRequest):
    if body.chart_type not in ("bar", "pie", "line", "histogram"):
        raise HTTPException(status_code=400, detail="Unsupported chart type")

    df = get_dataframe(body.spreadsheet_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Spreadsheet not found")

    if body.x_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{body.x_column}' not found")

    if body.y_column and body.y_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{body.y_column}' not found")

    try:
        filename = generate_chart(df, body.chart_type, body.x_column, body.y_column)
        url = f"/api/charts/{filename}"
        add_chart(body.chart_type, filename)
        return ChartResponse(filename=filename, url=url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")


@router.get("/charts/{filename}")
async def get_chart(filename: str):
    path = CHART_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Chart not found")
    return FileResponse(path, media_type="image/png")
