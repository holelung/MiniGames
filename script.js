// DOM 요소들
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('game-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const gameContainer = document.getElementById('game-container');
const playButtons = document.querySelectorAll('.play-btn');
const tabButtons = document.querySelectorAll('.tab-btn');

// 플레이어 이름 관련 요소들
const playerNameInput = document.getElementById('player-name-input');
const savePlayerNameBtn = document.getElementById('save-player-name');
const currentPlayerDisplay = document.getElementById('current-player-display');

// API 기본 URL - 환경에 따라 동적 설정
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://your-render-app-name.onrender.com') + '/api';

// 플레이어 ID 및 이름 관리
function getPlayerId() {
    let playerId = localStorage.getItem('playerId');
    if (!playerId) {
        playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('playerId', playerId);
    }
    return playerId;
}

function getPlayerName() {
    return localStorage.getItem('playerName') || '익명';
}

function setPlayerName(name) {
    if (name && name.trim()) {
        localStorage.setItem('playerName', name.trim());
        updatePlayerDisplay();
        return true;
    }
    return false;
}

function updatePlayerDisplay() {
    const playerName = getPlayerName();
    currentPlayerDisplay.textContent = playerName;
    
    // 입력 필드에도 현재 이름 표시
    if (playerNameInput) {
        playerNameInput.value = playerName === '익명' ? '' : playerName;
    }
}

// 게임 데이터 (로컬 캐시)
let gameData = {
    'number-guess': { best: 0, attempts: 0, games: 0 },
    'memory-card': { best: 0, moves: 0, games: 0 },
    'puzzle': { best: 0, moves: 0, games: 0 },
    'typing': { best: 0, time: 0, games: 0 },
    'color-match': { best: 0, time: 0, games: 0 },
    'reaction': { best: 0, time: 0, games: 0 }
};

// 랭킹 데이터
let leaderboardData = {
    'number-guess': [],
    'memory-card': [],
    'puzzle': [],
    'typing': [],
    'color-match': [],
    'reaction': []
};

// 테마 토글 기능
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = themeToggleBtn.querySelector('i');
    if (newTheme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// 저장된 테마 불러오기
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = themeToggleBtn.querySelector('i');
        if (savedTheme === 'dark') {
            icon.className = 'fas fa-sun';
        }
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        const icon = themeToggleBtn.querySelector('i');
        icon.className = 'fas fa-sun';
    }
}

// 모바일 메뉴 토글
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// 스무스 스크롤
function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}

// 모달 열기
function openModal(gameType) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const gameTitles = {
        'number-guess': '숫자 맞추기',
        'memory-card': '메모리 카드',
        'puzzle': '슬라이딩 퍼즐',
        'typing': '타자 게임',
        'color-match': '색상 맞추기',
        'reaction': '반응 속도 테스트'
    };
    
    const bestScore = gameData[gameType].best || 0;
    const bestPlayerName = gameData[gameType].bestPlayerName;
    const bestPlayerId = gameData[gameType].bestPlayerId;
    const bestScoreText = getBestScoreText(bestScore, bestPlayerName, bestPlayerId);
    
    modalTitle.innerHTML = `
        ${gameTitles[gameType]}
        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem; font-weight: normal;">
            🏆 최고 기록: ${bestScoreText}
        </div>
    `;
    loadGame(gameType);
}

// 최고 기록 텍스트 생성 (유저 이름 포함)
function getBestScoreText(bestScore, playerName = null, playerId = null, fullText = false) {
    if (!bestScore || bestScore === 0) return '아직 기록 없음';
    
    // 유저 이름이 있으면 유저명(유저ID) 형식으로 반환
    if (playerName && playerName !== '익명' && playerName !== null) {
        if (playerId && playerId !== null) {
            const completeText = `${playerName}(${playerId})`;
            // 전체 텍스트를 요청하거나 길이가 짧으면 그대로 반환
            if (fullText || completeText.length <= 20) {
                return completeText;
            } else {
                // ID가 너무 길면 축약
                const shortId = playerId.substring(0, 8) + '...';
                return `${playerName}(${shortId})`;
            }
        } else {
            return playerName;
        }
    }
    
    return '익명';
}

// 게임별 최고 기록 로드 (서버에서)
async function loadBestScores() {
    try {
        const response = await fetch(`${API_BASE_URL}/best-scores`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('🏆 전체 최고 기록 로드됨:', data.bestScores);
            
            // 로컬 게임 데이터 업데이트
            Object.keys(data.bestScores).forEach(gameType => {
                if (gameData[gameType]) {
                    const bestData = data.bestScores[gameType];
                    gameData[gameType].best = bestData.bestScore;
                    gameData[gameType].bestPlayerName = bestData.playerName;
                    gameData[gameType].bestPlayerId = bestData.playerId;
                }
            });
            
            // UI 업데이트
            updateGameStatsUI();
        } else {
            console.error('❌ 전체 최고 기록 로드 실패:', response.statusText);
        }
    } catch (error) {
        console.error('❌ 전체 최고 기록 네트워크 오류:', error);
    }
}

// 모달 닫기
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    gameContainer.innerHTML = '';
}

// 게임 로드
function loadGame(gameType) {
    switch(gameType) {
        case 'number-guess':
            if (window.Games && window.Games.loadNumberGuessGame) {
                window.Games.loadNumberGuessGame({ gameContainer, updateGameStats });
            } else {
                console.error('Number Guess module not loaded');
            }
            break;
        case 'memory-card':
            if (window.Games && window.Games.loadMemoryCardGame) {
                window.Games.loadMemoryCardGame({ gameContainer, updateGameStats });
            } else {
                console.error('Memory Card module not loaded');
            }
            break;
        case 'puzzle':
            if (window.Games && window.Games.loadPuzzleGame) {
                window.Games.loadPuzzleGame({ gameContainer, updateGameStats });
            } else {
                console.error('Puzzle module not loaded');
            }
            break;
        case 'typing':
            if (window.Games && window.Games.loadTypingGame) {
                window.Games.loadTypingGame({ gameContainer, updateGameStats });
            } else {
                console.error('Typing game module not loaded');
            }
            break;
        case 'color-match':
            if (window.Games && window.Games.loadColorMatchGame) {
                window.Games.loadColorMatchGame({ gameContainer, updateGameStats });
            } else {
                console.error('Color Match module not loaded');
            }
            break;
        case 'reaction':
            if (window.Games && window.Games.loadReactionGame) {
                window.Games.loadReactionGame({ gameContainer, updateGameStats });
            } else {
                console.error('Reaction module not loaded');
            }
            break;
    }
}

// 숫자 맞추기 게임 (모듈로 이동)
/* function loadNumberGuessGame() {
    const targetNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;
    let gameStartTime = Date.now();
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>시도 횟수: <span id="attempts">0</span></span>
                <span>힌트: <span id="hint">1-100 사이의 숫자를 입력하세요</span></span>
            </div>
            <div class="game-controls">
                <input type="number" id="guess-input" placeholder="숫자를 입력하세요" min="1" max="100" style="width: 200px; height: 50px; font-size: 1.2rem; padding: 0 1rem; border: 2px solid var(--border-color); border-radius: 10px; margin-right: 1rem;">
                <button class="btn btn-primary" id="guess-btn">확인</button>
                <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
            </div>
            <div class="game-area">
                <div id="result" style="font-size: 1.2rem; margin: 1rem 0;"></div>
            </div>
        </div>
    `;
    
    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const attemptsSpan = document.getElementById('attempts');
    const hintSpan = document.getElementById('hint');
    const resultDiv = document.getElementById('result');
    
    guessBtn.addEventListener('click', () => {
        const guess = parseInt(guessInput.value);
        attempts++;
        attemptsSpan.textContent = attempts;
        
        if (guess === targetNumber) {
            const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
            resultDiv.innerHTML = `
                <div style="color: var(--success-color); font-weight: bold;">
                    🎉 정답입니다! ${attempts}번 만에 맞췄습니다! (${timeTaken}초)
                </div>
            `;
            updateGameStats('number-guess', attempts, timeTaken);
            guessBtn.disabled = true;
        } else if (guess < targetNumber) {
            hintSpan.textContent = '더 큰 숫자입니다';
            resultDiv.textContent = '더 큰 숫자를 입력해보세요!';
        } else {
            hintSpan.textContent = '더 작은 숫자입니다';
            resultDiv.textContent = '더 작은 숫자를 입력해보세요!';
        }
        
        guessInput.value = '';
        guessInput.focus();
    });
    
    newGameBtn.addEventListener('click', () => {
        loadNumberGuessGame();
    });
    
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            guessBtn.click();
        }
    });
    
    guessInput.focus();
} */

// 메모리 카드 게임 (모듈로 이동)
/* function loadMemoryCardGame() {
    const symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎨'];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let gameStartTime = Date.now();
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>이동 횟수: <span id="moves">0</span></span>
                <span>맞춘 쌍: <span id="pairs">0</span>/8</span>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
            </div>
            <div class="game-area">
                <div id="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-width: 400px; margin: 0 auto;"></div>
            </div>
        </div>
    `;
    
    const memoryGrid = document.getElementById('memory-grid');
    const movesSpan = document.getElementById('moves');
    const pairsSpan = document.getElementById('pairs');
    const newGameBtn = document.getElementById('new-game-btn');
    
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.style.cssText = `
            width: 80px;
            height: 80px;
            background: var(--gradient-game);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            cursor: pointer;
            transition: transform 0.3s ease;
            transform: rotateY(180deg);
        `;
        card.innerHTML = '❓';
        
        card.addEventListener('click', () => {
            if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
                flipCard(card);
            }
        });
        
        memoryGrid.appendChild(card);
    });
    
    function flipCard(card) {
        card.style.transform = 'rotateY(0deg)';
        card.innerHTML = card.dataset.symbol;
        card.classList.add('flipped');
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            moves++;
            movesSpan.textContent = moves;
            
            setTimeout(() => {
                checkMatch();
            }, 1000);
        }
    }
    
    function checkMatch() {
        const [card1, card2] = flippedCards;
        
        if (card1.dataset.symbol === card2.dataset.symbol) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            pairsSpan.textContent = matchedPairs;
            
            if (matchedPairs === 8) {
                const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
                setTimeout(() => {
                    alert(`🎉 축하합니다! ${moves}번의 이동으로 모든 카드를 맞췄습니다! (${timeTaken}초)`);
                    updateGameStats('memory-card', moves, timeTaken);
                }, 500);
            }
        } else {
            card1.style.transform = 'rotateY(180deg)';
            card2.style.transform = 'rotateY(180deg)';
            card1.innerHTML = '❓';
            card2.innerHTML = '❓';
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }
        
        flippedCards = [];
    }
    
    newGameBtn.addEventListener('click', () => {
        loadMemoryCardGame();
    });
} */

// 슬라이딩 퍼즐 게임 (모듈로 이동)
/* function loadPuzzleGame() {
    const size = 3;
    let tiles = Array.from({length: size * size - 1}, (_, i) => i + 1);
    tiles.push(0); // 빈 타일
    let moves = 0;
    let gameStartTime = Date.now();
    
    // 타일 섞기
    for (let i = 0; i < 100; i++) {
        const emptyIndex = tiles.indexOf(0);
        const possibleMoves = getPossibleMoves(emptyIndex, size);
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        [tiles[emptyIndex], tiles[randomMove]] = [tiles[randomMove], tiles[emptyIndex]];
    }
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>이동 횟수: <span id="moves">0</span></span>
                <span>목표: 1부터 8까지 순서대로 배열하세요</span>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
            </div>
            <div class="game-area">
                <div id="puzzle-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem; max-width: 300px; margin: 0 auto;"></div>
            </div>
        </div>
    `;
    
    const puzzleGrid = document.getElementById('puzzle-grid');
    const movesSpan = document.getElementById('moves');
    const newGameBtn = document.getElementById('new-game-btn');
    
    function renderPuzzle() {
        puzzleGrid.innerHTML = '';
        tiles.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = 'puzzle-tile';
            tileElement.textContent = tile === 0 ? '' : tile;
            tileElement.style.cssText = `
                width: 80px;
                height: 80px;
                background: ${tile === 0 ? 'transparent' : 'var(--gradient-game)'};
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
                color: white;
                cursor: ${tile === 0 ? 'default' : 'pointer'};
                transition: transform 0.2s ease;
            `;
            
            if (tile !== 0) {
                tileElement.addEventListener('click', () => moveTile(index));
            }
            
            puzzleGrid.appendChild(tileElement);
        });
    }
    
    function getPossibleMoves(emptyIndex, size) {
        const moves = [];
        const row = Math.floor(emptyIndex / size);
        const col = emptyIndex % size;
        
        if (row > 0) moves.push(emptyIndex - size);
        if (row < size - 1) moves.push(emptyIndex + size);
        if (col > 0) moves.push(emptyIndex - 1);
        if (col < size - 1) moves.push(emptyIndex + 1);
        
        return moves;
    }
    
    function moveTile(index) {
        const emptyIndex = tiles.indexOf(0);
        const possibleMoves = getPossibleMoves(emptyIndex, size);
        
        if (possibleMoves.includes(index)) {
            [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
            moves++;
            movesSpan.textContent = moves;
            renderPuzzle();
            
            // 승리 조건 확인
            if (tiles.slice(0, -1).every((tile, i) => tile === i + 1) && tiles[tiles.length - 1] === 0) {
                const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
                setTimeout(() => {
                    alert(`🎉 축하합니다! ${moves}번의 이동으로 퍼즐을 완성했습니다! (${timeTaken}초)`);
                    updateGameStats('puzzle', moves, timeTaken);
                }, 500);
            }
        }
    }
    
    renderPuzzle();
    
    newGameBtn.addEventListener('click', () => {
        loadPuzzleGame();
    });
} */

// 타자 게임
// typing game moved to games/typing.js

// 색상 맞추기 게임 (모듈로 이동)
/* function loadColorMatchGame() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    let currentColor = '';
    let correctAnswers = 0;
    let totalAnswers = 0;
    let gameStartTime = Date.now();
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>정답: <span id="correct">0</span></span>
                <span>정확도: <span id="accuracy">0</span>%</span>
                <span>라운드: <span id="round">1</span>/10</span>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
            </div>
            <div class="game-area">
                <div id="color-display" style="width: 200px; height: 100px; margin: 2rem auto; border-radius: 10px; border: 3px solid var(--border-color);"></div>
                <div id="color-text" style="font-size: 1.5rem; margin: 1rem 0; color: var(--text-primary);"></div>
                <div id="color-options" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 400px; margin: 0 auto;"></div>
            </div>
        </div>
    `;
    
    const colorDisplay = document.getElementById('color-display');
    const colorText = document.getElementById('color-text');
    const colorOptions = document.getElementById('color-options');
    const correctSpan = document.getElementById('correct');
    const accuracySpan = document.getElementById('accuracy');
    const roundSpan = document.getElementById('round');
    const newGameBtn = document.getElementById('new-game-btn');
    
    const colorNames = {
        '#ff6b6b': '빨강',
        '#4ecdc4': '청록',
        '#45b7d1': '파랑',
        '#96ceb4': '초록',
        '#feca57': '노랑',
        '#ff9ff3': '분홍'
    };
    
    function generateRound() {
        const displayColor = colors[Math.floor(Math.random() * colors.length)];
        const textColor = colors[Math.floor(Math.random() * colors.length)];
        
        colorDisplay.style.backgroundColor = displayColor;
        colorText.textContent = colorNames[textColor];
        colorText.style.color = textColor;
        
        // 옵션 생성
        colorOptions.innerHTML = '';
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
        
        shuffledColors.slice(0, 3).forEach(color => {
            const option = document.createElement('button');
            option.className = 'btn btn-primary';
            option.style.cssText = `
                width: 100%;
                height: 60px;
                background: ${color};
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: transform 0.2s ease;
            `;
            
            option.addEventListener('click', () => {
                checkAnswer(color, textColor);
            });
            
            colorOptions.appendChild(option);
        });
    }
    
    function checkAnswer(selectedColor, correctColor) {
        totalAnswers++;
        
        if (selectedColor === correctColor) {
            correctAnswers++;
        }
        
        correctSpan.textContent = correctAnswers;
        accuracySpan.textContent = Math.round((correctAnswers / totalAnswers) * 100);
        
        if (totalAnswers >= 10) {
            const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
            setTimeout(() => {
                alert(`게임 종료! 정확도: ${Math.round((correctAnswers / totalAnswers) * 100)}% (${timeTaken}초)`);
                updateGameStats('color-match', correctAnswers, Math.round((correctAnswers / totalAnswers) * 100));
            }, 500);
        } else {
            roundSpan.textContent = totalAnswers + 1;
            setTimeout(generateRound, 1000);
        }
    }
    
    newGameBtn.addEventListener('click', () => {
        loadColorMatchGame();
    });
    
    generateRound();
} */

// 반응 속도 게임 (모듈로 이동)
/* function loadReactionGame() {
    let startTime = 0;
    let reactionTimes = [];
    let round = 1;
    let isWaiting = false;
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>라운드: <span id="round">1</span>/5</span>
                <span>평균: <span id="average">-</span>ms</span>
                <span>최고 기록: <span id="best">-</span>ms</span>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" id="start-btn">시작</button>
                <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
            </div>
            <div class="game-area">
                <div id="reaction-area" style="width: 300px; height: 200px; margin: 2rem auto; border-radius: 15px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; transition: background-color 0.3s ease;"></div>
            </div>
        </div>
    `;
    
    const reactionArea = document.getElementById('reaction-area');
    const startBtn = document.getElementById('start-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const roundSpan = document.getElementById('round');
    const averageSpan = document.getElementById('average');
    const bestSpan = document.getElementById('best');
    
    function startRound() {
        if (round > 5) {
            const avgTime = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
            const bestTime = Math.min(...reactionTimes);
            
            alert(`게임 종료! 평균: ${avgTime}ms, 최고 기록: ${bestTime}ms`);
            updateGameStats('reaction', bestTime, avgTime);
            return;
        }
        
        roundSpan.textContent = round;
        reactionArea.textContent = '대기 중...';
        reactionArea.style.backgroundColor = 'var(--bg-secondary)';
        isWaiting = true;
        
        const delay = Math.random() * 3000 + 1000; // 1-4초 랜덤
        
        setTimeout(() => {
            if (isWaiting) {
                reactionArea.textContent = '클릭하세요!';
                reactionArea.style.backgroundColor = 'var(--success-color)';
                startTime = Date.now();
            }
        }, delay);
    }
    
    reactionArea.addEventListener('click', () => {
        if (startTime > 0 && reactionArea.style.backgroundColor === 'var(--success-color)') {
            const reactionTime = Date.now() - startTime;
            reactionTimes.push(reactionTime);
            
            reactionArea.textContent = `${reactionTime}ms`;
            reactionArea.style.backgroundColor = 'var(--primary-color)';
            
            const avgTime = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
            const bestTime = Math.min(...reactionTimes);
            
            averageSpan.textContent = avgTime;
            bestSpan.textContent = bestTime;
            
            startTime = 0;
            round++;
            
            setTimeout(startRound, 1000);
        }
    });
    
    startBtn.addEventListener('click', () => {
        round = 1;
        reactionTimes = [];
        startRound();
    });
    
    newGameBtn.addEventListener('click', () => {
        loadReactionGame();
    });
    
    startRound();
} */

// 게임 통계 업데이트 (MongoDB 연동)
async function updateGameStats(gameType, score, time) {
    const stats = gameData[gameType];
    stats.games++;
    
    if (gameType === 'number-guess') {
        if (!stats.personalBest || score < stats.personalBest) {
            stats.personalBest = score;
        }
        stats.attempts = score;
    } else if (gameType === 'memory-card' || gameType === 'puzzle') {
        if (!stats.personalBest || score < stats.personalBest) {
            stats.personalBest = score;
        }
        stats.moves = score;
    } else if (gameType === 'typing') {
        // 점수는 초(낮을수록 좋음)
        if (!stats.personalBest || score < stats.personalBest) {
            stats.personalBest = score;
        }
        stats.time = score;
    } else if (gameType === 'color-match') {
        if (!stats.personalBest || score > stats.personalBest) {
            stats.personalBest = score;
        }
        stats.accuracy = time;
    } else if (gameType === 'reaction') {
        if (!stats.personalBest || score < stats.personalBest) {
            stats.personalBest = score;
        }
        stats.avg = time;
    }
    
    // 로컬 스토리지에 저장 (캐시)
    localStorage.setItem('gameData', JSON.stringify(gameData));
    
    // MongoDB에 저장 (플레이어 이름 포함)
    try {
        const response = await fetch(`${API_BASE_URL}/game-stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameType,
                playerId: getPlayerId(),
                playerName: getPlayerName(),
                score,
                time,
                difficulty: 'normal'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 게임 통계가 서버에 저장되었습니다:', result.message);
            
            // 리더보드 업데이트
            await loadLeaderboard(gameType);
            
            // 전체 최고 기록 업데이트 (새 기록이 전체 최고 기록일 수 있으므로)
            await loadBestScores();
        } else {
            console.error('❌ 서버 저장 실패:', response.statusText);
        }
    } catch (error) {
        console.error('❌ 네트워크 오류:', error);
    }
    
    // UI 업데이트
    updateGameStatsUI();
}

// 리더보드 로드 (MongoDB에서)
async function loadLeaderboard(gameType) {
    try {
        const response = await fetch(`${API_BASE_URL}/leaderboard/${gameType}?limit=10`);
        
        if (response.ok) {
            const data = await response.json();
            leaderboardData[gameType] = data.leaderboard;
            console.log(`📊 ${gameType} 리더보드 로드됨:`, data.leaderboard.length, '개 기록');
        } else {
            console.error('❌ 리더보드 로드 실패:', response.statusText);
        }
    } catch (error) {
        console.error('❌ 리더보드 네트워크 오류:', error);
    }
}

// 플레이어 통계 로드
async function loadPlayerStats() {
    try {
        const playerId = getPlayerId();
        const response = await fetch(`${API_BASE_URL}/player-stats/${playerId}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('👤 플레이어 통계 로드됨:', data);
            
            // 플레이어의 개인 최고 기록은 별도로 저장 (전체 최고 기록과 구분)
            Object.keys(data.bestScores).forEach(gameType => {
                if (gameData[gameType]) {
                    gameData[gameType].personalBest = data.bestScores[gameType];
                    gameData[gameType].games = data.totalGames;
                }
            });
            
            updateGameStatsUI();
        } else {
            console.error('❌ 플레이어 통계 로드 실패:', response.statusText);
        }
    } catch (error) {
        console.error('❌ 플레이어 통계 네트워크 오류:', error);
    }
}

// 게임 통계 UI 업데이트
function updateGameStatsUI() {
    Object.keys(gameData).forEach(gameType => {
        const stats = gameData[gameType];
        // 게임 타입 → ID 프리픽스 매핑 (HTML의 id와 정확히 일치시킴)
        const idPrefixMap = {
            'number-guess': 'number',
            'memory-card': 'memory',
            'puzzle': 'puzzle',
            'typing': 'typing',
            'color-match': 'color',
            'reaction': 'reaction'
        };
        const idPrefix = idPrefixMap[gameType] || gameType.replace('-', '');
        const bestElement = document.getElementById(`${idPrefix}-best`);
        if (bestElement) {
            // 디버깅을 위한 로그
            console.log(`${gameType} 데이터:`, {
                best: stats.best,
                bestPlayerName: stats.bestPlayerName,
                bestPlayerId: stats.bestPlayerId
            });
            
            // 최고 기록에 유저명(유저ID) 표시
            const bestScoreText = getBestScoreText(stats.best, stats.bestPlayerName, stats.bestPlayerId);
            bestElement.textContent = bestScoreText;
            
            // 전체 텍스트가 길면 툴팁 추가
            const fullText = getBestScoreText(stats.best, stats.bestPlayerName, stats.bestPlayerId, true);
            console.log('🔍 툴팁 디버깅:', { gameType, bestScoreText, fullText, hasTooltip: fullText && fullText !== bestScoreText });
            if (fullText && fullText !== bestScoreText) {
                // 기존 툴팁 제거
                const existingTooltip = bestElement.querySelector('.custom-tooltip');
                if (existingTooltip) {
                    existingTooltip.remove();
                }
                
                // 새 툴팁 생성
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = fullText;
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    z-index: 1000;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    border: 1px solid var(--border-color);
                    margin-bottom: 0.75rem;
                    max-width: 300px;
                    word-wrap: break-word;
                    white-space: normal;
                    text-align: center;
                    line-height: 1.4;
                    display: none;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                `;
                
                bestElement.appendChild(tooltip);
                bestElement.style.cursor = 'help';
                bestElement.style.position = 'relative';
                
                // 호버 이벤트 추가
                bestElement.addEventListener('mouseenter', () => {
                    tooltip.style.display = 'block';
                    setTimeout(() => tooltip.style.opacity = '1', 10);
                });
                
                bestElement.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                    setTimeout(() => tooltip.style.display = 'none', 200);
                });
                
                console.log('✅ 커스텀 툴팁 설정됨:', fullText);
            } else {
                // 툴팁 제거
                const existingTooltip = bestElement.querySelector('.custom-tooltip');
                if (existingTooltip) {
                    existingTooltip.remove();
                }
                bestElement.style.cursor = 'default';
            }
        }
        
        if (gameType === 'number-guess') {
            const attemptsElement = document.getElementById('number-attempts');
            if (attemptsElement) attemptsElement.textContent = stats.attempts || '-';
        } else if (gameType === 'memory-card') {
            const movesElement = document.getElementById('memory-moves');
            if (movesElement) movesElement.textContent = stats.moves || '-';
        } else if (gameType === 'puzzle') {
            const movesElement = document.getElementById('puzzle-moves');
            if (movesElement) movesElement.textContent = stats.moves || '-';
        } else if (gameType === 'typing') {
            const wpmElement = document.getElementById('typing-wpm');
            if (wpmElement) wpmElement.textContent = stats.time || '-';
        } else if (gameType === 'color-match') {
            const accuracyElement = document.getElementById('color-accuracy');
            if (accuracyElement) accuracyElement.textContent = stats.best || '-'; // 이제 best가 최종 점수
        } else if (gameType === 'reaction') {
            const avgElement = document.getElementById('reaction-avg');
            if (avgElement) avgElement.textContent = stats.best || '-'; // 이제 best가 평균속도(avgTime)
        }
    });
}

// 랭킹 탭 변경 (MongoDB 연동)
async function changeLeaderboardTab(gameType, event) {

    if (event){
        tabButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
    
    // MongoDB에서 리더보드 로드
    await loadLeaderboard(gameType);
    
    const leaderboardList = document.getElementById('leaderboard-list');
    const data = leaderboardData[gameType] || [];
    
    leaderboardList.innerHTML = '';
    
    if (data.length === 0) {
        leaderboardList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">아직 기록이 없습니다.</div>';
        return;
    }
    
    data.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // 유저명과 유저ID 표시 형식 결정
        let playerDisplay = '';
        if (entry.playerName && entry.playerName !== '익명') {
            if (entry.playerId) {
                playerDisplay = `${entry.playerName}(${entry.playerId})`;
            } else {
                playerDisplay = entry.playerName;
            }
        } else {
            playerDisplay = entry.playerId || '익명';
        }
        
        const scoreLabel = gameType === 'typing' ? `${entry.score}초` : `${entry.score}`;
        item.innerHTML = `
            <span>${entry.rank}</span>
            <span>${playerDisplay}</span>
            <span>${scoreLabel}</span>
            <span>${new Date(entry.date).toLocaleDateString()}</span>
        `;
        leaderboardList.appendChild(item);
    });
}

// 페이지 로드 시 초기화 (MongoDB 연동)
document.addEventListener('DOMContentLoaded', async function() {
    // 테마 로드
    loadTheme();
    
    // 저장된 데이터 로드 (로컬 캐시)
    const savedGameData = localStorage.getItem('gameData');
    if (savedGameData) {
        gameData = JSON.parse(savedGameData);
    }
    
    // 플레이어 이름 표시 초기화
    updatePlayerDisplay();
    
    // MongoDB에서 플레이어 통계 로드
    await loadPlayerStats();
    
    // 게임별 최고 기록 로드
    await loadBestScores();
    
    // 이벤트 리스너 등록
    themeToggleBtn.addEventListener('click', toggleTheme);
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // 플레이어 이름 저장 이벤트
    savePlayerNameBtn.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (setPlayerName(name)) {
            showNotification('플레이어 이름이 저장되었습니다!', 'success');
        } else {
            showNotification('이름을 입력해주세요.', 'error');
        }
    });
    
    // Enter 키로 이름 저장
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            savePlayerNameBtn.click();
        }
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    playButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gameCard = e.target.closest('.game-card');
            const gameType = gameCard.dataset.game;
            openModal(gameType);
        });
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            await changeLeaderboardTab(e.target.dataset.game, e);
        });
    });
    
    // 초기 랭킹 로드
    await changeLeaderboardTab('number-guess');
    
    // 통계 UI 업데이트
    updateGameStatsUI();
    
    // 전체 통계 업데이트
    updateOverallStats();
    
    console.log('🎮 미니게임 컬렉션이 MongoDB와 연동되어 로드되었습니다!');
    console.log('👤 플레이어 ID:', getPlayerId());
    console.log('👤 플레이어 이름:', getPlayerName());
});

// 알림 표시 함수
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.background = 'var(--success-color)';
    } else if (type === 'error') {
        notification.style.background = 'var(--error-color)';
    } else {
        notification.style.background = 'var(--primary-color)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 전체 통계 업데이트 (서버에서 로드)
async function updateOverallStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/overall-stats`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 전체 통계 로드됨:', data);
            
            // 시간을 분:초 형식으로 변환
            const totalMinutes = Math.floor(data.totalTime / 60);
            const totalSeconds = data.totalTime % 60;
            const timeDisplay = totalMinutes > 0 
                ? `${totalMinutes}분 ${totalSeconds}초`
                : `${totalSeconds}초`;
            
            document.getElementById('total-games').textContent = data.totalGames;
            document.getElementById('total-time').textContent = timeDisplay;
            
            // 최고 점수는 게임별로 다른 의미이므로 로컬 데이터 사용
            const bestScore = Math.max(...Object.values(gameData).map(game => game.best || 0));
            document.getElementById('best-score').textContent = bestScore;
        } else {
            console.error('❌ 전체 통계 로드 실패:', response.statusText);
            // 실패 시 로컬 데이터로 fallback
            const totalGames = Object.values(gameData).reduce((sum, game) => sum + game.games, 0);
            const bestScore = Math.max(...Object.values(gameData).map(game => game.best || 0));
            document.getElementById('total-games').textContent = totalGames;
            document.getElementById('best-score').textContent = bestScore;
        }
    } catch (error) {
        console.error('❌ 전체 통계 네트워크 오류:', error);
        // 실패 시 로컬 데이터로 fallback
        const totalGames = Object.values(gameData).reduce((sum, game) => sum + game.games, 0);
        const bestScore = Math.max(...Object.values(gameData).map(game => game.best || 0));
        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('best-score').textContent = bestScore;
    }
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K로 테마 토글
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleTheme();
    }
    
    // ESC로 모달 닫기
    if (e.key === 'Escape') {
        closeModal();
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});
