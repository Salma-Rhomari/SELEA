from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://selea:selea@localhost:5432/selea"
    jwt_secret: str = "dev-secret-change-later"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days
    anthropic_api_key: str = ""
    vision_model: str = "claude-sonnet-4-6"
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"

settings = Settings()