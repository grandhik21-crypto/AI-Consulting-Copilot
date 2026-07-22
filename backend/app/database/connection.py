import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.models.base import Base

DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DB_DIR.mkdir(exist_ok=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL", f"sqlite:///{DB_DIR / 'consulting_copilot.db'}"
)

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(engine, expire_on_commit=False)


def get_session() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
