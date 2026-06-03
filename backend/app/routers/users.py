from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.utils.dependencies import get_current_user
from app.services.upload_service import upload_image
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone:     Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password:     str


@router.get('/profile')
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        'id':           current_user.id,
        'full_name':    current_user.full_name,
        'email':        current_user.email,
        'phone':        current_user.phone,
        'role':         current_user.role,
        'is_verified':  current_user.is_verified,
        'profile_picture': current_user.profile_picture,
        'created_at':   current_user.created_at,
    }


@router.put('/profile')
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    return {'message': 'Profile updated', 'user': current_user}


@router.post('/profile/picture')
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ['image/jpeg', 'image/png', 'image/webp']:
        raise HTTPException(status_code=400, detail='Only JPEG/PNG/WebP images allowed')
    url = await upload_image(file, folder='profiles')
    current_user.profile_picture = url
    db.commit()
    return {'profile_picture': url}


@router.post('/change-password')
def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    if not pwd_context.verify(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail='New password must be at least 8 characters')
    current_user.hashed_password = pwd_context.hash(data.new_password)
    db.commit()
    return {'message': 'Password changed successfully'}


@router.get('/notifications')
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    unread_only: bool = False,
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).limit(50).all()


@router.patch('/notifications/{notif_id}/read')
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    n = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {'message': 'Marked as read'}


@router.patch('/notifications/read-all')
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({'is_read': True})
    db.commit()
    return {'message': 'All notifications marked as read'}