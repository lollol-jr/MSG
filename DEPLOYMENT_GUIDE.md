# 🚀 MSG 프로젝트 배포 가이드

## 📋 배포 전 체크리스트

- [x] 로컬 테스트 완료
- [x] 백엔드 실행 확인
- [x] 프론트엔드 실행 확인
- [ ] SQL 마이그레이션 실행
- [ ] GitHub 저장소 준비
- [ ] Dokploy 배포 (백엔드)
- [ ] Vercel 배포 (프론트엔드)

---

## 1️⃣ SQL 마이그레이션 실행

### Supabase Dashboard에서 실행 (진행 중)

✅ **SQL이 클립보드에 복사되었습니다!**

**실행 단계:**
1. 브라우저가 자동으로 Supabase SQL Editor를 열었습니다
2. 에디터에서 **Cmd+V** (Mac) 또는 **Ctrl+V** (Windows)로 붙여넣기
3. **"Run"** 버튼 클릭
4. 성공 메시지 확인

**실행할 내용:**
- 4개 테이블 생성 (profiles, conversations, messages, files)
- 인덱스 생성
- Row Level Security 정책 설정
- 트리거 및 함수 생성

---

## 2️⃣ GitHub 저장소 설정

### 새 저장소 생성 또는 기존 저장소 사용

```bash
cd /Users/jinkane/Desktop/project/MSG

# Git 초기화 (필요 시)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "feat: MSG AI Messenger MVP 초기 구현

- FastAPI 백엔드 구조
- Next.js 프론트엔드
- Claude CLI 통합
- Supabase 연동
- Docker 설정 완료

v0.1.0"

# 원격 저장소 추가 (GitHub에서 저장소 생성 후)
git remote add origin https://github.com/YOUR_USERNAME/msg-ai-messenger.git

# 푸시
git push -u origin main
```

---

## 3️⃣ 백엔드 배포 (Dokploy)

### Dokploy 설정

**접속:** https://dokploy.jrai.space

### 새 애플리케이션 생성

1. **프로젝트**: n8n (기존) 또는 새 프로젝트 생성
2. **애플리케이션 이름**: msg-backend
3. **저장소**: GitHub 연동
4. **브랜치**: main
5. **빌드 방식**: Dockerfile

### 환경변수 설정

```bash
SUPABASE_URL=https://dcrylsktmuttokoaoixf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnlsc2t0bXV0dG9rb2FvaXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzk5MTEsImV4cCI6MjA4NTc1NTkxMX0.aj_6lUtEZsQ5xrvYvJVqhJxemLE9F_OVpDMZS4B2sTU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnlsc2t0bXV0dG9rb2FvaXhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE3OTkxMSwiZXhwIjoyMDg1NzU1OTExfQ.7EZV6FhNM4tfcgiFTBU-0bFudSXPhVvpPakG5wRDNtQ
API_PORT=8000
```

### Claude CLI 설정 (배포 후)

```bash
# Dokploy 컨테이너 접속
docker exec -it msg-backend /bin/bash

# Claude CLI 로그인
claude login

# 로그인 후 exit
exit
```

### 도메인 설정

- **내부 도메인**: msg-backend.dokploy.internal
- **외부 도메인**: backend.msg.yourdomain.com (선택)

---

## 4️⃣ 프론트엔드 배포 (Vercel)

### Vercel CLI 설치

```bash
npm install -g vercel
```

### 배포

```bash
cd /Users/jinkane/Desktop/project/MSG/frontend

# Vercel 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경변수 설정 (Vercel Dashboard)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dcrylsktmuttokoaoixf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnlsc2t0bXV0dG9rb2FvaXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzk5MTEsImV4cCI6MjA4NTc1NTkxMX0.aj_6lUtEZsQ5xrvYvJVqhJxemLE9F_OVpDMZS4B2sTU
NEXT_PUBLIC_API_URL=https://msg-backend.dokploy.yourdomain.com
```

### 또는 Vercel GitHub 연동

1. Vercel Dashboard → **New Project**
2. GitHub 저장소 선택
3. **Root Directory**: frontend
4. 환경변수 입력
5. **Deploy** 클릭

---

## 5️⃣ 도메인 및 HTTPS 설정

### Dokploy (백엔드)

- 자동 HTTPS 인증서 생성
- Traefik으로 자동 라우팅

### Vercel (프론트엔드)

- 자동 HTTPS
- `*.vercel.app` 도메인 제공
- 커스텀 도메인 추가 가능

---

## 6️⃣ 배포 후 확인

### 백엔드 Health Check

```bash
curl https://your-backend-domain.com/health
```

### 프론트엔드 접속

```
https://your-frontend.vercel.app
```

### 기능 테스트

1. ✅ 로그인 페이지 접속
2. ✅ 이메일 인증
3. ✅ 채팅 전송
4. ✅ AI 응답 수신
5. ✅ 파일 업로드

---

## 🔧 트러블슈팅

### Claude CLI 로그인 실패

```bash
# 컨테이너 재시작 후 다시 로그인
docker restart msg-backend
docker exec -it msg-backend claude login
```

### CORS 에러

백엔드 `config.py`에서 프론트엔드 도메인 추가:

```python
cors_origins: list[str] = [
    "http://localhost:3000",
    "https://your-frontend.vercel.app"
]
```

### Supabase 연결 실패

환경변수 확인:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

---

## 📊 배포 완료 체크리스트

- [ ] SQL 마이그레이션 완료
- [ ] GitHub 푸시 완료
- [ ] Dokploy 백엔드 배포 성공
- [ ] Vercel 프론트엔드 배포 성공
- [ ] Claude CLI 로그인 완료
- [ ] Health Check 통과
- [ ] 로그인 테스트 성공
- [ ] 채팅 기능 테스트 성공

---

## 🎉 배포 완료!

**배포된 URL:**
- 백엔드: https://your-backend.dokploy.com
- 프론트엔드: https://your-frontend.vercel.app
- API 문서: https://your-backend.dokploy.com/docs
