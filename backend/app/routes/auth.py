from typing import Annotated

from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database.connection import get_session
from app.models.user import User
from app.services.auth_service import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter()
security = HTTPBearer()


class SignupRequest(BaseModel):
    email: str
    username: str
    name: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class MeResponse(BaseModel):
    id: str
    email: str
    username: str
    name: str
    is_active: bool


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_session)],
) -> User:
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user


@router.post("/auth/signup", response_model=AuthResponse)
async def signup(body: SignupRequest, db: Annotated[Session, Depends(get_session)]):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = User(
        email=body.email,
        username=body.username,
        name=body.name,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})

    return AuthResponse(
        token=token,
        user={"id": user.id, "email": user.email, "username": user.username, "name": user.name},
    )


@router.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: Annotated[Session, Depends(get_session)]):
    user = db.query(User).filter(User.username == body.username).first()
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": user.id, "email": user.email})

    return AuthResponse(
        token=token,
        user={"id": user.id, "email": user.email, "username": user.username, "name": user.name},
    )


@router.get("/auth/me", response_model=MeResponse)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        name=current_user.name,
        is_active=current_user.is_active,
    )
