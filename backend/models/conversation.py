"""대화 관련 Pydantic 모델"""
from pydantic import BaseModel
from datetime import datetime


class Message(BaseModel):
    """메시지 모델"""
    id: str
    conversation_id: str
    role: str  # 'user' | 'assistant' | 'system'
    content: str
    created_at: datetime


class MessageCreate(BaseModel):
    """메시지 생성 요청"""
    conversation_id: str
    content: str
    files: list[str] = []  # 파일 경로 리스트


class Conversation(BaseModel):
    """대화 모델"""
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime


class ConversationCreate(BaseModel):
    """대화 생성 요청"""
    title: str = "New Conversation"


class ConversationWithMessages(Conversation):
    """메시지 포함 대화"""
    messages: list[Message] = []


class FileUpload(BaseModel):
    """파일 업로드 정보"""
    id: str
    message_id: str
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    created_at: datetime
