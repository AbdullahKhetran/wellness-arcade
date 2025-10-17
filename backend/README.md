# Wellness Arcade Backend

FastAPI backend server for the Wellness Arcade application.

## Features

- User authentication (register/login/logout) with secure password hashing
- Daily wellness tracking for all 6 games
- RESTful API endpoints for frontend integration
- SQLite database with persistent data storage
- Session management with automatic expiration
- Secure authentication with bcrypt password hashing

## 📡 API Endpoints

### General
- `GET /api/ping/` - Test API connectivity
- `GET /api/tip/` - Get daily wellness tip

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `GET /api/user/` - Get user profile

### Game-Specific Endpoints
- **Hydration**: `/api/hydration/log/`, `/api/hydration/status/`, `/api/hydration/reset/`
- **Brushing**: `/api/brushing/log/`, `/api/brushing/status/`, `/api/brushing/detailed/`, `/api/brushing/reset/`
- **Breathing**: `/api/breathing/log/`, `/api/breathing/status/`
- **Brain Puzzles**: `/api/puzzles/`, `/api/puzzles/submit/`, `/api/puzzles/status/`
- **Emotions**: `/api/emotions/status/`, `/api/emotions/session/`, `/api/emotions/log/`, `/api/emotions/tip/`
- **Affirmations**: `/api/affirmations/status/`, `/api/affirmations/words/`, `/api/affirmations/submit/`, `/api/affirmations/generate/`, `/api/affirmations/history/`



## Database

For localhost the application uses SQLite for data storage:
- **Database file**: `wellness_arcade.db`
- **Tables**: users, user_sessions, daily_wellness_data
- **Features**: Automatic table creation, password hashing, session management

The server will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
