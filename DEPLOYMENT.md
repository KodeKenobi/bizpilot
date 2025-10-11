# Deployment Guide for JUSTPDF

## Overview
This app consists of two parts:
1. **Frontend**: Next.js app (deploy to Vercel)
2. **Backend**: Flask API (deploy to Heroku or Railway)

## Step 1: Deploy Flask Backend

### Option A: Heroku Deployment

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name-backend
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set SECRET_KEY=your-secret-key-here
   heroku config:set FLASK_ENV=production
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy Flask backend"
   git push heroku main
   ```

### Option B: Railway Deployment

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the Flask backend folder

2. **Set environment variables**:
   - SECRET_KEY=your-secret-key-here
   - FLASK_ENV=production

## Step 2: Deploy Next.js Frontend to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Set environment variables**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your Flask backend URL (e.g., https://your-app-name-backend.herokuapp.com)
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

## Step 3: Update Configuration

1. **Update vercel.json**:
   - Replace `https://your-flask-backend-url.herokuapp.com` with your actual backend URL

2. **Update next.config.js**:
   - The environment variable `NEXT_PUBLIC_API_URL` will automatically be used

## Step 4: Production Checklist

### Security
- [ ] Set strong SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Set up file size limits

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Monitor memory usage

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add health check endpoints
- [ ] Monitor API response times
- [ ] Set up uptime monitoring

## Environment Variables

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com
```

### Backend (Heroku/Railway)
```
SECRET_KEY=your-secret-key-here
FLASK_ENV=production
UPLOAD_FOLDER=uploads
EDITED_FOLDER=edited
HTML_FOLDER=saved_html
```

## Testing Production Deployment

1. **Test health endpoint**: `https://your-backend-url.herokuapp.com/health`
2. **Test frontend**: Visit your Vercel URL
3. **Test file upload**: Try uploading a PDF
4. **Test all features**: Go through each tool

## Troubleshooting

### Common Issues
1. **CORS errors**: Check CORS configuration in Flask app
2. **File upload issues**: Check file size limits and permissions
3. **Memory issues**: Monitor Heroku dyno memory usage
4. **Timeout errors**: Increase timeout settings

### Logs
- **Vercel**: Check Vercel dashboard for build logs
- **Heroku**: `heroku logs --tail`
- **Railway**: Check Railway dashboard logs
