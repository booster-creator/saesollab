const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function getKeywords() {
    try {
        const keywordsPath = path.join(__dirname, '../../data/keywords.json');
        const content = await fs.readFile(keywordsPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return ['맛집', '여행', '리뷰'];
    }
}

module.exports = {
    youtube: {
        apiKey: process.env.YOUTUBE_API_KEY,
        maxResults: 50,
        quotaPerDay: 10000
    },
    storage: {
        basePath: process.env.DATA_PATH || '../data/collected',
        format: 'json'
    },
    getKeywords
}; 