from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://selea:selea@localhost:5432/selea"
    jwt_secret: str = "dev-secret-change-later"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days
    gemini_api_key: str = ""
    vision_model: str = "gemini-3.6-flash"
    upload_dir: str = "uploads"
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    frontend_url: str = ""

    class Config:
        env_file = ".env"

settings = Settings()