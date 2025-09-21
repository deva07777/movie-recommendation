# Vercel Deployment Setup

## Environment Variable Setup

### Method 1: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `OMDB_API_KEY`
   - **Value**: `your_omdb_api_key`
   - **Environment**: Production, Preview, Development
5. Click **Save**

### Method 2: Vercel CLI
```bash
vercel env add OMDB_API_KEY
# Enter your API key when prompted
```

## Get OMDb API Key
1. Visit [omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
2. Choose free or paid plan
3. Verify email and get your key

## Deploy
```bash
git add .
git commit -m "Add OMDb API integration"
git push origin main
```

## Test API
```bash
curl "https://your-app.vercel.app/api/movies?query=batman"
```