# CineMatch - Premium Movie Recommendation Platform

## 🚀 Vercel Deployment Setup

### Prerequisites
- GitHub account
- Vercel account (free)
- TMDb API key

### Quick Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `TMDB_API_KEY=4d79fb69b3f9cc08488718e7792ad412`
   - Deploy!

### Local Development

```bash
npm install -g vercel
vercel dev
```

## 🎯 API Endpoints

### `/api/movies`
- **Parameters**: `mood` or `genreId`
- **Example**: `/api/movies?mood=happy`
- **Returns**: Top 10 movies with full poster URLs

### Supported Moods
- `happy` → Comedy + Romance
- `sad` → Drama  
- `romantic` → Romance
- `scary` → Horror + Thriller
- `thrilling` → Thriller + Horror
- `adventurous` → Adventure + Fantasy
- `energetic` → Action + Adventure
- `relaxed` → Family + Comedy
- `nostalgic` → Drama + History
- `mysterious` → Mystery + Thriller

### Genre IDs
- Action: 28, Adventure: 12, Comedy: 35, Drama: 18
- Horror: 27, Romance: 10749, Thriller: 53, Sci-Fi: 878
- Fantasy: 14, Mystery: 9648, Crime: 80, Family: 10751

## 🔧 Features
- ✅ Serverless TMDb API integration
- ✅ CORS-free movie fetching
- ✅ Environment variable security
- ✅ Mood-to-genre mapping
- ✅ High-quality movie data (6.5+ rating)
- ✅ Full poster URL transformation
- ✅ Vercel-ready deployment