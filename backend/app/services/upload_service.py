import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException
from app.config import settings

# Configure Cloudinary once when this module loads
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


async def upload_image(file: UploadFile, folder: str = 'general') -> str:
    '''
    Upload a file to Cloudinary and return its public URL.
    folder: organizes uploads e.g. 'profiles', 'vehicles', 'documents/42'
    '''
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(
            contents,
            folder=f'gari_niben_naki/{folder}',
            resource_type='auto',   # auto-detects image vs pdf
            quality='auto:good',    # auto-compress to reduce storage
            fetch_format='auto',    # serve as WebP on modern browsers
        )
        return result['secure_url']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Upload failed: {str(e)}')
    finally:
        await file.seek(0)  # Reset file pointer in case it needs re-reading


async def upload_multiple_images(files: list[UploadFile], folder: str) -> list[str]:
    '''Upload up to 10 images (for vehicle photo galleries).'''
    if len(files) > 10:
        raise HTTPException(status_code=400, detail='Maximum 10 images allowed')
    urls = []
    for file in files:
        url = await upload_image(file, folder=folder)
        urls.append(url)
    return urls


def delete_image(public_id: str) -> bool:
    '''Delete an image from Cloudinary by its public ID.'''
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception:
        return False