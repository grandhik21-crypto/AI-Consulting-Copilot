import os
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.chat import router as chat_router
from app.routes.upload import router as upload_router
from app.routes.excel_chat import router as excel_chat_router
from app.routes.charts import router as charts_router
from app.routes.swot import router as swot_router
from app.routes.slides import router as slides_router
from app.routes.email import router as email_router
from app.routes.dashboard import router as dashboard_router
from app.routes.auth import router as auth_router
from app.database.connection import engine, Base

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def _migrate_schema():
    """Add columns that may not exist on existing database."""
    import sqlalchemy as sa
    inspector = sa.inspect(engine)
    existing = {c["name"] for c in inspector.get_columns("users")}
    with engine.connect() as conn:
        for col_name, col_type in [("username", "VARCHAR(100)"), ("hashed_password", "VARCHAR(255)"), ("is_active", "BOOLEAN")]:
            if col_name not in existing:
                conn.execute(sa.text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate_schema()
    yield


app = FastAPI(title="AI Consulting Copilot API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "https://https://ai-consulting-copilot.vercel.app/"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(excel_chat_router, prefix="/api")
app.include_router(charts_router, prefix="/api")
app.include_router(swot_router, prefix="/api")
app.include_router(slides_router, prefix="/api")
app.include_router(email_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
