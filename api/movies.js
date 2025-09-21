module.exports = async function handler(req, res) {
  const { query } = req.query;
  
  const OMDB_API_KEY = process.env.OMDB_API_KEY || 'e5731106';
  
  console.log('API called with query:', query);
  console.log('API key available:', !!OMDB_API_KEY);
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`;
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('OMDb response:', data);

    if (data.Response === 'False') {
      console.log('OMDb error:', data.Error);
      return res.status(404).json({ error: data.Error || 'No movies found' });
    }

    if (!data.Search || data.Search.length === 0) {
      return res.status(404).json({ error: 'No movies found' });
    }

    const movies = data.Search.slice(0, 10).map(movie => ({
      title: movie.Title,
      year: movie.Year,
      imdbID: movie.imdbID,
      type: movie.Type,
      poster: movie.Poster !== 'N/A' ? movie.Poster : null
    }));

    console.log('Returning movies:', movies.length);
    res.status(200).json({ movies });
  } catch (error) {
    console.error('OMDb API Error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}