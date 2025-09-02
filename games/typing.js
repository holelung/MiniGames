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
    let updateInterval = null; // 실시간 업데이트를 위한 인터벌
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>시간(초): <span id="wpm">0</span></span>
                <span>정확도: <span id="accuracy">0</span>%</span>
                <span>단어: <span id="word-count">0</span>/10</span>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="new-game-btn">새 게임</button>
            </div>
            <div class="game-area">
                <div id="word-display" style="font-size: 2rem; margin: 2rem 0; color: var(--text-primary);"></div>
                <input type="text" id="typing-input" placeholder="단어를 입력하세요" style="width: 100%; padding: 1rem; font-size: 1.2rem; border: 2px solid var(--border-color); border-radius: 10px; margin-bottom: 1rem;">
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
        } else {
            endGame();
        }
    }
    
    function endGame() {
        const timeTakenMs = Date.now() - startTime; // 밀리초 단위로 시간 측정
        const timeTakenSec = Math.round(timeTakenMs / 1000 * 100) / 100; // 소수점 둘째자리까지 표시
        const accuracy = Math.round((correctChars / totalChars) * 100) || 0;
        
        // 실시간 업데이트 중지
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        
        typingInput.disabled = true;
        wordDisplay.textContent = `게임 종료! 시간: ${timeTakenSec}초, 정확도: ${accuracy}%`;
        timerDiv.textContent = '';
        
        // 점수(score)에는 걸린 시간(초, 소수점 둘째자리까지)을 저장, 낮을수록 좋음
        updateGameStats('typing', timeTakenSec, accuracy);
    }
    
    function updateStats() {
        if (startTime) {
            const timeElapsedMs = Date.now() - startTime; // 밀리초 단위로 시간 측정
            const timeElapsedSec = Math.round(timeElapsedMs / 1000 * 100) / 100; // 소수점 둘째자리까지 표시
            const accuracy = Math.round((correctChars / totalChars) * 100) || 0;
            
            wpmSpan.textContent = timeElapsedSec; // 현재 경과 시간(초, 소수점 둘째자리까지)
            accuracySpan.textContent = accuracy;
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
        
        totalChars = typedWord.length;
        correctChars = 0;
        
        for (let i = 0; i < typedWord.length; i++) {
            if (typedWord[i] === currentWord[i]) {
                correctChars++;
            }
        }
        
        // updateStats()는 이제 setInterval에서 자동으로 호출되므로 제거
        // updateStats();
        
        if (typedWord === currentWord) {
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


