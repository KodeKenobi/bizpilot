#!/bin/bash
# Quick deployment script for JUSTPDF

echo "🚀 Deploying JUSTPDF to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login first:"
    echo "   vercel login"
    exit 1
fi

# Set environment variable (you'll need to replace with your actual backend URL)
echo "📝 Setting environment variables..."
vercel env add NEXT_PUBLIC_API_URL production

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "   1. Update your Flask backend URL in Vercel environment variables"
echo "   2. Deploy your Flask backend to Heroku or Railway"
echo "   3. Test all functionality"
echo "   4. Check the deployment guide in DEPLOYMENT.md"
