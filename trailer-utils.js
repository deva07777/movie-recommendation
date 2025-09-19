class TrailerUtils {
    static openTrailer(movie) {
        const searchQuery = encodeURIComponent(`${movie.Title} ${movie.Year} trailer`);
        const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
        window.open(youtubeUrl, '_blank');
    }

    static addTrailerButton(container, movie, className = 'trailer-btn') {
        const trailerBtn = document.createElement('button');
        trailerBtn.className = className;
        trailerBtn.innerHTML = '<i class="fas fa-play"></i> Trailer';
        trailerBtn.onclick = (e) => {
            e.stopPropagation();
            this.openTrailer(movie);
        };
        container.appendChild(trailerBtn);
        return trailerBtn;
    }
}