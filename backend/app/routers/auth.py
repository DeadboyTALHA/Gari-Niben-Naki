from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User, UserRole
from app.config import settings
from pydantic import BaseModel, EmailStr

router = APIRouter()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


# ── Pydantic schemas (request/response shapes) ──────────────
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: UserRole = UserRole.CUSTOMER


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str


# ── Helper functions ────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {'sub': str(user_id), 'exp': expire},
        settings.secret_key,
        algorithm=settings.algorithm
    )


# ── Endpoints ───────────────────────────────────────────────
@router.post('/register', response_model=TokenResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already registered
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail='Email already registered')

    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        token_type='bearer',
        user_id=user.id,
        role=user.role.value,
    )


@router.post('/login', response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    if not user.is_active:
        raise HTTPException(status_code=403, detail='Account is suspended')

    return TokenResponse(
        access_token=create_access_token(user.id),
        token_type='bearer',
        user_id=user.id,
        role=user.role.value,
    )


@router.get('/me')
def get_me(db: Session = Depends(get_db), token: str = Depends(lambda x: x)):
    # Returns the current logged-in user's profile
    # See ddependencies.py for get_current_user
    pass