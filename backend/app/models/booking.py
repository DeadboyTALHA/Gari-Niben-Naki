from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class BookingStatus(str, enum.Enum):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    ACTIVE = 'active'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'


class InsuranceTier(str, enum.Enum):
    BASIC = 'basic'
    STANDARD = 'standard'
    PREMIUM = 'premium'


class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String(20), unique=True, index=True)  # e.g., 'GNN-2025-0001'
    customer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    vehicle_id = Column(Integer, ForeignKey('vehicles.id'), nullable=False)

    # Dates
    pickup_date = Column(DateTime(timezone=True), nullable=False)
    return_date = Column(DateTime(timezone=True), nullable=False)
    actual_return_date = Column(DateTime(timezone=True), nullable=True)

    # Pricing
    days = Column(Integer, nullable=False)
    daily_rate = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    insurance_tier = Column(Enum(InsuranceTier), default=InsuranceTier.BASIC)
    insurance_cost = Column(Float, default=0)
    service_fee = Column(Float, default=0)
    tax = Column(Float, default=0)
    security_deposit = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)

    # Status
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    customer = relationship('User', back_populates='bookings')
    vehicle = relationship('Vehicle', back_populates='bookings')
    payment = relationship('Payment', back_populates='booking', uselist=False)