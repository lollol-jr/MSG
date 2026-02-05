"""MSG 백엔드 메인 애플리케이션"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from api import auth, chat, history
import os

settings = get_settings()

# 환경변수 디버깅
print("=" * 50)
print("Environment Variables Check:")
print(f"SUPABASE_URL: {settings.supabase_url[:30]}...")
print(f"SUPABASE_SERVICE_ROLE_KEY: {settings.supabase_service_role_key[:20]}...")
print(f"ANTHROPIC_API_KEY: {settings.anthropic_api_key[:20]}...")
print(f"Environment vars loaded: {len([k for k in os.environ.keys() if 'SUPABASE' in k or 'ANTHROPIC' in k])} found")
print("=" * 50)

# FastAPI 앱 생성
app = FastAPI(
    title="MSG API",
    description="AI Messenger Backend",
    version="0.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(history.router, prefix="/api/history", tags=["history"])


@app.get("/")
async def root():
    """헬스체크"""
    return {
        "service": "MSG Backend",
        "version": "0.1.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "ok",
        "supabase_connected": True  # TODO: 실제 연결 확인
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )
