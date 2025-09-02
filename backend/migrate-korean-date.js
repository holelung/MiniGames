const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrateKoreanDate() {
    try {
        await client.connect();
        console.log('✅ MongoDB에 연결되었습니다.');
        
        const db = client.db('games');
        const collection = db.collection('game_stats');
        
        // koreanDate가 없는 문서들을 찾아서 업데이트
        const documentsToUpdate = await collection.find({ 
            koreanDate: { $exists: false } 
        }).toArray();
        
        console.log(`📊 업데이트할 문서 수: ${documentsToUpdate.length}`);
        
        if (documentsToUpdate.length > 0) {
            for (const doc of documentsToUpdate) {
                const koreanDate = new Date(doc.date).toLocaleString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                
                await collection.updateOne(
                    { _id: doc._id },
                    { $set: { koreanDate: koreanDate } }
                );
                
                console.log(`✅ 문서 업데이트 완료: ${doc._id} - ${koreanDate}`);
            }
            
            console.log('🎉 모든 문서의 koreanDate 마이그레이션이 완료되었습니다!');
        } else {
            console.log('ℹ️ 업데이트할 문서가 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB 연결이 종료되었습니다.');
    }
}

// 스크립트 실행
migrateKoreanDate();
