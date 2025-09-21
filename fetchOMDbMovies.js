// Example frontend fetch function
async function fetchOMDbMovies(keyword) {
  if (!keyword?.trim()) {
    throw new Error('Search keyword is required');
  }

  try {
    const response = await fetch(`/api/movies?query=${encodeURIComponent(keyword)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch movies');
    }

    return data.movies;
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(error.message || 'Network error occurred');
  }
}

// Usage examples:
// const movies = await fetchOMDbMovies('batman');
// const comedies = await fetchOMDbMovies('comedy');
// const actionMovies = await fetchOMDbMovies('action');

export { fetchOMDbMovies };