# 🚀 배포 가이드 - v1.0.0

미니게임 컬렉션을 GitHub Pages와 Render를 사용하여 배포하는 방법을 안내합니다.

## 📋 배포 개요

- **프론트엔드**: GitHub Pages (정적 파일 호스팅)
- **백엔드**: Render (Node.js + Express 서버)
- **데이터베이스**: MongoDB Atlas (클라우드 데이터베이스)

## 🎯 1단계: GitHub 저장소 설정

### 1.1 GitHub 저장소 생성
1. GitHub에 로그인
2. "New repository" 클릭
3. 저장소 이름: `minigames-collection`
4. 설명: "재미있는 미니게임 컬렉션 - MongoDB 연동 랭킹 시스템"
5. Public 선택
6. "Create repository" 클릭

### 1.2 로컬 저장소 설정
```bash
# 프로젝트 폴더에서
git init
git add .
git commit -m "Initial commit: v1.0.0 미니게임 컬렉션"
git branch -M main
git remote add origin https://github.com/[username]/minigames-collection.git
git push -u origin main
```

## 🌐 2단계: GitHub Pages 배포

### 2.1 GitHub Pages 활성화
1. 저장소 페이지에서 "Settings" 탭 클릭
2. 왼쪽 메뉴에서 "Pages" 클릭
3. Source를 "Deploy from a branch" 선택
4. Branch를 "main" 선택
5. "Save" 클릭

### 2.2 프론트엔드 파일 정리
GitHub Pages는 루트 폴더의 파일들을 서빙하므로, 프론트엔드 파일들을 루트로 이동:

```bash
# 프론트엔드 파일들을 루트로 이동
mv index.html ./
mv styles.css ./
mv script.js ./
mv games/ ./
mv README.md ./
mv .gitignore ./

# 백엔드 파일들은 별도 폴더로 이동
mkdir backend
mv server.js backend/
mv package.json backend/
mv DEPLOYMENT.md backend/
```

### 2.3 변경사항 커밋 및 푸시
```bash
git add .
git commit -m "Setup for GitHub Pages deployment"
git push
```

### 2.4 배포 확인
- `https://[username].github.io/minigames-collection` 접속
- 프론트엔드가 정상적으로 로드되는지 확인

## ⚙️ 3단계: Render 백엔드 배포

### 3.1 Render 계정 생성
1. [render.com](https://render.com) 접속
2. GitHub 계정으로 로그인
3. "New +" → "Web Service" 선택

### 3.2 서비스 설정
1. **Connect Repository**: GitHub 저장소 연결
2. **Name**: `minigames-backend`
3. **Environment**: `Node`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Plan**: Free 선택

### 3.3 환경 변수 설정
Environment Variables 섹션에서:
```
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/games
NODE_ENV=production
```

### 3.4 배포 시작
"Create Web Service" 클릭하여 배포 시작

### 3.5 배포 완료 확인
- 배포 상태가 "Live"가 될 때까지 대기
- 제공된 URL 확인 (예: `https://minigames-backend.onrender.com`)

## 🔧 4단계: 프론트엔드 API URL 업데이트

### 4.1 API URL 수정
`script.js`에서 Render URL로 업데이트:

```javascript
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://minigames-backend.onrender.com') + '/api';
```

### 4.2 변경사항 커밋 및 푸시
```bash
git add .
git commit -m "Update API URL for production deployment"
git push
```

## 🗄️ 5단계: MongoDB Atlas 설정

### 5.1 MongoDB Atlas 계정 생성
1. [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) 접속
2. 무료 계정 생성
3. 클러스터 생성 (M0 Free Tier)

### 5.2 데이터베이스 설정
1. **Database Access**: 사용자 생성
2. **Network Access**: IP 주소 추가 (0.0.0.0/0으로 모든 IP 허용)
3. **Clusters**: 데이터베이스 생성

### 5.3 연결 문자열 생성
1. "Connect" 클릭
2. "Connect your application" 선택
3. 연결 문자열 복사
4. Render 환경 변수에 설정

## 🧪 6단계: 배포 테스트

### 6.1 프론트엔드 테스트
- GitHub Pages URL 접속
- 모든 게임이 정상적으로 로드되는지 확인
- 다크/라이트 모드 전환 테스트

### 6.2 백엔드 테스트
- 게임 플레이 후 데이터 저장 확인
- 랭킹 시스템 작동 확인
- 통계 데이터 로드 확인

### 6.3 통합 테스트
- 게임 완료 후 MongoDB에 데이터 저장 확인
- 랭킹 탭에서 데이터 로드 확인
- 플레이어 이름 설정 및 저장 확인

## 📱 7단계: 모바일 최적화 확인

### 7.1 반응형 디자인 테스트
- 다양한 화면 크기에서 테스트
- 모바일 브라우저에서 터치 동작 확인
- 햄버거 메뉴 작동 확인

### 7.2 성능 테스트
- 페이지 로딩 속도 확인
- 게임 실행 성능 확인
- API 응답 속도 확인

## 🔍 8단계: 모니터링 및 유지보수

### 8.1 로그 모니터링
- Render 대시보드에서 로그 확인
- 에러 발생 시 즉시 대응

### 8.2 성능 모니터링
- MongoDB Atlas 대시보드에서 쿼리 성능 확인
- API 응답 시간 모니터링

### 8.3 사용자 피드백 수집
- GitHub Issues를 통한 버그 리포트
- 기능 요청 및 개선 제안 수집

## 🚨 문제 해결

### 프론트엔드 문제
- **페이지 로드 안됨**: GitHub Pages 설정 확인
- **API 연결 실패**: CORS 설정 및 URL 확인
- **스타일 깨짐**: CSS 파일 경로 확인

### 백엔드 문제
- **서버 시작 실패**: 환경 변수 및 의존성 확인
- **MongoDB 연결 실패**: 연결 문자열 및 네트워크 설정 확인
- **API 응답 없음**: 포트 및 라우팅 설정 확인

### 데이터베이스 문제
- **데이터 저장 실패**: 권한 및 스키마 확인
- **쿼리 성능 저하**: 인덱스 설정 확인

## 📚 추가 리소스

- [GitHub Pages 문서](https://pages.github.com/)
- [Render 문서](https://render.com/docs)
- [MongoDB Atlas 문서](https://docs.atlas.mongodb.com/)
- [Express.js 문서](https://expressjs.com/)

## 🎉 배포 완료!

모든 단계가 완료되면 다음과 같은 URL로 접근할 수 있습니다:

- **프론트엔드**: `https://[username].github.io/minigames-collection`
- **백엔드 API**: `https://minigames-backend.onrender.com`

축하합니다! 🎮✨ 미니게임 컬렉션 v1.0.0이 성공적으로 배포되었습니다!
