import { fetchOMDbMovies } from './lib/omdb.js';

// Example usage
async function searchMovies() {
  try {
    const movies = await fetchOMDbMovies('batman');
    console.log('Movies found:', movies);
    
    movies.forEach(movie => {
      console.log(`${movie.title} (${movie.year}) - ${movie.imdbID}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example with error handling
async function handleSearch(keyword) {
  try {
    const movies = await fetchOMDbMovies(keyword);
    return { success: true, movies };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export { searchMovies, handleSearch };