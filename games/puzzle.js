// Sliding Puzzle game module
window.Games = window.Games || {};
window.Games.loadPuzzleGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

    const size = 3;
    let tiles = Array.from({length: size * size - 1}, (_, i) => i + 1);
    tiles.push(0);
    let moves = 0;
    let gameStartTime = Date.now();
    
    // 퍼즐 설정 (3x3 기준)
    const PUZZLE_CONFIG = {
        optimalMoves: 80,
        timeCoefficient: 0.6,
        optimalTime: 48 // 0.6 * 80
    };
    
    // 새로운 점수 계산 함수
    function calculatePuzzleScore(moves, timeSeconds) {
        const M = moves;
        const T = timeSeconds;
        const M_star = PUZZLE_CONFIG.optimalMoves;
        const T_star = PUZZLE_CONFIG.optimalTime;
        
        // 정규화 효율
        const E_m = Math.min(1, M_star / M);
        const E_t = Math.min(1, T_star / T);
        
        // 가중 조화평균
        const w_m = 0.6, w_t = 0.4;
        const E = (w_m + w_t) / (w_m/E_m + w_t/E_t);
        
        // 기본 점수
        const baseScore = 80 * E;
        
        // 보너스 점수
        let bonus = 0;
        if (M <= M_star) bonus += 10;
        if (T <= T_star) bonus += 5;
        if (M <= M_star && T <= T_star) bonus += 5;
        
        // 최종 점수 (소수점 둘째자리까지)
        const finalScore = Math.round((baseScore + bonus) * 100) / 100;
        
        return finalScore;
    }
    
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
            if (tiles.slice(0, -1).every((tile, i) => tile === i + 1) && tiles[tiles.length - 1] === 0) {
                const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
                const finalScore = calculatePuzzleScore(moves, timeTaken);
                
                setTimeout(() => {
                    alert(`🎉 축하합니다! ${moves}번의 이동으로 퍼즐을 완성했습니다! (${timeTaken}초)\n최종 점수: ${finalScore}점`);
                    updateGameStats('puzzle', finalScore, timeTaken);
                }, 500);
            }
        }
    }
    
    renderPuzzle();
    newGameBtn.addEventListener('click', () => window.Games.loadPuzzleGame(deps));
};


