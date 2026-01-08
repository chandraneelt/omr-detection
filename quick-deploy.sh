#!/bin/bash

# OMR Scanner Quick Deploy Script
# This script helps you deploy the OMR Scanner to various platforms

echo "🚀 OMR Scanner Quick Deploy"
echo "=========================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: OMR Scanner application"
fi

echo ""
echo "Choose your deployment platform:"
echo "1. Railway (Recommended - Full Stack)"
echo "2. Vercel (Serverless)"
echo "3. Render (Full Stack)"
echo "4. Build for manual deployment"
echo "5. Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚂 Deploying to Railway..."
        echo ""
        echo "Steps to deploy to Railway:"
        echo "1. Go to https://railway.app"
        echo "2. Sign up/Login with GitHub"
        echo "3. Click 'Deploy from GitHub repo'"
        echo "4. Select this repository"
        echo "5. Railway will automatically detect the configuration"
        echo "6. Your app will be live at: https://your-app-name.up.railway.app"
        echo ""
        echo "Push your code to GitHub first:"
        echo "git remote add origin YOUR_GITHUB_REPO_URL"
        echo "git push -u origin main"
        ;;
    
    2)
        echo "▲ Deploying to Vercel..."
        echo ""
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        echo "Building frontend..."
        cd frontend
        npm install
        npm run build
        cd ..
        
        echo "Deploying to Vercel..."
        vercel --prod
        ;;
    
    3)
        echo "🎨 Deploying to Render..."
        echo ""
        echo "Steps to deploy to Render:"
        echo "1. Go to https://render.com"
        echo "2. Sign up/Login with GitHub"
        echo "3. Click 'New Web Service'"
        echo "4. Connect your GitHub repository"
        echo "5. Use these settings:"
        echo "   - Build Command: cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt"
        echo "   - Start Command: cd backend && python app.py"
        echo "   - Environment: Python 3"
        echo "6. Add environment variables:"
        echo "   - FLASK_ENV=production"
        echo "   - PORT=10000"
        echo "7. Deploy!"
        echo ""
        echo "Your app will be live at: https://your-app-name.onrender.com"
        ;;
    
    4)
        echo "🔨 Building for manual deployment..."
        echo ""
        
        # Build frontend
        echo "Building frontend..."
        cd frontend
        npm install
        npm run build
        cd ..
        
        # Install backend dependencies
        echo "Installing backend dependencies..."
        cd backend
        pip install -r requirements.txt
        cd ..
        
        echo "✅ Build complete!"
        echo ""
        echo "Files ready for deployment:"
        echo "- Frontend: frontend/build/"
        echo "- Backend: backend/"
        echo ""
        echo "You can now:"
        echo "1. Upload frontend/build/ to any static hosting (Netlify, GitHub Pages, etc.)"
        echo "2. Deploy backend/ to any Python hosting (Heroku, PythonAnywhere, etc.)"
        echo "3. Or use the Docker files for containerized deployment"
        ;;
    
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process initiated!"
echo ""
echo "📚 For detailed instructions, check deploy.md"
echo "🆘 Need help? Check the troubleshooting section in deploy.md"