"""인증 API"""
from fastapi import APIRouter, Depends, HTTPException, Header
from database import verify_user_token, get_user_profile
from models import UserProfile

router = APIRouter()


async def get_current_user(authorization: str = Header(None)) -> dict:
    """현재 사용자 인증"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")

    # Bearer 토큰 추출
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    # 토큰 검증
    user = await verify_user_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user


@router.get("/me", response_model=UserProfile)
async def get_me(user: dict = Depends(get_current_user)):
    """현재 사용자 정보 조회"""
    profile = await get_user_profile(user["id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.get("/verify")
async def verify_token(user: dict = Depends(get_current_user)):
    """토큰 검증"""
    return {
        "valid": True,
        "user_id": user["id"],
        "display_name": user.get("display_name")
    }
