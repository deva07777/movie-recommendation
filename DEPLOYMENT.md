# Vercel Deployment Guide for OMDb Movie Recommendation App

## Environment Variables Setup

### 1. Local Development (.env.local)
```bash
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key_here
```

### 2. Vercel Dashboard Setup

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and login
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_OMDB_API_KEY`
   - **Value**: `your_omdb_api_key_here`
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add NEXT_PUBLIC_OMDB_API_KEY
# Enter your API key when prompted
# Select all environments (Production, Preview, Development)
```

### 3. Get Your OMDb API Key
1. Visit [OMDb API](http://www.omdbapi.com/apikey.aspx)
2. Choose a plan (free tier available)
3. Verify your email
4. Copy your API key

## Deployment Steps

### Quick Deploy
```bash
# Push to GitHub
git add .
git commit -m "Add OMDb API integration"
git push origin main

# Deploy to Vercel (if connected to GitHub)
# Vercel will automatically deploy on push
```

### Manual Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Environment Variable Access

### Frontend (Client-side)
```javascript
// ✅ Correct - accessible in browser
const apiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;
```

### Backend (Server-side)
```javascript
// ✅ Correct - server-side only
const apiKey = process.env.OMDB_API_KEY;
```

## Important Notes

1. **NEXT_PUBLIC_ Prefix**: Required for client-side access in Next.js
2. **Security**: API keys with NEXT_PUBLIC_ are visible in browser
3. **Rate Limits**: OMDb free tier has 1000 requests/day limit
4. **Error Handling**: Always implement proper error handling for API failures

## Troubleshooting

### Common Issues

#### 1. API Key Not Found
```javascript
// Check if environment variable is set
if (!process.env.NEXT_PUBLIC_OMDB_API_KEY) {
  console.error('OMDb API key not configured');
}
```

#### 2. CORS Issues
- OMDb API supports CORS, no proxy needed
- Make sure you're using the correct API endpoint

#### 3. Rate Limit Exceeded
```javascript
// Handle rate limit errors
if (data.Error === 'Request limit reached!') {
  // Show user-friendly message
  setError('Too many requests. Please try again later.');
}
```

#### 4. Deployment Environment Variables
```bash
# Check if variables are set in Vercel
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

## Testing Deployment

### 1. Test API Key
```javascript
// Test in browser console after deployment
console.log('API Key:', process.env.NEXT_PUBLIC_OMDB_API_KEY);
```

### 2. Test API Call
```javascript
// Test OMDb API call
fetch(`https://www.omdbapi.com/?s=batman&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

## Production Checklist

- [ ] OMDb API key obtained and verified
- [ ] Environment variable set in Vercel dashboard
- [ ] Code uses `NEXT_PUBLIC_OMDB_API_KEY`
- [ ] Error handling implemented
- [ ] Rate limiting considered
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Domain configured (if custom domain needed)

## Performance Optimization

### 1. Caching
```javascript
// Implement caching for repeated requests
const cache = new Map();

async function cachedFetch(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, data);
  return data;
}
```

### 2. Request Batching
```javascript
// Batch multiple movie detail requests
const movieDetails = await Promise.all(
  movieIds.map(id => fetchMovieById(id))
);
```

## Monitoring

### 1. Error Tracking
```javascript
// Log errors for monitoring
console.error('OMDb API Error:', {
  error: result.error,
  timestamp: new Date().toISOString(),
  searchTerm: keyword
});
```

### 2. Usage Tracking
```javascript
// Track API usage
const apiUsage = {
  requests: 0,
  errors: 0,
  lastReset: new Date().toDateString()
};
```