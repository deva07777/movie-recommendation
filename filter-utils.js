// Shared Filter Utility for Movie Recommendations
class MovieFilter {
    constructor() {
        this.filters = {
            minRating: 0,
            maxRating: 10,
            yearFrom: 1900,
            yearTo: new Date().getFullYear(),
            minRuntime: 0,
            maxRuntime: 300,
            genre: '',
            language: '',
            country: '',
            director: '',
            actor: ''
        };
        this.isVisible = false;
    }

    createFilterHTML() {
        return `
            <div class="filter-section">
                <div class="filter-header">
                    <h3>Filter Movies</h3>
                    <button class="filter-toggle" onclick="movieFilter.toggleFilters()">
                        <i class="fas fa-filter"></i>
                        <span>${this.isVisible ? 'Hide' : 'Show'} Filters</span>
                    </button>
                </div>
                <div class="filter-controls" style="display: ${this.isVisible ? 'grid' : 'none'}">
                    <div class="filter-group">
                        <label>Rating Range</label>
                        <div class="filter-range">
                            <input type="number" id="minRating" class="filter-input" 
                                   min="0" max="10" step="0.1" value="${this.filters.minRating}" 
                                   placeholder="Min">
                            <span>-</span>
                            <input type="number" id="maxRating" class="filter-input" 
                                   min="0" max="10" step="0.1" value="${this.filters.maxRating}" 
                                   placeholder="Max">
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label>Year Range</label>
                        <div class="filter-range">
                            <input type="number" id="yearFrom" class="filter-input" 
                                   min="1900" max="${new Date().getFullYear()}" value="${this.filters.yearFrom}" 
                                   placeholder="From">
                            <span>-</span>
                            <input type="number" id="yearTo" class="filter-input" 
                                   min="1900" max="${new Date().getFullYear()}" value="${this.filters.yearTo}" 
                                   placeholder="To">
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label>Runtime (minutes)</label>
                        <div class="filter-range">
                            <input type="number" id="minRuntime" class="filter-input" 
                                   min="0" max="300" value="${this.filters.minRuntime}" 
                                   placeholder="Min">
                            <span>-</span>
                            <input type="number" id="maxRuntime" class="filter-input" 
                                   min="0" max="300" value="${this.filters.maxRuntime}" 
                                   placeholder="Max">
                        </div>
                    </div>
                    
                    <div class="filter-group">
                        <label>Genre</label>
                        <select id="genre" class="filter-input">
                            <option value="">All Genres</option>
                            <option value="Action">Action</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Animation">Animation</option>
                            <option value="Comedy">Comedy</option>
                            <option value="Crime">Crime</option>
                            <option value="Documentary">Documentary</option>
                            <option value="Drama">Drama</option>
                            <option value="Family">Family</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Horror">Horror</option>
                            <option value="Mystery">Mystery</option>
                            <option value="Romance">Romance</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Thriller">Thriller</option>
                            <option value="War">War</option>
                            <option value="Western">Western</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Language</label>
                        <select id="language" class="filter-input">
                            <option value="">All Languages</option>
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Italian">Italian</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Korean">Korean</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Russian">Russian</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Director</label>
                        <input type="text" id="director" class="filter-input" 
                               placeholder="Director name" value="${this.filters.director}">
                    </div>
                    
                    <div class="filter-group">
                        <label>Actor</label>
                        <input type="text" id="actor" class="filter-input" 
                               placeholder="Actor name" value="${this.filters.actor}">
                    </div>
                    
                    <div class="filter-group">
                        <label>Country</label>
                        <select id="country" class="filter-input">
                            <option value="">All Countries</option>
                            <option value="USA">USA</option>
                            <option value="UK">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="France">France</option>
                            <option value="Germany">Germany</option>
                            <option value="Italy">Italy</option>
                            <option value="Spain">Spain</option>
                            <option value="Japan">Japan</option>
                            <option value="South Korea">South Korea</option>
                            <option value="China">China</option>
                            <option value="India">India</option>
                            <option value="Australia">Australia</option>
                        </select>
                    </div>
                </div>
                <div class="filter-actions" style="display: ${this.isVisible ? 'flex' : 'none'}">
                    <button class="btn-filter" onclick="movieFilter.applyFilters()">Apply Filters</button>
                    <button class="btn-clear" onclick="movieFilter.clearFilters()">Clear All</button>
                </div>
            </div>
        `;
    }

    toggleFilters() {
        this.isVisible = !this.isVisible;
        const filterSection = document.querySelector('.filter-section');
        if (filterSection) {
            filterSection.innerHTML = this.createFilterHTML();
        }
    }

    updateFilters() {
        this.filters.minRating = parseFloat(document.getElementById('minRating')?.value || 0);
        this.filters.maxRating = parseFloat(document.getElementById('maxRating')?.value || 10);
        this.filters.yearFrom = parseInt(document.getElementById('yearFrom')?.value || 1900);
        this.filters.yearTo = parseInt(document.getElementById('yearTo')?.value || new Date().getFullYear());
        this.filters.minRuntime = parseInt(document.getElementById('minRuntime')?.value || 0);
        this.filters.maxRuntime = parseInt(document.getElementById('maxRuntime')?.value || 300);
        this.filters.genre = document.getElementById('genre')?.value || '';
        this.filters.language = document.getElementById('language')?.value || '';
        this.filters.country = document.getElementById('country')?.value || '';
        this.filters.director = document.getElementById('director')?.value || '';
        this.filters.actor = document.getElementById('actor')?.value || '';
    }

    applyFilters() {
        this.updateFilters();
        // Trigger filter event that pages can listen to
        window.dispatchEvent(new CustomEvent('filtersApplied', { detail: this.filters }));
    }

    clearFilters() {
        this.filters = {
            minRating: 0,
            maxRating: 10,
            yearFrom: 1900,
            yearTo: new Date().getFullYear(),
            minRuntime: 0,
            maxRuntime: 300,
            genre: '',
            language: '',
            country: '',
            director: '',
            actor: ''
        };
        
        // Update form fields
        document.getElementById('minRating').value = this.filters.minRating;
        document.getElementById('maxRating').value = this.filters.maxRating;
        document.getElementById('yearFrom').value = this.filters.yearFrom;
        document.getElementById('yearTo').value = this.filters.yearTo;
        document.getElementById('minRuntime').value = this.filters.minRuntime;
        document.getElementById('maxRuntime').value = this.filters.maxRuntime;
        document.getElementById('genre').value = this.filters.genre;
        document.getElementById('language').value = this.filters.language;
        document.getElementById('country').value = this.filters.country;
        document.getElementById('director').value = this.filters.director;
        document.getElementById('actor').value = this.filters.actor;
        
        this.applyFilters();
    }

    filterMovies(movies) {
        return movies.filter(movie => {
            // Rating filter
            const rating = parseFloat(movie.imdbRating) || 0;
            if (rating < this.filters.minRating || rating > this.filters.maxRating) {
                return false;
            }

            // Year filter
            const year = parseInt(movie.Year) || 0;
            if (year < this.filters.yearFrom || year > this.filters.yearTo) {
                return false;
            }

            // Runtime filter
            const runtime = parseInt(movie.Runtime) || 0;
            if (runtime < this.filters.minRuntime || runtime > this.filters.maxRuntime) {
                return false;
            }

            // Genre filter
            if (this.filters.genre && movie.Genre && !movie.Genre.includes(this.filters.genre)) {
                return false;
            }

            // Language filter
            if (this.filters.language && movie.Language && !movie.Language.includes(this.filters.language)) {
                return false;
            }

            // Country filter
            if (this.filters.country && movie.Country && !movie.Country.includes(this.filters.country)) {
                return false;
            }

            // Director filter
            if (this.filters.director && movie.Director && 
                !movie.Director.toLowerCase().includes(this.filters.director.toLowerCase())) {
                return false;
            }

            // Actor filter
            if (this.filters.actor && movie.Actors && 
                !movie.Actors.toLowerCase().includes(this.filters.actor.toLowerCase())) {
                return false;
            }

            return true;
        });
    }

    getDecadeOptions() {
        const currentYear = new Date().getFullYear();
        const decades = [];
        for (let year = 1920; year <= currentYear; year += 10) {
            decades.push({
                value: `${year}-${year + 9}`,
                label: `${year}s`
            });
        }
        return decades.reverse();
    }

    addDecadeFilter() {
        const decadeHTML = `
            <div class="filter-group">
                <label>Decade</label>
                <select id="decade" class="filter-input">
                    <option value="">All Decades</option>
                    ${this.getDecadeOptions().map(decade => 
                        `<option value="${decade.value}">${decade.label}</option>`
                    ).join('')}
                </select>
            </div>
        `;
        return decadeHTML;
    }
}

// Initialize global filter instance
const movieFilter = new MovieFilter();

// Utility functions for enhanced filtering
function getPopularGenres() {
    return ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure'];
}

function getTopDirectors() {
    return ['Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino', 'Steven Spielberg', 
            'David Fincher', 'Denis Villeneuve', 'Jordan Peele', 'Greta Gerwig'];
}

function getTopActors() {
    return ['Leonardo DiCaprio', 'Meryl Streep', 'Tom Hanks', 'Scarlett Johansson',
            'Robert Downey Jr.', 'Jennifer Lawrence', 'Brad Pitt', 'Margot Robbie'];
}

// Enhanced search with filters
async function searchMoviesWithFilters(query, filters = {}) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=e5731106&type=movie`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Get detailed info for each movie to apply filters
            const detailedMovies = await Promise.all(
                data.Search.slice(0, 10).map(async movie => {
                    const detailResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=e5731106`);
                    return await detailResponse.json();
                })
            );
            
            return movieFilter.filterMovies(detailedMovies);
        }
        return [];
    } catch (error) {
        console.error('Error searching movies with filters:', error);
        return [];
    }
}