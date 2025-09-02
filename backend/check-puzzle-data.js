const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function checkPuzzleData() {
    try {
        await client.connect();
        console.log('✅ MongoDB에 연결되었습니다.');
        
        const db = client.db('games');
        const collection = db.collection('game_stats');
        
        // 퍼즐 게임 데이터 조회 (정렬 없이)
        const puzzleRecords = await collection.find({ gameType: 'puzzle' }).toArray();
        
        console.log(`📊 퍼즐 게임 데이터 수: ${puzzleRecords.length}`);
        console.log('\n🔍 퍼즐 게임 데이터 상세:');
        console.log('점수 | 플레이어 | 시간(초) | 날짜 | _id');
        console.log('-----|----------|----------|------|-----');
        
        puzzleRecords.forEach((record, index) => {
            const score = record.score;
            const player = record.playerName || '익명';
            const time = record.time;
            const date = record.koreanDate || record.date;
            const id = record._id.toString().substring(0, 8) + '...';
            
            console.log(`${score.toString().padStart(5)} | ${player.padEnd(8)} | ${time.toString().padStart(8)} | ${date} | ${id}`);
        });
        
        // 서버 로직과 동일한 정렬로 확인
        console.log('\n🏆 서버 로직으로 정렬한 결과:');
        const serverSortResult = await collection.find({ gameType: 'puzzle' })
            .sort({ score: -1 }) // 높은 점수 순
            .limit(1)
            .toArray();
        
        if (serverSortResult.length > 0) {
            const best = serverSortResult[0];
            console.log(`최고 기록: ${best.score}점 (${best.playerName || '익명'})`);
        }
        
        // 낮은 점수 순으로도 확인
        console.log('\n📉 낮은 점수 순 정렬:');
        const lowScoreResult = await collection.find({ gameType: 'puzzle' })
            .sort({ score: 1 }) // 낮은 점수 순
            .limit(1)
            .toArray();
        
        if (lowScoreResult.length > 0) {
            const worst = lowScoreResult[0];
            console.log(`최저 기록: ${worst.score}점 (${worst.playerName || '익명'})`);
        }
        
    } catch (error) {
        console.error('❌ 확인 실패:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB 연결이 종료되었습니다.');
    }
}

// 스크립트 실행
checkPuzzleData();
