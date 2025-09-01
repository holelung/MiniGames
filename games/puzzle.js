// Sliding Puzzle game module
window.Games = window.Games || {};
window.Games.loadPuzzleGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

    const size = 3;
    let tiles = Array.from({length: size * size - 1}, (_, i) => i + 1);
    tiles.push(0);
    let moves = 0;
    let gameStartTime = Date.now();
    
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
                setTimeout(() => {
                    alert(`🎉 축하합니다! ${moves}번의 이동으로 퍼즐을 완성했습니다! (${timeTaken}초)`);
                    updateGameStats('puzzle', moves, timeTaken);
                }, 500);
            }
        }
    }
    
    renderPuzzle();
    newGameBtn.addEventListener('click', () => window.Games.loadPuzzleGame(deps));
};


