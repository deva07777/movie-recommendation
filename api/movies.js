export default async function handler(req, res) {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const OMDB_API_KEY = process.env.OMDB_API_KEY;
  
  if (!OMDB_API_KEY) {
    return res.status(500).json({ error: 'OMDb API key not configured' });
  }

  try {
    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`);
    const data = await response.json();

    if (data.Response === 'False') {
      return res.status(404).json({ error: data.Error || 'No movies found' });
    }

    const movies = data.Search.slice(0, 10).map(movie => ({
      title: movie.Title,
      year: movie.Year,
      imdbID: movie.imdbID,
      type: movie.Type,
      poster: movie.Poster !== 'N/A' ? movie.Poster : null
    }));

    res.status(200).json({ movies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}