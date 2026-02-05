# 🚀 MSG 프로젝트 실행 상태

## ✅ 현재 실행 중인 서비스

### 백엔드 (FastAPI)
- **URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs
- **Status**: ✅ 정상 실행 중

### 프론트엔드 (Next.js)
- **URL**: http://localhost:3000
- **환경**: .env.local 설정됨
- **Status**: ✅ 정상 실행 중

## 📋 테스트 가이드

### 1. 로그인 페이지 접속
```
http://localhost:3000/login
```

### 2. 이메일 로그인 테스트
1. 이메일 주소 입력
2. "이메일로 로그인" 클릭
3. Supabase에서 이메일 확인 (테스트 모드)
4. 로그인 링크 클릭

### 3. 채팅 페이지 접속
```
http://localhost:3000
```

## ⚠️ 주의사항

### SQL 마이그레이션 미실행
현재 데이터베이스 테이블이 생성되지 않았습니다.
**실제 채팅 기능을 사용하려면 SQL 실행 필수!**

```
1. Supabase Dashboard 접속:
   https://supabase.com/dashboard/project/dcrylsktmuttokoaoixf/editor/sql

2. SQL 파일 복사:
   cat supabase/migrations/20260204000000_initial_schema.sql | pbcopy

3. SQL Editor에 붙여넣기 후 Run
```

### Claude CLI 설정
```bash
# Claude CLI 로그인 확인
claude auth status

# 로그인되어 있지 않다면
claude login
```

## 🧪 기능별 테스트

### ✅ 가능한 테스트 (SQL 없이)
- [x] 백엔드 Health Check
- [x] 프론트엔드 UI 로드
- [x] 로그인 페이지 접근
- [x] 환경변수 설정 확인

### ⏳ SQL 실행 후 가능한 테스트
- [ ] 이메일 인증 및 로그인
- [ ] 채팅 메시지 전송
- [ ] AI 응답 수신 (스트리밍)
- [ ] 파일 업로드
- [ ] 대화 히스토리 저장/조회

## 🔧 트러블슈팅

### 백엔드가 실행되지 않는 경우
```bash
cd backend
python3 main.py
# 에러 메시지 확인
```

### 프론트엔드가 실행되지 않는 경우
```bash
cd frontend
npm run dev
# 에러 메시지 확인
```

### 포트가 이미 사용 중인 경우
```bash
# 8000 포트 확인
lsof -ti:8000 | xargs kill -9

# 3000 포트 확인
lsof -ti:3000 | xargs kill -9
```

## 📊 다음 단계

1. **SQL 실행** (5분) - 데이터베이스 준비
2. **로그인 테스트** (2분) - 이메일 인증
3. **채팅 테스트** (5분) - AI 응답 확인
4. **파일 업로드 테스트** (3분) - 파일 첨부 기능

**총 예상 시간: 15분**
