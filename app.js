const OMDB_API_KEY = 'e5731106';

class CineFlixApp {
    constructor() {
        this.currentMovie = null;
        this.watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        this.allTrendingMovies = [];
        this.allPopularMovies = [];
        this.init();
        this.initializeFilters();
    }

    async init() {
        this.showLoader();
        await this.loadFeaturedMovie();
        await this.loadTrendingMovies();
        await this.loadPopularMovies();
        this.setupEventListeners();
        this.hideLoader();
    }

    showLoader() {
        document.querySelector('.page-loader').style.display = 'flex';
    }

    hideLoader() {
        setTimeout(() => {
            document.querySelector('.page-loader').style.opacity = '0';
            setTimeout(() => {
                document.querySelector('.page-loader').style.display = 'none';
            }, 500);
        }, 1500);
    }

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('hero-play').addEventListener('click', () => this.playTrailer(this.currentMovie));
        document.getElementById('hero-info').addEventListener('click', () => this.showMovieModal(this.currentMovie));
        document.getElementById('modal-trailer').addEventListener('click', () => this.playTrailer(this.currentMovie));
        document.getElementById('modal-watchlist').addEventListener('click', () => this.toggleWatchlist(this.currentMovie));
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });
    }

    async loadFeaturedMovie() {
        const featuredMovies = ['Inception', 'The Dark Knight', 'Interstellar', 'Blade Runner 2049', 'Dune'];
        const randomMovie = featuredMovies[Math.floor(Math.random() * featuredMovies.length)];
        
        try {
            const movie = await this.fetchMovieByTitle(randomMovie);
            if (movie) {
                this.currentMovie = movie;
                this.updateHeroSection(movie);
            }
        } catch (error) {
            console.error('Error loading featured movie:', error);
        }
    }

    async loadTrendingMovies() {
        const trendingTerms = ['action', 'adventure', 'thriller', 'sci-fi', 'drama'];
        const randomTerm = trendingTerms[Math.floor(Math.random() * trendingTerms.length)];
        
        try {
            const movies = await this.fetchMoviesBySearch(randomTerm);
            this.allTrendingMovies = movies;
            const filteredMovies = movieFilter.filterMovies(movies);
            this.displayMoviesInCarousel('trending-movies', filteredMovies);
        } catch (error) {
            console.error('Error loading trending movies:', error);
        }
    }

    async loadPopularMovies() {
        const popularTerms = ['batman', 'superman', 'marvel', 'star', 'love'];
        const randomTerm = popularTerms[Math.floor(Math.random() * popularTerms.length)];
        
        try {
            const movies = await this.fetchMoviesBySearch(randomTerm);
            this.allPopularMovies = movies;
            const filteredMovies = movieFilter.filterMovies(movies);
            this.displayMoviesInCarousel('popular-movies', filteredMovies);
        } catch (error) {
            console.error('Error loading popular movies:', error);
        }
    }

    async fetchMovieByTitle(title) {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        return data.Response === 'True' ? data : null;
    }

    async fetchMoviesBySearch(searchTerm) {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&type=movie&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            const detailedMovies = await Promise.all(
                data.Search.slice(0, 10).map(movie => this.fetchMovieByTitle(movie.Title))
            );
            return detailedMovies.filter(movie => movie && movie.Poster !== 'N/A');
        }
        return [];
    }

    updateHeroSection(movie) {
        document.getElementById('hero-title').textContent = movie.Title;
        document.getElementById('hero-description').textContent = movie.Plot || 'Discover this amazing movie and immerse yourself in its captivating story.';
        document.getElementById('hero-poster-img').src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Image';
    }

    displayMoviesInCarousel(containerId, movies) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" 
                     alt="${movie.Title}" 
                     loading="lazy">
            `;
            
            movieCard.addEventListener('click', () => this.showMovieModal(movie));
            container.appendChild(movieCard);
        });
    }

    showMovieModal(movie) {
        if (!movie) return;
        
        this.currentMovie = movie;
        
        document.getElementById('modal-poster').src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/250x375?text=No+Image';
        document.getElementById('modal-title').textContent = movie.Title;
        document.getElementById('modal-rating').textContent = `⭐ ${movie.imdbRating || 'N/A'}`;
        document.getElementById('modal-year').textContent = movie.Year;
        document.getElementById('modal-runtime').textContent = movie.Runtime || 'N/A';
        document.getElementById('modal-plot').textContent = movie.Plot || 'No plot available.';
        
        const genresContainer = document.getElementById('modal-genres');
        genresContainer.innerHTML = '';
        if (movie.Genre) {
            movie.Genre.split(', ').forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre;
                genresContainer.appendChild(genreTag);
            });
        }
        
        const watchlistBtn = document.getElementById('modal-watchlist');
        const isInWatchlist = this.watchlist.some(item => item.imdbID === movie.imdbID);
        watchlistBtn.innerHTML = isInWatchlist 
            ? '<i class="fas fa-check"></i> In Watchlist'
            : '<i class="fas fa-plus"></i> Add to Watchlist';
        
        document.getElementById('movie-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    playTrailer(movie) {
        if (!movie) return;
        const searchQuery = encodeURIComponent(`${movie.Title} ${movie.Year} trailer`);
        window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
    }

    toggleWatchlist(movie) {
        if (!movie) return;
        
        const existingIndex = this.watchlist.findIndex(item => item.imdbID === movie.imdbID);
        
        if (existingIndex > -1) {
            this.watchlist.splice(existingIndex, 1);
        } else {
            this.watchlist.push({
                ...movie,
                addedAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
        
        const watchlistBtn = document.getElementById('modal-watchlist');
        const isInWatchlist = existingIndex === -1;
        watchlistBtn.innerHTML = isInWatchlist 
            ? '<i class="fas fa-check"></i> In Watchlist'
            : '<i class="fas fa-plus"></i> Add to Watchlist';
        
        this.showNotification(isInWatchlist ? 'Added to Watchlist' : 'Removed from Watchlist');
    }

    async handleSearch(query) {
        if (query.length < 3) {
            this.hideSearchResults();
            return;
        }
        
        try {
            const movies = await this.fetchMoviesBySearch(query);
            this.displaySearchResults(movies);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(movies) {
        let searchResults = document.getElementById('search-results');
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.id = 'search-results';
            searchResults.className = 'search-results';
            document.querySelector('.search-container').appendChild(searchResults);
        }
        
        if (movies.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No movies found</div>';
            searchResults.classList.add('active');
            return;
        }
        
        searchResults.innerHTML = movies.slice(0, 5).map(movie => `
            <div class="search-item" onclick="app.showMovieModal(${JSON.stringify(movie).replace(/"/g, '&quot;')})">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/50x75?text=No+Image'}" alt="${movie.Title}">
                <div class="search-info">
                    <div class="search-title">${movie.Title}</div>
                    <div class="search-year">${movie.Year}</div>
                </div>
            </div>
        `).join('');
        
        searchResults.classList.add('active');
    }
    
    hideSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }

    initializeFilters() {
        // Filters will be initialized in DOMContentLoaded event
    }
    
    applyFiltersToHomepage(filters) {
        // Apply filters to trending movies
        const filteredTrending = movieFilter.filterMovies(this.allTrendingMovies);
        this.displayMoviesInCarousel('trending-movies', filteredTrending);
        
        // Apply filters to popular movies
        const filteredPopular = movieFilter.filterMovies(this.allPopularMovies);
        this.displayMoviesInCarousel('popular-movies', filteredPopular);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--accent-red);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 3000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

function closeModal() {
    document.getElementById('movie-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function scrollCarousel(carouselId, direction) {
    const container = document.querySelector(`#${carouselId}-carousel .carousel-container`);
    const scrollAmount = 220 * direction;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function showWeatherRecommendations() {
    window.location.href = 'weather.html';
}

function showMoodRecommendations() {
    window.location.href = 'mood-weather.html';
}

function showGenreRecommendations() {
    window.location.href = 'genre.html';
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        box-shadow: var(--shadow-lg);
    }
`;
document.head.appendChild(style);

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CineFlixApp();
    
    // Initialize filters on homepage
    const filterContainer = document.getElementById('filter-container');
    if (filterContainer) {
        filterContainer.innerHTML = movieFilter.createFilterHTML();
    }
    
    window.addEventListener('filtersApplied', (event) => {
        app.applyFiltersToHomepage(event.detail);
    });
});