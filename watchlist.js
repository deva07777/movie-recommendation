class WatchlistManager {
    constructor() {
        this.watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        this.currentMovie = null;
        this.sortOrder = 'newest';
        this.init();
    }

    init() {
        this.displayWatchlist();
        this.setupEventListeners();
        this.updateMovieCount();
    }

    setupEventListeners() {
        document.getElementById('sort-btn').addEventListener('click', () => this.toggleSort());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAllMovies());
        document.getElementById('modal-trailer').addEventListener('click', () => this.playTrailer());
        document.getElementById('modal-remove').addEventListener('click', () => this.removeFromWatchlist());
    }

    displayWatchlist() {
        const grid = document.getElementById('watchlist-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.watchlist.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        const sortedWatchlist = this.getSortedWatchlist();
        grid.innerHTML = '';
        
        sortedWatchlist.forEach(movie => {
            const movieItem = this.createWatchlistItem(movie);
            grid.appendChild(movieItem);
        });
    }

    createWatchlistItem(movie) {
        const item = document.createElement('div');
        item.className = 'watchlist-item';
        
        const addedDate = new Date(movie.addedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        item.innerHTML = `
            <div class="item-poster">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/280x400?text=No+Image'}" 
                     alt="${movie.Title}" loading="lazy">
                <div class="item-overlay">
                    <div class="overlay-actions">
                        <button class="overlay-btn play-btn" onclick="watchlistManager.playTrailer('${movie.imdbID}')">
                            <i class="fas fa-play"></i> Trailer
                        </button>
                        <button class="overlay-btn remove-btn" onclick="watchlistManager.removeMovie('${movie.imdbID}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
            <div class="item-info">
                <h3 class="item-title">${movie.Title}</h3>
                <div class="item-meta">
                    <span class="item-rating">⭐ ${movie.imdbRating || 'N/A'}</span>
                    <span class="item-year">${movie.Year}</span>
                </div>
                <div class="item-genres">
                    ${movie.Genre ? movie.Genre.split(', ').slice(0, 3).map(genre => 
                        `<span class="genre-tag">${genre}</span>`
                    ).join('') : ''}
                </div>
                <div class="item-added">Added ${addedDate}</div>
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.overlay-btn')) {
                this.showMovieModal(movie);
            }
        });
        
        return item;
    }

    showMovieModal(movie) {
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
        
        document.getElementById('movie-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    playTrailer(imdbID = null) {
        const movie = imdbID ? this.watchlist.find(m => m.imdbID === imdbID) : this.currentMovie;
        if (!movie) return;
        
        const searchQuery = encodeURIComponent(`${movie.Title} ${movie.Year} trailer`);
        window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
    }

    removeMovie(imdbID) {
        this.watchlist = this.watchlist.filter(movie => movie.imdbID !== imdbID);
        localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
        this.displayWatchlist();
        this.updateMovieCount();
        this.showNotification('Movie removed from watchlist');
    }

    removeFromWatchlist() {
        if (!this.currentMovie) return;
        
        this.removeMovie(this.currentMovie.imdbID);
        closeModal();
    }

    clearAllMovies() {
        if (this.watchlist.length === 0) return;
        
        if (confirm('Are you sure you want to remove all movies from your watchlist?')) {
            this.watchlist = [];
            localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
            this.displayWatchlist();
            this.updateMovieCount();
            this.showNotification('Watchlist cleared');
        }
    }

    toggleSort() {
        this.sortOrder = this.sortOrder === 'newest' ? 'oldest' : 'newest';
        
        const sortBtn = document.getElementById('sort-btn');
        sortBtn.innerHTML = this.sortOrder === 'newest' 
            ? '<i class="fas fa-sort"></i> Sort by Date Added'
            : '<i class="fas fa-sort"></i> Sort by Oldest First';
        
        this.displayWatchlist();
    }

    getSortedWatchlist() {
        return [...this.watchlist].sort((a, b) => {
            const dateA = new Date(a.addedAt);
            const dateB = new Date(b.addedAt);
            return this.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }

    updateMovieCount() {
        const count = this.watchlist.length;
        const countText = count === 1 ? '1 movie' : `${count} movies`;
        document.getElementById('movie-count').textContent = countText;
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
            box-shadow: var(--shadow-lg);
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
`;
document.head.appendChild(style);

// Initialize watchlist manager
let watchlistManager;
document.addEventListener('DOMContentLoaded', () => {
    watchlistManager = new WatchlistManager();
});