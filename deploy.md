# OMR Scanner Deployment Guide

Get your OMR Scanner application live with a permanent link using these deployment options:

## 🚀 Quick Deploy Options

### 1. Railway (Recommended - Full Stack)
**Best for: Complete application with database**

1. **Sign up**: Go to [Railway.app](https://railway.app)
2. **Deploy**: Click "Deploy from GitHub repo"
3. **Connect**: Link your GitHub repository
4. **Configure**: Railway will auto-detect the configuration
5. **Access**: Get your permanent URL like `https://omr-scanner-production.up.railway.app`

**Features:**
- ✅ Full backend + frontend
- ✅ Persistent database
- ✅ File uploads
- ✅ Custom domain support
- ✅ Automatic HTTPS

### 2. Render (Full Stack Alternative)
**Best for: Professional deployment**

1. **Sign up**: Go to [Render.com](https://render.com)
2. **New Web Service**: Connect your GitHub repo
3. **Use**: `render.yaml` configuration (already included)
4. **Deploy**: Automatic deployment
5. **Access**: Get URL like `https://omr-scanner.onrender.com`

### 3. Vercel (Frontend + Serverless Backend)
**Best for: Fast deployment with serverless functions**

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Access**: Get URL like `https://omr-scanner.vercel.app`

### 4. Netlify (Frontend Only)
**Best for: Frontend-only deployment**

1. **Sign up**: Go to [Netlify.com](https://netlify.com)
2. **Drag & Drop**: Upload the `frontend/build` folder
3. **Or Connect Git**: Link your repository
4. **Access**: Get URL like `https://omr-scanner.netlify.app`

## 📋 Pre-Deployment Checklist

### Build Frontend for Production
```bash
cd frontend
npm run build
```

### Test Production Build Locally
```bash
# Serve the built frontend
npx serve -s build -l 3000

# Test backend
cd ../backend
python app.py
```

### Environment Variables
Set these in your deployment platform:

```env
# Backend
FLASK_ENV=production
PORT=8080
PYTHONPATH=/app

# Frontend (build time)
REACT_APP_API_URL=https://your-domain.com/api
```

## 🔧 Platform-Specific Instructions

### Railway Deployment (Detailed)

1. **Create Account**: [railway.app](https://railway.app)

2. **New Project**: 
   - Click "Deploy from GitHub repo"
   - Select your OMR Scanner repository

3. **Configuration**:
   - Railway auto-detects `railway.json`
   - Uses `Dockerfile.railway` for build
   - Automatically provisions database

4. **Environment Variables**:
   ```
   FLASK_ENV=production
   PORT=8080
   ```

5. **Custom Domain** (Optional):
   - Go to Settings → Domains
   - Add your custom domain
   - Configure DNS

### Render Deployment (Detailed)

1. **Create Account**: [render.com](https://render.com)

2. **New Web Service**:
   - Connect GitHub repository
   - Select "Web Service"

3. **Configuration**:
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python app.py`
   - Environment: `Python 3`

4. **Environment Variables**:
   ```
   FLASK_ENV=production
   PORT=10000
   PYTHONPATH=/opt/render/project/src/backend
   ```

### Vercel Deployment (Detailed)

1. **Install CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Configuration**: Uses `vercel.json` (already included)

## 🌐 Custom Domain Setup

### Railway
1. Go to your project → Settings → Domains
2. Add custom domain
3. Configure DNS: `CNAME your-domain.com → your-app.up.railway.app`

### Render
1. Go to Settings → Custom Domains
2. Add domain
3. Configure DNS as instructed

### Vercel
1. Go to project → Settings → Domains
2. Add domain
3. Configure DNS: `CNAME your-domain.com → cname.vercel-dns.com`

## 📊 Performance Optimization

### Frontend Optimization
```bash
# Build with optimizations
cd frontend
npm run build

# Analyze bundle size
npx webpack-bundle-analyzer build/static/js/*.js
```

### Backend Optimization
- Use production WSGI server (Gunicorn)
- Enable gzip compression
- Optimize image processing
- Add caching headers

## 🔒 Security Considerations

### Production Security
- Enable HTTPS (automatic on most platforms)
- Set secure environment variables
- Implement rate limiting
- Validate file uploads
- Use secure headers

### Environment Variables (Never commit these)
```env
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
UPLOAD_MAX_SIZE=10485760
```

## 📱 Mobile PWA Setup

### Make it a Progressive Web App
1. **Add to `frontend/public/manifest.json`**:
   ```json
   {
     "short_name": "OMR Scanner",
     "name": "OMR Scanner - Optical Mark Recognition",
     "icons": [
       {
         "src": "favicon.ico",
         "sizes": "64x64 32x32 24x24 16x16",
         "type": "image/x-icon"
       }
     ],
     "start_url": ".",
     "display": "standalone",
     "theme_color": "#000000",
     "background_color": "#ffffff"
   }
   ```

2. **Add Service Worker** (optional for offline support)

## 🎯 Recommended Deployment Flow

### For Production Use:
1. **Railway** - Full-featured, database included
2. **Render** - Professional alternative
3. **Vercel** - Fast serverless deployment

### For Demo/Portfolio:
1. **Netlify** - Frontend only, very fast
2. **Vercel** - Full-stack serverless
3. **GitHub Pages** - Static hosting

## 🆘 Troubleshooting

### Common Issues:

**Build Failures:**
- Check Node.js version (16+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

**API Connection Issues:**
- Verify `REACT_APP_API_URL` environment variable
- Check CORS configuration
- Ensure backend is running

**File Upload Issues:**
- Check file size limits
- Verify upload directory permissions
- Test with smaller files first

**Database Issues:**
- Ensure SQLite is supported on platform
- Check file permissions
- Consider PostgreSQL for production

## 📞 Support

If you encounter issues:
1. Check the platform's documentation
2. Review deployment logs
3. Test locally first
4. Check environment variables
5. Verify all dependencies are installed

Your OMR Scanner will be live and accessible worldwide once deployed! 🌍