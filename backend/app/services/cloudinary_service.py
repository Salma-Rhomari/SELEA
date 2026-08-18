import cloudinary
import cloudinary.uploader
from app.config import settings

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


def upload_image(image_bytes: bytes, folder: str = "selea") -> str:
    """Uploads image bytes to Cloudinary and returns the public HTTPS URL."""
    result = cloudinary.uploader.upload(
        image_bytes,
        folder=folder,
        resource_type="image",
    )
    return result["secure_url"]