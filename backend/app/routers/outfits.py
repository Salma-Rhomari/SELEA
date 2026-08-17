from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app import models, auth as auth_utils
from app.database import get_db
from app.services import outfit_engine

router = APIRouter(prefix="/outfits", tags=["outfits"])


# ---------- Schemas ----------

class GenerateOutfitsRequest(BaseModel):
    occasion: Optional[str] = None
    mood: str
    season: Optional[str] = None


class OutfitItemOut(BaseModel):
    id: str
    category: str
    image_url: Optional[str]
    color: Optional[str]
    style: Optional[str]

class GeneratedOutfitOut(BaseModel):
    items: list[OutfitItemOut]


class SaveOutfitRequest(BaseModel):
    name: str
    occasion: Optional[str] = None
    style: Optional[str] = None
    weather: Optional[str] = None
    item_ids: list[str]


class OutfitOut(BaseModel):
    id: str
    name: str
    occasion: Optional[str]
    style: Optional[str]
    weather: Optional[str]
    items: list[OutfitItemOut]

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True


class FeedbackRequest(BaseModel):
    liked: bool


# ---------- Routes ----------

@router.post("/generate", response_model=list[GeneratedOutfitOut])
def generate_outfits(
    payload: GenerateOutfitsRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    try:
        suggestions = outfit_engine.generate_outfits(
            db=db,
            user_id=current_user.id,
            occasion=payload.occasion,
            mood=payload.mood,
            season=payload.season,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not suggestions:
        raise HTTPException(
            status_code=404,
            detail="No matching items found for this mood/occasion. Try adding more items or changing filters.",
        )

    return suggestions


@router.post("/", response_model=OutfitOut)
def save_outfit(
    payload: SaveOutfitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    items = (
        db.query(models.ClothingItem)
        .filter(
            models.ClothingItem.id.in_(payload.item_ids),
            models.ClothingItem.user_id == current_user.id,
        )
        .all()
    )
    if len(items) != len(payload.item_ids):
        raise HTTPException(status_code=400, detail="One or more items not found")

    outfit = models.Outfit(
        user_id=current_user.id,
        name=payload.name,
        occasion=payload.occasion,
        style=payload.style,
        weather=payload.weather,
    )
    db.add(outfit)
    db.flush()  # get outfit.id before commit

    for item in items:
        db.add(models.OutfitItem(outfit_id=outfit.id, clothing_item_id=item.id))

    db.commit()
    db.refresh(outfit)

    return OutfitOut(
        id=outfit.id,
        name=outfit.name,
        occasion=outfit.occasion,
        style=outfit.style,
        weather=outfit.weather,
        items=[
            OutfitItemOut(
                id=item.id,
                category=item.category,
                image_url=item.image_url,
                color=item.color,
                style=item.style,
            )
            for item in items
        ],
    )


@router.get("/", response_model=list[OutfitOut])
def list_outfits(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    outfits = db.query(models.Outfit).filter(models.Outfit.user_id == current_user.id).all()

    result = []
    for outfit in outfits:
        items = (
            db.query(models.ClothingItem)
            .join(models.OutfitItem, models.OutfitItem.clothing_item_id == models.ClothingItem.id)
            .filter(models.OutfitItem.outfit_id == outfit.id)
            .all()
        )
        result.append(
            OutfitOut(
                id=outfit.id,
                name=outfit.name,
                occasion=outfit.occasion,
                style=outfit.style,
                weather=outfit.weather,
                items=[
                    OutfitItemOut(
                        id=item.id,
                        category=item.category,
                        image_url=item.image_url,
                        color=item.color,
                        style=item.style,
                    )
                    for item in items
                ],
            )
        )
    return result


@router.delete("/{outfit_id}")
def delete_outfit(
    outfit_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    outfit = (
        db.query(models.Outfit)
        .filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id)
        .first()
    )
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    db.query(models.OutfitItem).filter(models.OutfitItem.outfit_id == outfit_id).delete()
    db.delete(outfit)
    db.commit()
    return {"detail": "Outfit deleted"}


@router.post("/{outfit_id}/feedback")
def give_feedback(
    outfit_id: str,
    payload: FeedbackRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    outfit = (
        db.query(models.Outfit)
        .filter(models.Outfit.id == outfit_id, models.Outfit.user_id == current_user.id)
        .first()
    )
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    feedback = models.UserFeedback(
        user_id=current_user.id, outfit_id=outfit_id, liked=payload.liked
    )
    db.add(feedback)
    db.commit()
    return {"detail": "Feedback recorded"}