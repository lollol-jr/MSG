# MSG 프로젝트 테스트 결과

## ✅ 완료된 작업
- [x] 백엔드 FastAPI 구조 생성 (ELL-6)
- [x] 프론트엔드 Next.js 구조 생성 (ELL-7)
- [x] Claude CLI 서비스 통합 (ELL-8)
- [x] Docker 배포 설정 (ELL-9)
- [x] SQL 마이그레이션 파일 생성 (ELL-5)

## 📋 실행 전 필요한 작업

### 1. Supabase 데이터베이스 설정 (5분)
```bash
# Supabase Dashboard 접속
open "https://supabase.com/dashboard/project/dcrylsktmuttokoaoixf/editor/sql"

# SQL 파일 내용 복사-붙여넣기
cat supabase/migrations/20260204000000_initial_schema.sql
```

### 2. 백엔드 의존성 설치 (2분)
```bash
cd backend
pip3 install -r requirements.txt
```

### 3. 프론트엔드 의존성 설치 (3분)
```bash
cd frontend
npm install
```

### 4. Claude CLI 로그인 (1분)
```bash
claude login
# → 관리자 Claude 계정으로 로그인
```

### 5. 환경변수 확인
```bash
# .env 파일이 이미 존재하므로 확인만 필요
cat .env
```

## 🎯 실행 명령어

### 로컬 개발 (추천)
```bash
# 터미널 1: 백엔드
cd backend
uvicorn main:app --reload

# 터미널 2: 프론트엔드
cd frontend
npm run dev
```

### Docker 실행
```bash
# 전체 실행
docker-compose up -d

# Claude CLI 로그인 (컨테이너 내부)
docker exec -it msg-backend claude login

# 로그 확인
docker-compose logs -f
```

## ✅ 테스트 체크리스트
- [ ] SQL 실행 완료
- [ ] 백엔드 pip install 완료
- [ ] 프론트엔드 npm install 완료
- [ ] Claude CLI 로그인 완료
- [ ] 백엔드 실행 확인 (http://localhost:8000)
- [ ] 프론트엔드 실행 확인 (http://localhost:3000)
- [ ] 이메일 로그인 테스트
- [ ] 채팅 기능 테스트
- [ ] 파일 업로드 테스트

## 📊 예상 소요 시간
- 설정: 10분
- 테스트: 10분
- **총: 20분**

