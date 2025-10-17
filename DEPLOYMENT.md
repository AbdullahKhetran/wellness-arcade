# 🚀 Railway Deployment Guide

This guide will help you deploy your Wellness Arcade application to Railway.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Git** - For version control

## 🛠️ Pre-Deployment Setup

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Verify Changes Made
The following changes have been made for Railway compatibility:

- ✅ **Database**: Added PostgreSQL support (`psycopg2-binary`)
- ✅ **Environment Variables**: Added `DATABASE_URL` and `ALLOWED_ORIGINS` support
- ✅ **CORS**: Configurable origins for production
- ✅ **Static Files**: FastAPI now serves frontend files
- ✅ **Auto-Detection**: Frontend automatically detects production vs development
- ✅ **Railway Config**: Added `railway.toml`, `nixpacks.toml`, and `Procfile`
- ✅ **Build Configuration**: Railway discovers backend folder structure automatically

## 🚀 Railway Deployment Steps

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `wellness-arcade` repository
5. Select the `main` branch

### Step 2: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. The `DATABASE_URL` environment variable will be set automatically

### Step 3: Configure Environment Variables
1. Go to your service settings
2. Add these environment variables:
   ```
   ALLOWED_ORIGINS=https://your-app-name.railway.app
   ```
   (Replace `your-app-name` with your actual Railway app name)

### Step 4: Deploy
1. Railway will automatically detect your `railway.toml` configuration
2. The deployment will start automatically
3. Wait for the build to complete (usually 2-3 minutes)

### Step 5: Access Your App
1. Once deployed, Railway will provide a URL like: `https://your-app-name.railway.app`
2. Your app will be available at this URL
3. The frontend and backend will be served from the same domain

## 🔧 Configuration Details

### Database Migration
- **Development**: Uses SQLite (`wellness_arcade.db`)
- **Production**: Uses PostgreSQL (automatically provided by Railway)
- **Migration**: Automatic - SQLAlchemy handles the schema creation

### Environment Variables
- `DATABASE_URL`: Automatically set by Railway PostgreSQL
- `ALLOWED_ORIGINS`: Set to your Railway domain for security
- `PORT`: Automatically set by Railway

### File Structure
```
wellness-arcade/
├── backend/           # FastAPI backend
│   ├── requirements.txt  # Python dependencies
│   ├── main.py          # FastAPI application
│   └── ...              # Other backend files
├── frontend/          # Static frontend files
├── railway.toml       # Railway configuration
├── nixpacks.toml      # Build configuration
├── Procfile          # Process definition
└── env.example       # Environment variables template
```

## 🎯 What Happens During Deployment

1. **Build Phase**: Railway installs Python dependencies
2. **Database Setup**: PostgreSQL database is created and connected
3. **Schema Creation**: SQLAlchemy creates all tables automatically
4. **Static Files**: Frontend files are served by FastAPI
5. **Health Check**: Railway verifies the app is running via `/api/ping/`

## 🔍 Troubleshooting

### Common Issues

**Build Fails**
- Check that all dependencies are in `requirements.txt`
- Verify Python version compatibility

**Database Connection Issues**
- Ensure `DATABASE_URL` is set (Railway sets this automatically)
- Check that `psycopg2-binary` is in requirements.txt

**CORS Issues**
- Verify `ALLOWED_ORIGINS` includes your Railway domain
- Check that the frontend is making requests to the correct URL

**Frontend Not Loading**
- Ensure frontend files are in the correct directory structure
- Check that static file serving is configured properly

### Logs and Debugging
1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Deployments" tab
4. Click on the latest deployment
5. View logs for any errors

## 🎉 Post-Deployment

### Testing Your Deployment
1. Visit your Railway URL
2. Test user registration and login
3. Try all the wellness games
4. Verify data persistence (refresh and check if data remains)

### Custom Domain (Optional)
1. In Railway dashboard, go to "Settings"
2. Add your custom domain
3. Update `ALLOWED_ORIGINS` to include your custom domain
4. Configure DNS as instructed by Railway

## 💰 Cost Information

- **Free Tier**: $5 credit monthly (usually sufficient for small apps)
- **Usage**: Pay only for what you use
- **Database**: PostgreSQL included in the free tier
- **Bandwidth**: Generous limits on the free tier

## 🔄 Updates and Maintenance

### Deploying Updates
1. Push changes to your GitHub repository
2. Railway automatically detects changes and redeploys
3. No manual intervention required

### Database Backups
- Railway automatically backs up your PostgreSQL database
- Manual backups can be created through the Railway dashboard

---

**Your Wellness Arcade is now live on Railway! 🌿✨**

Visit your Railway URL to start your wellness journey online.
