from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import random, string
from app.database import get_db
from app.models.booking import Booking, BookingStatus, InsuranceTier
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.user import User
from app.utils.dependencies import get_current_user, require_owner
from pydantic import BaseModel

router = APIRouter()


class BookingCreate(BaseModel):
    vehicle_id: int
    pickup_date: datetime
    return_date: datetime
    insurance_tier: InsuranceTier = InsuranceTier.BASIC


def generate_booking_ref():
    suffix = ''.join(random.choices(string.digits, k=4))
    return f'GNN-{datetime.now().year}-{suffix}'


INSURANCE_RATES = {
    InsuranceTier.BASIC: 0,
    InsuranceTier.STANDARD: 10,
    InsuranceTier.PREMIUM: 25,
}

SERVICE_FEE_PERCENT = 0.10
TAX_PERCENT = 0.10


@router.post('/', status_code=201)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Load the vehicle
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == data.vehicle_id,
        Vehicle.status == VehicleStatus.ACTIVE,
        Vehicle.is_available == True
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail='Vehicle not available')

    # 2. Calculate pricing
    delta = data.return_date - data.pickup_date
    days = max(delta.days, 1)
    subtotal = days * vehicle.daily_rate
    insurance_cost = INSURANCE_RATES[data.insurance_tier] * days
    service_fee = subtotal * SERVICE_FEE_PERCENT
    tax = (subtotal + insurance_cost + service_fee) * TAX_PERCENT
    total = subtotal + insurance_cost + service_fee + tax + vehicle.security_deposit

    # 3. Create booking record
    booking = Booking(
        booking_ref=generate_booking_ref(),
        customer_id=current_user.id,
        vehicle_id=vehicle.id,
        pickup_date=data.pickup_date,
        return_date=data.return_date,
        days=days,
        daily_rate=vehicle.daily_rate,
        subtotal=subtotal,
        insurance_tier=data.insurance_tier,
        insurance_cost=insurance_cost,
        service_fee=service_fee,
        tax=tax,
        security_deposit=vehicle.security_deposit,
        total_amount=round(total, 2),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get('/my')
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
):
    query = db.query(Booking).filter(Booking.customer_id == current_user.id)
    if status:
        query = query.filter(Booking.status == status)
    return query.order_by(Booking.created_at.desc()).all()


@router.patch('/{booking_id}/cancel', status_code=200)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.customer_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')
    if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise HTTPException(status_code=400, detail='Cannot cancel this booking')

    booking.status = BookingStatus.CANCELLED
    db.commit()
    return {'message': 'Booking cancelled successfully'}

@router.get('/owner')
def owner_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
):
    '''
    Returns all bookings for vehicles that belong to the logged-in owner.
    Owners use this to see upcoming pickups and manage rentals.
    '''
    # Get IDs of all vehicles owned by this user
    vehicle_ids = [
        v.id for v in db.query(Vehicle.id).filter(
            Vehicle.owner_id == current_user.id
        ).all()
    ]

    if not vehicle_ids:
        return {'total': 0, 'bookings': [], 'page': page}

    # Query bookings for those vehicles
    query = db.query(Booking).filter(Booking.vehicle_id.in_(vehicle_ids))

    # Optional status filter
    if status:
        query = query.filter(Booking.status == status)

    total    = query.count()
    bookings = (
        query
        .order_by(Booking.pickup_date.asc())  # soonest pickup first
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        'total':    total,
        'page':     page,
        'bookings': bookings,
    }