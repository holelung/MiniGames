const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// package.json에서 버전 정보 읽기 (Render 구조에 맞게 루트의 package.json 사용)
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const APP_VERSION = packageJson.version;

// 디버깅을 위한 로그 추가
console.log('📦 package.json 경로:', path.join(__dirname, '..', 'package.json'));
console.log('📦 읽어온 버전:', packageJson.version);
console.log('📦 전체 package.json:', JSON.stringify(packageJson, null, 2));

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB 연결
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI 환경변수가 설정되지 않았습니다!');
    console.error('❌ .env 파일에 MONGODB_URI를 설정하거나 환경변수를 설정해주세요.');
    process.exit(1);
}
const client = new MongoClient(uri);

// 데이터베이스 연결 함수
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('✅ MongoDB에 성공적으로 연결되었습니다!');
        
        // 데이터베이스와 컬렉션 확인
        const db = client.db('games');
        const collections = await db.listCollections().toArray();
        console.log('📊 사용 가능한 컬렉션:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('❌ MongoDB 연결 실패:', error);
        process.exit(1);
    }
}

// 게임 통계 저장 API
app.post('/api/game-stats', async (req, res) => {
    try {
        const { gameType, playerId, playerName, score, time, difficulty = 'normal' } = req.body;
        
        if (!gameType || !playerId || score === undefined) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }

        const gameData = {
            gameType,
            playerId,
            playerName: playerName || '익명',
            score,
            time: time || 0,
            difficulty,
            date: new Date(),
            createdAt: new Date(),
            koreanDate: new Date().toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        };

        const db = client.db('games');
        const result = await db.collection('game_stats').insertOne(gameData);
        
        console.log(`🎮 게임 통계 저장됨: ${gameType} - ${playerName || '익명'} (${playerId}) - ${score}점`);
        
        res.json({
            success: true,
            message: '게임 통계가 저장되었습니다!',
            data: { id: result.insertedId, ...gameData }
        });
        
    } catch (error) {
        console.error('❌ 게임 통계 저장 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 게임별 최고 기록 조회 API
app.get('/api/leaderboard/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        const { limit = 10 } = req.query;
        
        const db = client.db('games');
        
        // 게임 타입별로 정렬 기준 결정
        // typing은 새로운 점수 계산 방식으로 높을수록 좋음
        // memory-card는 새로운 점수 계산 방식으로 높을수록 좋음
        // puzzle은 새로운 점수 계산 방식으로 높을수록 좋음
        // tetris는 점수가 높을수록 좋음
        const sortOrder = ['number-guess', 'reaction'].includes(gameType) 
            ? { score: 1 }  // 낮을수록 좋음
            : { score: -1 }; // 높을수록 좋음
        
        const leaderboard = await db.collection('game_stats')
            .find({ gameType })
            .sort(sortOrder)
            .limit(parseInt(limit))
            .toArray();
        
        res.json({
            success: true,
            gameType,
            leaderboard: leaderboard.map((entry, index) => ({
                rank: index + 1,
                playerId: entry.playerId,
                playerName: entry.playerName || '익명',
                score: entry.score,
                time: entry.time,
                difficulty: entry.difficulty,
                date: entry.date,
                koreanDate: entry.koreanDate
            }))
        });
        
    } catch (error) {
        console.error('❌ 리더보드 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 게임별 최고 기록 조회 API (단일 최고 기록)
app.get('/api/best-score/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        
        const db = client.db('games');
        
        // 게임 타입별로 정렬 기준 결정 (typing은 점수가 높을수록 좋음)
        const sortOrder = ['number-guess', 'reaction'].includes(gameType) 
            ? { score: 1 }  // 낮을수록 좋음
            : { score: -1 }; // 높을수록 좋음
        
        const bestRecord = await db.collection('game_stats')
            .find({ gameType })
            .sort(sortOrder)
            .limit(1)
            .toArray();
        
        if (bestRecord.length > 0) {
            res.json({
                success: true,
                gameType,
                bestScore: bestRecord[0].score,
                playerName: bestRecord[0].playerName || '익명',
                playerId: bestRecord[0].playerId,
                difficulty: bestRecord[0].difficulty,
                date: bestRecord[0].date
            });
        } else {
            res.json({
                success: true,
                gameType,
                bestScore: 0,
                playerName: null,
                playerId: null,
                difficulty: null,
                date: null
            });
        }
        
    } catch (error) {
        console.error('❌ 최고 기록 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 전체 게임별 최고 기록 조회 API
app.get('/api/best-scores', async (req, res) => {
    try {
        const db = client.db('games');
        const gameTypes = ['number-guess', 'memory-card', 'puzzle', 'typing', 'color-match', 'reaction', 'tetris'];
        const bestScores = {};
        
        for (const gameType of gameTypes) {
            // 게임 타입별로 정렬 기준 결정 (tetris는 점수가 높을수록 좋음)
            const sortOrder = ['number-guess', 'reaction'].includes(gameType) 
                ? { score: 1 }  // 낮을수록 좋음
                : { score: -1 }; // 높을수록 좋음
            
            console.log(`🔍 ${gameType} 정렬 기준:`, sortOrder);
            
            const bestRecord = await db.collection('game_stats')
                .find({ gameType })
                .sort(sortOrder)
                .limit(1)
                .toArray();
            
            if (bestRecord.length > 0) {
                console.log(`✅ ${gameType} 최고 기록:`, bestRecord[0].score, bestRecord[0].playerName);
                bestScores[gameType] = {
                    bestScore: bestRecord[0].score,
                    playerName: bestRecord[0].playerName || '익명',
                    playerId: bestRecord[0].playerId,
                    difficulty: bestRecord[0].difficulty,
                    date: bestRecord[0].date
                };
            } else {
                console.log(`ℹ️ ${gameType} 기록 없음`);
                bestScores[gameType] = {
                    bestScore: 0,
                    playerName: null,
                    playerId: null,
                    difficulty: null,
                    date: null
                };
            }
        }
        
        res.json({
            success: true,
            bestScores
        });
        
    } catch (error) {
        console.error('❌ 전체 최고 기록 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 플레이어별 통계 조회 API
app.get('/api/player-stats/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        
        const db = client.db('games');
        
        // 플레이어의 모든 게임 통계 조회
        const stats = await db.collection('game_stats')
            .find({ playerId })
            .toArray();
        
        // 게임별 최고 기록 계산
        const bestScores = {};
        const totalGames = stats.length;
        
        stats.forEach(stat => {
            const { gameType, score } = stat;
            const lowerIsBetter = ['number-guess', 'reaction'];
            if (!bestScores[gameType] || (lowerIsBetter.includes(gameType) ? score < bestScores[gameType] : score > bestScores[gameType])) {
                bestScores[gameType] = score;
            }
        });
        
        res.json({
            success: true,
            playerId,
            totalGames,
            bestScores,
            recentGames: stats.slice(-5).reverse() // 최근 5게임
        });
        
    } catch (error) {
        console.error('❌ 플레이어 통계 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 전체 통계 조회 API
app.get('/api/overall-stats', async (req, res) => {
    try {
        const db = client.db('games');
        
        // 전체 게임 수
        const totalGames = await db.collection('game_stats').countDocuments();
        
        // 총 플레이시간 (초 단위)
        const totalTimeResult = await db.collection('game_stats').aggregate([
            {
                $group: {
                    _id: null,
                    totalTime: { $sum: '$time' }
                }
            }
        ]).toArray();
        const totalTime = totalTimeResult.length > 0 ? totalTimeResult[0].totalTime : 0;
        
        // 게임별 통계 (퍼즐과 색상 맞추기는 높은 점수가 좋음)
        const gameStats = await db.collection('game_stats').aggregate([
            {
                $group: {
                    _id: '$gameType',
                    totalGames: { $sum: 1 },
                    avgScore: { $avg: '$score' },
                    minScore: { $min: '$score' },
                    maxScore: { $max: '$score' },
                    totalTime: { $sum: '$time' }
                }
            }
        ]).toArray();
        
        // 각 게임별로 최고/최저 점수 계산 (게임 타입에 따라 다름)
        const processedGameStats = gameStats.map(stat => {
            const gameType = stat._id;
            const lowerIsBetter = ['number-guess', 'reaction'];
            
            if (lowerIsBetter.includes(gameType)) {
                // 낮은 점수가 좋은 게임들
                return {
                    ...stat,
                    bestScore: stat.minScore,
                    worstScore: stat.maxScore
                };
            } else {
                // 높은 점수가 좋은 게임들 (puzzle, color-match, memory-card, typing)
                return {
                    ...stat,
                    bestScore: stat.maxScore,
                    worstScore: stat.minScore
                };
            }
        });
        
        res.json({
            success: true,
            totalGames,
            totalTime,
            gameStats: processedGameStats
        });
        
    } catch (error) {
        console.error('❌ 전체 통계 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 앱 정보 API (버전 등)
app.get('/api/app-info', async (req, res) => {
    try {
        // 캐시 무효화 헤더 추가
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        res.json({
            success: true,
            version: APP_VERSION,
            name: packageJson.name,
            description: packageJson.description,
            author: packageJson.author,
            license: packageJson.license
        });
    } catch (error) {
        console.error('❌ 앱 정보 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 서버 시작
async function startServer() {
    await connectToDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
        console.log(`📱 http://localhost:${PORT} 에서 접속하세요`);
        console.log(`📦 앱 버전: v${APP_VERSION}`);
    });
}

startServer().catch(console.error);
