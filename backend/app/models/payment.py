from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class PaymentStatus(str, enum.Enum):
    PENDING   = 'pending'
    SUCCEEDED = 'succeeded'
    FAILED    = 'failed'
    REFUNDED  = 'refunded'
    PARTIALLY_REFUNDED = 'partially_refunded'


class PaymentMethod(str, enum.Enum):
    CARD   = 'card'
    PAYPAL = 'paypal'
    KLARNA = 'klarna'


class Payment(Base):
    __tablename__ = 'payments'

    id          = Column(Integer, primary_key=True, index=True)
    booking_id  = Column(Integer, ForeignKey('bookings.id'), nullable=False, unique=True)

    # Stripe / payment gateway fields
    stripe_payment_intent_id = Column(String(255), unique=True, nullable=True)
    stripe_charge_id         = Column(String(255), nullable=True)

    amount          = Column(Float, nullable=False)
    currency        = Column(String(10), default='usd')
    status          = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method  = Column(Enum(PaymentMethod), default=PaymentMethod.CARD)

    # Refund info
    refunded_amount = Column(Float, default=0)
    refund_reason   = Column(String(500), nullable=True)

    # Receipt
    receipt_url     = Column(String(500), nullable=True)

    paid_at    = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    booking = relationship('Booking', back_populates='payment')