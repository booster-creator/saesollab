// YouTube API 관련 함수들
const axios = require('axios');

async function searchVideos(keyword, apiKey) {
    if (!apiKey) {
        throw new Error('YouTube API Key is required');
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            key: apiKey,
            q: keyword,
            part: 'snippet',
            type: 'video',
            maxResults: 50
        }
    });
    return response.data;
}

async function getVideoStats(videoIds, apiKey) {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
            key: apiKey,
            id: videoIds,
            part: 'statistics'
        }
    });
    return response.data;
}

async function getChannelStats(channelIds, apiKey) {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
            key: apiKey,
            id: channelIds,
            part: 'statistics'
        }
    });
    return response.data;
}

async function enrichVideoData(videos, apiKey) {
    // 비디오 ID 추출
    const videoIds = videos.items.map(item => item.id.videoId).join(',');
    const channelIds = videos.items.map(item => item.snippet.channelId).join(',');

    // 상세 정보 수집
    const [videoStats, channelStats] = await Promise.all([
        getVideoStats(videoIds, apiKey),
        getChannelStats(channelIds, apiKey)
    ]);

    // 데이터 병합
    return videos.items.map(item => {
        const videoStat = videoStats.items.find(v => v.id === item.id.videoId)?.statistics || {};
        const channelStat = channelStats.items.find(c => c.id === item.snippet.channelId)?.statistics || {};
        
        return {
            id: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails?.high?.url,
            statistics: {
                viewCount: videoStat.viewCount || '0',
                likeCount: videoStat.likeCount || '0',
                subscriberCount: channelStat.subscriberCount || '0'
            }
        };
    });
}

module.exports = {
    searchVideos,
    enrichVideoData,
    getVideoStats,
    getChannelStats
}; 