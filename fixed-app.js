// Complete Movie App with all fixes
const OMDB_API_KEY = 'e5731106';

class MovieApp {
    constructor() {
        this.currentMovie = null;
        this.watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        this.featuredMovies = ['Inception', 'The Dark Knight', 'Interstellar', 'Avengers', 'Spider-Man', 'Batman', 'Superman'];
        this.movieIndex = 0;
        this.init();
    }

    async init() {
        this.showLoader();
        await this.loadAllMovies();
        this.setupEventListeners();
        this.startHeroRotation();
        this.hideLoader();
    }

    showLoader() {
        document.querySelector('.page-loader').style.display = 'flex';
    }

    hideLoader() {
        setTimeout(() => {
            const loader = document.querySelector('.page-loader');
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 1000);
    }

    async loadAllMovies() {
        await Promise.all([
            this.loadMovieSection('trending', 'action'),
            this.loadMovieSection('popular', 'comedy'),
            this.loadFeaturedMovie()
        ]);
    }

    async loadMovieSection(section, query) {
        const loadingEl = document.getElementById(`${section}-loading`);
        const containerEl = document.getElementById(`${section}-movies`);
        
        const queries = section === 'trending' 
            ? ['batman', 'superman', 'spider', 'avengers', 'marvel', 'action']
            : ['comedy', 'romantic', 'family', 'animation', 'disney'];
        
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        
        try {
            loadingEl.style.display = 'block';
            const movies = await this.fetchMovies(randomQuery);
            
            if (movies && movies.length > 0) {
                this.displayMovies(containerEl, movies);
            } else {
                containerEl.innerHTML = '<div class="error-message">No movies found</div>';
            }
        } catch (error) {
            console.error(`Error loading ${section} movies:`, error);
            containerEl.innerHTML = '<div class="error-message">Failed to load movies</div>';
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    async loadFeaturedMovie() {
        try {
            const movie = await this.fetchMovieDetails(this.featuredMovies[this.movieIndex]);
            if (movie) {
                this.currentMovie = movie;
                this.updateHeroSection(movie);
            }
        } catch (error) {
            console.error('Error loading featured movie:', error);
        }
    }

    startHeroRotation() {
        setInterval(async () => {
            this.movieIndex = (this.movieIndex + 1) % this.featuredMovies.length;
            await this.loadFeaturedMovie();
        }, 10000);
    }

    async fetchMovies(query) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_API_KEY}`);
            const data = await response.json();
            
            if (data.Response === 'True') {
                const detailedMovies = await Promise.all(
                    data.Search.slice(0, 8).map(movie => this.fetchMovieDetails(movie.Title))
                );
                return detailedMovies.filter(movie => movie && movie.Poster !== 'N/A');
            }
            return [];
        } catch (error) {
            console.error('Fetch error:', error);
            return [];
        }
    }

    async fetchMovieDetails(title) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
            const data = await response.json();
            return data.Response === 'True' ? data : null;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    displayMovies(container, movies) {
        container.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card enhanced';
            movieCard.innerHTML = `
                <div class="movie-poster-wrapper">
                    <img src="${movie.Poster}" alt="${movie.Title}" loading="lazy">
                    <div class="movie-overlay">
                        <div class="movie-info-overlay">
                            <h4>${movie.Title}</h4>
                            <p>⭐ ${movie.imdbRating || 'N/A'}</p>
                            <p>${movie.Year}</p>
                        </div>
                        <button class="play-trailer-btn" onclick="event.stopPropagation(); window.open('https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + ' trailer')}', '_blank')">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            `;
            
            movieCard.addEventListener('click', () => this.showMovieModal(movie));
            container.appendChild(movieCard);
        });
    }

    updateHeroSection(movie) {
        document.getElementById('hero-title').textContent = movie.Title;
        document.getElementById('hero-description').textContent = movie.Plot || 'Discover this amazing movie and immerse yourself in its captivating story.';
        document.getElementById('hero-poster-img').src = movie.Poster;
    }

    showMovieModal(movie) {
        this.currentMovie = movie;
        
        document.getElementById('modal-poster').src = movie.Poster;
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

    setupEventListeners() {
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('modal-watchlist').addEventListener('click', () => this.toggleWatchlist());
        document.getElementById('modal-trailer').addEventListener('click', () => this.playTrailer());
        document.getElementById('hero-play').addEventListener('click', () => this.playTrailer());
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });
    }

    playTrailer() {
        if (this.currentMovie) {
            const query = encodeURIComponent(`${this.currentMovie.Title} trailer`);
            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
        }
    }

    toggleWatchlist() {
        if (!this.currentMovie) return;
        
        const existingIndex = this.watchlist.findIndex(item => item.imdbID === this.currentMovie.imdbID);
        
        if (existingIndex > -1) {
            this.watchlist.splice(existingIndex, 1);
        } else {
            this.watchlist.push({
                ...this.currentMovie,
                addedAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
        
        const watchlistBtn = document.getElementById('modal-watchlist');
        const isInWatchlist = existingIndex === -1;
        watchlistBtn.innerHTML = isInWatchlist 
            ? '<i class="fas fa-check"></i> In Watchlist'
            : '<i class="fas fa-plus"></i> Add to Watchlist';
    }

    async handleSearch(query) {
        if (query.length < 3) {
            this.hideSearchResults();
            return;
        }
        
        try {
            const movies = await this.fetchMovies(query);
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
                <img src="${movie.Poster}" alt="${movie.Title}">
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
}

// Global functions
function closeModal() {
    document.getElementById('movie-modal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function scrollCarousel(carouselId, direction) {
    const container = document.querySelector(`#${carouselId}-carousel .carousel-container`);
    if (container) {
        container.scrollBy({ left: 220 * direction, behavior: 'smooth' });
    }
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

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MovieApp();
});