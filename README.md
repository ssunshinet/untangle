# 풀어내기 🧶

마음에 걸린 감정을 친구한테 털어놓듯 풀어내고, 나만의 회복법을 발견하는 앱.

## 🚀 Vercel 배포하기

### 1. 사전 준비

**Anthropic API 키 발급:**
1. https://console.anthropic.com 가입
2. 결제 정보 등록 (최소 $5 충전 필요)
3. API Keys 메뉴에서 키 발급 (sk-ant-... 로 시작)
4. ⚠️ 이 키는 절대 코드에 직접 박지 말 것. 곧 환경변수로 등록할 거예요.

### 2. GitHub에 코드 올리기

```bash
# 이 폴더에서
git init
git add .
git commit -m "init untangle app"

# GitHub에서 새 repository 만든 후
git remote add origin https://github.com/[당신아이디]/untangle.git
git branch -M main
git push -u origin main
```

또는 GitHub 웹에서 직접 파일 업로드해도 OK.

### 3. Vercel에 배포

1. https://vercel.com 로그인 (GitHub 계정으로)
2. `Add New...` → `Project` 클릭
3. 방금 만든 GitHub repository 선택 → `Import`
4. **Environment Variables** 섹션에서:
   - Name: `ANTHROPIC_API_KEY`
   - Value: 발급받은 키 붙여넣기
   - `Add` 클릭
5. `Deploy` 클릭

1-2분 기다리면 URL 생성됨. 예: `https://untangle-xyz.vercel.app`

### 4. 배포 후 확인

브라우저로 URL 열어서:
- 홈 화면 뜨는지
- "글로 풀어내기" 눌러서 AI 응답 오는지
- 음성 모드 (크롬/사파리에서) 동작하는지

## 📁 파일 구조

```
.
├── index.html          ← 프론트엔드 (HTML/CSS/JS 한 파일)
├── api/
│   ├── chat.js         ← Claude API 호출 (대화)
│   └── summarize.js    ← Claude API 호출 (요약)
├── package.json
└── README.md
```

## 💰 비용 안내

Claude Sonnet 4.5 가격 (2026년 기준):
- 입력: $3 / 1M 토큰
- 출력: $15 / 1M 토큰

한 번 대화 (10턴 정도) → 약 $0.05~0.10
하루 50명이 한 번씩 사용 → 월 약 $75~150

**무한정 친구들한테 공유하기 전에** Anthropic Console에서 월 사용량 한도(Usage limit)를 꼭 설정하세요.

## ⚠️ 알아둘 것

- 데이터는 사용자 브라우저의 localStorage에만 저장됩니다 (서버 저장 X)
- API 키는 Vercel 환경변수에 안전하게 보관됩니다
- 누구나 접속 가능한 공개 URL이지만, 인증은 없습니다
- 정신건강 위기 상황은 자살예방상담전화 1393으로 안내됩니다

## 🛠 로컬에서 테스트하려면

```bash
npm install -g vercel
vercel dev
```

API 키는 `.env.local` 파일에 `ANTHROPIC_API_KEY=sk-ant-...` 로 저장.
