# Vercel Deployment Instructions

## Environment Variable Setup

### Method 1: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and login
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `OMDB_API_KEY`
   - **Value**: `e5731106` (or your OMDb API key)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variable
vercel env add OMDB_API_KEY
# Enter your API key when prompted: e5731106
# Select all environments
```

## Deployment Steps

1. **Push to GitHub**:
```bash
git add .
git commit -m "Production-ready movie app with OMDb API"
git push origin main
```

2. **Deploy to Vercel**:
   - If connected to GitHub: Automatic deployment on push
   - Manual deploy: `vercel --prod`

## API Endpoints

- **GET** `/api/movies?query=batman` - Search movies
- Returns: `{ movies: [{ title, year, imdbID, type, poster }] }`
- Error: `{ error: "Error message" }`

## Testing

1. **Local**: `http://localhost:3000`
2. **Production**: `https://your-app.vercel.app`
3. **API Test**: `https://your-app.vercel.app/api/movies?query=batman`

## Features Included

✅ Serverless API with Node.js 18.x  
✅ Error handling and fallbacks  
✅ Loading states  
✅ Movie display in all sections  
✅ Modal functionality  
✅ Carousel navigation  
✅ Search functionality  
✅ Watchlist integration  
✅ Console logging for debugging  
✅ Production-ready code