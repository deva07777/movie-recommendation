const API_KEY = 'e5731106'; // TMDb API key
const WEATHER_API_KEY = 'ffcb57bffc5f60e19fe22661807f9b7c'; // OpenWeatherMap API key

class MovieRecommender {
    constructor() {
        this.currentWeather = null;
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('get-weather').addEventListener('click', () => this.getWeather());
        document.getElementById('get-recommendation').addEventListener('click', () => this.getRecommendation());
        document.getElementById('recommend-again').addEventListener('click', () => this.getRecommendation());
    }

    async getWeather() {
        if (!navigator.geolocation) {
            this.showWeatherError('Geolocation not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
                    );
                    const data = await response.json();
                    this.currentWeather = data;
                    this.displayWeather(data);
                } catch (error) {
                    this.showWeatherError('Unable to fetch weather');
                }
            },
            () => this.showWeatherError('Location access denied')
        );
    }

    displayWeather(weather) {
        const weatherDisplay = document.getElementById('weather-display');
        const temp = Math.round(weather.main.temp);
        const condition = weather.weather[0].main.toLowerCase();
        const icon = this.getWeatherIcon(condition);
        
        weatherDisplay.innerHTML = `
            ${icon} ${weather.weather[0].description} • ${temp}°C
        `;
        weatherDisplay.style.display = 'block';
    }

    getWeatherIcon(condition) {
        const icons = {
            clear: '☀️',
            clouds: '☁️',
            rain: '🌧️',
            snow: '❄️',
            thunderstorm: '⛈️',
            drizzle: '🌦️',
            mist: '🌫️'
        };
        return icons[condition] || '🌤️';
    }

    showWeatherError(message) {
        const weatherDisplay = document.getElementById('weather-display');
        weatherDisplay.innerHTML = `❌ ${message}`;
        weatherDisplay.style.display = 'block';
    }

    async getRecommendation() {
        const mood = document.getElementById('mood').value;
        const genre = document.getElementById('genre').value;

        if (!mood || !genre) {
            alert('Please select both mood and genre');
            return;
        }

        this.showLoading(true);
        
        try {
            const movies = await this.fetchMovies(genre);
            const selectedMovie = this.selectMovieByMoodAndWeather(movies, mood);
            await this.displayMovie(selectedMovie);
        } catch (error) {
            alert('Error fetching movie recommendation');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchMovies(genreId) {
        const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${Math.floor(Math.random() * 5) + 1}`
        );
        const data = await response.json();
        return data.results;
    }

    selectMovieByMoodAndWeather(movies, mood) {
        let filteredMovies = movies.filter(movie => {
            const rating = movie.vote_average || 0;
            
            // Mood-based filtering
            if (mood === 'happy' && rating < 7) return false;
            if (mood === 'sad' && rating > 6) return false;
            if (mood === 'energetic' && rating < 6.5) return false;
            
            return true;
        });

        // Weather-based adjustment
        if (this.currentWeather) {
            const condition = this.currentWeather.weather[0].main.toLowerCase();
            const temp = this.currentWeather.main.temp;
            
            if (['rain', 'drizzle', 'thunderstorm'].includes(condition) || temp < 10) {
                filteredMovies = filteredMovies.filter(movie => {
                    const overview = movie.overview.toLowerCase();
                    return !overview.includes('adventure') || overview.includes('home');
                });
            }
        }

        return filteredMovies.length > 0 
            ? filteredMovies[Math.floor(Math.random() * filteredMovies.length)]
            : movies[Math.floor(Math.random() * movies.length)];
    }

    async displayMovie(movie) {
        const movieCard = document.getElementById('movie-card');
        const movieImage = document.getElementById('movie-image');
        const movieTitle = document.getElementById('movie-title');
        const movieRating = document.getElementById('movie-rating');
        const movieDescription = document.getElementById('movie-description');

        movieImage.src = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Image';
        
        movieTitle.textContent = movie.title;
        movieRating.textContent = movie.vote_average
            ? `⭐ ${movie.vote_average.toFixed(1)}/10`
            : '⭐ N/A';
        movieDescription.textContent = movie.overview || 'No description available.';

        movieCard.classList.remove('hidden');
        movieCard.scrollIntoView({ behavior: 'smooth' });
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const movieCard = document.getElementById('movie-card');
        
        if (show) {
            loading.classList.remove('hidden');
            movieCard.classList.add('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new MovieRecommender();
});
