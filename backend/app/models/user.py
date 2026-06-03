from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum
from sqlalchemy.orm import relationship

class UserRole(str, enum.Enum):
    CUSTOMER = 'customer'
    OWNER = 'owner'
    ADMIN = 'admin'
    BOTH = 'both'  # can rent AND list cars


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)

    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_kyc_approved = Column(Boolean, default=False)

    # Profile
    profile_picture = Column(String(500), nullable=True)
    average_rating = Column(Integer, default=0)

    # Timestamps (set automatically)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    vehicles      = relationship('Vehicle',      back_populates='owner')
    bookings      = relationship('Booking',      back_populates='customer')
    reviews       = relationship('Review',       back_populates='customer')
    documents     = relationship('UserDocument', back_populates='user',
                                 foreign_keys='UserDocument.user_id')
    notifications = relationship('Notification', back_populates='user')
