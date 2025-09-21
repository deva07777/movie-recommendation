import React, { useState, useEffect } from 'react';
import { fetchOMDbMovies, getMoodKeyword } from '../utils/omdb';

const MovieRecommendations = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  /**
   * Fetch movies based on keyword or mood
   * @param {string} keyword - Search term or mood
   */
  const handleFetchMovies = async (keyword) => {
    if (!keyword.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError(null);
    setMovies([]);

    try {
      // Convert mood to keyword if needed
      const searchTerm = getMoodKeyword(keyword);
      
      const result = await fetchOMDbMovies(searchTerm);
      
      if (result.success) {
        setMovies(result.movies);
        if (result.movies.length === 0) {
          setError('No movies found. Try a different search term.');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Movie fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    handleFetchMovies(searchKeyword);
  };

  /**
   * Handle mood button clicks
   */
  const handleMoodClick = (mood) => {
    setSearchKeyword(mood);
    handleFetchMovies(mood);
  };

  // Load default movies on component mount
  useEffect(() => {
    handleFetchMovies('popular');
  }, []);

  return (
    <div className="movie-recommendations">
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search movies or enter your mood..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="mood-buttons">
          <h3>Or choose your mood:</h3>
          <div className="mood-grid">
            {['happy', 'sad', 'romantic', 'scary', 'thrilling', 'adventurous'].map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodClick(mood)}
                disabled={loading}
                className="mood-button"
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="dismiss-error">
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Finding perfect movies for you...</p>
        </div>
      )}

      {/* Movies Grid */}
      {movies.length > 0 && (
        <div className="movies-grid">
          <h2>Recommended Movies</h2>
          <div className="movies-container">
            {movies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Movie Card Component
 */
const MovieCard = ({ movie }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="movie-card">
      <div className="movie-poster">
        {movie.Poster && !imageError ? (
          <img
            src={movie.Poster}
            alt={`${movie.Title} poster`}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="poster-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.Title}</h3>
        <p className="movie-year">{movie.Year}</p>
        
        {movie.Genre && (
          <p className="movie-genre">{movie.Genre}</p>
        )}
        
        {movie.imdbRating && (
          <div className="movie-rating">
            <span>⭐ {movie.imdbRating}</span>
          </div>
        )}
        
        {movie.Plot && (
          <p className="movie-plot">
            {movie.Plot.length > 100 
              ? `${movie.Plot.substring(0, 100)}...` 
              : movie.Plot
            }
          </p>
        )}
        
        {movie.Runtime && (
          <p className="movie-runtime">{movie.Runtime}</p>
        )}
      </div>
    </div>
  );
};

export default MovieRecommendations;