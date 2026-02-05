#!/usr/bin/env python3
"""Supabase에 SQL 마이그레이션 자동 실행"""
import requests
import json

# Supabase 설정
SUPABASE_URL = "https://dcrylsktmuttokoaoixf.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnlsc2t0bXV0dG9rb2FvaXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE3OTkxMSwiZXhwIjoyMDg1NzU1OTExfQ.7EZV6FhNM4tfcgiFTBU-0bFudSXPhVvpPakG5wRDNtQ"

# SQL 파일 읽기
with open('supabase/migrations/20260204000000_initial_schema.sql', 'r') as f:
    sql_content = f.read()

print("📝 SQL 마이그레이션 파일 로드 완료")
print(f"   총 {len(sql_content)} 자")
print("")

# SQL 문을 개별 명령어로 분리
sql_statements = []
current_statement = []
in_function = False

for line in sql_content.split('\n'):
    line_stripped = line.strip()
    
    # 주석과 빈 줄 건너뛰기
    if line_stripped.startswith('--') or not line_stripped:
        continue
    
    current_statement.append(line)
    
    # 함수 정의 내부 체크
    if 'create or replace function' in line_stripped.lower() or 'create function' in line_stripped.lower():
        in_function = True
    
    # 세미콜론으로 끝나고 함수 내부가 아니면 명령어 완료
    if line_stripped.endswith(';'):
        if in_function and ('end;' in line_stripped.lower() or 'end $' in line_stripped.lower()):
            in_function = False
            sql_statements.append('\n'.join(current_statement))
            current_statement = []
        elif not in_function:
            sql_statements.append('\n'.join(current_statement))
            current_statement = []

print(f"📊 총 {len(sql_statements)}개의 SQL 명령어로 분리")
print("")

# Supabase Management API는 직접 SQL 실행을 지원하지 않으므로
# PostgreSQL 연결 문자열을 사용해야 합니다
print("⚠️  자동 SQL 실행은 Supabase Management API 제한으로 불가능합니다.")
print("")
print("📋 대신 다음 방법으로 실행하세요:")
print("")
print("방법 1: Supabase Dashboard (추천)")
print("1. https://supabase.com/dashboard/project/dcrylsktmuttokoaoixf/editor/sql")
print("2. SQL 파일 내용 복사-붙여넣기")
print("3. Run 버튼 클릭")
print("")
print("방법 2: psql CLI")
print("psql 'postgresql://postgres:[YOUR-PASSWORD]@db.dcrylsktmuttokoaoixf.supabase.co:5432/postgres' -f supabase/migrations/20260204000000_initial_schema.sql")
print("")
print("💡 SQL 파일을 클립보드에 복사하려면:")
print("   cat supabase/migrations/20260204000000_initial_schema.sql | pbcopy")
