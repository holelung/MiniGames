// Typing game module (10 words, measure seconds)
window.Games = window.Games || {};
window.Games.loadTypingGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

    const words = [
        'javascript', 'html', 'css', 'react', 'vue', 'angular', 'node', 'python',
        'java', 'csharp', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'
    ];
    let currentWordIndex = 0;
    let startTime = null;
    let correctChars = 0;
    let totalChars = 0;
    let currentWordCorrectChars = 0; // 현재 단어의 정확한 문자 수
    let currentWordTotalChars = 0;    // 현재 단어의 전체 문자 수
    let updateInterval = null; // 실시간 업데이트를 위한 인터벌
    
    // 타자 게임 설정 (10단어 기준)
    const TYPING_CONFIG = {
        optimalTime: 20,        // 10단어 완성 목표 시간 (20초)
        optimalAccuracy: 100,    // 최적 정확도 (100%)
        timeWeight: 0.6,        // 시간 가중치
        accuracyWeight: 0.4,     // 정확도 가중치
        maxScore: 100          // 최대 점수
    };
    
    // 타자 게임 점수 계산 함수
    function calculateTypingScore(timeSeconds, accuracy) {
        const T = timeSeconds;
        const A = accuracy;
        const T_star = TYPING_CONFIG.optimalTime;
        const A_star = TYPING_CONFIG.optimalAccuracy;
        
        // 정규화 효율
        const E_t = Math.min(1, T_star / T);  // 시간 효율 (빠를수록 높음)
        const E_a = A / A_star;               // 정확도 효율 (정확할수록 높음)
        
        // 가중 조화평균
        const w_t = TYPING_CONFIG.timeWeight;
        const w_a = TYPING_CONFIG.accuracyWeight;
        const E = (w_t + w_a) / (w_t/E_t + w_a/E_a);
        
        // 기본 점수
        const baseScore = 80 * E;
        
        // 보너스 점수
        let bonus = 0;
        if (T <= T_star) bonus += 10;        // 목표 시간 달성
        if (A >= 95) bonus += 8;             // 95% 이상 정확도
        if (A >= 90) bonus += 5;             // 90% 이상 정확도
        if (T <= T_star && A >= 95) bonus += 7; // 둘 다 달성
        
        // 최종 점수 (소수점 둘째자리까지, 최대 100점)
        const finalScore = Math.max(0, Math.min(100, Math.round((baseScore + bonus) * 100) / 100));
        
        return finalScore;
    }
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>점수: <span id="wpm">0</span></span>
                <span>정확도: <span id="accuracy">0</span>%</span>
                <span>단어: <span id="word-count">0</span>/10</span>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
            </div>
            <div class="game-area">
                <div id="word-display" style="font-size: 2rem; margin: 2rem 0; color: var(--text-primary);"></div>
                <input type="text" id="typing-input" placeholder="단어를 입력하세요 (Enter로 다음 단어로)" style="width: 100%; padding: 1rem; font-size: 1.2rem; border: 2px solid var(--border-color); border-radius: 10px; margin-bottom: 1rem;">
                <div id="timer" style="font-size: 1.5rem; color: var(--primary-color);"></div>
            </div>
        </div>
    `;
    
    const wordDisplay = document.getElementById('word-display');
    const typingInput = document.getElementById('typing-input');
    const wpmSpan = document.getElementById('wpm');
    const accuracySpan = document.getElementById('accuracy');
    const wordCountSpan = document.getElementById('word-count');
    const timerDiv = document.getElementById('timer');
    const newGameBtn = document.getElementById('new-game-btn');
    
    function startGame() {
        currentWordIndex = 0;
        correctChars = 0;
        totalChars = 0;
        currentWordCorrectChars = 0;
        currentWordTotalChars = 0;
        // startTime은 첫 번째 키보드 입력 시에 설정
        displayNextWord();
        typingInput.disabled = false;
        typingInput.focus();
        
        // 실시간 시간 업데이트는 첫 번째 키보드 입력 시에 시작
    }
    
    function displayNextWord() {
        if (currentWordIndex < 10) {
            wordDisplay.textContent = words[Math.floor(Math.random() * words.length)];
            wordCountSpan.textContent = currentWordIndex + 1;
            typingInput.value = '';
            currentWordCorrectChars = 0;
            currentWordTotalChars = 0;
        } else {
            endGame();
        }
    }
    
    function endGame() {
        const timeTakenMs = Date.now() - startTime; // 밀리초 단위로 시간 측정
        const timeTakenSec = Math.round(timeTakenMs / 1000 * 100) / 100; // 소수점 둘째자리까지 표시
        const accuracy = Math.round((correctChars / totalChars) * 100) || 0;
        const finalScore = calculateTypingScore(timeTakenSec, accuracy);
        
        // 실시간 업데이트 중지
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        
        typingInput.disabled = true;
        wordDisplay.textContent = `게임 종료! 시간: ${timeTakenSec}초, 정확도: ${accuracy}%\n최종 점수: ${finalScore}점`;
        timerDiv.textContent = '';
        
        // 점수(score)에는 계산된 점수를 저장
        updateGameStats('typing', finalScore, timeTakenSec);
    }
    
    function updateStats() {
        if (startTime) {
            const timeElapsedMs = Date.now() - startTime; // 밀리초 단위로 시간 측정
            const timeElapsedSec = Math.round(timeElapsedMs / 1000 * 100) / 100; // 소수점 둘째자리까지 표시
            const totalAccuracy = Math.round(((correctChars + currentWordCorrectChars) / Math.max(totalChars + currentWordTotalChars, 1)) * 100) || 0;
            
            wpmSpan.textContent = timeElapsedSec; // 현재 경과 시간(초, 소수점 둘째자리까지)
            accuracySpan.textContent = totalAccuracy;
            timerDiv.textContent = `${timeElapsedSec}초`;
        } else {
            // 게임이 아직 시작되지 않았을 때
            wpmSpan.textContent = '0';
            accuracySpan.textContent = '0';
            timerDiv.textContent = '게임을 시작하려면 타이핑하세요';
        }
    }
    
    typingInput.addEventListener('input', (e) => {
        if (!startTime) {
            startTime = Date.now();
            // 실시간 시간 업데이트 시작 (100ms마다)
            updateInterval = setInterval(updateStats, 100);
        }
        
        const currentWord = wordDisplay.textContent;
        const typedWord = e.target.value;
        
        currentWordTotalChars = typedWord.length;
        currentWordCorrectChars = 0;
        
        for (let i = 0; i < typedWord.length; i++) {
            if (typedWord[i] === currentWord[i]) {
                currentWordCorrectChars++;
            }
        }
    });
    
    // Enter 키로 다음 단어로 진행
    typingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const currentWord = wordDisplay.textContent;
            const typedWord = e.target.value;
            
            // 현재 단어의 정확도 계산
            let wordCorrectChars = 0;
            for (let i = 0; i < Math.min(typedWord.length, currentWord.length); i++) {
                if (typedWord[i] === currentWord[i]) {
                    wordCorrectChars++;
                }
            }
            
            // 전체 정확도에 반영
            correctChars += wordCorrectChars;
            totalChars += currentWord.length;
            
            currentWordIndex++;
            setTimeout(displayNextWord, 500);
        }
    });
    
    newGameBtn.addEventListener('click', () => {
        // 기존 인터벌 정리
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        window.Games.loadTypingGame(deps);
    });
    
    // 게임 시작 시 초기 상태 표시
    updateStats();
    
    startGame();
};


