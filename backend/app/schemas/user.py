from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email:     EmailStr
    phone:     Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description='Minimum 8 characters')
    role:     UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone:     Optional[str] = None


class UserResponse(UserBase):
    id:               int
    role:             UserRole
    is_verified:      bool
    is_kyc_approved:  bool
    profile_picture:  Optional[str]
    created_at:       datetime

    class Config:
        from_attributes = True  # Allows reading from SQLAlchemy model instances


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    user_id:      int
    role:         str