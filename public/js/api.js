class YouTubeAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/youtube';
    }

    async searchVideos(query, maxResults = 30) {
        try {
            const response = await fetch(`${this.baseUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, maxResults })
            });

            if (!response.ok) {
                throw new Error('API 요청 실패');
            }

            return await response.json();
        } catch (error) {
            throw new Error(`검색 중 오류 발생: ${error.message}`);
        }
    }
} 