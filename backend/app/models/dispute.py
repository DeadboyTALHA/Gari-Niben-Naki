from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class DisputeStatus(str, enum.Enum):
    OPEN       = 'open'
    UNDER_REVIEW = 'under_review'
    RESOLVED   = 'resolved'
    CLOSED     = 'closed'


class DisputeResolution(str, enum.Enum):
    REFUND_FULL    = 'refund_full'
    REFUND_PARTIAL = 'refund_partial'
    NO_REFUND      = 'no_refund'
    CREDIT_ISSUED  = 'credit_issued'


class Dispute(Base):
    __tablename__ = 'disputes'

    id          = Column(Integer, primary_key=True, index=True)
    booking_id  = Column(Integer, ForeignKey('bookings.id'), nullable=False)
    raised_by   = Column(Integer, ForeignKey('users.id'),    nullable=False)
    assigned_to = Column(Integer, ForeignKey('users.id'),    nullable=True)  # Admin

    subject     = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence_urls = Column(Text, nullable=True)  # JSON array of image URLs

    status      = Column(Enum(DisputeStatus),    default=DisputeStatus.OPEN)
    resolution  = Column(Enum(DisputeResolution), nullable=True)
    resolution_note = Column(Text, nullable=True)
    refund_amount   = Column(Integer, default=0)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    booking     = relationship('Booking')
    raiser      = relationship('User', foreign_keys=[raised_by])
    admin       = relationship('User', foreign_keys=[assigned_to])