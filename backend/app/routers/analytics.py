from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app import models, auth as auth_utils
from app.database import get_db
from app.services import analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


# ---------- Schemas ----------

class NeverWornItemOut(BaseModel):
    id: str
    category: Optional[str]
    image_url: Optional[str]


class MostWornItemOut(BaseModel):
    id: str
    category: Optional[str]
    image_url: Optional[str]
    wear_count: int


class WardrobeStatsOut(BaseModel):
    total_items: int
    by_category: dict[str, int]
    by_color: dict[str, int]
    by_style: dict[str, int]
    by_occasion: dict[str, int]
    never_worn_count: int
    never_worn_items: list[NeverWornItemOut]
    most_worn_items: list[MostWornItemOut]


class ClusterOut(BaseModel):
    centroid: dict[str, int]
    item_count: int


class GapOut(BaseModel):
    ecosystem: str
    suggestion: str


class ColorGapsOut(BaseModel):
    wardrobe_clusters: list[ClusterOut]
    covered_ecosystems: list[str]
    gaps: list[GapOut]


# ---------- Routes ----------

@router.get("/stats", response_model=WardrobeStatsOut)
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    return analytics.get_wardrobe_stats(db, current_user.id)


@router.get("/color-gaps", response_model=ColorGapsOut)
def get_color_gaps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    return analytics.analyze_color_gaps(db, current_user.id)