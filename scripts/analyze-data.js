const fs = require('fs').promises;
const path = require('path');

async function analyzeData(filePath) {
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    data.forEach(({ keyword, data: videos }) => {
        console.log(`\n=== ${keyword} 분석 ===`);
        console.log(`총 영상 수: ${videos.length}`);
        
        // 조 번째 영상의 정보 상세 출력
        const firstVideo = videos[0];
        console.log('\n첫 번째 영상 정보:');
        console.log(`제목: ${firstVideo.title}`);
        console.log(`채널: ${firstVideo.channelTitle}`);
        console.log(`URL: https://youtube.com/watch?v=${firstVideo.id}`);
        console.log(`썸네일: ${firstVideo.thumbnail}`);
        console.log(`조회수: ${parseInt(firstVideo.statistics.viewCount).toLocaleString()}`);
        console.log(`구독자: ${parseInt(firstVideo.statistics.subscriberCount).toLocaleString()}`);
    });
}

// 가장 최근 파일 분석
async function analyzeLatest() {
    const dir = path.join(__dirname, '../data/collected');
    const files = await fs.readdir(dir);
    const latest = files
        .filter(f => f.startsWith('youtube-data-'))
        .sort()
        .pop();
    
    if (latest) {
        console.log(`분석 파일: ${latest}`);
        await analyzeData(path.join(dir, latest));
    }
}

analyzeLatest().catch(console.error); 