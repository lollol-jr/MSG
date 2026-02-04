"""사용자 관련 Pydantic 모델"""
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserProfile(BaseModel):
    """사용자 프로필"""
    id: str
    display_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    """프로필 업데이트"""
    display_name: str | None = None
    avatar_url: str | None = None


class AuthResponse(BaseModel):
    """인증 응답"""
    access_token: str
    refresh_token: str | None = None
    user: dict
