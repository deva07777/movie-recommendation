const OMDB_API_KEY = 'e5731106';

class GenreExplorer {
    constructor() {
        this.genres = [];
        this.selectedGenre = null;
        this.currentMovies = [];
        this.filteredMovies = [];
        this.currentPage = 1;
        this.currentType = 'trending';
        this.currentView = 'grid';
        this.initEventListeners();
        this.loadGenres();
        this.initializeFilters();
    }

    initEventListeners() {
        document.getElementById('genre-search').addEventListener('input', (e) => this.searchGenres(e.target.value));
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterGenres(e.target.dataset.filter));
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeView(e.target.dataset.view));
        });
        
        document.getElementById('load-more').addEventListener('click', () => this.loadMoreMovies());
    }
    
    initializeFilters() {
        const filterContainer = document.getElementById('filter-container');
        if (filterContainer) {
            filterContainer.innerHTML = movieFilter.createFilterHTML();
        }
        
        window.addEventListener('filtersApplied', (event) => {
            this.applyFiltersToMovies(event.detail);
        });
    }

    async loadGenres() {
        this.showLoading('Loading genres...');
        
        this.genres = [
            { id: 'action', name: 'Action', emoji: '💥', description: 'High-energy movies with thrilling sequences', popularity: 'popular' },
            { id: 'adventure', name: 'Adventure', emoji: '🗺️', description: 'Epic journeys and exciting quests', popularity: 'popular' },
            { id: 'comedy', name: 'Comedy', emoji: '😂', description: 'Laugh-out-loud entertainment', popularity: 'popular' },
            { id: 'crime', name: 'Crime', emoji: '🔫', description: 'Gripping criminal underworld stories', popularity: 'trending' },
            { id: 'drama', name: 'Drama', emoji: '🎭', description: 'Emotional and character-driven narratives', popularity: 'popular' },
            { id: 'family', name: 'Family', emoji: '👨👩👧👦', description: 'Perfect for family movie nights', popularity: 'classic' },
            { id: 'fantasy', name: 'Fantasy', emoji: '🧙♂️', description: 'Magical worlds and mythical creatures', popularity: 'trending' },
            { id: 'horror', name: 'Horror', emoji: '👻', description: 'Spine-chilling and terrifying tales', popularity: 'trending' },
            { id: 'mystery', name: 'Mystery', emoji: '🔍', description: 'Puzzling plots and hidden secrets', popularity: 'classic' },
            { id: 'romance', name: 'Romance', emoji: '💕', description: 'Love stories and romantic adventures', popularity: 'classic' },
            { id: 'sci-fi', name: 'Sci-Fi', emoji: '🚀', description: 'Futuristic and sci-fi adventures', popularity: 'trending' },
            { id: 'thriller', name: 'Thriller', emoji: '😱', description: 'Edge-of-your-seat suspense', popularity: 'trending' },
            { id: 'war', name: 'War', emoji: '⚔️', description: 'Military conflicts and heroism', popularity: 'classic' },
            { id: 'western', name: 'Western', emoji: '🤠', description: 'Wild west adventures', popularity: 'classic' }
        ];
        
        this.displayGenres(this.genres);
        this.hideLoading();
    }

    displayGenres(genres) {
        const genresGrid = document.getElementById('genres-grid');
        genresGrid.innerHTML = '';
        
        genres.forEach(genre => {
            const genreCard = document.createElement('div');
            genreCard.className = 'genre-card';
            genreCard.dataset.genreId = genre.id;
            genreCard.innerHTML = `
                <span class="genre-emoji">${genre.emoji}</span>
                <div class="genre-name">${genre.name}</div>
                <div class="genre-count">1000+ movies</div>
            `;
            
            genreCard.addEventListener('click', () => this.selectGenre(genre));
            genresGrid.appendChild(genreCard);
        });
    }

    searchGenres(query) {
        if (!query.trim()) {
            this.displayGenres(this.genres);
            return;
        }
        
        const filteredGenres = this.genres.filter(genre =>
            genre.name.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displayGenres(filteredGenres);
    }

    filterGenres(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        let filteredGenres = this.genres;
        
        if (filter !== 'all') {
            filteredGenres = this.genres.filter(genre => genre.popularity === filter);
        }
        
        this.displayGenres(filteredGenres);
    }

    selectGenre(genre) {
        document.querySelectorAll('.genre-card').forEach(card => card.classList.remove('selected'));
        document.querySelector(`[data-genre-id="${genre.id}"]`).classList.add('selected');
        
        this.selectedGenre = genre;
        this.displayGenreInfo(genre);
        this.setupRecommendationOptions();
    }

    displayGenreInfo(genre) {
        const genreInfo = document.getElementById('selected-genre-info');
        
        document.getElementById('selected-genre-icon').textContent = genre.emoji;
        document.getElementById('selected-genre-name').textContent = genre.name;
        document.getElementById('selected-genre-description').textContent = genre.description;
        
        genreInfo.classList.remove('hidden');
        genreInfo.scrollIntoView({ behavior: 'smooth' });
    }

    setupRecommendationOptions() {
        document.querySelectorAll('.option-card').forEach(card => {
            card.replaceWith(card.cloneNode(true));
        });
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.getGenreRecommendations(type);
            });
        });
    }

    async getGenreRecommendations(type) {
        if (!this.selectedGenre) return;
        
        this.currentType = type;
        this.currentPage = 1;
        this.currentMovies = [];
        
        this.showLoading(`Loading ${type} ${this.selectedGenre.name.toLowerCase()} movies...`);
        
        try {
            const movies = await this.fetchMoviesByType(type);
            
            // Movies from TMDb already have detailed info
            this.currentMovies = movies;
            this.filteredMovies = movieFilter.filterMovies(movies);
            
            this.displayMovieRecommendations(this.filteredMovies, type);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            alert('Failed to load movie recommendations');
        }
    }
    
    applyFiltersToMovies(filters) {
        if (this.currentMovies.length > 0) {
            this.filteredMovies = movieFilter.filterMovies(this.currentMovies);
            this.displayMovieRecommendations(this.filteredMovies, this.currentType);
        }
    }

    async fetchMoviesByType(type) {
        try {
            const movies = await TMDbAPI.fetchMoviesByGenre(this.selectedGenre.id);
        
        // Filter out already recommended movies
        const unrecommendedMovies = recommendationTracker.filterUnrecommendedMovies(movies);
        let filteredMovies = unrecommendedMovies.length > 0 ? unrecommendedMovies : movies;
        
        if (type === 'recent') {
            filteredMovies = filteredMovies.filter(movie => parseInt(movie.Year) >= 2020);
        } else if (type === 'classic') {
            filteredMovies = filteredMovies.filter(movie => parseInt(movie.Year) <= 2000);
        }
        
        return filteredMovies.filter(movie => movie.Poster && movie.Poster !== 'N/A');
        } catch (error) {
            console.warn('Failed to fetch movies by type:', error);
            return this.getFallbackMovies();
        }
    }

    getSearchTermForType(type) {
        const genreTerms = {
            action: ['batman', 'mission', 'fast', 'john', 'die', 'matrix', 'avengers'],
            adventure: ['indiana', 'treasure', 'pirates', 'jungle', 'quest', 'journey', 'world'],
            comedy: ['funny', 'laugh', 'wedding', 'night', 'party', 'american', 'meet'],
            crime: ['godfather', 'goodfellas', 'casino', 'scarface', 'mob', 'gang', 'heist'],
            drama: ['story', 'life', 'man', 'woman', 'love', 'family', 'american'],
            family: ['disney', 'kids', 'children', 'animated', 'family', 'home', 'school'],
            fantasy: ['lord', 'harry', 'magic', 'dragon', 'wizard', 'kingdom', 'legend'],
            horror: ['night', 'dead', 'evil', 'dark', 'ghost', 'scary', 'nightmare'],
            mystery: ['detective', 'murder', 'secret', 'missing', 'case', 'investigation', 'clue'],
            romance: ['love', 'wedding', 'heart', 'kiss', 'romantic', 'couple', 'valentine'],
            'sci-fi': ['star', 'space', 'future', 'alien', 'robot', 'time', 'planet'],
            thriller: ['night', 'dark', 'dangerous', 'chase', 'escape', 'deadly', 'suspect'],
            war: ['soldier', 'battle', 'army', 'military', 'world', 'combat', 'enemy'],
            western: ['cowboy', 'gun', 'wild', 'sheriff', 'outlaw', 'frontier', 'ranch']
        };
        
        const terms = genreTerms[this.selectedGenre.id] || ['movie'];
        return terms[Math.floor(Math.random() * terms.length)];
    }

    displayMovieRecommendations(movies, type) {
        const recommendationsSection = document.getElementById('movie-recommendations');
        const recommendationsTitle = document.getElementById('recommendations-title');
        const moviesContainer = document.getElementById('movies-container');
        
        const typeLabels = {
            'trending': 'Trending Now',
            'top-rated': 'Top Rated',
            'recent': 'Recent Releases',
            'classic': 'Classics'
        };
        
        recommendationsTitle.textContent = `${this.selectedGenre.name} Movies - ${typeLabels[type]}`;
        
        moviesContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            moviesContainer.appendChild(movieCard);
        });
        
        recommendationsSection.classList.remove('hidden');
        recommendationsSection.scrollIntoView({ behavior: 'smooth' });
    }

    createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <div class="movie-poster-wrapper">
                <img class="movie-poster" src="${movie.Poster}" alt="${movie.Title}">
                <div class="movie-overlay">
                    <button class="play-trailer-btn" onclick="event.stopPropagation(); TrailerUtils.openTrailer({Title: '${movie.Title}', Year: '${movie.Year}'})">
                        <i class="fas fa-play"></i> Trailer
                    </button>
                </div>
            </div>
            <div class="movie-info">
                <div class="movie-title">${movie.Title}</div>
                <div class="movie-meta">
                    <span class="movie-rating">⭐ N/A</span>
                    <span class="movie-year">${movie.Year}</span>
                </div>
            </div>
        `;
        
        movieCard.addEventListener('click', () => {
            recommendationTracker.addRecommendedMovie(movie.imdbID);
            this.openMovieModal(movie);
        });
        return movieCard;
    }

    async openMovieModal(movie) {
        const modal = document.getElementById('movie-modal');
        const details = await this.getMovieDetails(movie.imdbID);
        
        document.getElementById('modal-poster-img').src = movie.Poster;
        document.getElementById('modal-title').textContent = movie.Title;
        document.getElementById('modal-rating').textContent = `⭐ ${details.imdbRating || 'N/A'}`;
        document.getElementById('modal-year').textContent = movie.Year;
        document.getElementById('modal-runtime').textContent = details.Runtime || 'N/A';
        document.getElementById('modal-overview').textContent = details.Plot || 'No description available.';
        
        const genresContainer = document.getElementById('modal-genres');
        genresContainer.innerHTML = '';
        if (details.Genre) {
            details.Genre.split(', ').forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'modal-genre-tag';
                genreTag.textContent = genre;
                genresContainer.appendChild(genreTag);
            });
        }
        
        document.getElementById('modal-trailer').onclick = () => this.watchTrailer(movie.imdbID);
        document.getElementById('modal-save').onclick = () => this.saveMovie(movie);
        document.getElementById('modal-share').onclick = () => this.shareMovie(movie);
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    async getMovieDetails(movieId) {
        try {
            if (movieId.startsWith('tmdb_')) {
                const tmdbId = movieId.replace('tmdb_', '');
                return await TMDbAPI.fetchMovieDetails(tmdbId);
            }
            return {};
        } catch (error) {
            console.warn(`Failed to get details for ${movieId}:`, error);
            return {};
        }
    }

    changeView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        const moviesContainer = document.getElementById('movies-container');
        
        if (view === 'list') {
            moviesContainer.classList.add('list-view');
        } else {
            moviesContainer.classList.remove('list-view');
        }
        
        this.currentView = view;
    }

    async loadMoreMovies() {
        if (!this.selectedGenre) return;
        
        try {
            const moreMovies = await this.fetchMoviesByType(this.currentType);
            this.currentMovies = [...this.currentMovies, ...moreMovies];
            
            const moviesContainer = document.getElementById('movies-container');
            moreMovies.forEach(movie => {
                const movieCard = this.createMovieCard(movie);
                moviesContainer.appendChild(movieCard);
            });
            
        } catch (error) {
            alert('Failed to load more movies');
        }
    }

    watchTrailer(imdbID) {
        // This method is kept for modal usage
        window.open(`https://www.imdb.com/title/${imdbID}`, '_blank');
    }

    saveMovie(movie) {
        let savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');
        
        if (!savedMovies.find(m => m.imdbID === movie.imdbID)) {
            savedMovies.push({
                ...movie,
                savedAt: new Date().toISOString(),
                genre: this.selectedGenre.name
            });
            localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
            
            const btn = document.getElementById('modal-save');
            btn.textContent = '✅ Saved!';
            btn.style.background = 'var(--success)';
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.textContent = '💾 Save';
                btn.style.background = 'transparent';
                btn.style.color = 'var(--primary)';
            }, 2000);
        }
    }

    shareMovie(movie) {
        const shareText = `Check out this ${this.selectedGenre.name.toLowerCase()} movie: ${movie.Title} (${movie.Year})`;
        
        if (navigator.share) {
            navigator.share({
                title: movie.Title,
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Movie info copied to clipboard!');
        }
    }

    showLoading(status) {
        const loading = document.getElementById('loading-genre');
        const loadingStatus = document.getElementById('genre-loading-status');
        loadingStatus.textContent = status;
        loading.classList.remove('hidden');
    }

    getFallbackMovies() {
        const fallbackMovies = [
            'The Dark Knight', 'Inception', 'Interstellar', 'The Matrix',
            'Pulp Fiction', 'Fight Club', 'Goodfellas', 'The Godfather'
        ];
        return fallbackMovies.map((title, index) => ({
            Title: title,
            Year: '2020',
            imdbID: `genre_fallback${index}`,
            Poster: `https://via.placeholder.com/200x300?text=${encodeURIComponent(title)}`,
            Genre: this.selectedGenre ? this.selectedGenre.name : 'Action'
        }));
    }

    hideLoading() {
        const loading = document.getElementById('loading-genre');
        loading.classList.add('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('movie-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', () => {
    new GenreExplorer();
});