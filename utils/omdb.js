/**
 * OMDb API utility functions for movie recommendations
 * Handles API calls with proper error handling and environment variables
 */

const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

/**
 * Fetches movies from OMDb API based on search keyword
 * @param {string} keyword - Search term (e.g., "romantic", "action", "comedy")
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise<Object>} - Returns movies array or error object
 */
export async function fetchOMDbMovies(keyword, page = 1) {
  // Validate API key
  if (!OMDB_API_KEY) {
    return {
      success: false,
      error: 'OMDb API key not configured. Please set NEXT_PUBLIC_OMDB_API_KEY environment variable.',
      movies: []
    };
  }

  // Validate keyword
  if (!keyword || keyword.trim().length === 0) {
    return {
      success: false,
      error: 'Search keyword is required',
      movies: []
    };
  }

  try {
    const searchUrl = `${OMDB_BASE_URL}?s=${encodeURIComponent(keyword)}&type=movie&page=${page}&apikey=${OMDB_API_KEY}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle OMDb API specific responses
    if (data.Response === 'False') {
      return {
        success: false,
        error: data.Error || 'No movies found for this search term',
        movies: []
      };
    }
    
    if (!data.Search || data.Search.length === 0) {
      return {
        success: false,
        error: 'No movies found for this search term',
        movies: []
      };
    }
    
    // Get detailed information for each movie
    const detailedMovies = await Promise.all(
      data.Search.slice(0, 10).map(async (movie) => {
        try {
          const detailResponse = await fetch(`${OMDB_BASE_URL}?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`);
          const details = await detailResponse.json();
          
          if (details.Response === 'True') {
            return {
              ...details,
              // Ensure consistent data structure
              imdbID: details.imdbID,
              Title: details.Title,
              Year: details.Year,
              Poster: details.Poster !== 'N/A' ? details.Poster : null,
              Plot: details.Plot !== 'N/A' ? details.Plot : 'No plot available',
              Genre: details.Genre !== 'N/A' ? details.Genre : 'Unknown',
              imdbRating: details.imdbRating !== 'N/A' ? details.imdbRating : null,
              Runtime: details.Runtime !== 'N/A' ? details.Runtime : null
            };
          }
          return movie; // Fallback to basic info if details fail
        } catch (error) {
          console.warn(`Failed to fetch details for ${movie.Title}:`, error);
          return movie; // Return basic info if detailed fetch fails
        }
      })
    );
    
    return {
      success: true,
      movies: detailedMovies,
      totalResults: data.totalResults,
      currentPage: page
    };
    
  } catch (error) {
    console.error('OMDb API Error:', error);
    return {
      success: false,
      error: 'Failed to fetch movies. Please check your internet connection and try again.',
      movies: []
    };
  }
}

/**
 * Fetches a single movie by IMDb ID
 * @param {string} imdbId - IMDb ID of the movie
 * @returns {Promise<Object>} - Returns movie object or error
 */
export async function fetchMovieById(imdbId) {
  if (!OMDB_API_KEY) {
    return {
      success: false,
      error: 'OMDb API key not configured'
    };
  }

  if (!imdbId) {
    return {
      success: false,
      error: 'IMDb ID is required'
    };
  }

  try {
    const response = await fetch(`${OMDB_BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    
    if (data.Response === 'False') {
      return {
        success: false,
        error: data.Error || 'Movie not found'
      };
    }
    
    return {
      success: true,
      movie: data
    };
    
  } catch (error) {
    console.error('OMDb API Error:', error);
    return {
      success: false,
      error: 'Failed to fetch movie details'
    };
  }
}

/**
 * Mood to keyword mapping for better search results
 */
export const MOOD_KEYWORDS = {
  happy: 'comedy',
  sad: 'drama',
  romantic: 'romance',
  scary: 'horror',
  thrilling: 'thriller',
  adventurous: 'adventure',
  energetic: 'action',
  relaxed: 'family',
  nostalgic: 'classic',
  mysterious: 'mystery'
};

/**
 * Get search keyword based on mood
 * @param {string} mood - User's current mood
 * @returns {string} - Corresponding search keyword
 */
export function getMoodKeyword(mood) {
  return MOOD_KEYWORDS[mood.toLowerCase()] || mood;
}