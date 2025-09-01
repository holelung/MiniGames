const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB 연결
const uri = process.env.MONGODB_URI || "mongodb+srv://junho20435642_db_user:j0qyq5aBZCOGVhAw@cluster0.vkbticy.mongodb.net/games?retryWrites=true&w=majority";
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
            createdAt: new Date()
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
        // typing은 10단어 완료 시간(초)을 score로 저장하므로 낮을수록 좋음
        const sortOrder = ['number-guess', 'memory-card', 'puzzle', 'reaction', 'typing'].includes(gameType) 
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
                date: entry.date
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
        
        // 게임 타입별로 정렬 기준 결정 (typing은 초가 낮을수록 좋음)
        const sortOrder = ['number-guess', 'memory-card', 'puzzle', 'reaction', 'typing'].includes(gameType) 
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
                date: bestRecord[0].date
            });
        } else {
            res.json({
                success: true,
                gameType,
                bestScore: 0,
                playerName: null,
                playerId: null,
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
        const gameTypes = ['number-guess', 'memory-card', 'puzzle', 'typing', 'color-match', 'reaction'];
        const bestScores = {};
        
        for (const gameType of gameTypes) {
            // 게임 타입별로 정렬 기준 결정 (typing은 초가 낮을수록 좋음)
            const sortOrder = ['number-guess', 'memory-card', 'puzzle', 'reaction', 'typing'].includes(gameType) 
                ? { score: 1 }  // 낮을수록 좋음
                : { score: -1 }; // 높을수록 좋음
            
            const bestRecord = await db.collection('game_stats')
                .find({ gameType })
                .sort(sortOrder)
                .limit(1)
                .toArray();
            
            if (bestRecord.length > 0) {
                bestScores[gameType] = {
                    bestScore: bestRecord[0].score,
                    playerName: bestRecord[0].playerName || '익명',
                    playerId: bestRecord[0].playerId,
                    date: bestRecord[0].date
                };
            } else {
                bestScores[gameType] = {
                    bestScore: 0,
                    playerName: null,
                    playerId: null,
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
            const lowerIsBetter = ['number-guess', 'memory-card', 'puzzle', 'reaction', 'typing'];
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
        
        // 게임별 통계
        const gameStats = await db.collection('game_stats').aggregate([
            {
                $group: {
                    _id: '$gameType',
                    totalGames: { $sum: 1 },
                    avgScore: { $avg: '$score' },
                    bestScore: { $min: '$score' },
                    worstScore: { $max: '$score' },
                    totalTime: { $sum: '$time' }
                }
            }
        ]).toArray();
        
        res.json({
            success: true,
            totalGames,
            totalTime,
            gameStats
        });
        
    } catch (error) {
        console.error('❌ 전체 통계 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 서버 시작
async function startServer() {
    await connectToDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
        console.log(`📱 http://localhost:${PORT} 에서 접속하세요`);
    });
}

startServer().catch(console.error);
