# PowerShell deployment script for JUSTPDF

Write-Host "🚀 Deploying JUSTPDF to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if user is logged in
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Vercel. Please login first:" -ForegroundColor Red
    Write-Host "   vercel login" -ForegroundColor Yellow
    exit 1
}

# Set environment variable
Write-Host "📝 Setting environment variables..." -ForegroundColor Blue
Write-Host "Please enter your Flask backend URL (e.g., https://your-app-name-backend.herokuapp.com):" -ForegroundColor Yellow
$backendUrl = Read-Host "Backend URL"
vercel env add NEXT_PUBLIC_API_URL production $backendUrl

# Deploy to production
Write-Host "🚀 Deploying to production..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host "   1. Deploy your Flask backend to Heroku or Railway" -ForegroundColor White
Write-Host "   2. Test all functionality" -ForegroundColor White
Write-Host "   3. Check the deployment guide in DEPLOYMENT.md" -ForegroundColor White
