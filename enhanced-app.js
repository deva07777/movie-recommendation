const OMDB_API_KEY = 'e5731106';
const STREAMING_API_KEY = 'demo_key'; // Replace with actual streaming API key

class EnhancedCineFlixApp {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.currentMovie = null;
        this.streamingData = {};
        this.init();
    }

    async init() {
        if (!this.currentUser) {
            window.location.href = 'auth.html';
            return;
        }
        
        this.updateUserInterface();
        this.showLoader();
        await this.loadFeaturedMovie();
        await this.loadPersonalizedContent();
        this.setupEventListeners();
        this.hideLoader();
    }

    updateUserInterface() {
        // Update header with user info
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn && this.currentUser) {
            profileBtn.innerHTML = `<img src="${this.currentUser.avatar}" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%;">`;
        }

        // Add user-specific navigation
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.innerHTML += `
                <a href="profile.html" class="nav-link">Profile</a>
                <a href="#" class="nav-link" onclick="logout()">Logout</a>
            `;
        }
    }

    async loadPersonalizedContent() {
        await this.loadRecommendedMovies();
        await this.loadTrendingMovies();
        await this.loadPopularMovies();
        this.updateRecommendationSections();
    }

    async loadRecommendedMovies() {
        const preferences = this.currentUser.preferences;
        const favoriteGenres = preferences.favoriteGenres.length > 0 
            ? preferences.favoriteGenres 
            : ['action', 'drama', 'comedy'];
        
        const randomGenre = favoriteGenres[Math.floor(Math.random() * favoriteGenres.length)];
        
        try {
            const movies = await this.fetchMoviesBySearch(randomGenre);
            const enhancedMovies = await this.enhanceMoviesWithStreamingData(movies);
            this.displayMoviesInCarousel('trending-movies', enhancedMovies);
        } catch (error) {
            console.error('Error loading recommended movies:', error);
        }
    }

    async enhanceMoviesWithStreamingData(movies) {
        return Promise.all(movies.map(async (movie) => {
            const streamingInfo = await this.getStreamingInfo(movie.imdbID);
            return { ...movie, streaming: streamingInfo };
        }));
    }

    async getStreamingInfo(imdbID) {
        // Simulate streaming service data
        const services = ['Netflix', 'Prime Video', 'Hulu', 'Disney+', 'HBO Max'];
        const randomServices = services.slice(0, Math.floor(Math.random() * 3) + 1);
        
        return {
            available: randomServices,
            rent: Math.random() > 0.5 ? '$3.99' : null,
            buy: Math.random() > 0.5 ? '$12.99' : null
        };
    }

    displayMoviesInCarousel(containerId, movies) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card enhanced';
            movieCard.innerHTML = `
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" 
                     alt="${movie.Title}" loading="lazy">
                <div class="movie-overlay">
                    <div class="movie-actions">
                        <button class="action-btn play-btn" onclick="app.playTrailer('${movie.imdbID}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="action-btn info-btn" onclick="app.showEnhancedModal('${movie.imdbID}')">
                            <i class="fas fa-info"></i>
                        </button>
                        <button class="action-btn add-btn" onclick="app.addToList('${movie.imdbID}', 'watchlist')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    ${movie.streaming ? this.renderStreamingBadges(movie.streaming) : ''}
                </div>
                <div class="movie-info">
                    <h4>${movie.Title}</h4>
                    <div class="movie-meta">
                        <span class="rating">⭐ ${movie.imdbRating || 'N/A'}</span>
                        <span class="year">${movie.Year}</span>
                    </div>
                </div>
            `;
            
            container.appendChild(movieCard);
        });
    }

    renderStreamingBadges(streaming) {
        if (!streaming.available.length) return '';
        
        return `
            <div class="streaming-badges">
                ${streaming.available.map(service => 
                    `<span class="streaming-badge">${service}</span>`
                ).join('')}
            </div>
        `;
    }

    async showEnhancedModal(imdbID) {
        const movie = await this.fetchMovieByImdbID(imdbID);
        if (!movie) return;

        const castInfo = await this.getCastInfo(imdbID);
        const similarMovies = await this.getSimilarMovies(movie.Genre);
        const streamingInfo = await this.getStreamingInfo(imdbID);
        
        this.displayEnhancedModal(movie, castInfo, similarMovies, streamingInfo);
    }

    async getCastInfo(imdbID) {
        // Simulate cast data
        return {
            director: 'Christopher Nolan',
            cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy', 'Ellen Page'],
            writers: ['Christopher Nolan']
        };
    }

    async getSimilarMovies(genres) {
        if (!genres) return [];
        const genreArray = genres.split(', ');
        const randomGenre = genreArray[Math.floor(Math.random() * genreArray.length)];
        const movies = await this.fetchMoviesBySearch(randomGenre);
        return movies.slice(0, 4);
    }

    displayEnhancedModal(movie, cast, similar, streaming) {
        const modal = document.getElementById('movie-modal') || this.createEnhancedModal();
        
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeModal()"></div>
            <div class="modal-content enhanced">
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="modal-hero">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
                    <div class="modal-info">
                        <h2>${movie.Title}</h2>
                        <div class="modal-meta">
                            <span class="rating">⭐ ${movie.imdbRating || 'N/A'}</span>
                            <span class="year">${movie.Year}</span>
                            <span class="runtime">${movie.Runtime || 'N/A'}</span>
                            <span class="rated">${movie.Rated || 'Not Rated'}</span>
                        </div>
                        
                        <div class="genres">
                            ${movie.Genre ? movie.Genre.split(', ').map(genre => 
                                `<span class="genre-tag">${genre}</span>`
                            ).join('') : ''}
                        </div>
                        
                        <p class="plot">${movie.Plot || 'No plot available.'}</p>
                        
                        <div class="cast-info">
                            <div class="cast-item">
                                <strong>Director:</strong> ${cast.director}
                            </div>
                            <div class="cast-item">
                                <strong>Cast:</strong> ${cast.cast.join(', ')}
                            </div>
                        </div>
                        
                        <div class="streaming-info">
                            <h4>Where to Watch</h4>
                            <div class="streaming-options">
                                ${streaming.available.map(service => 
                                    `<button class="streaming-btn">${service}</button>`
                                ).join('')}
                                ${streaming.rent ? `<button class="rent-btn">Rent ${streaming.rent}</button>` : ''}
                                ${streaming.buy ? `<button class="buy-btn">Buy ${streaming.buy}</button>` : ''}
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button class="btn-primary" onclick="app.playTrailer('${movie.imdbID}')">
                                <i class="fas fa-play"></i> Watch Trailer
                            </button>
                            <button class="btn-secondary" onclick="app.rateMovie('${movie.imdbID}')">
                                <i class="fas fa-star"></i> Rate Movie
                            </button>
                            <button class="btn-secondary" onclick="app.addToList('${movie.imdbID}', 'watchlist')">
                                <i class="fas fa-plus"></i> Add to List
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="similar-movies">
                    <h3>Similar Movies</h3>
                    <div class="similar-grid">
                        ${similar.map(movie => `
                            <div class="similar-item" onclick="app.showEnhancedModal('${movie.imdbID}')">
                                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x225?text=No+Image'}" alt="${movie.Title}">
                                <span>${movie.Title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    createEnhancedModal() {
        const modal = document.createElement('div');
        modal.id = 'movie-modal';
        modal.className = 'movie-modal enhanced';
        document.body.appendChild(modal);
        return modal;
    }

    async rateMovie(imdbID) {
        const rating = prompt('Rate this movie (1-10):');
        if (rating && rating >= 1 && rating <= 10) {
            this.currentUser.preferences.ratings[imdbID] = parseInt(rating);
            this.saveUserData();
            this.showNotification('Rating saved!');
        }
    }

    async addToList(imdbID, listType = 'watchlist') {
        const movie = await this.fetchMovieByImdbID(imdbID);
        if (!movie) return;

        if (!this.currentUser.preferences.lists[listType].find(m => m.imdbID === imdbID)) {
            this.currentUser.preferences.lists[listType].push({
                ...movie,
                addedAt: new Date().toISOString()
            });
            this.saveUserData();
            this.showNotification(`Added to ${listType}!`);
        }
    }

    async fetchMovieByImdbID(imdbID) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
            const data = await response.json();
            return data.Response === 'True' ? data : null;
        } catch (error) {
            console.error('Error fetching movie:', error);
            return null;
        }
    }

    saveUserData() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    updateRecommendationSections() {
        // Add personalized section headers
        const trendingTitle = document.querySelector('#trending-carousel .carousel-title');
        if (trendingTitle) {
            trendingTitle.textContent = 'Recommended for You';
        }
    }

    // Inherit other methods from original app
    async fetchMoviesBySearch(searchTerm) {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&type=movie&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            const detailedMovies = await Promise.all(
                data.Search.slice(0, 10).map(movie => this.fetchMovieByImdbID(movie.imdbID))
            );
            return detailedMovies.filter(movie => movie && movie.Poster !== 'N/A');
        }
        return [];
    }

    playTrailer(imdbID) {
        // Implementation from original app
        if (!imdbID) return;
        window.open(`https://www.youtube.com/results?search_query=${imdbID}+trailer`, '_blank');
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
        setTimeout(() => notification.remove(), 3000);
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
        // Add enhanced event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

function closeModal() {
    const modal = document.getElementById('movie-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Initialize enhanced app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EnhancedCineFlixApp();
});