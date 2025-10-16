# Wellness Arcade Backend

FastAPI backend server for the Wellness Arcade application.

## Features

- User authentication (register/login/logout)
- Daily wellness tracking for all 6 games
- RESTful API endpoints for frontend integration
- In-memory data storage

## API Endpoints

### General
- `GET /api/ping/` - Test API connectivity
- `POST /api/register/` - Register new user
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `GET /api/user/` - Get user profile
- `GET /api/tip/` - Get daily wellness tip

### Hydration Hero
- `POST /api/hydration/log/` - Log water intake
- `GET /api/hydration/status/` - Get daily hydration status
- `POST /api/hydration/reset/` - Reset daily hydration data

### Sparkle Smile (Brushing)
- `POST /api/brushing/log/` - Log teeth brushing
- `GET /api/brushing/status/` - Get daily brushing status
- `POST /api/brushing/reset/` - Reset daily brushing data

### Breathe & Balance
- `POST /api/breathing/log/` - Log breathing session
- `GET /api/breathing/status/` - Get breathing session count

### Brain Sprint
- `GET /api/puzzles/` - Get available puzzles
- `POST /api/puzzles/submit/` - Submit puzzle response
- `GET /api/puzzles/status/` - Get puzzle completion status

### Mood Watch
- `GET /api/emotions/session/` - Get emotion scenario
- `POST /api/emotions/log/` - Log emotional response
- `GET /api/emotions/tip/` - Get wellness tip for mood

### Affirmation Builder
- `GET /api/affirmations/words/` - Get word bank
- `POST /api/affirmations/submit/` - Save user affirmation
- `GET /api/affirmations/generate/` - Generate affirmation
- `GET /api/affirmations/history/` - Get affirmation history

## Installation

1. Install Python 3.8+ if not already installed
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

### Option 1: Using the startup script
```bash
python start_server.py
```

### Option 2: Direct uvicorn command
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
