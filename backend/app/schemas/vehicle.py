from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.vehicle import FuelType, TransmissionType, VehicleStatus


class VehicleBase(BaseModel):
    brand:            str = Field(..., min_length=1, max_length=50)
    model:            str = Field(..., min_length=1, max_length=50)
    year:             int = Field(..., ge=2000, le=2030)
    color:            Optional[str] = None
    license_plate:    str
    fuel_type:        FuelType
    transmission:     TransmissionType
    seats:            int = Field(5, ge=2, le=15)
    doors:            int = Field(4, ge=2, le=6)
    daily_rate:       float = Field(..., gt=0)
    security_deposit: float = Field(0, ge=0)
    location_address: Optional[str] = None
    location_city:    Optional[str] = None
    description:      Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):  # All fields optional for partial update
    brand:        Optional[str]   = None
    model:        Optional[str]   = None
    year:         Optional[int]   = None
    daily_rate:   Optional[float] = None
    is_available: Optional[bool]  = None
    description:  Optional[str]   = None


class VehicleResponse(VehicleBase):
    id:             int
    owner_id:       int
    status:         VehicleStatus
    is_available:   bool
    average_rating: float
    total_reviews:  int
    created_at:     datetime

    class Config:
        from_attributes = True


class VehicleListResponse(BaseModel):
    total:       int
    page:        int
    page_size:   int
    total_pages: int
    vehicles:    List[VehicleResponse]