from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class VehicleImage(Base):
    __tablename__ = 'vehicle_images'

    id         = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey('vehicles.id', ondelete='CASCADE'),
                        nullable=False)

    image_url  = Column(String(500), nullable=False)   # Cloudinary URL
    public_id  = Column(String(255), nullable=True)    # Cloudinary public_id (for deletion)
    is_primary = Column(Boolean, default=False)        # The main thumbnail photo
    order      = Column(Integer, default=0)            # Display order (0 = first)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the vehicle
    vehicle = relationship('Vehicle', back_populates='images')