"""대화 히스토리 API"""
from fastapi import APIRouter, Depends, HTTPException
from database import (
    get_user_conversations,
    get_conversation_messages,
    create_conversation
)
from models import Conversation, ConversationCreate, Message
from api.auth import get_current_user

router = APIRouter()


@router.get("/conversations", response_model=list[Conversation])
async def list_conversations(user: dict = Depends(get_current_user)):
    """사용자의 모든 대화 목록 조회"""
    conversations = await get_user_conversations(user["id"])
    return conversations


@router.post("/conversations", response_model=Conversation)
async def new_conversation(
    data: ConversationCreate,
    user: dict = Depends(get_current_user)
):
    """새 대화 생성"""
    conversation = await create_conversation(user["id"], data.title)
    if not conversation:
        raise HTTPException(status_code=500, detail="Failed to create conversation")
    return conversation


@router.get("/conversations/{conversation_id}/messages", response_model=list[Message])
async def get_messages(
    conversation_id: str,
    user: dict = Depends(get_current_user)
):
    """특정 대화의 메시지 목록 조회"""
    messages = await get_conversation_messages(conversation_id)
    return messages


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user: dict = Depends(get_current_user)
):
    """대화 삭제"""
    # TODO: Supabase에서 대화 삭제
    # CASCADE로 메시지도 자동 삭제됨
    return {"success": True, "conversation_id": conversation_id}
