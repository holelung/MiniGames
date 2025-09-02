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
const API_BASE_URL = (() => {
    // 개발 환경 감지
    const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.port === '3000' ||
                        window.location.protocol === 'file:';
    
    if (isDevelopment) {
        console.log('🔧 개발 환경 감지됨 - 로컬 서버 사용');
        return 'http://localhost:3000/api';
    } else {
        console.log('🚀 배포 환경 감지됨 - Render 서버 사용');
        return 'https://minigames-7s1x.onrender.com/api';
    }
})();

// 앱 버전 로드
async function loadAppVersion() {
    try {
        const response = await fetch(`${API_BASE_URL}/app-info?t=${Date.now()}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        if (response.ok) {
            const data = await response.json();
            const versionBadge = document.querySelector('.version-badge');
            if (versionBadge) {
                versionBadge.textContent = `v${data.version}`;
                console.log(`📦 앱 버전 로드됨: v${data.version}`);
            }
        } else {
            console.error('❌ 앱 버전 로드 실패:', response.statusText);
        }
    } catch (error) {
        console.error('❌ 앱 버전 네트워크 오류:', error);
    }
}
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
        'reaction': { best: 0, time: 0, games: 0 },
        'tetris': { best: 0, difficulty: 0, games: 0 }
    };

    // 랭킹 데이터
    let leaderboardData = {
        'number-guess': [],
        'memory-card': [],
        'puzzle': [],
        'typing': [],
        'color-match': [],
        'reaction': [],
        'tetris': []
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
        'reaction': '반응 속도 테스트',
        'tetris': '테트리스'
    };
    
    // gameData[gameType]이 존재하지 않을 경우를 대비한 안전한 처리
    const gameStats = gameData[gameType] || { best: 0, bestPlayerName: null, bestPlayerId: null };
    const bestScore = gameStats.best || 0;
    const bestPlayerName = gameStats.bestPlayerName;
    const bestPlayerId = gameStats.bestPlayerId;
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
    // 0도 유효한 점수로 인정. null/undefined만 기록 없음 처리
    if (bestScore === undefined || bestScore === null) return '아직 기록 없음';
    
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
        const response = await fetch(`${API_BASE_URL}/best-scores?t=${Date.now()}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('🏆 전체 최고 기록 로드됨:', data.bestScores);
            
            // 로컬 게임 데이터 업데이트
            Object.keys(data.bestScores).forEach(gameType => {
                if (gameData[gameType]) {
                    const bestData = data.bestScores[gameType];
                    console.log(`📊 ${gameType} 최고 기록 설정:`, bestData.bestScore, bestData.playerName);
                    gameData[gameType].best = bestData.bestScore;
                    gameData[gameType].bestPlayerName = bestData.playerName;
                    gameData[gameType].bestPlayerId = bestData.playerId;
                    // 테트리스 난이도 동기화
                    if (gameType === 'tetris') {
                        gameData[gameType].difficulty = bestData.difficulty || gameData[gameType].difficulty;
                    }
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
        case 'tetris':
            if (window.Games && window.Games.loadTetrisGame) {
                window.Games.loadTetrisGame({ gameContainer, updateGameStats });
            } else {
                console.error('Tetris module not loaded');
            }
            break;
    }
}

// 게임 통계 업데이트 (MongoDB 연동)
async function updateGameStats(gameType, score, time, difficulty) {
    // 안전 가드: 해당 게임 키가 없으면 기본 구조 생성
    if (!gameData[gameType]) {
        gameData[gameType] = { best: 0, games: 0 };
    }
    const stats = gameData[gameType];
    stats.games++;
    
    // 최고 점수 업데이트 (전체 최고 기록용)
    if (gameType === 'number-guess' || gameType === 'memory-card' || gameType === 'reaction' || gameType === 'typing') {
        // 낮은 점수가 좋은 게임들
        if (!stats.best || score < stats.best) {
            stats.best = score;
        }
    } else if (gameType === 'color-match' || gameType === 'puzzle' || gameType === 'tetris') {
        // 높은 점수가 좋은 게임
        if (!stats.best || score > stats.best) {
            stats.best = score;
        }
    }
    
    // 개인 최고 기록 업데이트
    if (gameType === 'number-guess') {
        if (!stats.personalBest || score < stats.personalBest) {
            stats.personalBest = score;
        }
        stats.attempts = score;
    } else if (gameType === 'memory-card') {
        if (!stats.personalBest || score < stats.personalBest) {
            stats.personalBest = score;
        }
        stats.moves = score;
    } else if (gameType === 'puzzle') {
        if (!stats.personalBest || score > stats.personalBest) {
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
    } else if (gameType === 'tetris') {
        if (!stats.personalBest || score > stats.personalBest) {
            stats.personalBest = score;
        }
        stats.score = score; // 테트리스 점수 저장
        stats.difficulty = difficulty || 'normal'; // 난이도 정보도 저장
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
                difficulty: difficulty || 'normal'
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
        const response = await fetch(`${API_BASE_URL}/leaderboard/${gameType}?limit=10&t=${Date.now()}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
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
            
            // UI 업데이트는 loadBestScores에서 처리하므로 여기서는 호출하지 않음
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
            'reaction': 'reaction',
            'tetris': 'tetris'
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
            
            // 최고 기록에 유저명(유저ID) 표시 (테트리스 포함 동일 처리)
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
            if (attemptsElement) attemptsElement.textContent = stats.best ? Math.round(stats.best * 100) / 100 : '-'; // 소수점 둘째자리까지 표시
        } else if (gameType === 'memory-card') {
            const movesElement = document.getElementById('memory-moves');
            if (movesElement) movesElement.textContent = stats.best ? `${Math.round(stats.best * 100) / 100}점` : '-'; // 점수 시스템으로 변경
        } else if (gameType === 'puzzle') {
            const movesElement = document.getElementById('puzzle-moves');
            if (movesElement) movesElement.textContent = stats.best ? `${Math.round(stats.best * 100) / 100}점` : '-'; // 소수점 둘째자리까지 표시
        } else if (gameType === 'typing') {
            const wpmElement = document.getElementById('typing-wpm');
            if (wpmElement) wpmElement.textContent = stats.best ? `${Math.round(stats.best * 100) / 100}점` : '-'; // 점수 시스템으로 변경
        } else if (gameType === 'color-match') {
            const accuracyElement = document.getElementById('color-accuracy');
            if (accuracyElement) accuracyElement.textContent = stats.best ? Math.round(stats.best * 100) / 100 : '-'; // 소수점 둘째자리까지 표시
        } else if (gameType === 'reaction') {
            const avgElement = document.getElementById('reaction-avg');
            if (avgElement) avgElement.textContent = stats.best ? Math.round(stats.best * 100) / 100 : '-'; // 소수점 둘째자리까지 표시
        } else if (gameType === 'tetris') {
            const scoreElement = document.getElementById('tetris-score');
            if (scoreElement) {
                const sourceVal = (stats.best !== undefined && stats.best !== null) ? stats.best : stats.score;
                const hasVal = (sourceVal !== undefined && sourceVal !== null);
                const bestVal = hasVal ? Math.round(sourceVal * 100) / 100 : null;
                scoreElement.textContent = hasVal ? ` ${bestVal}점 / ${stats.difficulty || '-'}` : '-';
            }
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
        
        // 게임 섹션과 동일한 방식으로 플레이어명 표시
        const playerDisplay = getBestScoreText(entry.score, entry.playerName, entry.playerId);
        
        const scoreLabel = gameType === 'typing' ? `${Math.round(entry.score * 100) / 100}점` : 
                          gameType === 'puzzle' ? `${Math.round(entry.score * 100) / 100}점` :
                          gameType === 'memory-card' ? `${Math.round(entry.score * 100) / 100}점` :
                          gameType === 'tetris' ? `${Math.round(entry.score * 100) / 100}점 / ${entry.difficulty || '-'}` :
                          gameType === 'number-guess' ? `${Math.round(entry.score * 100) / 100}회` :
                          gameType === 'reaction' ? `${Math.round(entry.score * 100) / 100}ms` :
                          `${Math.round(entry.score * 100) / 100}`;
        
        // 한국 시간 형식으로 표시 (YYYY-MM-DD HH:MM:SS)
        let dateDisplay;
        if (entry.koreanDate) {
            // koreanDate가 있으면 그대로 사용
            dateDisplay = entry.koreanDate;
        } else {
            // 기존 데이터는 date를 한국 시간으로 변환
            const koreanTime = new Date(entry.date).toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            dateDisplay = koreanTime;
        }
        
        item.innerHTML = `
            <span>${entry.rank}</span>
            <span>${playerDisplay}</span>
            <span>${scoreLabel}</span>
            <span>${dateDisplay}</span>
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
        const parsed = JSON.parse(savedGameData);
        // 기본 구조와 병합하여 누락된 게임 타입이 없도록 보정
        gameData = Object.assign({}, gameData, parsed);
        // 각 게임 항목도 최소 필드를 보장
        Object.keys(gameData).forEach(key => {
            const base = { best: 0, games: 0 };
            gameData[key] = Object.assign({}, base, gameData[key] || {});
        });
    }
    
    // 플레이어 이름 표시 초기화
    updatePlayerDisplay();
    
    // 앱 버전 로드
    await loadAppVersion();
    
    // 게임별 최고 기록 로드 (먼저)
    await loadBestScores();
    
    // MongoDB에서 플레이어 통계 로드 (나중에)
    await loadPlayerStats();
    
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
            
            // 시간을 분:초 형식으로 변환 (정수로 표시)
            const totalMinutes = Math.floor(data.totalTime / 60);
            const totalSeconds = Math.floor(data.totalTime % 60); // Math.floor 추가
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
