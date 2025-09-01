# MongoDB 미니게임 컬렉션 설치 및 실행 가이드

## 🚀 **1단계: MongoDB Atlas 설정**

### 1.1 MongoDB Atlas 계정 생성
1. https://www.mongodb.com/atlas 접속
2. 무료 계정으로 가입
3. 이메일 인증 완료

### 1.2 클러스터 생성
1. "Build a Database" 클릭
2. "FREE" 플랜 선택 (M0)
3. 클라우드 제공자 및 지역 선택 (가까운 지역 선택)
4. "Create" 클릭

### 1.3 데이터베이스 사용자 생성
1. Security > Database Access 메뉴로 이동
2. "Add New Database User" 클릭
3. 사용자명과 비밀번호 설정 (기억해두세요!)
4. "Add User" 클릭

### 1.4 네트워크 액세스 설정
1. Security > Network Access 메뉴로 이동
2. "Add IP Address" 클릭
3. "Allow Access from Anywhere" 선택 (0.0.0.0/0)
4. "Confirm" 클릭

### 1.5 연결 문자열 가져오기
1. "Connect" 버튼 클릭
2. "Connect your application" 선택
3. 연결 문자열 복사
4. `<password>` 부분을 실제 비밀번호로 변경

## 🛠 **2단계: 프로젝트 설정**

### 2.1 의존성 설치
```bash
cd minigames
npm install
```

### 2.2 환경 변수 설정
1. `.env` 파일 생성 (이미 생성됨)
2. MongoDB 연결 문자열 입력:
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/games?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🎮 **3단계: 서버 실행**

### 3.1 개발 모드로 실행
```bash
npm run dev
```

### 3.2 프로덕션 모드로 실행
```bash
npm start
```

## 📊 **4단계: API 테스트**

### 4.1 게임 통계 저장 테스트
```bash
curl -X POST http://localhost:3000/api/game-stats \
  -H "Content-Type: application/json" \
  -d '{
    "gameType": "number-guess",
    "playerId": "test_player",
    "score": 5,
    "time": 30
  }'
```

### 4.2 리더보드 조회 테스트
```bash
curl http://localhost:3000/api/leaderboard/number-guess
```

### 4.3 플레이어 통계 조회 테스트
```bash
curl http://localhost:3000/api/player-stats/test_player
```

## 🔧 **5단계: 문제 해결**

### 5.1 MongoDB 연결 실패
- 연결 문자열 확인
- 네트워크 액세스 설정 확인
- 사용자명/비밀번호 확인

### 5.2 CORS 오류
- 브라우저 개발자 도구에서 확인
- 서버의 CORS 설정 확인

### 5.3 포트 충돌
- 다른 포트 사용: `PORT=3001 npm start`

## 📈 **6단계: 추가 기능**

### 6.1 실시간 업데이트
- Socket.IO 추가
- 실시간 리더보드 업데이트

### 6.2 사용자 인증
- JWT 토큰 기반 인증
- 사용자 프로필 시스템

### 6.3 게임 모드 확장
- 난이도별 기록
- 시간 제한 모드

## 🎯 **성공 확인**

서버가 정상적으로 실행되면 다음 메시지가 표시됩니다:
```
✅ MongoDB에 성공적으로 연결되었습니다!
📊 사용 가능한 컬렉션: []
🚀 서버가 포트 3000에서 실행 중입니다!
📱 http://localhost:3000 에서 접속하세요
```

브라우저에서 http://localhost:3000 접속 후 게임을 플레이하면 MongoDB에 데이터가 저장됩니다!
