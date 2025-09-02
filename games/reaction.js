// Reaction game module
window.Games = window.Games || {};
window.Games.loadReactionGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

    let startTime = 0;
    let reactionTimes = [];
    let round = 1;
    let isWaiting = false;
    let isGameActive = true;
    
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
                <div id="reaction-area" style="width: 300px; height: 200px; margin: 2rem auto; border-radius: 15px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer; transition: background-color 0.3s ease; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -webkit-user-drag: none; -khtml-user-drag: none; -moz-user-drag: none; -o-user-drag: none; user-drag: none;"></div>
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
            alert(`게임 종료! 평균: ${avgTime}ms, 최고 속도: ${bestTime}ms`);
            updateGameStats('reaction', avgTime, bestTime);
            return;
        }
        roundSpan.textContent = round;
        reactionArea.textContent = '대기 중...';
        reactionArea.style.backgroundColor = 'var(--bg-secondary)';
        isWaiting = true;
        isGameActive = true;
        const delay = Math.random() * 3000 + 1000;
        setTimeout(() => {
            if (isWaiting && isGameActive) {
                reactionArea.textContent = '클릭하세요!';
                reactionArea.style.backgroundColor = 'var(--success-color)';
                startTime = Date.now();
            }
        }, delay);
    }
    
    reactionArea.addEventListener('click', () => {
        if (!isGameActive) return;
        
        if (isWaiting && startTime === 0) {
            // 미리 클릭한 경우
            isGameActive = false;
            isWaiting = false;
            reactionArea.textContent = '미리누르는 것은 반칙입니다! 새로 게임을 시작해주세요';
            reactionArea.style.backgroundColor = 'var(--error-color)';
            return;
        }
        
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
        isGameActive = true;
        startRound();
    });
    
    newGameBtn.addEventListener('click', () => window.Games.loadReactionGame(deps));
    
    startRound();
};


