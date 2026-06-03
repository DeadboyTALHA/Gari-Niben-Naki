from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class NotificationType(str, enum.Enum):
    BOOKING_CONFIRMED  = 'booking_confirmed'
    BOOKING_CANCELLED  = 'booking_cancelled'
    PAYMENT_RECEIVED   = 'payment_received'
    REVIEW_RECEIVED    = 'review_received'
    CAR_APPROVED       = 'car_approved'
    CAR_REJECTED       = 'car_rejected'
    DISPUTE_OPENED     = 'dispute_opened'
    DISPUTE_RESOLVED   = 'dispute_resolved'
    RETURN_REMINDER    = 'return_reminder'
    GENERAL            = 'general'


class Notification(Base):
    __tablename__ = 'notifications'

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey('users.id'), nullable=False)

    type        = Column(Enum(NotificationType), nullable=False)
    title       = Column(String(255), nullable=False)
    message     = Column(Text, nullable=False)
    is_read     = Column(Boolean, default=False)

    # Optional link to related resource
    link        = Column(String(500), nullable=True)  # e.g. /dashboard/bookings/42

    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='notifications')