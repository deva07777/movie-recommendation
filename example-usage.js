/**
 * Example usage of the OMDb API utility functions
 * This demonstrates how to use the fetchOMDbMovies function in your components
 */

import { fetchOMDbMovies, getMoodKeyword, fetchMovieById } from './utils/omdb';

// Example 1: Basic movie search
async function searchMovies() {
  console.log('Searching for romantic movies...');
  
  const result = await fetchOMDbMovies('romantic');
  
  if (result.success) {
    console.log(`Found ${result.movies.length} movies:`);
    result.movies.forEach(movie => {
      console.log(`- ${movie.Title} (${movie.Year}) - Rating: ${movie.imdbRating || 'N/A'}`);
    });
  } else {
    console.error('Search failed:', result.error);
  }
}

// Example 2: Mood-based search
async function searchByMood() {
  console.log('Searching movies for happy mood...');
  
  const mood = 'happy';
  const keyword = getMoodKeyword(mood); // Converts 'happy' to 'comedy'
  
  const result = await fetchOMDbMovies(keyword);
  
  if (result.success) {
    console.log(`Found ${result.movies.length} ${mood} movies (${keyword}):`);
    result.movies.forEach(movie => {
      console.log(`- ${movie.Title} (${movie.Year})`);
    });
  } else {
    console.error('Mood search failed:', result.error);
  }
}

// Example 3: Error handling
async function handleSearchErrors() {
  // Test with invalid search term
  const result = await fetchOMDbMovies('xyzinvalidmovie123');
  
  if (!result.success) {
    console.log('Expected error:', result.error);
    // Display user-friendly error message in UI
    displayErrorMessage(result.error);
  }
}

// Example 4: Get specific movie details
async function getMovieDetails() {
  const movieId = 'tt0111161'; // The Shawshank Redemption
  
  const result = await fetchMovieById(movieId);
  
  if (result.success) {
    const movie = result.movie;
    console.log(`Movie Details:
      Title: ${movie.Title}
      Year: ${movie.Year}
      Director: ${movie.Director}
      Plot: ${movie.Plot}
      Rating: ${movie.imdbRating}
    `);
  } else {
    console.error('Failed to get movie details:', result.error);
  }
}

// Example 5: Frontend component integration
function displayErrorMessage(error) {
  // This would be implemented in your React component
  console.log('Display error to user:', error);
}

// Example 6: Loading state management
async function searchWithLoadingState(setLoading, setMovies, setError) {
  setLoading(true);
  setError(null);
  
  try {
    const result = await fetchOMDbMovies('action');
    
    if (result.success) {
      setMovies(result.movies);
    } else {
      setError(result.error);
    }
  } catch (err) {
    setError('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
}

// Run examples (uncomment to test)
// searchMovies();
// searchByMood();
// handleSearchErrors();
// getMovieDetails();

export {
  searchMovies,
  searchByMood,
  handleSearchErrors,
  getMovieDetails,
  searchWithLoadingState
};