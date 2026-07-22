from fastapi import APIRouter

from app.services.dashboard_store import get_all

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard():
    return get_all()
