#!/usr/bin/env python3
"""Supabase 프로젝트 정보 확인"""
import requests
import json

SUPABASE_URL = "https://dcrylsktmuttokoaoixf.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnlsc2t0bXV0dG9rb2FvaXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzk5MTEsImV4cCI6MjA4NTc1NTkxMX0.aj_6lUtEZsQ5xrvYvJVqhJxemLE9F_OVpDMZS4B2sTU"

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}"
}

def check_tables():
    """데이터베이스 테이블 확인"""
    url = f"{SUPABASE_URL}/rest/v1/"
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()
        paths = data.get("paths", {})

        # RPC 함수 제외하고 테이블만 추출
        tables = [path.replace("/", "") for path in paths.keys()
                 if path != "/" and not path.startswith("/rpc")]

        print("📊 Supabase 데이터베이스 테이블:")
        if tables:
            for table in sorted(tables):
                print(f"  - {table}")
        else:
            print("  (테이블 없음 - 새 프로젝트)")

        return tables
    except Exception as e:
        print(f"❌ 테이블 조회 실패: {e}")
        return []

def check_auth_config():
    """Auth 설정 확인"""
    url = f"{SUPABASE_URL}/auth/v1/settings"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            settings = response.json()
            print("\n🔐 Auth 설정:")
            print(f"  - External providers: {settings.get('external', {}).keys()}")
            print(f"  - Email enabled: {settings.get('external_email_enabled', 'N/A')}")
            print(f"  - Phone enabled: {settings.get('external_phone_enabled', 'N/A')}")
        else:
            print(f"\n⚠️  Auth 설정 조회 불가 (status: {response.status_code})")
            print("   → Supabase Dashboard에서 수동 확인 필요")
    except Exception as e:
        print(f"\n⚠️  Auth 설정 확인 실패: {e}")
        print("   → Supabase Dashboard에서 수동 확인 필요")

def check_storage():
    """Storage buckets 확인"""
    url = f"{SUPABASE_URL}/storage/v1/bucket"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            buckets = response.json()
            print("\n📦 Storage Buckets:")
            if buckets:
                for bucket in buckets:
                    print(f"  - {bucket.get('name')} (public: {bucket.get('public', False)})")
            else:
                print("  (버킷 없음)")
        else:
            print(f"\n⚠️  Storage 조회 불가 (status: {response.status_code})")
    except Exception as e:
        print(f"\n⚠️  Storage 확인 실패: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("Supabase 프로젝트 분석")
    print("=" * 60)

    tables = check_tables()
    check_auth_config()
    check_storage()

    print("\n" + "=" * 60)
    print("✅ 분석 완료")
    print("=" * 60)
