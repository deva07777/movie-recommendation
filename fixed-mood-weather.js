// Fixed Weather + Mood Page
const OMDB_API_KEY = 'e5731106';
const WEATHER_API_KEY = '7c9c4f8a8b8e4c9d9e8f7a6b5c4d3e2f';

class WeatherMoodApp {
    constructor() {
        this.selectedMood = null;
        this.currentWeather = null;
        this.currentMovie = null;
        this.recommendedMovies = new Set(JSON.parse(localStorage.getItem('recommendedMovies') || '[]'));
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.autoDetectWeather();
    }

    setupEventListeners() {
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectMood(e.currentTarget));
        });

        document.getElementById('auto-detect').addEventListener('click', () => this.detectWeather());
        document.getElementById('manual-weather').addEventListener('change', (e) => this.setManualWeather(e.target.value));
        document.getElementById('get-fusion-recommendation').addEventListener('click', () => this.getFusionRecommendation());
        document.getElementById('new-recommendation').addEventListener('click', () => this.getFusionRecommendation());
        document.getElementById('save-fusion').addEventListener('click', () => this.saveMovie());
        document.getElementById('play-trailer').addEventListener('click', () => this.playTrailer());
    }

    selectMood(moodElement) {
        document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
        moodElement.classList.add('selected');
        this.selectedMood = moodElement.dataset.mood;
        this.updateFusionStatus();
    }

    async autoDetectWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => this.fetchWeatherData(position.coords.latitude, position.coords.longitude),
                () => this.setDefaultWeather()
            );
        } else {
            this.setDefaultWeather();
        }
    }

    async detectWeather() {
        this.showLoading('Detecting your location...');
        
        if (!navigator.geolocation) {
            this.hideLoading();
            this.setDefaultWeather();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => this.fetchWeatherData(position.coords.latitude, position.coords.longitude),
            () => {
                this.hideLoading();
                this.setDefaultWeather();
            }
        );
    }

    async fetchWeatherData(lat, lon) {
        try {
            this.updateLoadingProgress('Fetching weather data...');
            
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
            );
            
            if (!response.ok) throw new Error('Weather API error');
            
            const data = await response.json();
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
            this.setDefaultWeather();
        }
    }

    setDefaultWeather() {
        this.currentWeather = {
            condition: 'clear',
            temperature: 22,
            description: 'clear sky',
            location: 'Default Location'
        };
        this.displayWeather();
        this.updateFusionStatus();
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
                    <div class="weather-temp">${Math.round(this.currentWeather.temperature)}°C</div>
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
            statusText.textContent = 'Great! Weather detected automatically';
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
            const searchTerm = this.getFusionSearchTerm();
            const movies = await this.fetchMovies(searchTerm);
            const selectedMovie = this.selectFusionMovie(movies);
            
            if (selectedMovie) {
                this.currentMovie = selectedMovie;
                await this.displayFusionResult(selectedMovie);
            } else {
                alert('No suitable movies found');
            }
        } catch (error) {
            alert('Failed to get recommendation');
        } finally {
            this.hideLoading();
        }
    }

    getFusionSearchTerm() {
        const moodTerms = {
            happy: 'comedy',
            sad: 'drama',
            energetic: 'action',
            relaxed: 'romance',
            romantic: 'romance',
            adventurous: 'adventure',
            nostalgic: 'classic',
            mysterious: 'mystery'
        };

        return moodTerms[this.selectedMood] || 'movie';
    }

    async fetchMovies(searchTerm) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&type=movie&apikey=${OMDB_API_KEY}`);
            const data = await response.json();
            
            if (data.Response === 'True') {
                const detailedMovies = await Promise.all(
                    data.Search.slice(0, 10).map(async movie => {
                        const details = await this.getMovieDetails(movie.imdbID);
                        return { ...movie, ...details };
                    })
                );
                return detailedMovies.filter(movie => movie.Poster !== 'N/A');
            }
            return [];
        } catch (error) {
            console.error('Error fetching movies:', error);
            return [];
        }
    }

    async getMovieDetails(imdbID) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
            return await response.json();
        } catch (error) {
            return {};
        }
    }

    selectFusionMovie(movies) {
        const validMovies = movies.filter(movie => 
            movie.Poster !== 'N/A' && !this.recommendedMovies.has(movie.imdbID)
        );
        
        if (validMovies.length === 0) {
            this.recommendedMovies.clear();
            localStorage.setItem('recommendedMovies', JSON.stringify([]));
            return movies.filter(movie => movie.Poster !== 'N/A')[0] || movies[0];
        }
        
        const selected = validMovies[Math.floor(Math.random() * validMovies.length)];
        this.recommendedMovies.add(selected.imdbID);
        localStorage.setItem('recommendedMovies', JSON.stringify([...this.recommendedMovies]));
        return selected;
    }

    async displayFusionResult(movie) {
        const resultSection = document.getElementById('recommendation-result');
        
        document.getElementById('result-poster').src = movie.Poster;
        document.getElementById('result-title').textContent = movie.Title;
        document.getElementById('result-rating').textContent = `⭐ ${movie.imdbRating || 'N/A'}`;
        document.getElementById('result-year').textContent = movie.Year;
        document.getElementById('result-duration').textContent = movie.Runtime || 'N/A';
        document.getElementById('result-overview').textContent = movie.Plot || 'No description available.';
        
        const genresContainer = document.getElementById('result-genres');
        genresContainer.innerHTML = '';
        if (movie.Genre) {
            movie.Genre.split(', ').slice(0, 3).forEach(genre => {
                const tag = document.createElement('span');
                tag.className = 'genre-tag';
                tag.textContent = genre;
                genresContainer.appendChild(tag);
            });
        }
        
        const fusionScore = this.calculateFusionScore(movie);
        document.querySelector('.score-value').textContent = `${fusionScore}%`;
        
        document.getElementById('mood-analysis').textContent = this.getMoodAnalysis();
        document.getElementById('weather-analysis').textContent = this.getWeatherAnalysis();
        
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    calculateFusionScore(movie) {
        let score = 75;
        
        if (movie.imdbRating && parseFloat(movie.imdbRating) > 7) score += 15;
        if (movie.imdbRating && parseFloat(movie.imdbRating) > 8) score += 10;
        
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
            foggy: 'Mysterious atmosphere enhanced by foggy conditions',
            clear: 'Perfect viewing conditions for any genre'
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
            const originalText = btn.textContent;
            btn.textContent = '✅ Saved!';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }

    playTrailer() {
        if (!this.currentMovie) return;
        const query = encodeURIComponent(`${this.currentMovie.Title} trailer`);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }

    showLoading(status) {
        const loading = document.getElementById('loading-fusion');
        const progress = document.getElementById('fusion-progress');
        if (progress) progress.textContent = status;
        if (loading) loading.classList.remove('hidden');
    }

    updateLoadingProgress(status) {
        const progress = document.getElementById('fusion-progress');
        if (progress) progress.textContent = status;
    }

    hideLoading() {
        const loading = document.getElementById('loading-fusion');
        if (loading) loading.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherMoodApp();
});