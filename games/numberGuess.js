// Number Guess game module
window.Games = window.Games || {};
window.Games.loadNumberGuessGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

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
    
    newGameBtn.addEventListener('click', () => window.Games.loadNumberGuessGame(deps));
    
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            guessBtn.click();
        }
    });
    
    guessInput.focus();
};


