export default async function handler(req, res) {
    const { genre, mood, s } = req.query;
    
    const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e5731106';
    
    const MOOD_TO_SEARCH = {
        happy: 'comedy',
        sad: 'drama',
        romantic: 'romance',
        scary: 'horror',
        thrilling: 'thriller',
        adventurous: 'adventure',
        energetic: 'action',
        relaxed: 'family',
        nostalgic: 'drama',
        mysterious: 'mystery'
    };
    
    try {
        let searchTerm = s || genre;
        
        if (mood && MOOD_TO_SEARCH[mood]) {
            searchTerm = MOOD_TO_SEARCH[mood];
        } else if (!searchTerm) {
            searchTerm = 'action';
        }
        
        const url = `https://www.omdbapi.com/?s=${searchTerm}&type=movie&apikey=${OMDB_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True' && data.Search) {
            const movies = data.Search.slice(0, 10).map(movie => ({
                id: movie.imdbID,
                title: movie.Title,
                poster_path: movie.Poster !== 'N/A' ? movie.Poster : null,
                overview: 'No description available',
                vote_average: 0,
                release_date: movie.Year,
                genre: searchTerm
            }));
            
            res.status(200).json({ success: true, movies });
        } else {
            res.status(200).json({ success: false, movies: [] });
        }
    } catch (error) {
        console.error('OMDb API Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch movies' });
    }
}