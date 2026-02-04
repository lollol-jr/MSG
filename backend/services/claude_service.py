"""Claude CLI 서비스 - 단일 계정 공유"""
import asyncio
from typing import AsyncGenerator


class ClaudeService:
    """Claude CLI를 subprocess로 실행하여 AI 응답 생성"""

    def __init__(self):
        self.is_cli_available = self._check_cli_installed()

    def _check_cli_installed(self) -> bool:
        """Claude CLI 설치 확인"""
        try:
            import subprocess
            result = subprocess.run(
                ["claude", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception as e:
            print(f"Claude CLI not found: {e}")
            return False

    async def chat(
        self,
        message: str,
        files: list[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Claude CLI로 대화

        Args:
            message: 사용자 메시지
            files: 첨부 파일 경로 리스트

        Yields:
            AI 응답 청크 (스트리밍)
        """
        if not self.is_cli_available:
            yield "⚠️ Claude CLI가 설치되지 않았습니다. 설치 후 `claude login`을 실행하세요."
            return

        # 명령어 구성
        cmd = ["claude", "chat"]

        # 파일 첨부
        if files:
            for file_path in files:
                cmd.extend(["--file", file_path])

        # 메시지 추가
        cmd.append(message)

        try:
            # subprocess 실행
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            # 스트리밍 출력
            while True:
                line = await process.stdout.readline()
                if not line:
                    break

                text = line.decode('utf-8')
                yield text

            # 프로세스 종료 대기
            await process.wait()

            # 에러 확인
            if process.returncode != 0:
                stderr = await process.stderr.read()
                error_msg = stderr.decode('utf-8')
                yield f"\n⚠️ Error: {error_msg}"

        except asyncio.TimeoutError:
            yield "\n⚠️ Timeout: Claude CLI 응답 시간 초과"
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
