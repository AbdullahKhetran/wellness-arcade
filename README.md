# [Wellness Arcade](https://web-production-0c23.up.railway.app/) 

A collection of mini interactive games designed to reinforce healthy habits through gamification. Each mini-game encourages wellness activities in a fun, engaging way.

## Games Included

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

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python 3.11+, FastAPI, Pydantic, SQLAlchemy
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: bcrypt, JWT tokens
- **Server**: Uvicorn (ASGI server)
- **Deployment**: Railway (with automatic database switching)


## Built at [HackVortex Codestorm #5](https://hackvortex-codestorm-5.devpost.com/) by
- [Dua Fatima](https://github.com/DuaFatima-1717) Frontend Developer
- [Abdullah Khetran](https://github.com/AbdullahKhetran) Full Stack Developer
- [Sadia Asif](https://devpost.com/sadia-asif107) Domain Expert (Medical Advisor)
- [Marium Noor Khetran](https://github.com/mariumnoorkhetran) Content and Submission


## AI Usage Disclosure

The following AI services were utilized in the development process:
- ChatGPT: For idea generation and conceptual support.
- Cursor IDE: For code generation, documentation and implementation assistance.


## Quick Start (Localhost)


```bash
# Clone repository
git clone https://github.com/AbdullahKhetran/wellness-arcade.git
# Move into repository
cd wellness-arcade
# Install dependencies
pip install -r requirements.txt
# Start the application (serves both frontend and backend)
python main.py
```

Open **http://localhost:8000** in your browser to access the Wellness Arcade.



## Project Structure
```
wellness-arcade/
├── main.py                 # Railway entry point & unified startup
├── requirements.txt        # Python dependencies (references backend/)
├── railway.toml            # Railway deployment configuration
├── Procfile                # Process definition
├── env.example             # Environment variables template
├── .gitignore              # Folder and files to ignore
├── frontend/               # Frontend application
│   ├── index.html          # Main HTML file
│   ├── script.js           # Game logic and functionality
│   ├── style.css           # CSS styling
│   ├── api-service.js      # Backend API communication
│   └── README.md           # Frontend documentation
├── backend/                # Backend API server
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── database.py         # Database configuration
│   ├── install_database.py # Database setup script
│   ├── auth_utils.py       # Authentication utilities
│   ├── wellness_arcade.db  # SQLite database (development)
│   └── README.md           # Backend documentation
└── README.md               # This file
```


### License
This project is open source and available under the MIT License.


---


[Start your wellness journey today!](https://web-production-0c23.up.railway.app/)
