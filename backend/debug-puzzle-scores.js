const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function debugPuzzleScores() {
    try {
        await client.connect();
        console.log('✅ MongoDB에 연결되었습니다.');
        
        const db = client.db('games');
        const collection = db.collection('game_stats');
        
        // 퍼즐 게임 데이터 조회 (점수 순으로 정렬)
        const puzzleRecords = await collection.find({ gameType: 'puzzle' })
            .sort({ score: -1 }) // 높은 점수 순으로 정렬
            .toArray();
        
        console.log(`📊 퍼즐 게임 데이터 수: ${puzzleRecords.length}`);
        console.log('\n🏆 퍼즐 게임 랭킹 (점수 순):');
        console.log('순위 | 점수 | 플레이어 | 시간(초) | 날짜');
        console.log('-----|------|----------|----------|------');
        
        puzzleRecords.forEach((record, index) => {
            const rank = index + 1;
            const score = record.score;
            const player = record.playerName || '익명';
            const time = record.time;
            const date = record.koreanDate || record.date;
            
            console.log(`${rank.toString().padStart(2)}위 | ${score.toString().padStart(6)} | ${player.padEnd(8)} | ${time.toString().padStart(8)} | ${date}`);
        });
        
        // 낮은 점수 순으로도 확인
        console.log('\n📉 퍼즐 게임 랭킹 (낮은 점수 순):');
        const lowScoreRecords = await collection.find({ gameType: 'puzzle' })
            .sort({ score: 1 }) // 낮은 점수 순으로 정렬
            .toArray();
        
        lowScoreRecords.forEach((record, index) => {
            const rank = index + 1;
            const score = record.score;
            const player = record.playerName || '익명';
            const time = record.time;
            
            console.log(`${rank.toString().padStart(2)}위 | ${score.toString().padStart(6)} | ${player.padEnd(8)} | ${time.toString().padStart(8)}`);
        });
        
    } catch (error) {
        console.error('❌ 디버깅 실패:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB 연결이 종료되었습니다.');
    }
}

// 스크립트 실행
debugPuzzleScores();
