const TMDB_API_KEY = '4d79fb69b3f9cc08488718e7792ad412';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

class TMDbAPI {
    static GENRES = {
        action: 28,
        adventure: 12,
        animation: 16,
        comedy: 35,
        crime: 80,
        documentary: 99,
        drama: 18,
        family: 10751,
        fantasy: 14,
        history: 36,
        horror: 27,
        music: 10402,
        mystery: 9648,
        romance: 10749,
        'sci-fi': 878,
        thriller: 53,
        war: 10752
    };

    static MOOD_TO_GENRES = {
        happy: [35, 10749], // Comedy, Romance
        sad: [18], // Drama
        energetic: [28, 12], // Action, Adventure
        relaxed: [10749, 10751], // Romance, Family
        romantic: [10749], // Romance
        adventurous: [12, 14], // Adventure, Fantasy
        nostalgic: [18, 36], // Drama, History
        mysterious: [9648, 53], // Mystery, Thriller
        scary: [27], // Horror
        thrilling: [53, 27] // Thriller, Horror
    };

    static async fetchMoviesByGenre(moodOrGenre, page = 1) {
        try {
            let genreIds;
            
            // Check if it's a mood or direct genre
            if (this.MOOD_TO_GENRES[moodOrGenre]) {
                genreIds = this.MOOD_TO_GENRES[moodOrGenre];
            } else if (this.GENRES[moodOrGenre]) {
                genreIds = [this.GENRES[moodOrGenre]];
            } else {
                genreIds = [28]; // Default to Action
            }

            const genreString = genreIds.join(',');
            const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreString}&sort_by=popularity.desc&vote_average.gte=6.5&language=en-US&page=${page}`;
            
            const response = await cachedFetch.fetch(url);
            const data = await response.json();
            
            if (data.results) {
                return data.results.slice(0, 10).map(movie => ({
                    Title: movie.title,
                    Year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
                    imdbID: `tmdb_${movie.id}`,
                    Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'N/A',
                    Plot: movie.overview || 'No plot available.',
                    Genre: this.getGenreNames(movie.genre_ids).join(', '),
                    imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
                    Runtime: 'N/A',
                    tmdbId: movie.id
                }));
            }
            return [];
        } catch (error) {
            console.warn('TMDb API error:', error);
            return [];
        }
    }

    static async fetchMovieDetails(tmdbId) {
        try {
            const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;
            const response = await cachedFetch.fetch(url);
            const data = await response.json();
            
            return {
                Title: data.title,
                Year: data.release_date ? data.release_date.split('-')[0] : 'N/A',
                Runtime: data.runtime ? `${data.runtime} min` : 'N/A',
                Genre: data.genres ? data.genres.map(g => g.name).join(', ') : 'N/A',
                Plot: data.overview || 'No plot available.',
                imdbRating: data.vote_average ? data.vote_average.toFixed(1) : 'N/A',
                Poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'N/A'
            };
        } catch (error) {
            console.warn('TMDb details error:', error);
            return {};
        }
    }

    static getGenreNames(genreIds) {
        const genreMap = {
            28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
            80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
            14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
            9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
            53: 'Thriller', 10752: 'War', 37: 'Western'
        };
        return genreIds.map(id => genreMap[id] || 'Unknown').filter(Boolean);
    }

    static getWeatherGenres(weatherCondition) {
        const weatherMap = {
            rain: [18, 10749], // Drama, Romance
            clear: [28, 12], // Action, Adventure
            clouds: [9648, 53], // Mystery, Thriller
            snow: [10749, 10751], // Romance, Family
            thunderstorm: [53, 27], // Thriller, Horror
            fog: [9648, 27] // Mystery, Horror
        };
        return weatherMap[weatherCondition] || [28]; // Default to Action
    }
}