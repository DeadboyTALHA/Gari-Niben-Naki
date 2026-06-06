from backend.app.models.booking import Booking
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from typing import Optional, List
from app.database import get_db
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.user import User
from app.utils.dependencies import get_current_user, require_owner
from pydantic import BaseModel

router = APIRouter()


class VehicleCreate(BaseModel):
    brand: str
    model: str
    year: int
    color: str = ''
    license_plate: str
    fuel_type: str
    transmission: str
    seats: int = 5
    doors: int = 4
    daily_rate: float
    security_deposit: float = 0
    location_address: str = ''
    location_city: str = ''
    description: str = ''


@router.get('/')
def list_vehicles(
    db: Session = Depends(get_db),
    city: Optional[str] = Query(None),
    fuel_type: Optional[str] = Query(None),
    transmission: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    seats: Optional[int] = Query(None),
    sort_by: str = Query('created_at'),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    query = db.query(Vehicle).options(
        joinedload(Vehicle.images)
    ).filter(Vehicle.status == VehicleStatus.ACTIVE)

    if city:
        query = query.filter(Vehicle.location_city.ilike(f'%{city}%'))
    if fuel_type:
        query = query.filter(Vehicle.fuel_type == fuel_type)
    if transmission:
        query = query.filter(Vehicle.transmission == transmission)
    if min_price:
        query = query.filter(Vehicle.daily_rate >= min_price)
    if max_price:
        query = query.filter(Vehicle.daily_rate <= max_price)
    if seats:
        query = query.filter(Vehicle.seats >= seats)

    total = query.count()
    vehicles = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
        'vehicles': vehicles,
    }


@router.get('/{vehicle_id}')
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    v = db.query(Vehicle).options(
        joinedload(Vehicle.images)
    ).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail='Vehicle not found')
    return v


@router.post('/', status_code=201)
def create_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    vehicle = Vehicle(**data.dict(), owner_id=current_user.id)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.put('/{vehicle_id}')
def update_vehicle(
    vehicle_id: int,
    data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail='Vehicle not found or not yours')
    for key, value in data.dict().items():
        setattr(v, key, value)
    db.commit()
    db.refresh(v)
    return v


@router.delete('/{vehicle_id}', status_code=204)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail='Not found')
    db.delete(v)
    db.commit()

@router.get('/my')
def my_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    '''Returns all vehicles owned by the currently logged-in owner.'''
    return db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).all()

@router.get('/{booking_id}')
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')
    # Only the customer or an admin can view
    if booking.customer_id != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Access denied')
    return booking
