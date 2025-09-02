// Memory Card game module
window.Games = window.Games || {};
window.Games.loadMemoryCardGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

    const symbols = ['🍕', '🍦', '🎨', '🎭', '🦄', '🌈', '🎮', '🎲'];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let gameStartTime = Date.now();
    
    // 메모리 카드 게임 설정 (16장 카드 기준)
    const MEMORY_CONFIG = {
        optimalMoves: 16, // 최적의 경우: 각 쌍을 한 번에 맞추는 경우
        timeCoefficient: 0.7,
        optimalTime: 30, // 30초 내에 완료하는 것을 목표
        maxScore: 80 // 최대 점수 제한
    };
    
    // 메모리 카드 점수 계산 함수
    function calculateMemoryScore(moves, timeSeconds) {
        const M = moves;
        const T = timeSeconds;
        const M_star = MEMORY_CONFIG.optimalMoves;
        const T_star = MEMORY_CONFIG.optimalTime;
        
        // 정규화 효율
        const E_m = Math.min(1, M_star / M);
        const E_t = Math.min(1, T_star / T);
        
        // 가중 조화평균 (메모리 게임은 이동 횟수가 더 중요)
        const w_m = 0.7, w_t = 0.3;
        const E = (w_m + w_t) / (w_m/E_m + w_t/E_t);
        
        // 기본 점수 (최대 점수 제한)
        const baseScore = Math.min(MEMORY_CONFIG.maxScore, 60 * E);
        
        // 보너스 점수 (운도 실력이므로 페널티 없이 보상)
        let bonus = 0;
        
        // 이동 횟수 보너스 (운도 실력이므로 모든 경우에 보상)
        if (M <= M_star * 1.1) bonus += 10; // 최적의 10% 이내
        if (M <= M_star * 1.2) bonus += 7; // 최적의 20% 이내
        if (M <= M_star * 1.3) bonus += 5; // 최적의 30% 이내
        if (M <= M_star * 1.5) bonus += 3; // 최적의 50% 이내
        
        // 시간 보너스
        if (T <= T_star) bonus += 8; // 최적 시간 달성
        if (T <= T_star * 1.2) bonus += 5; // 최적 시간의 20% 이내
        if (T <= T_star * 1.5) bonus += 3; // 최적 시간의 50% 이내
        
        // 최종 점수 (소수점 둘째자리까지, 최대 100점)
        const finalScore = Math.max(0, Math.min(100, Math.round((baseScore + bonus) * 100) / 100));
        
        return finalScore;
    }
    
    gameContainer.innerHTML = `
        <div class="game-container">
            <div class="game-info">
                <span>이동 횟수: <span id="moves">0</span></span>
                <span>맞춘 쌍: <span id="pairs">0</span>/8</span>
                <span>목표: 최소 이동으로 모든 쌍을 맞추세요</span>
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
            setTimeout(() => checkMatch(), 1000);
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
                const finalScore = calculateMemoryScore(moves, timeTaken);
                
                setTimeout(() => {
                    alert(`🎉 축하합니다! ${moves}번의 이동으로 모든 카드를 맞췄습니다! (${timeTaken}초)\n최종 점수: ${finalScore}점`);
                    updateGameStats('memory-card', finalScore, timeTaken);
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
    
    newGameBtn.addEventListener('click', () => window.Games.loadMemoryCardGame(deps));
};


