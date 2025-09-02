const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// 퍼즐 게임 점수 계산 함수 (새로운 방식)
function calculatePuzzleScore(moves, timeSeconds) {
    const M = moves;
    const T = timeSeconds;
    const M_star = 80; // 최적 이동 수
    const T_star = 48; // 기준 시간 (0.6 * 80)
    
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

async function migratePuzzleScores() {
    try {
        await client.connect();
        console.log('✅ MongoDB에 연결되었습니다.');
        
        const db = client.db('games');
        const collection = db.collection('game_stats');
        
        // 퍼즐 게임 데이터 조회
        const puzzleRecords = await collection.find({ gameType: 'puzzle' }).toArray();
        
        console.log(`📊 퍼즐 게임 데이터 수: ${puzzleRecords.length}`);
        
        if (puzzleRecords.length > 0) {
            let updatedCount = 0;
            
            for (const record of puzzleRecords) {
                // 기존 데이터가 이동 횟수인지 확인 (score가 100 이하인 경우)
                if (record.score <= 100 && record.score > 0) {
                    // 기존 이동 횟수를 새로운 점수로 변환
                    const newScore = calculatePuzzleScore(record.score, record.time);
                    
                    await collection.updateOne(
                        { _id: record._id },
                        { $set: { score: newScore } }
                    );
                    
                    console.log(`✅ 퍼즐 점수 업데이트: ${record.score} → ${newScore} (이동: ${record.score}, 시간: ${record.time}초)`);
                    updatedCount++;
                } else {
                    console.log(`ℹ️ 이미 변환된 데이터 스킵: ${record.score}`);
                }
            }
            
            console.log(`🎉 퍼즐 게임 점수 마이그레이션 완료! ${updatedCount}개 데이터 업데이트`);
        } else {
            console.log('ℹ️ 업데이트할 퍼즐 게임 데이터가 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error);
    } finally {
        await client.close();
        console.log('🔌 MongoDB 연결이 종료되었습니다.');
    }
}

// 스크립트 실행
migratePuzzleScores();
