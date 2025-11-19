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

### GitHub Actions에서 환경 변수 설정 (필수)

GitHub Pages에 자동 배포하려면 GitHub Secrets에 환경 변수를 추가해야 합니다:

1. GitHub 저장소로 이동
2. Settings > Secrets and variables > Actions 클릭
3. "New repository secret" 버튼 클릭
4. 다음 환경 변수들을 하나씩 추가:
   - `VITE_SUPABASE_URL` - Supabase 프로젝트 URL
   - `VITE_SUPABASE_ANON_KEY` - Supabase anon key
   - `OPENAI_API_KEY` - OpenAI API 키 (Guest 페이지 AI 기능용)

### 로컬에서 실행할 때

프로젝트를 다른 곳에서 실행할 때는 `.env.example` 파일을 참고하여 새로운 `.env` 파일을 만들고 다음 환경 변수를 설정해야 합니다:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## GitHub Pages에 배포하기

GitHub Pages를 사용하는 경우:

1. 프로젝트를 빌드합니다:
   ```bash
   npm run build
   ```

2. 빌드 결과물은 `dist/public` 디렉토리에 생성됩니다

3. GitHub Pages 설정에서:
   - Settings > Pages로 이동
   - Source를 "GitHub Actions"로 선택하거나
   - 수동으로 `dist/public` 폴더의 내용을 `gh-pages` 브랜치의 루트에 푸시

**중요**: `dist/public` 폴더의 **내용**을 배포 루트로 설정해야 합니다. `dist` 폴더가 아니라 `dist/public` 입니다!

## Vercel, Netlify 등에 배포하기

프로젝트를 배포 플랫폼에 올릴 때:

1. GitHub 저장소를 연결합니다
2. 환경 변수를 플랫폼의 설정에서 추가합니다:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
3. 빌드 명령어: `npm run build`
4. 출력 디렉토리: `dist/public` (중요: `dist`가 아닙니다!)
5. 환경 변수에 `NODE_ENV=production` 추가

### 커스텀 도메인 사용 시 빈 화면(White Screen) 문제

커스텀 도메인을 사용할 때 빈 화면이 나온다면:

**원인**: GitHub Actions 워크플로우가 경로를 `/ICNFBC-app/assets/...`로 변경하고 있지만, 커스텀 도메인에서는 `/assets/...`로 접근해야 합니다.

**해결 방법**:
1. `.github/workflows/deploy.yml` 파일에서 "Fix asset paths for GitHub Pages" 단계를 제거했습니다
2. 이제 커스텀 도메인과 GitHub Pages 모두에서 정상 작동합니다
3. 변경사항을 GitHub에 푸시하면 자동으로 다시 배포됩니다

### 이미지가 로드되지 않는 문제

만약 GitHub Pages에서 이미지가 로드되지 않는다면:

1. 출력 디렉토리가 올바른지 확인:
   - `dist/public`의 **내용**이 배포되어야 합니다
   - `dist` 폴더 자체가 아닙니다!

2. 빌드 후 확인:
   ```bash
   npm run build
   ls dist/public/
   # guest1.jpg, guest2.jpg, guest3.jpg, guest4.jpg가 있어야 합니다
   ```

3. GitHub Pages가 올바른 폴더를 서빙하는지 확인:
   - `https://your-username.github.io/your-repo/guest1.jpg`에 직접 접속해서 이미지가 보이는지 확인

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
