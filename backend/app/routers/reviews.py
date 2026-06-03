from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review  import Review
from app.models.booking import Booking, BookingStatus
from app.models.vehicle import Vehicle
from app.models.user    import User
from app.utils.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class ReviewCreate(BaseModel):
    booking_id:           int
    rating:               int      # 1-5
    comment:              Optional[str] = None
    cleanliness_rating:   Optional[int] = None
    communication_rating: Optional[int] = None
    value_rating:         Optional[int] = None


@router.post('/', status_code=201)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate rating range
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail='Rating must be between 1 and 5')

    # Make sure the booking exists, belongs to this customer, and is completed
    booking = db.query(Booking).filter(
        Booking.id == data.booking_id,
        Booking.customer_id == current_user.id,
        Booking.status == BookingStatus.COMPLETED
    ).first()
    if not booking:
        raise HTTPException(
            status_code=400,
            detail='Can only review completed bookings that belong to you'
        )

    # Prevent duplicate review
    existing = db.query(Review).filter(Review.booking_id == data.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail='You have already reviewed this booking')

    review = Review(
        booking_id=data.booking_id,
        vehicle_id=booking.vehicle_id,
        customer_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
        cleanliness_rating=data.cleanliness_rating,
        communication_rating=data.communication_rating,
        value_rating=data.value_rating,
    )
    db.add(review)

    # Recalculate vehicle average rating
    vehicle = db.query(Vehicle).filter(Vehicle.id == booking.vehicle_id).first()
    all_ratings = db.query(Review.rating).filter(Review.vehicle_id == vehicle.id).all()
    all_ratings = [r[0] for r in all_ratings] + [data.rating]
    vehicle.average_rating = round(sum(all_ratings) / len(all_ratings), 2)
    vehicle.total_reviews  = len(all_ratings)

    db.commit()
    db.refresh(review)
    return review


@router.get('/vehicle/{vehicle_id}')
def get_vehicle_reviews(
    vehicle_id: int,
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 10,
):
    query = db.query(Review).filter(Review.vehicle_id == vehicle_id)
    total    = query.count()
    reviews  = query.order_by(Review.created_at.desc())
    reviews  = reviews.offset((page-1)*page_size).limit(page_size).all()
    return {'total': total, 'reviews': reviews}