require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// YouTube API 설정
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// API 엔드포인트
app.post('/api/youtube/search', async (req, res) => {
    try {
        const { query, maxResults = 30 } = req.body;
        
        // 검색 요청
        const searchResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
            params: {
                key: YOUTUBE_API_KEY,
                q: query,
                part: 'snippet',
                type: 'video',
                order: 'relevance',
                maxResults
            }
        });

        const videos = searchResponse.data.items;
        const detailedData = await Promise.all(
            videos.map(async (video) => {
                const [videoStats, channelStats] = await Promise.all([
                    getVideoStats(video.id.videoId),
                    getChannelStats(video.snippet.channelId)
                ]);

                return {
                    title: video.snippet.title,
                    videoId: video.id.videoId,
                    publishedAt: video.snippet.publishedAt,
                    viewCount: videoStats.viewCount,
                    likeCount: videoStats.likeCount,
                    commentCount: videoStats.commentCount,
                    channelTitle: video.snippet.channelTitle,
                    subscriberCount: channelStats.subscriberCount,
                    totalVideos: channelStats.videoCount,
                    url: `https://www.youtube.com/watch?v=${video.id.videoId}`
                };
            })
        );

        res.json(detailedData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            details: error.message 
        });
    }
});

// 비디오 통계 가져오기
async function getVideoStats(videoId) {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
            key: YOUTUBE_API_KEY,
            id: videoId,
            part: 'statistics'
        }
    });
    return response.data.items[0].statistics;
}

// 채널 통계 가져오기
async function getChannelStats(channelId) {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
        params: {
            key: YOUTUBE_API_KEY,
            id: channelId,
            part: 'statistics'
        }
    });
    return response.data.items[0].statistics;
}

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 