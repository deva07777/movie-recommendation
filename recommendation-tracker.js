class RecommendationTracker {
    constructor() {
        this.recommendedMovies = new Set(JSON.parse(localStorage.getItem('recommendedMovies') || '[]'));
        this.weatherCache = new Map();
        this.weatherCacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    addRecommendedMovie(imdbID) {
        this.recommendedMovies.add(imdbID);
        this.saveToStorage();
    }

    isMovieRecommended(imdbID) {
        return this.recommendedMovies.has(imdbID);
    }

    filterUnrecommendedMovies(movies) {
        return movies.filter(movie => !this.isMovieRecommended(movie.imdbID));
    }

    saveToStorage() {
        localStorage.setItem('recommendedMovies', JSON.stringify([...this.recommendedMovies]));
    }

    clearRecommendations() {
        this.recommendedMovies.clear();
        localStorage.removeItem('recommendedMovies');
    }

    // Weather caching methods
    cacheWeather(lat, lon, data) {
        const key = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
        this.weatherCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCachedWeather(lat, lon) {
        const key = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const cached = this.weatherCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < this.weatherCacheTimeout) {
            return cached.data;
        }
        return null;
    }
}

// Global instance
const recommendationTracker = new RecommendationTracker();