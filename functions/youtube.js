const axios = require('axios');

exports.handler = async function(event, context) {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // OPTIONS 요청 처리
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: '허용되지 않는 메소드' })
        };
    }

    try {
        const { query, maxResults = 30 } = JSON.parse(event.body);
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

        // 검색 요청
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
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
                    getVideoStats(video.id.videoId, YOUTUBE_API_KEY),
                    getChannelStats(video.snippet.channelId, YOUTUBE_API_KEY)
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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(detailedData)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: '서버 오류가 발생했습니다.',
                details: error.message 
            })
        };
    }
};

async function getVideoStats(videoId, apiKey) {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            key: apiKey,
            id: videoId,
            part: 'statistics'
        }
    });
    return response.data.items[0].statistics;
}

async function getChannelStats(channelId, apiKey) {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
            key: apiKey,
            id: channelId,
            part: 'statistics'
        }
    });
    return response.data.items[0].statistics;
} 