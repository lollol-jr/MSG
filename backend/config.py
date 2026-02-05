"""환경변수 설정"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # Anthropic
    anthropic_api_key: str

    # API
    api_port: int = 8000
    api_host: str = "0.0.0.0"

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://frontend-two-beige-80.vercel.app",
        "https://frontend-5jq47q6h1-0510s-projects.vercel.app"
    ]

    # 파일 업로드
    max_file_size_mb: int = 10
    allowed_file_types: list[str] = [
        "image/png", "image/jpeg", "image/jpg", "image/gif",
        "application/pdf",
        "text/plain", "text/csv",
        "application/json"
    ]

    # Storage
    storage_bucket: str = "chat-files"

    # JWT (Supabase가 관리하지만 백엔드에서도 필요할 수 있음)
    jwt_secret: str = "change_this_in_production"
    jwt_algorithm: str = "HS256"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # 추가 필드 무시


@lru_cache()
def get_settings() -> Settings:
    """설정 싱글톤"""
    return Settings()
