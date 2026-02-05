"""Supabase 데이터베이스 연결"""
from supabase import create_client, Client
from config import get_settings

# 캐시 없이 매번 새로 생성 (환경변수 업데이트 반영)
_client_cache = None
_anon_client_cache = None


def get_supabase_client() -> Client:
    """Supabase 클라이언트"""
    global _client_cache
    if _client_cache is None:
        settings = get_settings()
        print(f"[DEBUG] Creating Supabase client with key: {settings.supabase_service_role_key[:30]}...")
        _client_cache = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    return _client_cache


def get_supabase_anon_client() -> Client:
    """Supabase 익명 클라이언트 (프론트엔드용)"""
    global _anon_client_cache
    if _anon_client_cache is None:
        settings = get_settings()
        _anon_client_cache = create_client(
            settings.supabase_url,
            settings.supabase_anon_key
        )
    return _anon_client_cache


async def verify_user_token(token: str) -> dict | None:
    """JWT 토큰 검증"""
    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        return user.user if user else None
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None


async def get_user_profile(user_id: str) -> dict | None:
    """사용자 프로필 조회"""
    try:
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").eq("id", user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Failed to get user profile: {e}")
        return None


async def save_message(
    conversation_id: str,
    role: str,
    content: str
) -> dict | None:
    """메시지 저장"""
    try:
        supabase = get_supabase_client()
        result = supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "role": role,
            "content": content
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Failed to save message: {e}")
        return None


async def get_conversation_messages(conversation_id: str) -> list[dict]:
    """대화의 모든 메시지 조회"""
    try:
        supabase = get_supabase_client()
        result = supabase.table("messages")\
            .select("*")\
            .eq("conversation_id", conversation_id)\
            .order("created_at", desc=False)\
            .execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Failed to get messages: {e}")
        return []


async def create_conversation(user_id: str, title: str = "New Conversation") -> dict | None:
    """새 대화 생성"""
    try:
        supabase = get_supabase_client()
        result = supabase.table("conversations").insert({
            "user_id": user_id,
            "title": title
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Failed to create conversation: {e}")
        return None


async def get_user_conversations(user_id: str) -> list[dict]:
    """사용자의 모든 대화 조회"""
    try:
        supabase = get_supabase_client()
        result = supabase.table("conversations")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("updated_at", desc=True)\
            .execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Failed to get conversations: {e}")
        return []
