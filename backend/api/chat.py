"""채팅 API - WebSocket & HTTP Streaming"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from database import (
    save_message,
    get_conversation_messages,
    create_conversation
)
from services import get_claude_service
from api.auth import get_current_user
import json

router = APIRouter()
claude_service = get_claude_service()


class ChatRequest(BaseModel):
    user_id: str
    message: str
    conversation_id: str = None
    files: list[str] = []


@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket 채팅 엔드포인트

    메시지 형식:
    - 클라이언트 → 서버:
      {
        "type": "message",
        "conversation_id": "uuid",
        "content": "메시지 내용",
        "files": ["file_path1", "file_path2"]  # 선택
      }

    - 서버 → 클라이언트:
      {
        "type": "stream",  # 스트리밍 중
        "content": "청크"
      }
      또는
      {
        "type": "done",  # 응답 완료
        "message_id": "uuid",
        "content": "전체 응답"
      }
      또는
      {
        "type": "error",
        "message": "에러 메시지"
      }
    """
    await websocket.accept()

    # 토큰 검증 (쿼리 파라미터로 받음)
    token = websocket.query_params.get("token")
    if not token:
        await websocket.send_json({
            "type": "error",
            "message": "No token provided"
        })
        await websocket.close()
        return

    # 사용자 인증 (간단한 방식 - 실제로는 더 안전하게)
    # TODO: JWT 토큰 검증 로직 추가
    user_id = websocket.query_params.get("user_id")  # 임시

    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_json()

            if data.get("type") != "message":
                continue

            conversation_id = data.get("conversation_id")
            content = data.get("content")
            files = data.get("files", [])

            # 대화 ID 없으면 새로 생성
            if not conversation_id:
                conversation = await create_conversation(user_id, "New Chat")
                conversation_id = conversation["id"]
                await websocket.send_json({
                    "type": "conversation_created",
                    "conversation_id": conversation_id
                })

            # 사용자 메시지 저장
            await save_message(conversation_id, "user", content)

            # Claude CLI 호출 및 스트리밍 응답
            full_response = ""
            async for chunk in claude_service.chat(content, files):
                # 실시간으로 클라이언트에 전송
                await websocket.send_json({
                    "type": "stream",
                    "content": chunk
                })
                full_response += chunk

            # AI 응답 저장
            message = await save_message(conversation_id, "assistant", full_response)

            # 완료 신호
            await websocket.send_json({
                "type": "done",
                "message_id": message["id"] if message else None,
                "content": full_response
            })

    except WebSocketDisconnect:
        print(f"Client disconnected: {user_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
        await websocket.close()


@router.post("/send")
async def send_message_http(
    conversation_id: str,
    content: str,
    files: list[str] = [],
    user: dict = Depends(get_current_user)
):
    """
    HTTP POST 방식 메시지 전송 (WebSocket 대안)
    스트리밍은 지원하지 않음
    """
    # 사용자 메시지 저장
    await save_message(conversation_id, "user", content)

    # Claude CLI 호출
    full_response = ""
    async for chunk in claude_service.chat(content, files):
        full_response += chunk

    # AI 응답 저장
    message = await save_message(conversation_id, "assistant", full_response)

    return {
        "message_id": message["id"] if message else None,
        "content": full_response
    }


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    """
    HTTP POST 스트리밍 방식 채팅

    배포 환경에서 WebSocket보다 안정적
    """
    async def generate():
        try:
            # 대화 ID 없으면 새로 생성
            conversation_id = request.conversation_id
            if not conversation_id:
                # 프로필이 없으면 먼저 생성
                from database import get_supabase_client
                supabase = get_supabase_client()

                # 프로필 확인 및 생성
                profile_result = supabase.table("profiles").select("*").eq("id", request.user_id).execute()
                if not profile_result.data:
                    # 프로필 생성
                    supabase.table("profiles").insert({
                        "id": request.user_id,
                        "email": f"{request.user_id}@temp.com"
                    }).execute()

                conversation = await create_conversation(request.user_id, "New Chat")
                if not conversation:
                    yield "⚠️ 대화를 생성할 수 없습니다. 잠시 후 다시 시도해주세요."
                    return
                conversation_id = conversation["id"]

            # 사용자 메시지 저장 (실패해도 계속 진행)
            await save_message(conversation_id, "user", request.message)

            # Claude API 호출 및 스트리밍
            full_response = ""
            async for chunk in claude_service.chat(request.message, request.files):
                full_response += chunk
                yield chunk

            # AI 응답 저장 (실패해도 무시)
            if conversation_id:
                await save_message(conversation_id, "assistant", full_response)

        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            print(f"Stream error: {error_detail}")
            yield f"\n⚠️ Error: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")
