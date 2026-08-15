import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    style_preferences = Column(ARRAY(String), default=list)
    favorite_colors = Column(ARRAY(String), default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("ClothingItem", back_populates="owner")
    outfits = relationship("Outfit", back_populates="owner")


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=False)
    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=True)
    color = Column(String, nullable=True)
    secondary_colors = Column(ARRAY(String), default=list)
    pattern = Column(String, nullable=True)
    style = Column(String, nullable=True)
    season = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    material = Column(String, nullable=True)
    wear_count = Column(Integer, default=0)
    last_worn_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="items")


class Outfit(Base):
    __tablename__ = "outfits"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    style = Column(String, nullable=True)
    weather = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="outfits")
    items = relationship("OutfitItem", back_populates="outfit")


class OutfitItem(Base):
    __tablename__ = "outfit_items"

    outfit_id = Column(String, ForeignKey("outfits.id"), primary_key=True)
    clothing_item_id = Column(String, ForeignKey("clothing_items.id"), primary_key=True)

    outfit = relationship("Outfit", back_populates="items")


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    outfit_id = Column(String, ForeignKey("outfits.id"), nullable=False)
    liked = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)