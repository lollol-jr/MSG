"""Claude API 서비스 - 직접 HTTP 호출"""
import os
import httpx
from typing import AsyncGenerator
import json


class ClaudeService:
    """Anthropic API를 직접 HTTP로 호출하여 AI 응답 생성"""

    def __init__(self):
        self.api_key = None
        self.model = "claude-3-5-sonnet-20241022"
        self.api_url = "https://api.anthropic.com/v1/messages"

    def _ensure_api_key(self):
        """API 키 lazy loading"""
        if self.api_key is None:
            from config import get_settings
            settings = get_settings()
            self.api_key = settings.anthropic_api_key
            if not self.api_key:
                raise ValueError("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.")

    async def chat(
        self,
        message: str,
        files: list[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Claude API로 대화

        Args:
            message: 사용자 메시지
            files: 첨부 파일 경로 리스트 (현재 미지원)

        Yields:
            AI 응답 청크 (스트리밍)
        """
        try:
            # API 키 로드
            self._ensure_api_key()

            # HTTP 요청 헤더
            headers = {
                "x-api-key": self.api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }

            # 요청 바디
            payload = {
                "model": self.model,
                "max_tokens": 4096,
                "messages": [
                    {
                        "role": "user",
                        "content": message
                    }
                ],
                "stream": True
            }

            # 스트리밍 요청
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    self.api_url,
                    headers=headers,
                    json=payload
                ) as response:
                    response.raise_for_status()

                    # SSE 스트림 파싱
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]  # "data: " 제거

                            if data_str == "[DONE]":
                                break

                            try:
                                data = json.loads(data_str)

                                # 텍스트 델타 추출
                                if data.get("type") == "content_block_delta":
                                    delta = data.get("delta", {})
                                    if delta.get("type") == "text_delta":
                                        text = delta.get("text", "")
                                        if text:
                                            yield text

                            except json.JSONDecodeError:
                                continue

        except httpx.HTTPStatusError as e:
            error_detail = f"HTTP {e.response.status_code}: {e.response.text}"
            print(f"Claude API HTTP Error: {error_detail}")
            yield f"\n⚠️ API Error: {error_detail}"
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            print(f"Claude API Error: {error_detail}")
            yield f"\n⚠️ Error: {str(e)}"


# 싱글톤 인스턴스
_claude_service = None


def get_claude_service() -> ClaudeService:
    """Claude Service 싱글톤"""
    global _claude_service
    if _claude_service is None:
        _claude_service = ClaudeService()
    return _claude_service
