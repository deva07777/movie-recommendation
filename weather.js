const OMDB_API_KEY = 'e5731106';
const WEATHER_API_KEY = 'ffcb57bffc5f60e19fe22661807f9b7c';

class WeatherMovieRecommender {
    constructor() {
        this.currentWeather = null;
        this.currentMovie = null;
        this.filteredMovies = [];
        this.initEventListeners();
        this.initializeFilters();
    }

    initEventListeners() {
        document.getElementById('detect-weather').addEventListener('click', () => this.detectWeather());
        document.getElementById('get-weather-recommendation').addEventListener('click', () => this.getRecommendation());
        document.getElementById('recommend-again').addEventListener('click', () => this.getAnotherRecommendation());
        document.getElementById('save-movie').addEventListener('click', () => this.saveMovie());
        document.getElementById('trailer-btn').addEventListener('click', () => this.watchTrailer());
        document.getElementById('watch-trailer').addEventListener('click', () => this.watchTrailer());
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

    async detectWeather() {
        this.showLoading('Detecting your location...');
        
        if (!navigator.geolocation) {
            this.hideLoading();
            alert('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await this.fetchWeatherData(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                this.hideLoading();
                alert('Unable to retrieve your location. Please enable location services.');
            }
        );
    }

    async fetchWeatherData(lat, lon) {
        try {
            // Check cache first
            const cachedWeather = recommendationTracker.getCachedWeather(lat, lon);
            if (cachedWeather) {
                this.currentWeather = cachedWeather;
                this.displayWeather(cachedWeather);
                this.enableRecommendationButton();
                this.hideLoading();
                return;
            }
            
            this.updateLoadingStatus('Fetching weather data...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`,
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error('Weather API error');
            
            const data = await response.json();
            recommendationTracker.cacheWeather(lat, lon, data);
            this.currentWeather = data;
            this.displayWeather(data);
            this.enableRecommendationButton();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            alert('Failed to fetch weather data. Please try again.');
        }
    }

    displayWeather(weather) {
        const weatherDisplay = document.getElementById('weather-display');
        const weatherIcon = document.getElementById('weather-icon');
        const temperature = document.getElementById('temperature');
        const condition = document.getElementById('condition');
        const location = document.getElementById('location');
        const feelsLike = document.getElementById('feels-like');
        const humidity = document.getElementById('humidity');

        const temp = Math.round(weather.main.temp);
        const feels = Math.round(weather.main.feels_like);
        
        weatherIcon.textContent = this.getWeatherIcon(weather.weather[0].main.toLowerCase());
        temperature.textContent = `${temp}°C`;
        condition.textContent = weather.weather[0].description;
        location.textContent = `${weather.name}, ${weather.sys.country}`;
        feelsLike.textContent = `${feels}°C`;
        humidity.textContent = `${weather.main.humidity}%`;

        weatherDisplay.classList.remove('hidden');
    }

    getWeatherIcon(condition) {
        const icons = {
            clear: '☀️',
            clouds: '☁️',
            rain: '🌧️',
            drizzle: '🌦️',
            thunderstorm: '⛈️',
            snow: '❄️',
            mist: '🌫️',
            fog: '🌫️',
            haze: '🌫️'
        };
        return icons[condition] || '🌤️';
    }

    enableRecommendationButton() {
        const btn = document.getElementById('get-weather-recommendation');
        btn.classList.remove('disabled');
        btn.style.cursor = 'pointer';
    }

    async getRecommendation() {
        if (!this.currentWeather) {
            alert('Please detect weather first!');
            return;
        }

        this.showLoading('Finding the perfect movie for your weather...');
        
        try {
            const weatherMood = this.getWeatherBasedMood();
            const movies = await OMDbAPI.fetchMoviesByGenre(weatherMood);
            
            // Movies from TMDb already have detailed info
            const detailedMovies = movies;
            
            // Apply filters
            this.filteredMovies = movieFilter.filterMovies(detailedMovies);
            
            if (this.filteredMovies.length > 0) {
                const selectedMovie = this.selectWeatherAppropriateMovie(this.filteredMovies);
                this.currentMovie = selectedMovie;
                await this.displayMovie(selectedMovie);
            } else {
                alert('No movies match your filters. Try adjusting your criteria.');
            }
        } catch (error) {
            alert('Failed to get movie recommendation. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    getAnotherRecommendation() {
        if (this.filteredMovies.length > 1) {
            const selectedMovie = this.selectWeatherAppropriateMovie(this.filteredMovies);
            this.currentMovie = selectedMovie;
            this.displayMovie(selectedMovie);
        } else {
            this.getRecommendation();
        }
    }
    
    applyFiltersToMovies(filters) {
        if (this.filteredMovies.length > 0) {
            const filtered = movieFilter.filterMovies(this.filteredMovies);
            if (filtered.length > 0) {
                const selectedMovie = this.selectWeatherAppropriateMovie(filtered);
                this.currentMovie = selectedMovie;
                this.displayMovie(selectedMovie);
            } else {
                alert('No movies match your current filters. Try adjusting your criteria.');
            }
        }
    }

    getWeatherBasedMood() {
        const condition = this.currentWeather.weather[0].main.toLowerCase();
        const weatherMoodMap = {
            rain: 'sad',
            clear: 'energetic', 
            clouds: 'mysterious',
            snow: 'romantic',
            thunderstorm: 'thrilling',
            fog: 'mysterious'
        };
        return weatherMoodMap[condition] || 'happy';
    }

    // Removed - now using TMDb API directly

    selectWeatherAppropriateMovie(movies) {
        const validMovies = movies.filter(movie => movie.Poster !== 'N/A');
        const unrecommendedMovies = recommendationTracker.filterUnrecommendedMovies(validMovies);
        
        if (unrecommendedMovies.length === 0) {
            // If all movies have been recommended, reset and use all movies
            recommendationTracker.clearRecommendations();
            return validMovies[Math.floor(Math.random() * validMovies.length)] || movies[0];
        }
        
        const selectedMovie = unrecommendedMovies[Math.floor(Math.random() * unrecommendedMovies.length)];
        recommendationTracker.addRecommendedMovie(selectedMovie.imdbID);
        return selectedMovie;
    }

    async displayMovie(movie) {
        const movieResult = document.getElementById('movie-result');
        const moviePoster = document.getElementById('movie-poster');
        const movieTitle = document.getElementById('movie-title');
        const movieRating = document.getElementById('movie-rating');
        const movieYear = document.getElementById('movie-year');
        const movieRuntime = document.getElementById('movie-runtime');
        const movieGenres = document.getElementById('movie-genres');
        const movieOverview = document.getElementById('movie-overview');
        const matchReason = document.getElementById('match-reason');

        const details = await this.getMovieDetails(movie.imdbID);
        
        moviePoster.src = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/350x500?text=No+Image';
        movieTitle.textContent = movie.Title;
        movieRating.textContent = `⭐ ${details.imdbRating || 'N/A'}`;
        movieYear.textContent = movie.Year;
        movieRuntime.textContent = details.Runtime || 'N/A';
        movieOverview.textContent = details.Plot || 'No description available.';
        
        movieGenres.innerHTML = '';
        if (details.Genre) {
            details.Genre.split(', ').slice(0, 3).forEach(genre => {
                const genreTag = document.createElement('span');
                genreTag.className = 'genre-tag';
                genreTag.textContent = genre;
                movieGenres.appendChild(genreTag);
            });
        }

        matchReason.textContent = this.getMatchReason();
        movieResult.classList.remove('hidden');
        movieResult.scrollIntoView({ behavior: 'smooth' });
    }

    async getMovieDetails(movieId) {
        try {
            if (movieId.startsWith('tmdb_')) {
                const tmdbId = movieId.replace('tmdb_', '');
                return await OMDbAPI.fetchMovieDetails(movieId.replace('tmdb_', ''));
            }
            return {};
        } catch (error) {
            console.warn(`Failed to get details for ${movieId}:`, error);
            return {};
        }
    }

    getMatchReason() {
        const condition = this.currentWeather.weather[0].main.toLowerCase();
        const reasons = {
            rain: "Perfect for a cozy rainy day! 🌧️",
            clear: "Great for sunny weather vibes! ☀️",
            clouds: "Ideal for cloudy day relaxation! ☁️",
            snow: "Cozy winter movie night! ❄️",
            thunderstorm: "Thrilling like the storm outside! ⛈️"
        };
        return reasons[condition] || "Perfectly matched to your weather! 🎯";
    }

    saveMovie() {
        if (!this.currentMovie) return;
        
        let savedMovies = JSON.parse(localStorage.getItem('savedMovies') || '[]');
        
        if (!savedMovies.find(m => m.imdbID === this.currentMovie.imdbID)) {
            savedMovies.push(this.currentMovie);
            localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
            
            const btn = document.getElementById('save-movie');
            btn.textContent = '✅ Saved!';
            btn.style.background = 'var(--success)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            
            setTimeout(() => {
                btn.textContent = '💾 Save for Later';
                btn.style.background = 'transparent';
                btn.style.color = 'var(--primary)';
                btn.style.border = '2px solid var(--primary)';
            }, 2000);
        }
    }

    watchTrailer() {
        if (!this.currentMovie) return;
        TrailerUtils.openTrailer(this.currentMovie);
    }

    showLoading(status = 'Loading...') {
        const loading = document.getElementById('loading');
        const loadingStatus = document.getElementById('loading-status');
        loadingStatus.textContent = status;
        loading.classList.remove('hidden');
    }

    updateLoadingStatus(status) {
        const loadingStatus = document.getElementById('loading-status');
        loadingStatus.textContent = status;
    }

    getFallbackMovies() {
        const fallbackMovies = [
            'The Dark Knight', 'Inception', 'Interstellar', 'Blade Runner 2049',
            'The Matrix', 'Pulp Fiction', 'Fight Club', 'Goodfellas'
        ];
        return fallbackMovies.map((title, index) => ({
            Title: title,
            Year: '2020',
            imdbID: `weather_fallback${index}`,
            Poster: `https://via.placeholder.com/200x300?text=${encodeURIComponent(title)}`
        }));
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        loading.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherMovieRecommender();
});