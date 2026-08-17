import random
from typing import Optional
from sqlalchemy.orm import Session
from app import models

MOOD_STYLE_MAP = {
    "confident": ["chic", "elegant", "classic"],
    "cozy": ["casual", "comfy", "minimal"],
    "romantic": ["romantic", "boho", "elegant"],
    "edgy": ["streetwear", "edgy", "grunge"],
    "playful": ["casual", "boho", "colorful"],
    "professional": ["classic", "minimal", "chic"],
}

TOP_CATEGORIES = {"top", "shirt", "blouse", "t-shirt", "sweater"}
BOTTOM_CATEGORIES = {"bottom", "pants", "skirt", "jeans", "shorts"}
DRESS_CATEGORIES = {"dress"}
OUTERWEAR_CATEGORIES = {"outerwear", "jacket", "coat"}
SHOE_CATEGORIES = {"shoes", "sneakers", "boots", "heels"}
ACCESSORY_CATEGORIES = {"accessory", "bag", "jewelry", "scarf"}


def _matches_mood(item: models.ClothingItem, styles: list[str]) -> bool:
    return item.style is not None and item.style.lower() in styles


def _matches_occasion(item: models.ClothingItem, occasion: Optional[str]) -> bool:
    if not occasion:
        return True
    return item.occasion is not None and item.occasion.lower() == occasion.lower()


def generate_outfits(
    db: Session,
    user_id: int,
    occasion: Optional[str],
    mood: str,
    season: Optional[str] = None,
    n: int = 3,
) -> list[dict]:
    styles = MOOD_STYLE_MAP.get(mood.lower(), [])
    if not styles:
        raise ValueError(f"Unknown mood: {mood}")

    items = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.user_id == user_id)
        .all()
    )

    def keep(item: models.ClothingItem) -> bool:
        if not _matches_mood(item, styles):
            return False
        if not _matches_occasion(item, occasion):
            return False
        if season and item.season and item.season.lower() != season.lower():
            return False
        return True

    filtered = [i for i in items if keep(i)]

    tops = [i for i in filtered if i.category.lower() in TOP_CATEGORIES]
    bottoms = [i for i in filtered if i.category.lower() in BOTTOM_CATEGORIES]
    dresses = [i for i in filtered if i.category.lower() in DRESS_CATEGORIES]
    outerwear = [i for i in filtered if i.category.lower() in OUTERWEAR_CATEGORIES]
    shoes = [i for i in filtered if i.category.lower() in SHOE_CATEGORIES]
    accessories = [i for i in filtered if i.category.lower() in ACCESSORY_CATEGORIES]

    bases: list[list[models.ClothingItem]] = []

    for top in tops:
        for bottom in bottoms:
            bases.append([top, bottom])

    for dress in dresses:
        bases.append([dress])

    if not bases:
        return []

    random.shuffle(bases)

    outfits = []
    for base in bases[: n * 3]:  # on suréchantillonne un peu avant de trim à n
        outfit_items = list(base)
        if outerwear and random.random() < 0.5:
            outfit_items.append(random.choice(outerwear))
        if shoes:
            outfit_items.append(random.choice(shoes))
        if accessories and random.random() < 0.5:
            outfit_items.append(random.choice(accessories))
        outfits.append(outfit_items)
        if len(outfits) >= n:
            break

    return [
        {
            "items": [
                {
                    "id": item.id,
                    "category": item.category,
                    "image_url": item.image_url,
                    "color": item.color,
                    "style": item.style,
                }
                for item in outfit
            ]
        }
        for outfit in outfits
    ]