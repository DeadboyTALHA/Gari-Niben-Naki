from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.booking import BookingStatus, InsuranceTier


class BookingCreate(BaseModel):
    vehicle_id:     int
    pickup_date:    datetime
    return_date:    datetime
    insurance_tier: InsuranceTier = InsuranceTier.BASIC


class BookingResponse(BaseModel):
    id:               int
    booking_ref:      str
    customer_id:      int
    vehicle_id:       int
    pickup_date:      datetime
    return_date:      datetime
    days:             int
    daily_rate:       float
    subtotal:         float
    insurance_tier:   InsuranceTier
    insurance_cost:   float
    service_fee:      float
    tax:              float
    security_deposit: float
    total_amount:     float
    status:           BookingStatus
    created_at:       datetime

    class Config:
        from_attributes = True