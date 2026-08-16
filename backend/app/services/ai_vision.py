import json
from google import genai
from google.genai import types
from app.config import settings

client = genai.Client(api_key=settings.gemini_api_key)

ANALYSIS_PROMPT = """You are a fashion classification assistant. Analyze the clothing item in this image and return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:

{
  "category": "one word, e.g. Top, Bottom, Shoes, Outerwear, Accessory",
  "subcategory": "specific type, e.g. Tailored Blazer, Straight-leg Trouser",
  "color": "primary color name",
  "pattern": "e.g. Plain, Striped, Floral, Checked",
  "style": "e.g. Elegant, Casual, Sporty, Formal",
  "season": "e.g. Spring/Autumn, Summer, Winter, All-season",
  "occasion": "e.g. Formal, Casual, Work, Evening",
  "material": "best guess, e.g. Cotton, Wool, Denim, Silk"
}

Respond with ONLY the JSON object, nothing else."""


def analyze_clothing_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    response = client.models.generate_content(
        model=settings.vision_model,
        contents=[
            ANALYSIS_PROMPT,
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        ],
    )

    text = response.text.strip()

    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return json.loads(text)