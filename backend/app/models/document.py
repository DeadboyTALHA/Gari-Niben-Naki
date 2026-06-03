from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class DocumentType(str, enum.Enum):
    DRIVING_LICENSE   = 'driving_license'
    NATIONAL_ID       = 'national_id'
    CAR_REGISTRATION  = 'car_registration'
    INSURANCE_PROOF   = 'insurance_proof'
    PASSPORT          = 'passport'


class DocumentStatus(str, enum.Enum):
    PENDING  = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class UserDocument(Base):
    __tablename__ = 'user_documents'

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey('users.id'), nullable=False)

    document_type   = Column(Enum(DocumentType), nullable=False)
    document_url    = Column(String(500), nullable=False)  # Cloudinary URL
    status          = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
    rejection_reason= Column(String(500), nullable=True)

    # For driving license: store expiry
    expiry_date     = Column(DateTime(timezone=True), nullable=True)

    reviewed_by     = Column(Integer, ForeignKey('users.id'), nullable=True)  # Admin user ID
    reviewed_at     = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    user     = relationship('User', foreign_keys=[user_id], back_populates='documents')
    reviewer = relationship('User', foreign_keys=[reviewed_by])