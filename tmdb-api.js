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
            let apiUrl;
            
            // Check if it's a mood or direct genre
            if (this.MOOD_TO_GENRES[moodOrGenre]) {
                apiUrl = `/api/movies?mood=${moodOrGenre}`;
            } else if (this.GENRES[moodOrGenre]) {
                apiUrl = `/api/movies?genreId=${this.GENRES[moodOrGenre]}`;
            } else {
                apiUrl = `/api/movies?genreId=28`; // Default to Action
            }
            
            const response = await cachedFetch.fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.movies) {
                return data.movies.map(movie => ({
                    Title: movie.title,
                    Year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
                    imdbID: `tmdb_${movie.id}`,
                    Poster: movie.poster_path || 'N/A',
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
            const response = await cachedFetch.fetch(`/api/movies?genreId=28`);
            const data = await response.json();
            
            if (data.success && data.movies) {
                const movie = data.movies.find(m => m.id == tmdbId) || data.movies[0];
                return {
                    Title: movie.title,
                    Year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
                    Runtime: 'N/A',
                    Genre: this.getGenreNames(movie.genre_ids).join(', '),
                    Plot: movie.overview || 'No plot available.',
                    imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
                    Poster: movie.poster_path || 'N/A'
                };
            }
            return {};
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