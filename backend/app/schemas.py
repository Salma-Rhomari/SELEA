from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    style_preferences: List[str] = []
    favorite_colors: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserPreferencesUpdate(BaseModel):
    style_preferences: Optional[List[str]] = None
    favorite_colors: Optional[List[str]] = None


class ClothingItemCreate(BaseModel):
    image_url: str
    category: str
    subcategory: Optional[str] = None
    color: Optional[str] = None
    secondary_colors: List[str] = []
    pattern: Optional[str] = None
    style: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    material: Optional[str] = None


class ClothingItemUpdate(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None
    color: Optional[str] = None
    secondary_colors: Optional[List[str]] = None
    pattern: Optional[str] = None
    style: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    material: Optional[str] = None


class ClothingItemOut(BaseModel):
    id: str
    image_url: str
    category: str
    subcategory: Optional[str] = None
    color: Optional[str] = None
    secondary_colors: List[str] = []
    pattern: Optional[str] = None
    style: Optional[str] = None
    season: Optional[str] = None
    occasion: Optional[str] = None
    material: Optional[str] = None
    wear_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True