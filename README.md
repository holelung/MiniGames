# 🎮 미니게임 컬렉션 v1.0.0

재미있는 미니게임들을 모아놓은 웹 게임 컬렉션입니다. MongoDB를 연동하여 랭킹과 통계를 제공합니다.

## ✨ 주요 기능

- 🎯 **6가지 미니게임**: 숫자 맞추기, 메모리 카드, 슬라이딩 퍼즐, 타자 게임, 색상 맞추기, 반응 속도 테스트
- 🏆 **랭킹 시스템**: MongoDB 기반 실시간 랭킹
- 📊 **통계 대시보드**: 게임별 상세 통계 및 전체 통계
- 👤 **플레이어 관리**: 개인별 기록 및 이름 설정
- 🌓 **다크/라이트 모드**: 테마 전환 지원
- 📱 **반응형 디자인**: 모든 디바이스에서 최적화

## 🎮 게임 목록

### 1. 숫자 맞추기
- 1~100 사이의 숫자를 추측하는 게임
- 시도 횟수가 적을수록 높은 점수

### 2. 메모리 카드
- 같은 카드 쌍을 찾는 기억력 게임
- 이동 횟수가 적을수록 높은 점수

### 3. 슬라이딩 퍼즐
- 숫자들을 올바른 순서로 배열하는 퍼즐
- 이동 횟수가 적을수록 높은 점수

### 4. 타자 게임
- 10단어를 빠르게 타이핑하는 게임
- 완료 시간이 짧을수록 높은 점수

### 5. 색상 맞추기
- 텍스트 색상과 같은 색상 버튼을 선택하는 게임
- 정답률 10% + 속도 90%로 100점 만점

### 6. 반응 속도 테스트
- 색상 변화를 빠르게 감지하는 게임
- 평균 반응 속도가 빠를수록 높은 점수

## 🚀 배포 정보

### 프론트엔드
- **GitHub Pages**: https://[username].github.io/[repository-name]
- **기술**: HTML5, CSS3, JavaScript (ES6+)

### 백엔드
- **Render**: Node.js + Express 서버
- **데이터베이스**: MongoDB Atlas
- **API**: RESTful API

## 🛠️ 로컬 개발 환경 설정

### 필수 요구사항
- Node.js 18.0.0 이상
- MongoDB Atlas 계정

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/[username]/minigames-collection.git
cd minigames-collection
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
`.env` 파일 생성:
```env
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/games
PORT=3000
```

4. **개발 서버 실행**
```bash
npm run dev
```

5. **브라우저에서 접속**
```
http://localhost:3000
```

## 📁 프로젝트 구조

```
minigames/
├── index.html          # 메인 HTML 파일
├── styles.css          # 메인 CSS 스타일
├── script.js           # 메인 JavaScript 로직
├── server.js           # Express 서버
├── package.json        # 프로젝트 설정
├── .env                # 환경 변수 (로컬 개발용)
├── games/              # 게임별 모듈
│   ├── numberGuess.js  # 숫자 맞추기 게임
│   ├── memoryCard.js   # 메모리 카드 게임
│   ├── puzzle.js       # 슬라이딩 퍼즐 게임
│   ├── typing.js       # 타자 게임
│   ├── colorMatch.js   # 색상 맞추기 게임
│   └── reaction.js     # 반응 속도 테스트 게임
└── README.md           # 프로젝트 문서
```

## 🔧 API 엔드포인트

### 게임 통계
- `POST /api/game-stats` - 게임 결과 저장
- `GET /api/leaderboard/:gameType` - 게임별 랭킹 조회
- `GET /api/best-score/:gameType` - 게임별 최고 기록 조회
- `GET /api/best-scores` - 전체 게임 최고 기록 조회
- `GET /api/player-stats/:playerId` - 플레이어별 통계 조회
- `GET /api/overall-stats` - 전체 통계 조회

## 🎯 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, CSS 변수, 애니메이션
- **JavaScript**: ES6+, 모듈 패턴, 비동기 처리

### 백엔드
- **Node.js**: 서버 런타임
- **Express.js**: 웹 프레임워크
- **MongoDB**: NoSQL 데이터베이스
- **MongoDB Driver**: 데이터베이스 연결

### 개발 도구
- **Font Awesome**: 아이콘 라이브러리
- **Google Fonts**: 웹 폰트
- **Nodemon**: 개발 서버 자동 재시작

## 📱 반응형 디자인

- **모바일**: 320px 이상
- **태블릿**: 768px 이상
- **데스크톱**: 1024px 이상

## 🌟 주요 특징

- **모듈화된 구조**: 각 게임을 독립적인 모듈로 분리
- **실시간 통계**: MongoDB 연동으로 실시간 데이터 업데이트
- **사용자 경험**: 직관적인 UI/UX와 부드러운 애니메이션
- **크로스 브라우저**: 모든 최신 브라우저 지원
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**즐거운 게임 되세요! 🎮✨**
