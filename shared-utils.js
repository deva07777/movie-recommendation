// Shared utilities and API handlers
const OMDB_API_KEY = 'e5731106';

// Movie recommendation tracker to prevent repetition
class RecommendationTracker {
    constructor() {
        this.recommendedMovies = new Set(JSON.parse(localStorage.getItem('recommendedMovies') || '[]'));
        this.weatherCache = new Map();
    }

    addRecommended(movieId) {
        this.recommendedMovies.add(movieId);
        localStorage.setItem('recommendedMovies', JSON.stringify([...this.recommendedMovies]));
    }

    isRecommended(movieId) {
        return this.recommendedMovies.has(movieId);
    }

    clearRecommended() {
        this.recommendedMovies.clear();
        localStorage.removeItem('recommendedMovies');
    }

    cacheWeather(lat, lon, data) {
        const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
        this.weatherCache.set(key, { data, timestamp: Date.now() });
    }

    getCachedWeather(lat, lon) {
        const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
        const cached = this.weatherCache.get(key);
        if (cached && Date.now() - cached.timestamp < 600000) { // 10 minutes
            return cached.data;
        }
        return null;
    }
}

// Enhanced OMDb API wrapper
class OMDbAPI {
    static async fetchMoviesByGenre(mood) {
        const genreQueries = {
            happy: ['comedy', 'family', 'animation', 'musical'],
            sad: ['drama', 'romance', 'biography'],
            energetic: ['action', 'adventure', 'sport'],
            relaxed: ['romance', 'drama', 'documentary'],
            romantic: ['romance', 'comedy', 'drama'],
            adventurous: ['adventure', 'action', 'fantasy'],
            nostalgic: ['classic', 'drama', 'family'],
            mysterious: ['mystery', 'thriller', 'crime'],
            thrilling: ['thriller', 'horror', 'crime'],
            action: ['action', 'adventure', 'superhero'],
            default: ['popular', 'trending', 'top']
        };

        const queries = genreQueries[mood] || genreQueries.default;
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        
        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${randomQuery}&type=movie&apikey=${OMDB_API_KEY}`);
            const data = await response.json();
            
            if (data.Response === 'True') {
                const detailedMovies = await Promise.all(
                    data.Search.slice(0, 10).map(async movie => {
                        const details = await this.fetchMovieDetails(movie.imdbID);
                        return { ...movie, ...details };
                    })
                );
                return detailedMovies.filter(movie => movie.Poster !== 'N/A');
            }
            return this.getFallbackMovies();
        } catch (error) {
            console.error('API Error:', error);
            return this.getFallbackMovies();
        }
    }

    static async fetchMovieDetails(imdbID) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
            return await response.json();
        } catch (error) {
            return {};
        }
    }

    static getFallbackMovies() {
        return [
            { Title: 'The Dark Knight', Year: '2008', imdbID: 'tt0468569', Poster: 'https://via.placeholder.com/300x450?text=The+Dark+Knight', Plot: 'Batman faces the Joker in this epic superhero film.', imdbRating: '9.0' },
            { Title: 'Inception', Year: '2010', imdbID: 'tt1375666', Poster: 'https://via.placeholder.com/300x450?text=Inception', Plot: 'A thief enters dreams to plant ideas.', imdbRating: '8.8' },
            { Title: 'Interstellar', Year: '2014', imdbID: 'tt0816692', Poster: 'https://via.placeholder.com/300x450?text=Interstellar', Plot: 'A space odyssey to save humanity.', imdbRating: '8.6' }
        ];
    }
}

// Trailer utility
class TrailerUtils {
    static openTrailer(movie) {
        if (!movie) return;
        const query = encodeURIComponent(`${movie.Title} ${movie.Year} trailer`);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
}

// Initialize global instances
const recommendationTracker = new RecommendationTracker();