# MSG - AI Messenger

AI 비서 기반 메신저 애플리케이션 (MVP)

## 📋 개요

개인이 AI를 비서처럼 사용할 수 있는 메신저 서비스
- 실시간 대화 스트리밍
- 파일 업로드 지원
- 대화 히스토리 저장
- 이메일 인증

## 🚀 기술 스택

### Backend
- **FastAPI** - Python 웹 프레임워크
- **Supabase** - Auth, Database, Storage
- **Claude CLI** - AI 통합 (단일 계정 공유)

### Frontend
- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **WebSocket** - 실시간 통신

### Database
- **PostgreSQL** (Supabase)
  - profiles: 사용자 프로필
  - conversations: 대화 세션
  - messages: 메시지 히스토리
  - files: 파일 메타데이터

## 🏗️ 프로젝트 구조

```
MSG/
├── backend/              # FastAPI 백엔드
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── services/
│   │   ├── claude_service.py
│   │   └── storage_service.py
│   ├── api/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   └── history.py
│   └── models/
│       ├── user.py
│       └── conversation.py
│
├── frontend/             # Next.js 프론트엔드
│   ├── app/
│   ├── components/
│   └── lib/
│
├── supabase/
│   └── migrations/
│
├── docker-compose.yml
└── VERSION
```

## 🚀 시작하기

### 사전 요구사항

- Python 3.11+
- Node.js 18+
- Docker (선택)
- Claude CLI 설치 및 로그인

### 설치

#### 1. 환경변수 설정

```bash
cp .env.example .env
# .env 파일 편집하여 Supabase 정보 입력
```

#### 2. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

#### 4. Claude CLI 설정

```bash
# 백엔드 컨테이너에서 실행 (Docker 사용 시)
docker exec -it backend claude login
# 또는 로컬에서
claude login
```

### Docker Compose 실행

```bash
docker-compose up -d
```

## 📚 주요 기능

### MVP 기능
- ✅ 이메일 인증 (Supabase Auth)
- ✅ 실시간 채팅 (WebSocket)
- ✅ AI 응답 스트리밍 (Claude CLI)
- ✅ 파일 업로드 (10MB 제한)
- ✅ 대화 히스토리 저장
- ✅ 사용자별 데이터 격리 (RLS)

### 향후 추가 예정
- ⏳ 전화번호 인증
- ⏳ 트위터 OAuth
- ⏳ 사용자별 API 키 (Anthropic API 전환)
- ⏳ 그룹 채팅

## 🔒 보안

- Row Level Security (RLS) - 사용자별 데이터 격리
- JWT 토큰 기반 인증
- 환경변수로 시크릿 관리
- CORS 설정

## 📦 배포

### Backend (Dokploy)
```bash
# Dockerfile 빌드
docker build -t msg-backend ./backend

# 환경변수 설정
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Frontend (Vercel)
```bash
# GitHub 연동 자동 배포
vercel --prod

# 환경변수 설정
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=...
```

## 🤝 기여

Linear 이슈: https://linear.app/elle2

## 📄 라이선스

MIT

## 📞 문의

프로젝트 관련 문의: [이메일 주소]
