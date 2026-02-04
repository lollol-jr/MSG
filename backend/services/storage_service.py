"""파일 업로드 서비스 - Supabase Storage"""
import os
import uuid
from datetime import datetime
from database import get_supabase_client
from config import get_settings

settings = get_settings()


class StorageService:
    """Supabase Storage를 사용한 파일 업로드"""

    def __init__(self):
        self.supabase = get_supabase_client()
        self.bucket = settings.storage_bucket

    async def upload_file(
        self,
        file_content: bytes,
        file_name: str,
        mime_type: str,
        user_id: str
    ) -> dict | None:
        """
        파일 업로드

        Args:
            file_content: 파일 바이너리 데이터
            file_name: 원본 파일명
            mime_type: MIME 타입
            user_id: 사용자 ID

        Returns:
            파일 정보 (path, url, size 등)
        """
        try:
            # 파일 크기 확인
            file_size = len(file_content)
            max_size = settings.max_file_size_mb * 1024 * 1024  # MB to bytes

            if file_size > max_size:
                raise ValueError(f"File too large: {file_size} bytes (max {max_size})")

            # MIME 타입 확인
            if mime_type not in settings.allowed_file_types:
                raise ValueError(f"File type not allowed: {mime_type}")

            # 고유 파일명 생성
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = uuid.uuid4().hex[:8]
            file_extension = os.path.splitext(file_name)[1]
            unique_filename = f"{user_id}/{timestamp}_{unique_id}{file_extension}"

            # Supabase Storage 업로드
            result = self.supabase.storage.from_(self.bucket).upload(
                path=unique_filename,
                file=file_content,
                file_options={"content-type": mime_type}
            )

            # Public URL 생성
            public_url = self.supabase.storage.from_(self.bucket).get_public_url(unique_filename)

            return {
                "file_name": file_name,
                "file_path": unique_filename,
                "file_size": file_size,
                "mime_type": mime_type,
                "public_url": public_url
            }

        except Exception as e:
            print(f"File upload failed: {e}")
            return None

    async def delete_file(self, file_path: str) -> bool:
        """파일 삭제"""
        try:
            self.supabase.storage.from_(self.bucket).remove([file_path])
            return True
        except Exception as e:
            print(f"File deletion failed: {e}")
            return False

    async def get_file_url(self, file_path: str) -> str | None:
        """파일 Public URL 조회"""
        try:
            return self.supabase.storage.from_(self.bucket).get_public_url(file_path)
        except Exception as e:
            print(f"Failed to get file URL: {e}")
            return None


# 싱글톤 인스턴스
_storage_service = None


def get_storage_service() -> StorageService:
    """Storage Service 싱글톤"""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service
