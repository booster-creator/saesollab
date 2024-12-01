const fs = require('fs').promises;
const path = require('path');

async function loadExistingVideos(obsidianDir, keyword) {
    try {
        const files = await fs.readdir(obsidianDir);
        const existingIds = new Set();
        
        // 해당 키워드의 기존 파일들을 확인
        for (const file of files) {
            if (file.startsWith(keyword + '-')) {
                const content = await fs.readFile(path.join(obsidianDir, file), 'utf-8');
                // URL에서 비디오 ID 추출
                const matches = content.matchAll(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g);
                for (const match of matches) {
                    existingIds.add(match[1]);
                }
            }
        }
        return existingIds;
    } catch (error) {
        console.log('기존 파일 확인 중 오류:', error);
        return new Set();
    }
}

async function generateMarkdown(jsonFilePath) {
    const data = JSON.parse(await fs.readFile(jsonFilePath, 'utf-8'));
    const timestamp = new Date().toISOString().split('T')[0];
    const obsidianDir = process.env.OBSIDIAN_DIR || path.join(__dirname, '../obsidian');
    await fs.mkdir(obsidianDir, { recursive: true });
    
    for (const { keyword, data: videos } of data) {
        // 기존 비디오 ID 목록 가져오기
        const existingIds = await loadExistingVideos(obsidianDir, keyword);
        
        // 새로운 비디오만 필터링
        const newVideos = videos.filter(video => !existingIds.has(video.id));
        
        if (newVideos.length === 0) {
            console.log(`${keyword}: 새로운 영상이 없습니다.`);
            continue;
        }

        const markdown = `---
title: ${keyword} 관련 YouTube 영상 모음 (${timestamp})
date: ${timestamp}
tags: [youtube, ${keyword}, research]
---

# ${keyword} 관련 YouTube 영상 모음
수집일: ${timestamp}
새로 추가된 영상 수: ${newVideos.length}개

## 새로 추가된 영상 목록

${newVideos.map(video => `
### ${video.title}
- **채널**: ${video.channelTitle}
- **URL**: [바로가기](https://youtube.com/watch?v=${video.id})
- **조회수**: ${parseInt(video.statistics.viewCount).toLocaleString()}회
- **구독자**: ${parseInt(video.statistics.subscriberCount).toLocaleString()}명
- **업로드**: ${new Date(video.publishedAt).toLocaleDateString()}

![썸네일](${video.thumbnail})

---`).join('\n')}
`;
        
        const markdownPath = path.join(obsidianDir, `${keyword}-${timestamp}.md`);
        await fs.writeFile(markdownPath, markdown);
        
        console.log(`마크다운 파일 생성 완료: ${markdownPath} (새로운 영상: ${newVideos.length}개)`);
    }
}

// 가장 최근 JSON 파일로 마크다운 생성
async function generateLatest() {
    const dir = path.join(__dirname, '../data/collected');
    const files = await fs.readdir(dir);
    const latest = files
        .filter(f => f.startsWith('youtube-data-'))
        .sort()
        .pop();
    
    if (latest) {
        console.log(`처리할 파일: ${latest}`);
        await generateMarkdown(path.join(dir, latest));
    }
}

generateLatest().catch(console.error); 