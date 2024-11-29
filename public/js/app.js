class YouTubeAnalyzer {
    constructor() {
        this.api = new YouTubeAPI();
        this.initializeUI();
        this.currentData = [];
    }

    initializeUI() {
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.loading = document.getElementById('loading');
        this.resultsTable = document.getElementById('resultsTable');
        this.sortSelect = document.getElementById('sortSelect');

        this.searchButton.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.sortSelect.addEventListener('change', () => this.handleSort());
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showToast('검색어를 입력해주세요');
            return;
        }

        try {
            this.showLoading(true);
            const data = await this.api.searchVideos(query);
            this.currentData = this.processData(data);
            this.handleSort();
        } catch (error) {
            this.showToast(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    processData(data) {
        return data.map(video => {
            const viewCount = parseInt(video.viewCount) || 0;
            const subscriberCount = parseInt(video.subscriberCount) || 0;
            const likeCount = parseInt(video.likeCount) || 0;
            const commentCount = parseInt(video.commentCount) || 0;

            // 구독자 수 대비 조회수 비율 (매력도) 계산
            const subscriberViewRatio = subscriberCount > 0 ? (viewCount / subscriberCount) : 0;
            const viewLikeRatio = viewCount > 0 ? (likeCount / viewCount) : 0;
            const viewCommentRatio = viewCount > 0 ? (commentCount / viewCount) : 0;

            return {
                ...video,
                viewCount,
                subscriberCount,
                likeCount,
                commentCount,
                subscriberViewRatio,    // 구독자 수 대비 조회수 비율
                viewLikeRatio,         // 조회수 대비 좋아요 비율
                viewCommentRatio,      // 조회수 대비 댓글 비율
                tension: subscriberViewRatio  // 매력도는 구독자 수 대비 조회수 비율
            };
        });
    }

    handleSort() {
        const sortType = this.sortSelect.value;
        let sortedData = [...this.currentData];

        switch (sortType) {
            case 'views':
                sortedData.sort((a, b) => b.viewCount - a.viewCount);
                break;
            case 'subscribers':
                sortedData.sort((a, b) => b.subscriberCount - a.subscriberCount);
                break;
            case 'tension':
                sortedData.sort((a, b) => b.tension - a.tension);
                break;
        }

        this.displayResults(sortedData);
    }

    displayResults(data) {
        this.resultsTable.innerHTML = data.map((video, index) => `
            <div class="video-card">
                <img 
                    class="video-thumbnail" 
                    src="https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg" 
                    alt="${video.title}"
                >
                <div class="video-info">
                    <a href="${video.url}" target="_blank" class="video-title">
                        ${video.title}
                        ${this.sortSelect.value === 'tension' ? 
                            `<span class="tension-badge">${(index + 1)}위</span>` : ''}
                    </a>
                    <div class="video-stats">
                        <div class="stat-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                            </svg>
                            ${this.formatNumber(video.viewCount)}
                        </div>
                        <div class="stat-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                            </svg>
                            ${this.formatNumber(video.likeCount)}
                        </div>
                        <div class="stat-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path>
                            </svg>
                            ${this.formatNumber(video.subscriberCount)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ko-KR').format(num);
    }

    showLoading(show) {
        this.loading.style.display = show ? 'flex' : 'none';
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }
}

// 애플리케이션 초기화
const app = new YouTubeAnalyzer(); 