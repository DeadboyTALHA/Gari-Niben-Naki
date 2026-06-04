from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.vehicle_image import VehicleImage
from app.models.user import User
from app.utils.dependencies import require_owner
from app.services.upload_service import upload_image

router = APIRouter()


@router.post('/{vehicle_id}/images', status_code=201)
async def upload_vehicle_images(
    vehicle_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    '''
    Upload 1–10 photos for a vehicle.
    Only the owner of that vehicle can upload photos.
    '''
    # Verify this vehicle belongs to the logged-in owner
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id,
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404,
                            detail='Vehicle not found or does not belong to you')

    if len(files) > 10:
        raise HTTPException(status_code=400, detail='Maximum 10 images per vehicle')

    allowed_types = {'image/jpeg', 'image/png', 'image/webp'}
    saved = []

    # Find current highest order so new images come after existing ones
    existing_count = db.query(VehicleImage).filter(
        VehicleImage.vehicle_id == vehicle_id
    ).count()

    for i, file in enumerate(files):
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f'File {file.filename} must be JPEG, PNG, or WebP'
            )
        url = await upload_image(file, folder=f'vehicles/{vehicle_id}')
        img = VehicleImage(
            vehicle_id=vehicle_id,
            image_url=url,
            is_primary=(existing_count == 0 and i == 0),  # first ever upload = primary
            order=existing_count + i,
        )
        db.add(img)
        saved.append(img)

    db.commit()
    for img in saved:
        db.refresh(img)
    return {'uploaded': len(saved), 'images': saved}


@router.get('/{vehicle_id}/images')
def get_vehicle_images(vehicle_id: int, db: Session = Depends(get_db)):
    '''Get all images for a vehicle. Public endpoint — no auth needed.'''
    return db.query(VehicleImage).filter(
        VehicleImage.vehicle_id == vehicle_id
    ).order_by(VehicleImage.order).all()


@router.patch('/{vehicle_id}/images/{image_id}/set-primary')
def set_primary_image(
    vehicle_id: int,
    image_id:   int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    '''Mark one image as the primary (thumbnail) photo.'''
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id,
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail='Vehicle not found')

    # Unset all current primary flags for this vehicle
    db.query(VehicleImage).filter(
        VehicleImage.vehicle_id == vehicle_id
    ).update({'is_primary': False})

    # Set the chosen image as primary
    image = db.query(VehicleImage).filter(
        VehicleImage.id == image_id,
        VehicleImage.vehicle_id == vehicle_id,
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail='Image not found')
    image.is_primary = True
    db.commit()
    return {'message': 'Primary image updated'}


@router.delete('/{vehicle_id}/images/{image_id}', status_code=204)
def delete_vehicle_image(
    vehicle_id: int,
    image_id:   int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    '''Delete a single image from a vehicle listing.'''
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id,
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail='Vehicle not found')

    image = db.query(VehicleImage).filter(
        VehicleImage.id == image_id,
        VehicleImage.vehicle_id == vehicle_id,
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail='Image not found')

    db.delete(image)
    db.commit()