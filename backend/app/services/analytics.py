import random
from collections import Counter
from typing import Optional
from sqlalchemy.orm import Session
from app import models

# ---------- Color RGB mapping ----------

COLOR_RGB_MAP = {
    "black": (20, 20, 20),
    "charcoal": (54, 54, 54),
    "grey": (128, 128, 128),
    "gray": (128, 128, 128),
    "white": (245, 245, 245),
    "ivory": (240, 234, 214),
    "cream": (245, 237, 210),
    "beige": (222, 194, 156),
    "tan": (210, 180, 140),
    "camel": (193, 154, 107),
    "brown": (101, 67, 33),
    "khaki": (189, 175, 129),
    "olive": (110, 118, 60),
    "navy": (25, 40, 80),
    "denim blue": (60, 100, 150),
    "light blue": (150, 200, 230),
    "sky blue": (135, 206, 235),
    "blue": (0, 102, 204),
    "teal": (0, 128, 128),
    "green": (46, 125, 50),
    "dark green": (27, 77, 30),
    "red": (200, 30, 45),
    "burgundy": (110, 20, 40),
    "maroon": (100, 20, 30),
    "orange": (230, 126, 34),
    "rust": (183, 88, 42),
    "mustard": (218, 165, 32),
    "yellow": (240, 200, 40),
    "gold": (212, 175, 55),
    "silver": (192, 192, 192),
    "pink": (235, 150, 175),
    "blush": (240, 190, 200),
    "lavender": (200, 180, 220),
    "purple": (120, 60, 150),
    "coral": (240, 128, 100),
}

# Sorted so multi-word keys ("denim blue") are checked before single-word ones ("blue")
_SORTED_COLOR_KEYS = sorted(COLOR_RGB_MAP.keys(), key=len, reverse=True)


def color_to_rgb(color_name: Optional[str]) -> Optional[tuple[float, float, float]]:
    if not color_name:
        return None
    normalized = color_name.lower().strip()
    for key in _SORTED_COLOR_KEYS:
        if key in normalized:
            return COLOR_RGB_MAP[key]
    return None  # unknown color, skip it rather than guessing


# ---------- Pure-python k-means ----------

def _euclidean(a: tuple, b: tuple) -> float:
    return sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5


def kmeans(points: list[tuple], k: int, iterations: int = 15, seed: int = 42):
    if not points:
        return [], []

    k = min(k, len(points))
    rng = random.Random(seed)
    centroids = rng.sample(points, k)
    assignments = [-1] * len(points)

    for _ in range(iterations):
        new_assignments = []
        for p in points:
            dists = [_euclidean(p, c) for c in centroids]
            new_assignments.append(dists.index(min(dists)))

        if new_assignments == assignments:
            break
        assignments = new_assignments

        for i in range(k):
            cluster_points = [points[j] for j in range(len(points)) if assignments[j] == i]
            if cluster_points:
                centroids[i] = tuple(
                    sum(p[dim] for p in cluster_points) / len(cluster_points)
                    for dim in range(3)
                )

    return centroids, assignments


# ---------- Reference color ecosystems ----------

REFERENCE_ECOSYSTEMS = [
    {
        "name": "Neutrals",
        "swatches": [(20, 20, 20), (245, 245, 245), (128, 128, 128), (222, 194, 156)],
        "suggestion": "Add a few neutral basics (black, white, grey, or beige) — they anchor every outfit.",
    },
    {
        "name": "Earth Tones",
        "swatches": [(101, 67, 33), (193, 154, 107), (110, 118, 60)],
        "suggestion": "Try a brown, camel, or olive piece for warmth and easy layering.",
    },
    {
        "name": "Warm Pops",
        "swatches": [(200, 30, 45), (230, 126, 34), (218, 165, 32)],
        "suggestion": "A red, orange, or mustard piece would give your outfits an energetic accent.",
    },
    {
        "name": "Cool Pops",
        "swatches": [(0, 102, 204), (0, 128, 128), (46, 125, 50)],
        "suggestion": "Consider a blue, teal, or green piece for a fresh, cool accent.",
    },
    {
        "name": "Pastels",
        "swatches": [(240, 190, 200), (200, 180, 220), (135, 206, 235)],
        "suggestion": "A soft pastel (blush, lavender, sky blue) could soften your palette.",
    },
    {
        "name": "Jewel Tones",
        "swatches": [(110, 20, 40), (120, 60, 150), (0, 128, 128)],
        "suggestion": "A jewel-toned piece (burgundy, purple, teal) adds richness for dressier looks.",
    },
]

GAP_THRESHOLD = 90.0  # RGB distance above which we consider an ecosystem "missing"


def analyze_color_gaps(db: Session, user_id: str) -> dict:
    items = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.user_id == user_id)
        .all()
    )

    points = []
    for item in items:
        colors = [item.color] + list(item.secondary_colors or [])
        for c in colors:
            rgb = color_to_rgb(c)
            if rgb:
                points.append(rgb)

    if not points:
        return {"wardrobe_clusters": [], "covered_ecosystems": [], "gaps": []}

    k = min(6, len(set(points)))
    centroids, assignments = kmeans(points, k)
    counts = Counter(assignments)

    wardrobe_clusters = [
        {
            "centroid": {"r": round(c[0]), "g": round(c[1]), "b": round(c[2])},
            "item_count": counts.get(i, 0),
        }
        for i, c in enumerate(centroids)
    ]

    covered = []
    gaps = []
    for eco in REFERENCE_ECOSYSTEMS:
        min_dist = min(
            _euclidean(c["centroid"] and (c["centroid"]["r"], c["centroid"]["g"], c["centroid"]["b"]) or (0, 0, 0), swatch)
            for c in wardrobe_clusters
            for swatch in eco["swatches"]
        )
        if min_dist > GAP_THRESHOLD:
            gaps.append({"ecosystem": eco["name"], "suggestion": eco["suggestion"]})
        else:
            covered.append(eco["name"])

    return {
        "wardrobe_clusters": wardrobe_clusters,
        "covered_ecosystems": covered,
        "gaps": gaps,
    }


# ---------- Basic wardrobe stats ----------

def get_wardrobe_stats(db: Session, user_id: str) -> dict:
    items = (
        db.query(models.ClothingItem)
        .filter(models.ClothingItem.user_id == user_id)
        .all()
    )

    total = len(items)
    by_category = Counter(i.category for i in items if i.category)
    by_color = Counter(i.color for i in items if i.color)
    by_style = Counter(i.style for i in items if i.style)
    by_occasion = Counter(i.occasion for i in items if i.occasion)

    never_worn = [i for i in items if (i.wear_count or 0) == 0]
    most_worn = sorted(items, key=lambda i: i.wear_count or 0, reverse=True)[:5]

    return {
        "total_items": total,
        "by_category": dict(by_category),
        "by_color": dict(by_color),
        "by_style": dict(by_style),
        "by_occasion": dict(by_occasion),
        "never_worn_count": len(never_worn),
        "never_worn_items": [
            {"id": i.id, "category": i.category, "image_url": i.image_url}
            for i in never_worn
        ],
        "most_worn_items": [
            {"id": i.id, "category": i.category, "image_url": i.image_url, "wear_count": i.wear_count}
            for i in most_worn
        ],
    }