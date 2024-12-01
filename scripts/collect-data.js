const { searchVideos, enrichVideoData } = require('./lib/youtube-api');
const config = require('./config/default');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function collectData() {
    const keywords = await config.getKeywords();
    console.log('Starting data collection...');
    console.log('Using API Key:', process.env.YOUTUBE_API_KEY?.substring(0, 5) + '...');
    const results = [];

    for (const keyword of keywords) {
        try {
            console.log(`Processing keyword: ${keyword}`);
            const searchResults = await searchVideos(keyword, process.env.YOUTUBE_API_KEY);
            const enrichedResults = await enrichVideoData(searchResults, process.env.YOUTUBE_API_KEY);
            
            results.push({
                keyword,
                timestamp: new Date().toISOString(),
                data: enrichedResults
            });

            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error processing keyword ${keyword}:`, error);
        }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(config.storage.basePath, 
        `youtube-data-${timestamp}.json`);
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(`Data saved to: ${outputPath}`);
}

// 실행
if (require.main === module) {
    collectData()
        .catch(console.error)
        .finally(() => console.log('Collection process completed'));
} 