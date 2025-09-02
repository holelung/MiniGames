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
        
        console.log('\n🔍 모든 퍼즐 게임 데이터:');
        const allRecords = await collection.find({ gameType: 'puzzle' }).toArray();
        allRecords.forEach((record, index) => {
            console.log(`${index + 1}. 점수: ${record.score}, 플레이어: ${record.playerName}, 시간: ${record.time}초`);
        });
        
        console.log('\n🏆 높은 점수 순 정렬:');
        const highToLow = await collection.find({ gameType: 'puzzle' }).sort({ score: -1 }).toArray();
        highToLow.forEach((record, index) => {
            console.log(`${index + 1}위. 점수: ${record.score}, 플레이어: ${record.playerName}`);
        });
        
        console.log('\n📉 낮은 점수 순 정렬:');
        const lowToHigh = await collection.find({ gameType: 'puzzle' }).sort({ score: 1 }).toArray();
        lowToHigh.forEach((record, index) => {
            console.log(`${index + 1}위. 점수: ${record.score}, 플레이어: ${record.playerName}`);
        });
        
        console.log('\n🎯 최고 점수:');
        const bestRecord = await collection.find({ gameType: 'puzzle' }).sort({ score: -1 }).limit(1).toArray();
        if (bestRecord.length > 0) {
            console.log(`최고 기록: ${bestRecord[0].score}점 (${bestRecord[0].playerName})`);
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
