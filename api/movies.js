export default async function handler(req, res) {
    const { genreId, mood } = req.query;
    
    const TMDB_API_KEY = process.env.TMDB_API_KEY || '4d79fb69b3f9cc08488718e7792ad412';
    
    const MOOD_TO_GENRES = {
        happy: [35, 10749], // Comedy, Romance
        sad: [18], // Drama
        romantic: [10749], // Romance
        scary: [27, 53], // Horror, Thriller
        thrilling: [53, 27], // Thriller, Horror
        adventurous: [12, 14], // Adventure, Fantasy
        energetic: [28, 12], // Action, Adventure
        relaxed: [10751, 35], // Family, Comedy
        nostalgic: [18, 36], // Drama, History
        mysterious: [9648, 53] // Mystery, Thriller
    };
    
    try {
        let genres = [];
        
        if (mood && MOOD_TO_GENRES[mood]) {
            genres = MOOD_TO_GENRES[mood];
        } else if (genreId) {
            genres = [parseInt(genreId)];
        } else {
            genres = [28]; // Default to Action
        }
        
        const genreString = genres.join(',');
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreString}&sort_by=popularity.desc&vote_average.gte=6.5&language=en-US&page=1`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results) {
            const movies = data.results.slice(0, 10).map(movie => ({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                overview: movie.overview,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                genre_ids: movie.genre_ids
            }));
            
            res.status(200).json({ success: true, movies });
        } else {
            res.status(200).json({ success: false, movies: [] });
        }
    } catch (error) {
        console.error('TMDb API Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch movies' });
    }
}