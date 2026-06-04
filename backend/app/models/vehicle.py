from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class FuelType(str, enum.Enum):
    PETROL = 'petrol'
    DIESEL = 'diesel'
    ELECTRIC = 'electric'
    HYBRID = 'hybrid'


class TransmissionType(str, enum.Enum):
    MANUAL = 'manual'
    AUTOMATIC = 'automatic'


class VehicleStatus(str, enum.Enum):
    PENDING = 'pending'      # Awaiting admin approval
    ACTIVE = 'active'        # Available for booking
    MAINTENANCE = 'maintenance'
    REJECTED = 'rejected'


class Vehicle(Base):
    __tablename__ = 'vehicles'

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Basic info
    brand = Column(String(50), nullable=False)
    model = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    color = Column(String(30))
    license_plate = Column(String(20), unique=True)
    description = Column(Text)

    # Specs
    fuel_type = Column(Enum(FuelType), nullable=False)
    transmission = Column(Enum(TransmissionType), nullable=False)
    seats = Column(Integer, default=5)
    doors = Column(Integer, default=4)
    mileage = Column(Integer, default=0)

    # Location
    location_address = Column(String(255))
    location_city = Column(String(100))
    location_lat = Column(Float)
    location_lng = Column(Float)

    # Pricing
    daily_rate = Column(Float, nullable=False)
    weekly_discount_percent = Column(Integer, default=0)
    monthly_discount_percent = Column(Integer, default=0)
    security_deposit = Column(Float, default=0)

    # Status
    status = Column(Enum(VehicleStatus), default=VehicleStatus.PENDING)
    is_available = Column(Boolean, default=True)
    average_rating = Column(Float, default=0)
    total_reviews = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship('User', back_populates='vehicles')
    bookings = relationship('Booking', back_populates='vehicle')
    reviews = relationship('Review', back_populates='vehicle')

    images = relationship('VehicleImage', back_populates='vehicle',
                          cascade='all, delete-orphan',
                          order_by='VehicleImage.order')