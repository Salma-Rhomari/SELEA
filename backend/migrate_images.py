"""One-off script: migrate existing local images to Cloudinary."""
import os
from app.database import SessionLocal
from app import models
from app.services.cloudinary_service import upload_image

db = SessionLocal()

items = db.query(models.ClothingItem).filter(
    models.ClothingItem.image_url.like("%localhost%")
).all()

print(f"Found {len(items)} items with local image URLs.")

for item in items:
    filename = item.image_url.split("/uploads/")[-1]
    filepath = os.path.join("uploads", filename)

    if not os.path.exists(filepath):
        print(f"SKIP {item.id} — file not found: {filepath}")
        continue

    with open(filepath, "rb") as f:
        image_bytes = f.read()

    try:
        new_url = upload_image(image_bytes)
        item.image_url = new_url
        db.commit()
        print(f"OK {item.id} -> {new_url}")
    except Exception as e:
        print(f"FAILED {item.id}: {e}")

db.close()
print("Migration done.")