from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from fastapi import UploadFile, File
from app.services.ai_vision import analyze_clothing_image
from app.database import get_db
from app import models, schemas, auth as auth_utils
import os
import uuid
from app.config import settings
from app.services.cloudinary_service import upload_image


router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])


@router.post("/items", response_model=schemas.ClothingItemOut)
def create_item(
    payload: schemas.ClothingItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    item = models.ClothingItem(user_id=current_user.id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/items", response_model=list[schemas.ClothingItemOut])
def list_items(
    q: Optional[str] = None,
    category: Optional[str] = None,
    color: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    query = db.query(models.ClothingItem).filter(models.ClothingItem.user_id == current_user.id)

    if category:
        query = query.filter(models.ClothingItem.category == category)
    if color:
        query = query.filter(models.ClothingItem.color == color)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                models.ClothingItem.category.ilike(like),
                models.ClothingItem.subcategory.ilike(like),
                models.ClothingItem.color.ilike(like),
            )
        )

    return query.order_by(models.ClothingItem.created_at.desc()).all()


@router.patch("/items/{item_id}", response_model=schemas.ClothingItemOut)
def update_item(
    item_id: str,
    payload: schemas.ClothingItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    item = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.id == item_id, models.ClothingItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{item_id}")
def delete_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    item = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.id == item_id, models.ClothingItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"deleted": True}

@router.post("/analyze")
async def analyze_item(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    try:
        result = analyze_clothing_image(image_bytes, mime_type)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {str(e)}")

    try:
        image_url = upload_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image upload failed: {str(e)}")

    result["image_url"] = image_url

    return result