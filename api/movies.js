export default async function handler(req, res) {
    const { genre, mood } = req.query;
    
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '15c2c4f697mshd1ffc21af191fb5p1c9709jsn6742deaef05f';
    
    const MOOD_TO_GENRES = {
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
        let searchGenre = genre;
        
        if (mood && MOOD_TO_GENRES[mood]) {
            searchGenre = MOOD_TO_GENRES[mood];
        } else if (!searchGenre) {
            searchGenre = 'action';
        }
        
        const url = `https://imdb8.p.rapidapi.com/title/v2/find?title=${searchGenre}&limit=10&sortArg=moviemeter,asc`;
        
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
            }
        });
        
        const data = await response.json();
        
        if (data.results) {
            const movies = data.results.slice(0, 10).map(movie => ({
                id: movie.id,
                title: movie.titleText?.text || movie.originalTitleText?.text || 'Unknown',
                poster_path: movie.primaryImage?.url || null,
                overview: movie.plot?.plotText?.plainText || 'No description available',
                vote_average: movie.ratingsSummary?.aggregateRating || 0,
                release_date: movie.releaseYear?.year || 'N/A',
                genre: searchGenre
            }));
            
            res.status(200).json({ success: true, movies });
        } else {
            res.status(200).json({ success: false, movies: [] });
        }
    } catch (error) {
        console.error('RapidAPI IMDb Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch movies' });
    }
}