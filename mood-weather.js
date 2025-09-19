const OMDB_API_KEY = 'e5731106';
const WEATHER_API_KEY = 'ffcb57bffc5f60e19fe22661807f9b7c';

class MoodWeatherFusion {
    constructor() {
        this.selectedMood = null;
        this.currentWeather = null;
        this.currentMovie = null;
        this.filteredMovies = [];
        this.initEventListeners();
        this.initializeFilters();
    }

    initEventListeners() {
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectMood(e.currentTarget));
        });

        document.getElementById('auto-detect').addEventListener('click', () => this.detectWeather());
        document.getElementById('manual-weather').addEventListener('change', (e) => this.setManualWeather(e.target.value));

        document.getElementById('get-fusion-recommendation').addEventListener('click', () => this.getFusionRecommendation());
        document.getElementById('new-recommendation').addEventListener('click', () => this.getAnotherRecommendation());
        document.getElementById('save-fusion').addEventListener('click', () => this.saveMovie());
        document.getElementById('share-result').addEventListener('click', () => this.shareResult());
        document.getElementById('play-trailer').addEventListener('click', () => this.playTrailer());
        document.getElementById('watch-fusion-trailer').addEventListener('click', () => this.playTrailer());
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

    selectMood(moodElement) {
        document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
        moodElement.classList.add('selected');
        this.selectedMood = moodElement.dataset.mood;
        this.updateFusionStatus();
    }

    async detectWeather() {
        this.showLoading('Detecting your location...');
        
        if (!navigator.geolocation) {
            this.hideLoading();
            alert('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await this.fetchWeatherData(position.coords.latitude, position.coords.longitude);
            },
            () => {
                this.hideLoading();
                alert('Location access denied');
            }
        );
    }

    async fetchWeatherData(lat, lon) {
        try {
            // Check cache first
            const cachedWeather = recommendationTracker.getCachedWeather(lat, lon);
            if (cachedWeather) {
                this.currentWeather = {
                    condition: cachedWeather.weather[0].main.toLowerCase(),
                    temperature: cachedWeather.main.temp,
                    description: cachedWeather.weather[0].description,
                    location: `${cachedWeather.name}, ${cachedWeather.sys.country}`
                };
                this.displayWeather();
                this.updateFusionStatus();
                this.hideLoading();
                return;
            }
            
            this.updateLoadingProgress('Fetching weather data...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`,
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            const data = await response.json();
            recommendationTracker.cacheWeather(lat, lon, data);
            
            this.currentWeather = {
                condition: data.weather[0].main.toLowerCase(),
                temperature: data.main.temp,
                description: data.weather[0].description,
                location: `${data.name}, ${data.sys.country}`
            };
            
            this.displayWeather();
            this.updateFusionStatus();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            alert('Failed to fetch weather data');
        }
    }

    setManualWeather(weatherType) {
        if (!weatherType) return;
        
        this.currentWeather = {
            condition: weatherType,
            temperature: 20,
            description: weatherType,
            location: 'Manual Selection'
        };
        
        this.displayWeather();
        this.updateFusionStatus();
    }

    displayWeather() {
        const weatherDisplay = document.getElementById('weather-display');
        const icon = this.getWeatherIcon(this.currentWeather.condition);
        
        weatherDisplay.innerHTML = `
            <div class="weather-info-display">
                <div class="weather-icon-large">${icon}</div>
                <div class="weather-text">
                    <div class="weather-condition">${this.currentWeather.description}</div>
                    <div class="weather-location">${this.currentWeather.location}</div>
                </div>
            </div>
        `;
        
        weatherDisplay.classList.remove('hidden');
    }

    getWeatherIcon(condition) {
        const icons = {
            clear: '☀️', sunny: '☀️',
            clouds: '☁️', cloudy: '☁️',
            rain: '🌧️', rainy: '🌧️',
            drizzle: '🌦️',
            thunderstorm: '⛈️', stormy: '⛈️',
            snow: '❄️', snowy: '❄️',
            mist: '🌫️', fog: '🌫️', foggy: '🌫️'
        };
        return icons[condition] || '🌤️';
    }

    updateFusionStatus() {
        const statusText = document.querySelector('.status-text');
        const fusionBtn = document.getElementById('get-fusion-recommendation');
        
        if (this.selectedMood && this.currentWeather) {
            statusText.textContent = `Ready to fuse ${this.selectedMood} mood with ${this.currentWeather.condition} weather`;
            fusionBtn.classList.remove('disabled');
        } else if (this.selectedMood) {
            statusText.textContent = 'Great! Now detect or select weather conditions';
        } else if (this.currentWeather) {
            statusText.textContent = 'Perfect! Now select your current mood';
        } else {
            statusText.textContent = 'Select mood and weather to begin';
        }
    }

    async getFusionRecommendation() {
        if (!this.selectedMood || !this.currentWeather) {
            alert('Please select both mood and weather');
            return;
        }

        this.showLoading('Analyzing emotional patterns...');
        
        try {
            const moodGenre = this.getFusionGenre();
            const movies = await IMDbAPI.fetchMoviesByGenre(moodGenre);
            
            // Movies from TMDb already have detailed info
            const detailedMovies = movies;
            
            // Apply filters
            this.filteredMovies = movieFilter.filterMovies(detailedMovies);
            
            if (this.filteredMovies.length > 0) {
                const selectedMovie = this.selectFusionMovie(this.filteredMovies);
                this.currentMovie = selectedMovie;
                await this.displayFusionResult(selectedMovie);
            } else {
                alert('No movies match your filters. Try adjusting your criteria.');
            }
        } catch (error) {
            alert('Failed to get recommendation');
        } finally {
            this.hideLoading();
        }
    }
    
    getAnotherRecommendation() {
        if (this.filteredMovies.length > 1) {
            const selectedMovie = this.selectFusionMovie(this.filteredMovies);
            this.currentMovie = selectedMovie;
            this.displayFusionResult(selectedMovie);
        } else {
            this.getFusionRecommendation();
        }
    }
    
    applyFiltersToMovies(filters) {
        if (this.filteredMovies.length > 0) {
            const filtered = movieFilter.filterMovies(this.filteredMovies);
            if (filtered.length > 0) {
                const selectedMovie = this.selectFusionMovie(filtered);
                this.currentMovie = selectedMovie;
                this.displayFusionResult(selectedMovie);
            } else {
                alert('No movies match your current filters. Try adjusting your criteria.');
            }
        }
    }

    getFusionGenre() {
        return this.selectedMood || 'happy';
    }

    // Removed - now using TMDb API directly

    selectFusionMovie(movies) {
        const validMovies = movies.filter(movie => movie.Poster !== 'N/A');
        const unrecommendedMovies = recommendationTracker.filterUnrecommendedMovies(validMovies);
        
        if (unrecommendedMovies.length === 0) {
            recommendationTracker.clearRecommendations();
            return validMovies[Math.floor(Math.random() * validMovies.length)] || movies[0];
        }
        
        const selectedMovie = unrecommendedMovies[Math.floor(Math.random() * unrecommendedMovies.length)];
        recommendationTracker.addRecommendedMovie(selectedMovie.imdbID);
        return selectedMovie;
    }

    async displayFusionResult(movie) {
        const resultSection = document.getElementById('recommendation-result');
        const details = await this.getMovieDetails(movie.imdbID);
        
        document.getElementById('result-poster').src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600?text=No+Image';
        document.getElementById('result-title').textContent = movie.Title;
        document.getElementById('result-rating').textContent = `⭐ ${details.imdbRating || 'N/A'}`;
        document.getElementById('result-year').textContent = movie.Year;
        document.getElementById('result-duration').textContent = details.Runtime || 'N/A';
        document.getElementById('result-overview').textContent = details.Plot || 'No description available.';
        
        const genresContainer = document.getElementById('result-genres');
        genresContainer.innerHTML = '';
        if (details.Genre) {
            details.Genre.split(', ').slice(0, 3).forEach(genre => {
                const tag = document.createElement('span');
                tag.className = 'genre-tag';
                tag.textContent = genre;
                genresContainer.appendChild(tag);
            });
        }
        
        const fusionScore = this.calculateFusionScore(details);
        document.querySelector('.score-value').textContent = `${fusionScore}%`;
        
        document.getElementById('mood-analysis').textContent = this.getMoodAnalysis();
        document.getElementById('weather-analysis').textContent = this.getWeatherAnalysis();
        
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    async getMovieDetails(movieId) {
        try {
            if (movieId.startsWith('tmdb_')) {
                const tmdbId = movieId.replace('tmdb_', '');
                return await IMDbAPI.fetchMovieDetails(movieId.replace('tmdb_', ''));
            }
            return {};
        } catch (error) {
            console.warn(`Failed to get details for ${movieId}:`, error);
            return {};
        }
    }

    calculateFusionScore(details) {
        let score = 75;
        
        if (details.imdbRating && parseFloat(details.imdbRating) > 7) score += 15;
        if (details.imdbRating && parseFloat(details.imdbRating) > 8) score += 10;
        
        return Math.min(score, 98);
    }

    getMoodAnalysis() {
        const analyses = {
            happy: 'Uplifting content that matches your positive energy',
            sad: 'Emotionally resonant story for reflective moments',
            energetic: 'High-energy content to fuel your enthusiasm',
            relaxed: 'Calming entertainment for peaceful viewing',
            romantic: 'Heartwarming story perfect for romantic moods',
            adventurous: 'Thrilling journey to satisfy your wanderlust',
            nostalgic: 'Timeless story that evokes cherished memories',
            mysterious: 'Intriguing plot to engage your curious mind'
        };
        
        return analyses[this.selectedMood] || 'Perfectly matched to your current mood';
    }

    getWeatherAnalysis() {
        const analyses = {
            rain: 'Cozy indoor viewing perfect for rainy weather',
            sunny: 'Bright and engaging content for sunny days',
            cloudy: 'Atmospheric story matching the cloudy ambiance',
            stormy: 'Intense drama complementing the stormy weather',
            snowy: 'Warm and comforting for cold snowy days',
            foggy: 'Mysterious atmosphere enhanced by foggy conditions'
        };
        
        return analyses[this.currentWeather.condition] || 'Ideally suited for current weather conditions';
    }

    saveMovie() {
        if (!this.currentMovie) return;
        
        let savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');
        
        if (!savedMovies.find(m => m.imdbID === this.currentMovie.imdbID)) {
            savedMovies.push({
                ...this.currentMovie,
                savedAt: new Date().toISOString(),
                mood: this.selectedMood,
                weather: this.currentWeather.condition
            });
            localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
            
            const btn = document.getElementById('save-fusion');
            btn.textContent = '✅ Saved!';
            btn.style.background = 'var(--success)';
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.textContent = '💾 Save Movie';
                btn.style.background = 'transparent';
                btn.style.color = 'var(--primary)';
            }, 2000);
        }
    }

    shareResult() {
        if (!this.currentMovie) return;
        
        const shareText = `Check out this perfect movie match: ${this.currentMovie.Title} - recommended for ${this.selectedMood} mood and ${this.currentWeather.condition} weather!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'CineMatch Recommendation',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Recommendation copied to clipboard!');
        }
    }

    playTrailer() {
        if (!this.currentMovie) return;
        TrailerUtils.openTrailer(this.currentMovie);
    }

    showLoading(status) {
        const loading = document.getElementById('loading-fusion');
        const progress = document.getElementById('fusion-progress');
        progress.textContent = status;
        loading.classList.remove('hidden');
    }

    updateLoadingProgress(status) {
        const progress = document.getElementById('fusion-progress');
        progress.textContent = status;
    }

    getFallbackMovies() {
        const fallbackMovies = [
            'The Dark Knight', 'Inception', 'Interstellar', 'Pulp Fiction',
            'The Matrix', 'Fight Club', 'Goodfellas', 'The Godfather'
        ];
        return fallbackMovies.map((title, index) => ({
            Title: title,
            Year: '2020',
            imdbID: `mood_fallback${index}`,
            Poster: `https://via.placeholder.com/200x300?text=${encodeURIComponent(title)}`
        }));
    }

    hideLoading() {
        const loading = document.getElementById('loading-fusion');
        loading.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MoodWeatherFusion();
});