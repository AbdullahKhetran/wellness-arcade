# 🌿 Wellness Arcade 💧

A collection of mini interactive games designed to reinforce healthy habits through gamification. Each mini-game encourages wellness activities in a fun, engaging way.

## 🎮 Games Included

### 1. **Hydration Hero** 💧
- Track daily water intake
- Watch a cute plant grow with each glass of water
- Goal: 7-8 glasses per day

### 2. **Sparkle Smile** 🦷
- Log morning and evening teeth brushing
- Character gets shinier and happier with each brush
- Goal: 2 brushing sessions per day

### 3. **Breathe & Balance** 🧘
- Interactive breathing exercise with visual cues
- 16-second guided breathing sessions
- Promotes mindfulness and stress reduction

### 4. **Brain Sprint** 🧠
- Memory and attention training game
- Increasing difficulty sequence recall
- Tracks high scores and progress

### 5. **Mood Watch** 😊
- Emotional awareness and intelligence building
- Respond to scenarios and receive wellness insights
- Promotes emotional regulation

### 6. **Affirmation Builder** ✨
- Create positive affirmations from word banks
- Generate personalized uplifting messages
- Build self-esteem and positive thinking

## 🏗️ Architecture

### Frontend
- **Pure HTML, CSS, and JavaScript** (no frameworks)
- Responsive design
- Auto-detects production vs development environments
- Real-time API integration for data persistence

### Backend
- **FastAPI** with Python
- RESTful API design
- **SQLite** (development) / **PostgreSQL** (production)
- Environment-based CORS configuration
- Serves frontend static files
- Comprehensive API documentation

### Deployment
- **Railway** for production hosting
- **Single service** deployment (frontend + backend)
- **Automatic database switching** (SQLite → PostgreSQL)
- **Environment variable configuration**

## 🚀 Quick Start

### Development (Localhost)

#### Option 1: Unified Setup (Recommended)
```bash
# Install dependencies
pip install -r requirements.txt

# Start the application (serves both frontend and backend)
python main.py
```

#### Option 2: Traditional Backend Setup
```bash
cd backend
pip install -r requirements.txt
python start_server.py
```

Then open **http://localhost:8000** in your browser to access the Wellness Arcade.

### Production (Railway)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Railway deployment instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Connect repository to Railway
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

## 📡 API Endpoints

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `GET /api/user/` - Get user profile

### Game-Specific Endpoints
- **Hydration**: `/api/hydration/log/`, `/api/hydration/status/`, `/api/hydration/reset/`
- **Brushing**: `/api/brushing/log/`, `/api/brushing/status/`, `/api/brushing/reset/`
- **Breathing**: `/api/breathing/log/`, `/api/breathing/status/`
- **Brain Puzzles**: `/api/puzzles/`, `/api/puzzles/submit/`, `/api/puzzles/status/`
- **Emotions**: `/api/emotions/session/`, `/api/emotions/log/`, `/api/emotions/tip/`
- **Affirmations**: `/api/affirmations/words/`, `/api/affirmations/submit/`, `/api/affirmations/generate/`, `/api/affirmations/history/`

### General
- `GET /api/ping/` - Test API connectivity
- `GET /api/tip/` - Get daily wellness tip



## 🛠️ Development

### Project Structure
```
wellness-arcade/
├── main.py                 # Railway entry point & unified startup
├── requirements.txt        # Python dependencies (references backend/)
├── railway.toml           # Railway deployment configuration
├── Procfile              # Process definition
├── env.example           # Environment variables template
├── DEPLOYMENT.md         # Railway deployment guide
├── frontend/             # Frontend application
│   ├── index.html        # Main HTML file
│   ├── script.js         # Game logic and functionality
│   ├── style.css         # Ghibli-inspired styling
│   ├── api-service.js    # Backend API communication
│   └── README.md         # Frontend documentation
├── backend/              # Backend API server
│   ├── main.py          # FastAPI application
│   ├── start_server.py  # Backend startup script
│   ├── requirements.txt # Python dependencies
│   ├── database.py      # Database configuration
│   ├── auth_utils.py    # Authentication utilities
│   ├── wellness_arcade.db # SQLite database (development)
│   └── README.md        # Backend documentation
├── context.txt          # Project requirements
└── README.md            # This file
```

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: bcrypt, JWT tokens
- **Server**: Uvicorn (ASGI server)
- **Deployment**: Railway (with automatic database switching)

### Database Configuration
- **Development**: Uses SQLite (`backend/wellness_arcade.db`)
- **Production**: Uses PostgreSQL (Railway managed)
- **Auto-switching**: Environment variable `DATABASE_URL` determines which database to use
- **No code changes**: Same codebase works in both environments

### Environment Differences

| Feature | Development (Localhost) | Production (Railway) |
|---------|------------------------|---------------------|
| **Database** | SQLite (local file) | PostgreSQL (cloud) |
| **Frontend** | Served by FastAPI | Served by FastAPI |
| **API URL** | `http://localhost:8000` | `https://your-app.railway.app` |
| **CORS** | Allows all origins | Configured origins only |
| **Static Files** | `/static/` path | `/static/` path |
| **Startup** | `python main.py` | Automatic via Railway |

### Deployment Features
- **Single Service**: Frontend and backend deployed together
- **Auto-scaling**: Railway handles traffic spikes
- **Database Backups**: Automatic PostgreSQL backups
- **Environment Variables**: Secure configuration management
- **Custom Domains**: Support for custom domain names
- **Free Tier**: $5 monthly credit (usually sufficient for small apps)

## 📄 License

This project is open source and available under the MIT License.


---

**Start your wellness journey today! 🌿✨**
