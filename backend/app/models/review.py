from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Review(Base):
    __tablename__ = 'reviews'
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating'),
        # Prevent duplicate reviews: one review per customer per booking
        {'extend_existing': True}
    )

    id         = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey('bookings.id'), nullable=False)
    vehicle_id = Column(Integer, ForeignKey('vehicles.id'), nullable=False)
    customer_id= Column(Integer, ForeignKey('users.id'),    nullable=False)

    rating     = Column(Integer, nullable=False)  # 1–5
    comment    = Column(Text, nullable=True)

    # Optional sub-ratings
    cleanliness_rating    = Column(Integer, nullable=True)
    communication_rating  = Column(Integer, nullable=True)
    value_rating          = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    vehicle  = relationship('Vehicle',  back_populates='reviews')
    customer = relationship('User',     back_populates='reviews')
    booking  = relationship('Booking')