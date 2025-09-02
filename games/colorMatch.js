// Color Match game module
window.Games = window.Games || {};
window.Games.loadColorMatchGame = function(deps) {
    const { gameContainer, updateGameStats } = deps;

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
                <div class="game-instruction" style="text-align: center; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">
                    📝 <strong>게임 룰:</strong> 아래 텍스트의 <strong>색상</strong>과 같은 색상의 버튼을 선택하세요!
                </div>
                <div id="color-display" style="width: 180px; height: 80px; margin: 0.5rem auto; border-radius: 10px; border: 3px solid var(--border-color);"></div>
                <div id="color-text" style="font-size: 1.3rem; margin: 0.5rem 0; color: var(--text-primary); font-weight: bold;"></div>
                <div class="game-instruction" style="text-align: center; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.75rem;">
                    ↓ 텍스트 색상과 같은 버튼을 클릭하세요 ↓
                </div>
                <div id="color-options" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; max-width: 350px; margin: 0 auto;"></div>
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
        
        colorOptions.innerHTML = '';
        
        // 정답 색상을 포함한 3개 옵션 생성
        const otherColors = colors.filter(color => color !== textColor);
        const shuffledOthers = [...otherColors].sort(() => Math.random() - 0.5);
        const optionColors = [textColor, ...shuffledOthers.slice(0, 2)];
        
        // 옵션들을 섞어서 배치
        const shuffledOptions = optionColors.sort(() => Math.random() - 0.5);
        
        shuffledOptions.forEach(color => {
            const option = document.createElement('button');
            option.className = 'btn btn-primary';
            option.style.cssText = `
                width: 100%;
                height: 50px; /* 60px에서 50px로 감소 */
                background: ${color};
                border: 3px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            `;
            
            // 호버 효과 추가
            option.addEventListener('mouseenter', () => {
                option.style.transform = 'scale(1.05)';
                option.style.borderColor = 'var(--accent-color)';
                option.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            });
            
            option.addEventListener('mouseleave', () => {
                option.style.transform = 'scale(1)';
                option.style.borderColor = 'transparent';
                option.style.boxShadow = 'none';
            });
            
            option.addEventListener('click', () => {
                // 클릭 시 시각적 피드백
                option.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    option.style.transform = 'scale(1)';
                }, 150);
                checkAnswer(color, textColor);
            });
            
            colorOptions.appendChild(option);
        });
    }
    
    // 새로운 점수 계산 함수 (100점 만점, 밀리초 단위)
    function calculateScore(accuracy, timeTakenMs) {
        // 정답률 점수 (10%)
        const accuracyScore = (accuracy / 100) * 10;
        
        // 걸린시간 점수 (90%) - 밀리초 단위로 더 정밀한 계산
        const timeTakenSeconds = timeTakenMs / 1000; // 밀리초를 초로 변환
        
        let timeScore;
        if (timeTakenSeconds <= 10) {
            timeScore = 90; // 10초까지는 만점
        } else {
            // 10초 이후로는 선형적으로 감소 (10초 = 90점, 100초 = 0점)
            timeScore = Math.max(0, 90 - ((timeTakenSeconds - 10) * 1)); // 1초당 1점씩 감소
        }
        
        // 총점 계산 (소수점 둘째자리까지 반올림 - 더 정밀한 점수)
        const totalScore = Math.round((accuracyScore + timeScore) * 100) / 100;
        
        return Math.max(0, Math.min(100, totalScore)); // 0~100점 범위 제한
    }
    
    function checkAnswer(selectedColor, correctColor) {
        totalAnswers++;
        if (selectedColor === correctColor) correctAnswers++;
        correctSpan.textContent = correctAnswers;
        accuracySpan.textContent = Math.round((correctAnswers / totalAnswers) * 100);
        if (totalAnswers >= 10) {
            const timeTakenMs = Date.now() - gameStartTime; // 밀리초 단위로 시간 측정
            const timeTakenSeconds = Math.round(timeTakenMs / 1000 * 100) / 100; // 소수점 둘째자리까지 표시
            const accuracy = Math.round((correctAnswers / totalAnswers) * 100);
            const finalScore = calculateScore(accuracy, timeTakenMs);
            
            setTimeout(() => {
                alert(`게임 종료!\n정확도: ${accuracy}%\n걸린 시간: ${timeTakenSeconds}초\n최종 점수: ${finalScore}점`);
                updateGameStats('color-match', finalScore, timeTakenSeconds); // 밀리초를 초로 변환한 값을 저장
            }, 500);
        } else {
            roundSpan.textContent = totalAnswers + 1;
            setTimeout(generateRound, 1000);
        }
    }
    
    newGameBtn.addEventListener('click', () => window.Games.loadColorMatchGame(deps));
    
    generateRound();
};


