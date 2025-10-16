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
- 30-second guided breathing sessions
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
- Local storage fallback for offline functionality
- Real-time API integration for data persistence

### Backend
- **FastAPI** with Python
- RESTful API design
- In-memory storage
- CORS-enabled for frontend integration
- Comprehensive API documentation

## 🚀 Quick Start

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python start_server.py
```

#### Frontend Setup
```bash
# In a new terminal, from the project root
cd frontend
python -m http.server 3000
```

Then open **http://localhost:3000** in your browser to access the Wellness Arcade.

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
├── frontend/               # Frontend application
│   ├── index.html          # Main HTML file
│   ├── script.js           # Game logic and functionality
│   ├── style.css           # Ghibli-inspired styling
│   ├── api-service.js      # Backend API communication
│   └── README.md           # Frontend documentation
├── backend/                # Backend API server
│   ├── main.py             # FastAPI application
│   ├── start_server.py     # Backend startup script
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
├── context.txt             # Project requirements
└── README.md               # This file
```

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python 3.8+, FastAPI, Pydantic
- **Storage**: In-memory (development), localStorage (frontend)
- **Server**: Uvicorn (ASGI server)


## 📄 License

This project is open source and available under the MIT License.


---

**Start your wellness journey today! 🌿✨**
