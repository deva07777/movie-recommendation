class OMDbAPI {
    static GENRES = {
        action: 'action',
        adventure: 'adventure',
        animation: 'animation',
        comedy: 'comedy',
        crime: 'crime',
        documentary: 'documentary',
        drama: 'drama',
        family: 'family',
        fantasy: 'fantasy',
        history: 'history',
        horror: 'horror',
        music: 'music',
        mystery: 'mystery',
        romance: 'romance',
        'sci-fi': 'sci-fi',
        thriller: 'thriller',
        war: 'war'
    };

    static MOOD_TO_GENRES = {
        happy: 'comedy',
        sad: 'drama',
        energetic: 'action',
        relaxed: 'family',
        romantic: 'romance',
        adventurous: 'adventure',
        nostalgic: 'drama',
        mysterious: 'mystery',
        scary: 'horror',
        thrilling: 'thriller'
    };

    static async fetchMoviesByGenre(moodOrGenre, page = 1) {
        try {
            let apiUrl;
            
            if (this.MOOD_TO_GENRES[moodOrGenre]) {
                apiUrl = `/api/movies?mood=${moodOrGenre}`;
            } else if (this.GENRES[moodOrGenre]) {
                apiUrl = `/api/movies?genre=${this.GENRES[moodOrGenre]}`;
            } else {
                apiUrl = `/api/movies?genre=action`;
            }
            
            const response = await cachedFetch.fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.movies) {
                return data.movies.map(movie => ({
                    Title: movie.title,
                    Year: movie.release_date || 'N/A',
                    imdbID: movie.id,
                    Poster: movie.poster_path || 'N/A',
                    Plot: movie.overview || 'No plot available.',
                    Genre: movie.genre || 'Unknown',
                    imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
                    Runtime: 'N/A'
                }));
            }
            return [];
        } catch (error) {
            console.warn('OMDb API error:', error);
            return [];
        }
    }

    static async fetchMovieDetails(movieId) {
        try {
            const response = await cachedFetch.fetch(`/api/movies?genre=action`);
            const data = await response.json();
            
            if (data.success && data.movies) {
                const movie = data.movies.find(m => m.id == movieId) || data.movies[0];
                return {
                    Title: movie.title,
                    Year: movie.release_date || 'N/A',
                    Runtime: 'N/A',
                    Genre: movie.genre || 'Unknown',
                    Plot: movie.overview || 'No plot available.',
                    imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
                    Poster: movie.poster_path || 'N/A'
                };
            }
            return {};
        } catch (error) {
            console.warn('OMDb details error:', error);
            return {};
        }
    }

    static getGenreNames(genre) {
        return [genre || 'Unknown'];
    }

    static getWeatherGenres(weatherCondition) {
        const weatherMap = {
            rain: 'drama',
            clear: 'action',
            clouds: 'mystery',
            snow: 'romance',
            thunderstorm: 'thriller',
            fog: 'mystery'
        };
        return weatherMap[weatherCondition] || 'action';
    }
}