from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.user import User
from app.utils.dependencies import require_admin
from pydantic import BaseModel

router = APIRouter()


@router.get('/stats')
def get_platform_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    from app.models.booking import Booking, BookingStatus
    return {
        'total_users': db.query(User).count(),
        'total_vehicles': db.query(Vehicle).count(),
        'pending_approvals': db.query(Vehicle).filter(Vehicle.status == VehicleStatus.PENDING).count(),
        'active_bookings': db.query(Booking).filter(Booking.status == BookingStatus.ACTIVE).count(),
    }


@router.patch('/vehicles/{vehicle_id}/approve')
def approve_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail='Vehicle not found')
    v.status = VehicleStatus.ACTIVE
    db.commit()
    return {'message': 'Vehicle approved'}


@router.patch('/vehicles/{vehicle_id}/reject')
def reject_vehicle(
    vehicle_id: int,
    reason: str = 'Does not meet requirements',
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail='Vehicle not found')
    v.status = VehicleStatus.REJECTED
    db.commit()
    return {'message': f'Vehicle rejected: {reason}'}


@router.get('/users')
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    page: int = 1,
    page_size: int = 20,
):
    total = db.query(User).count()
    users = db.query(User).offset((page-1)*page_size).limit(page_size).all()
    return {'total': total, 'users': users}


@router.patch('/users/{user_id}/suspend')
def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    user.is_active = False
    db.commit()
    return {'message': 'User suspended'}