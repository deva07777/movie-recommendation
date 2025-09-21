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
                return data.movies;
            }
            return [];
        } catch (error) {
            console.warn('OMDb API error:', error);
            return [];
        }
    }

    static async fetchMovieDetails(movieId) {
        try {
            const response = await cachedFetch.fetch(`/api/movies?id=${movieId}`);
            const data = await response.json();
            
            if (data.success && data.movie) {
                return data.movie;
            }
            return {};
        } catch (error) {
            console.warn('OMDb details error:', error);
            return {};
        }
    }

    static getGenreNames(genre) {
        return genre ? genre.split(', ') : ['Unknown'];
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