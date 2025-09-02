// Tetris game module
window.Games = window.Games || {};
window.Games.loadTetrisGame = function (deps) {
    const { gameContainer, updateGameStats } = deps;

    // 게임 설정
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 18;
    const DIFFICULTY_LEVELS = {
        BEGINNER: { minScore: 0, speed: 1.0, multiplier: 1.0, name: "초급" },
        INTERMEDIATE: {
            minScore: 1000,
            speed: 0.7,
            multiplier: 1.5,
            name: "중급",
        },
        ADVANCED: { minScore: 3000, speed: 0.4, multiplier: 2.0, name: "고급" },
        EXPERT: { minScore: 6000, speed: 0.2, multiplier: 3.0, name: "전문가" },
        MASTER: {
            minScore: 10000,
            speed: 0.1,
            multiplier: 5.0,
            name: "마스터",
        },
    };

    // 테트로미노 블록 정의
    const TETROMINOES = {
        I: {
            shape: [[1, 1, 1, 1]],
            color: "#00f5ff",
        },
        O: {
            shape: [
                [1, 1],
                [1, 1],
            ],
            color: "#ffff00",
        },
        T: {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
            ],
            color: "#a000f0",
        },
        S: {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
            ],
            color: "#00f000",
        },
        Z: {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
            ],
            color: "#f00000",
        },
        J: {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
            ],
            color: "#0000f0",
        },
        L: {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
            ],
            color: "#ff7f00",
        },
    };

    // 게임 상태
    let board = [];
    let currentPiece = null;
    let nextPiece = null;
    let score = 0;
    let level = 1;
    let lines = 0;
    let combo = 0;
    let gameInterval = null;
    let gameState = "READY"; // READY, PLAYING, PAUSED, GAME_OVER
    let currentDifficulty = DIFFICULTY_LEVELS.BEGINNER;

    // 시간 측정 관련 변수들
    let gameStartTime = null;
    let totalPlayTime = 0; // 누적 플레이 시간 (밀리초)
    let playTimeInterval = null; // 플레이 시간 측정용 타이머

    // 게임 보드 초기화
    function initBoard() {
        board = Array(BOARD_HEIGHT)
            .fill()
            .map(() => Array(BOARD_WIDTH).fill(0));
    }

    // 플레이 시간 측정 시작
    function startPlayTimeTracking() {
        if (!gameStartTime) {
            gameStartTime = Date.now();
        }

        // 1초마다 플레이 시간 업데이트
        playTimeInterval = setInterval(() => {
            const currentTime = Date.now();
            totalPlayTime = currentTime - gameStartTime;
            updatePlayTimeDisplay();
        }, 1000);
    }

    // 플레이 시간 측정 정지
    function stopPlayTimeTracking() {
        if (playTimeInterval) {
            clearInterval(playTimeInterval);
            playTimeInterval = null;
        }
    }

    // 플레이 시간 측정 일시정지
    function pausePlayTimeTracking() {
        if (playTimeInterval) {
            clearInterval(playTimeInterval);
            playTimeInterval = null;
        }
    }

    // 플레이 시간 표시 업데이트
    function updatePlayTimeDisplay() {
        const playTimeElement = document.getElementById("play-time");
        if (playTimeElement) {
            const seconds = Math.floor(totalPlayTime / 1000);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            playTimeElement.textContent = `${minutes}:${remainingSeconds
                .toString()
                .padStart(2, "0")}`;
        }
    }

    // 총 플레이 시간 계산 (초 단위)
    function getTotalPlayTimeInSeconds() {
        return Math.floor(totalPlayTime / 1000);
    }

    // 현재 난이도 가져오기
    function getCurrentDifficulty(score) {
        if (score >= 10000) return DIFFICULTY_LEVELS.MASTER;
        if (score >= 6000) return DIFFICULTY_LEVELS.EXPERT;
        if (score >= 3000) return DIFFICULTY_LEVELS.ADVANCED;
        if (score >= 1000) return DIFFICULTY_LEVELS.INTERMEDIATE;
        return DIFFICULTY_LEVELS.BEGINNER;
    }

    // 난이도 상승 확인
    function checkDifficultyUpgrade() {
        const newDifficulty = getCurrentDifficulty(score);
        if (currentDifficulty !== newDifficulty) {
            currentDifficulty = newDifficulty;
            showDifficultyUpgradeEffect();
            updateGameSpeed();
            return true;
        }
        return false;
    }

    // 난이도 상승 효과 표시
    function showDifficultyUpgradeEffect() {
        const difficultyDisplay = document.getElementById("difficulty-display");
        if (difficultyDisplay) {
            difficultyDisplay.textContent = currentDifficulty.name;
            difficultyDisplay.style.color = "#ff6b6b";
            difficultyDisplay.style.transform = "scale(1.2)";
            setTimeout(() => {
                difficultyDisplay.style.color = "";
                difficultyDisplay.style.transform = "";
            }, 1000);
        }
    }

    // 게임 속도 업데이트
    function updateGameSpeed() {
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        if (gameState === "PLAYING") {
            gameInterval = setInterval(() => {
                movePieceDown();
            }, currentDifficulty.speed * 1000);
        }
    }

    // 랜덤 블록 생성
    function createRandomPiece() {
        const pieces = Object.keys(TETROMINOES);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            type: randomPiece,
            shape: TETROMINOES[randomPiece].shape,
            color: TETROMINOES[randomPiece].color,
            x:
                Math.floor(BOARD_WIDTH / 2) -
                Math.floor(TETROMINOES[randomPiece].shape[0].length / 2),
            y: 0,
        };
    }

    // 블록 회전
    function rotatePiece(piece) {
        const rotated = [];
        const rows = piece.shape.length;
        const cols = piece.shape[0].length;

        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = piece.shape[rows - 1 - j][i];
            }
        }
        return rotated;
    }

    // 충돌 검사
    function isValidMove(piece, dx = 0, dy = 0, rotatedShape = null) {
        const shape = rotatedShape || piece.shape;
        const newX = piece.x + dx;
        const newY = piece.y + dy;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;

                    if (
                        boardX < 0 ||
                        boardX >= BOARD_WIDTH ||
                        boardY >= BOARD_HEIGHT ||
                        (boardY >= 0 && board[boardY][boardX])
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // 블록 이동
    function movePiece(dx, dy) {
        if (currentPiece && isValidMove(currentPiece, dx, dy)) {
            currentPiece.x += dx;
            currentPiece.y += dy;
            renderBoard();
            return true;
        }
        return false;
    }

    // 블록 회전
    function rotateCurrentPiece() {
        if (currentPiece) {
            const rotatedShape = rotatePiece(currentPiece);
            if (isValidMove(currentPiece, 0, 0, rotatedShape)) {
                currentPiece.shape = rotatedShape;
                renderBoard();
            }
        }
    }

    // 블록 하강
    function movePieceDown() {
        if (!movePiece(0, 1)) {
            placePiece();
            clearLines();
            spawnNewPiece();
        }
    }

    // 블록 배치
    function placePiece() {
        if (currentPiece) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const boardY = currentPiece.y + y;
                        const boardX = currentPiece.x + x;
                        if (boardY >= 0) {
                            board[boardY][boardX] = currentPiece.type;
                        }
                    }
                }
            }
        }
    }

    // 줄 제거
    function clearLines() {
        let linesCleared = 0;

        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (board[y].every((cell) => cell !== 0)) {
                board.splice(y, 1);
                board.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // 같은 줄을 다시 검사
            }
        }

        if (linesCleared > 0) {
            // 점수 계산
            const lineScores = [0, 100, 300, 500, 800];
            const baseScore = lineScores[linesCleared];
            const comboBonus = combo * 50;
            const levelBonus = level * 20;

            score +=
                (baseScore + comboBonus + levelBonus) *
                currentDifficulty.multiplier;
            lines += linesCleared;
            combo++;
            level = Math.floor(lines / 10) + 1;

            updateScore();
            checkDifficultyUpgrade();
        } else {
            combo = 0;
        }
    }

    // 새 블록 생성
    function spawnNewPiece() {
        currentPiece = nextPiece || createRandomPiece();
        nextPiece = createRandomPiece();

        if (!isValidMove(currentPiece, 0, 0)) {
            gameOver();
        }

        renderBoard();
        renderNextPiece();
    }

    // 점수 업데이트
    function updateScore() {
        const scoreElement = document.getElementById("score");
        const levelElement = document.getElementById("level");
        const linesElement = document.getElementById("lines");
        const difficultyElement = document.getElementById("difficulty-display");
        const nextTargetElement = document.getElementById("next-target");

        if (scoreElement) scoreElement.textContent = Math.floor(score);
        if (levelElement) levelElement.textContent = level;
        if (linesElement) linesElement.textContent = lines;
        if (difficultyElement)
            difficultyElement.textContent = currentDifficulty.name;

        // 다음 목표 표시
        const nextDifficulty = Object.values(DIFFICULTY_LEVELS).find(
            (d) => d.minScore > score
        );
        if (nextTargetElement && nextDifficulty) {
            const remaining = nextDifficulty.minScore - score;
            nextTargetElement.textContent = `${nextDifficulty.name}까지 ${remaining}점`;
        }
    }

    // 게임 보드 렌더링
    function renderBoard() {
        const boardElement = document.getElementById("tetris-board");
        if (!boardElement) return;

        boardElement.innerHTML = "";

        // 보드 그리기
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const cell = document.createElement("div");
                cell.className = "tetris-cell";

                if (board[y][x]) {
                    cell.style.backgroundColor = TETROMINOES[board[y][x]].color;
                }

                boardElement.appendChild(cell);
            }
        }

        // 현재 블록 그리기
        if (currentPiece) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const boardY = currentPiece.y + y;
                        const boardX = currentPiece.x + x;

                        if (
                            boardY >= 0 &&
                            boardY < BOARD_HEIGHT &&
                            boardX >= 0 &&
                            boardX < BOARD_WIDTH
                        ) {
                            const index = boardY * BOARD_WIDTH + boardX;
                            const cell = boardElement.children[index];
                            if (cell) {
                                cell.style.backgroundColor = currentPiece.color;
                            }
                        }
                    }
                }
            }
        }
    }

    // 다음 블록 렌더링 (항상 4x4 그리드 중앙 정렬)
    function renderNextPiece() {
        const nextElement = document.getElementById("next-piece");
        if (!nextElement || !nextPiece) return;

        nextElement.innerHTML = "";

        const previewSize = 4;
        const shapeHeight = nextPiece.shape.length;
        const shapeWidth = nextPiece.shape[0].length;
        const offsetX = Math.floor((previewSize - shapeWidth) / 2);
        const offsetY = Math.floor((previewSize - shapeHeight) / 2);

        for (let y = 0; y < previewSize; y++) {
            for (let x = 0; x < previewSize; x++) {
                const cell = document.createElement("div");
                cell.className = "next-cell";

                const shapeY = y - offsetY;
                const shapeX = x - offsetX;
                if (
                    shapeY >= 0 &&
                    shapeY < shapeHeight &&
                    shapeX >= 0 &&
                    shapeX < shapeWidth &&
                    nextPiece.shape[shapeY][shapeX]
                ) {
                    cell.style.backgroundColor = nextPiece.color;
                }

                nextElement.appendChild(cell);
            }
        }
    }

    // 게임 시작
    function startGame() {
        if (gameState === "READY" || gameState === "GAME_OVER") {
            initBoard();
            score = 0;
            level = 1;
            lines = 0;
            combo = 0;
            currentDifficulty = DIFFICULTY_LEVELS.BEGINNER;
            gameState = "PLAYING";

            // 시간 측정 초기화 및 시작
            gameStartTime = Date.now();
            totalPlayTime = 0;
            startPlayTimeTracking();

            spawnNewPiece();
            updateGameSpeed();
            updateScore();

            const startBtn = document.getElementById("start-btn");
            if (startBtn) startBtn.textContent = "일시정지";
        } else if (gameState === "PLAYING") {
            pauseGame();
        } else if (gameState === "PAUSED") {
            resumeGame();
        }
    }

    // 게임 일시정지
    function pauseGame() {
        if (gameState === "PLAYING") {
            gameState = "PAUSED";
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            // 플레이 시간 측정도 일시정지
            pausePlayTimeTracking();
            const startBtn = document.getElementById("start-btn");
            if (startBtn) startBtn.textContent = "재개";
        }
    }

    // 게임 재개
    function resumeGame() {
        if (gameState === "PAUSED") {
            gameState = "PLAYING";
            updateGameSpeed();
            // 플레이 시간 측정 재개
            startPlayTimeTracking();
            const startBtn = document.getElementById("start-btn");
            if (startBtn) startBtn.textContent = "일시정지";
        }
    }

    // 게임 오버
    function gameOver() {
        gameState = "GAME_OVER";
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }

        // 플레이 시간 측정 정지
        stopPlayTimeTracking();

        const finalScore = Math.floor(score);
        const playTime = getTotalPlayTimeInSeconds();

        setTimeout(() => {
            alert(
                `게임 오버!\n최종 점수: ${finalScore}점\n달성 난이도: ${
                    currentDifficulty.name
                }\n완성한 줄: ${lines}줄\n플레이 시간: ${Math.floor(
                    playTime / 60
                )}분 ${playTime % 60}초`
            );
            updateGameStats("tetris", finalScore, playTime);
        }, 500);
    }

    // 새 게임
    function newGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }

        // 시간 측정 초기화
        stopPlayTimeTracking();
        gameStartTime = null;
        totalPlayTime = 0;

        gameState = "READY";
        const startBtn = document.getElementById("start-btn");
        if (startBtn) startBtn.textContent = "시작";
        initBoard();
        renderBoard();
        updateScore();
        updatePlayTimeDisplay(); // 시간 표시 초기화
    }

    // 즉시 하강
    function instantDrop() {
        if (currentPiece) {
            while (movePiece(0, 1)) {}
            placePiece();
            clearLines();
            spawnNewPiece();
        }
    }

    // 키보드 이벤트 처리
    function handleKeyPress(e) {
        if (gameState !== "PLAYING") return;

        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault();
                movePiece(-1, 0);
                break;
            case "ArrowRight":
                e.preventDefault();
                movePiece(1, 0);
                break;
            case "ArrowDown":
                e.preventDefault();
                movePieceDown();
                break;
            case "ArrowUp":
                e.preventDefault();
                rotateCurrentPiece();
                break;
            case " ":
                e.preventDefault();
                instantDrop();
                break;
            case "p":
            case "P":
                e.preventDefault();
                pauseGame();
                break;
        }
    }

    // UI 생성
    console.log("🎨 테트리스 UI 생성 시작");
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="tetris-layout">
                <div class="tetris-left-panel">
                    <div class="game-info">
                        <h3>게임 정보</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">점수:</span>
                                <span class="info-value" id="score">0</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">레벨:</span>
                                <span class="info-value" id="level">1</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">완성한 줄:</span>
                                <span class="info-value" id="lines">0</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">현재 난이도:</span>
                                <span class="info-value" id="difficulty-display">초급</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">플레이 시간:</span>
                                <span class="info-value" id="play-time">0:00</span>
                            </div>
                        </div>
                    </div>

                    <div class="next-target-container">
                        <h4>다음 목표</h4>
                        <p class="next-target-text"><span id="next-target">중급까지 1000점</span></p>
                    </div>
                    
                    
                </div>

                <div class="tetris-center-section">
                  <div id="tetris-board" class="tetris-board"></div>
                </div>
                
                <div class="tetris-right-panel">
                    
                    
                    

                    <div class="next-piece-container">
                        <h4>다음 블록</h4>
                        <div id="next-piece" class="next-piece"></div>
                    </div>
                    <div class="tetris-right-section">
                        <div class="game-info-panel">
                            <h4>조작법</h4>
                            <ul class="controls-list">
                                <li><span class="key">←→</span> 이동</li>
                                <li><span class="key">↓</span> 빠른 하강</li>
                                <li><span class="key">↑</span> 회전</li>
                                <li><span class="key">스페이스</span> 즉시 하강</li>
                                <li><span class="key">P</span> 일시정지</li>
                            </ul>
                        </div>
                        
                        <div class="game-controls">
                            <button class="btn btn-primary" id="start-btn">시작</button>
                            <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    console.log("✅ 테트리스 UI 생성 완료");

    // 이벤트 리스너 등록
    console.log("🔗 이벤트 리스너 등록 시작");
    const startBtn = document.getElementById("start-btn");
    const newGameBtn = document.getElementById("new-game-btn");

    console.log("🔍 버튼 찾기:", { startBtn, newGameBtn });

    if (startBtn) {
        startBtn.addEventListener("click", startGame);
        console.log("✅ 시작 버튼 이벤트 리스너 등록됨");
    } else {
        console.error("❌ 시작 버튼을 찾을 수 없습니다!");
    }

    if (newGameBtn) {
        newGameBtn.addEventListener("click", newGame);
        console.log("✅ 새 게임 버튼 이벤트 리스너 등록됨");
    } else {
        console.error("❌ 새 게임 버튼을 찾을 수 없습니다!");
    }

    document.addEventListener("keydown", handleKeyPress);
    console.log("✅ 키보드 이벤트 리스너 등록됨");

    // 초기 렌더링
    console.log("🎯 초기 렌더링 시작");
    initBoard();
    renderBoard();
    updateScore();
    updatePlayTimeDisplay(); // 플레이 시간 표시 초기화
    console.log("✅ 테트리스 게임 로드 완료");
};
