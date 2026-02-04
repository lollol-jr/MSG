#!/usr/bin/env python3
"""Supabase 마이그레이션 적용"""
import requests
import os

SUPABASE_URL = "https://dcrylsktmuttokoaoixf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnlsc2t0bXV0dG9rb2FvaXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE3OTkxMSwiZXhwIjoyMDg1NzU1OTExfQ.7EZV6FhNM4tfcgiFTBU-0bFudSXPhVvpPakG5wRDNtQ"

def apply_migration():
    """SQL 마이그레이션 실행"""

    # SQL 파일 읽기
    sql_file = "supabase/migrations/20260204000000_initial_schema.sql"
    with open(sql_file, 'r') as f:
        sql = f.read()

    print("📝 SQL 마이그레이션 적용 중...")
    print("=" * 60)

    # Supabase REST API는 직접 SQL 실행을 지원하지 않음
    # 대신 PostgREST를 통해 테이블 생성 확인만 가능

    print("\n⚠️  자동 실행 불가: Supabase Dashboard에서 수동 실행 필요")
    print("\n📋 다음 단계:")
    print("1. Supabase Dashboard 접속:")
    print("   https://supabase.com/dashboard/project/dcrylsktmuttokoaoixf/editor/sql")
    print("\n2. SQL Editor에서 다음 파일 내용 복사-붙여넣기:")
    print(f"   {sql_file}")
    print("\n3. 'Run' 버튼 클릭하여 실행")
    print("\n" + "=" * 60)

    # SQL 내용 출력 (복사하기 쉽게)
    print("\n📄 SQL 내용 (복사용):")
    print("=" * 60)
    print(sql)
    print("=" * 60)

if __name__ == "__main__":
    apply_migration()
