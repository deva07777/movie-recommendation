// Simple working version without complex dependencies
async function loadMovies() {
    try {
        console.log('Loading movies...');
        
        // Load trending movies
        const trendingResponse = await fetch('/api/movies?genre=action');
        const trendingData = await trendingResponse.json();
        
        if (trendingData.success && trendingData.movies) {
            displayMovies('trending-movies', trendingData.movies);
            console.log('Trending movies loaded:', trendingData.movies.length);
        }
        
        // Load popular movies
        const popularResponse = await fetch('/api/movies?genre=comedy');
        const popularData = await popularResponse.json();
        
        if (popularData.success && popularData.movies) {
            displayMovies('popular-movies', popularData.movies);
            console.log('Popular movies loaded:', popularData.movies.length);
        }
        
    } catch (error) {
        console.error('Error loading movies:', error);
        displayFallbackMovies();
    }
}

function displayMovies(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <div class="movie-poster-wrapper">
                <img src="${movie.poster_path || 'https://via.placeholder.com/200x300?text=No+Image'}" 
                     alt="${movie.title}" 
                     loading="lazy">
            </div>
        `;
        container.appendChild(movieCard);
    });
}

function displayFallbackMovies() {
    const fallbackMovies = [
        { title: 'The Dark Knight', poster_path: 'https://via.placeholder.com/200x300?text=The+Dark+Knight' },
        { title: 'Inception', poster_path: 'https://via.placeholder.com/200x300?text=Inception' },
        { title: 'Interstellar', poster_path: 'https://via.placeholder.com/200x300?text=Interstellar' }
    ];
    
    displayMovies('trending-movies', fallbackMovies);
    displayMovies('popular-movies', fallbackMovies);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    loadMovies();
});