"""Claude API 서비스 - Anthropic SDK 사용"""
import os
from typing import AsyncGenerator
from anthropic import AsyncAnthropic


class ClaudeService:
    """Anthropic API를 사용하여 AI 응답 생성"""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.")

        self.client = AsyncAnthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"

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
            # 스트리밍 응답 요청
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=4096,
                messages=[{
                    "role": "user",
                    "content": message
                }]
            ) as stream:
                async for text in stream.text_stream:
                    yield text

        except Exception as e:
            yield f"\n⚠️ Error: {str(e)}"


# 싱글톤 인스턴스
_claude_service = None


def get_claude_service() -> ClaudeService:
    """Claude Service 싱글톤"""
    global _claude_service
    if _claude_service is None:
        _claude_service = ClaudeService()
    return _claude_service
