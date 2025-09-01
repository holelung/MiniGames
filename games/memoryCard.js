// Memory Card game module
window.Games = window.Games || {};
window.Games.loadMemoryCardGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

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
    
    newGameBtn.addEventListener('click', () => window.Games.loadMemoryCardGame(deps));
};


