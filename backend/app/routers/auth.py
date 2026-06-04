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
from app.utils.dependencies import get_current_user

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
def get_me(current_user: User = Depends(get_current_user)):
    '''
    Returns the profile of the currently logged-in user.
    Called by the frontend after login to get the full user object.
    '''
    return {
        'id':              current_user.id,
        'full_name':       current_user.full_name,
        'email':           current_user.email,
        'phone':           current_user.phone,
        'role':            current_user.role,
        'is_verified':     current_user.is_verified,
        'is_kyc_approved': current_user.is_kyc_approved,
        'profile_picture': current_user.profile_picture,
        'created_at':      current_user.created_at,
    }