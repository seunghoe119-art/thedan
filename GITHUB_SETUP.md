# GitHub에 프로젝트 푸시하기

이 가이드는 프로젝트를 GitHub에 푸시하는 방법을 설명합니다.

## 사전 준비

1. GitHub 계정이 있어야 합니다
2. Git이 설치되어 있어야 합니다

## 단계별 가이드

### 1. GitHub에서 새 저장소 만들기

1. GitHub에 로그인합니다
2. 오른쪽 상단의 `+` 버튼을 클릭하고 "New repository"를 선택합니다
3. 저장소 이름을 입력합니다 (예: `my-project`)
4. Public 또는 Private을 선택합니다
5. **"Initialize this repository with a README"는 체크하지 마세요** (이미 프로젝트가 있으므로)
6. "Create repository" 버튼을 클릭합니다

### 2. 로컬 Git 저장소 초기화 (처음 푸시하는 경우)

Replit 콘솔에서 다음 명령어를 실행합니다:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 3. GitHub 저장소 연결

GitHub에서 만든 저장소의 URL을 복사한 후 (예: `https://github.com/username/my-project.git`):

```bash
git remote add origin https://github.com/username/my-project.git
git branch -M main
git push -u origin main
```

### 4. 이후 업데이트 푸시하기

코드를 수정한 후 GitHub에 푸시하려면:

```bash
git add .
git commit -m "설명 메시지 작성"
git push
```

## 환경 변수 설정

**중요**: 환경 변수는 GitHub에 푸시되지 않습니다 (`.gitignore`에 `.env` 파일이 포함되어 있습니다).

프로젝트를 다른 곳에서 실행할 때는 `.env.example` 파일을 참고하여 새로운 `.env` 파일을 만들고 다음 환경 변수를 설정해야 합니다:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Vercel, Netlify 등에 배포하기

프로젝트를 배포 플랫폼에 올릴 때:

1. GitHub 저장소를 연결합니다
2. 환경 변수를 플랫폼의 설정에서 추가합니다:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. 빌드 명령어: `npm run build`
4. 출력 디렉토리: `dist`

## 문제 해결

### Git 사용자 정보 설정

처음 Git을 사용하는 경우:

```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### 인증 문제

GitHub에 푸시할 때 비밀번호 대신 Personal Access Token을 사용해야 합니다:

1. GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. "Generate new token" 클릭
3. repo 권한 체크
4. 토큰 생성 후 복사
5. 푸시할 때 비밀번호 대신 토큰 사용
