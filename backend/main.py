from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime, date
import json
import os
from sqlalchemy.orm import Session

# Import our database and auth utilities
from database import get_db, init_database, User, UserSession, DailyWellnessData
from auth_utils import hash_password, verify_password, generate_session_token, get_token_expiry, is_token_expired

app = FastAPI(title="Wellness Arcade API", version="1.0.0")

# CORS middleware to allow frontend connections
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for frontend
# Handle both localhost (from root) and Railway (from backend) scenarios
if os.path.exists("frontend"):
    # Running from root directory (localhost with root main.py)
    frontend_path = "frontend"
elif os.path.exists(os.path.join(os.path.dirname(__file__), "..", "frontend")):
    # Running from backend directory (original setup)
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
else:
    frontend_path = None

if frontend_path and os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

# Serve frontend files
@app.get("/")
async def serve_frontend():
    """Serve the main frontend page"""
    if frontend_path:
        frontend_file = os.path.join(frontend_path, "index.html")
        if os.path.exists(frontend_file):
            return FileResponse(frontend_file)
    return {"message": "Frontend files not found"}

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class HydrationLog(BaseModel):
    glasses: int = 1

class BrushingLog(BaseModel):
    session_type: str  # "morning" or "night"

class BreathingLog(BaseModel):
    duration_seconds: int = 30

class PuzzleResponse(BaseModel):
    puzzle_id: str
    user_sequence: List[int]
    correct: bool

class EmotionLog(BaseModel):
    scenario_id: str
    selected_mood: str

class AffirmationSubmit(BaseModel):
    words: List[str]
    generated_affirmation: str

class LogoutRequest(BaseModel):
    session_token: str

# Helper functions
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>" format
    try:
        token = authorization.split(" ")[1]  # Remove "Bearer " prefix
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    # Check if session exists in database
    session = db.query(UserSession).filter(UserSession.session_token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if session is expired
    if is_token_expired(session.expires_at):
        # Remove expired session
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user from database
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user.username

def get_user_daily_data(username: str, data_type: str, db: Session):
    today = date.today().isoformat()
    
    # Get user ID
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get or create daily data record
    daily_record = db.query(DailyWellnessData).filter(
        DailyWellnessData.user_id == user.id,
        DailyWellnessData.date == today,
        DailyWellnessData.data_type == data_type
    ).first()
    
    if not daily_record:
        daily_record = DailyWellnessData(
            user_id=user.id,
            date=today,
            data_type=data_type,
            count=0,
            data_json="[]"
        )
        db.add(daily_record)
        db.commit()
        db.refresh(daily_record)
    
    return daily_record

# General endpoints
@app.get("/api/ping/")
async def ping():
    return {"message": "API is working", "timestamp": datetime.now().isoformat()}

@app.post("/api/register/")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Hash the password
    hashed_password = hash_password(user.password)
    
    # Create new user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "User registered successfully", "username": user.username}

@app.post("/api/login/")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user in database
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate session token
    session_token = generate_session_token()
    expires_at = get_token_expiry()
    
    # Create session in database
    db_session = UserSession(
        session_token=session_token,
        user_id=db_user.id,
        expires_at=expires_at
    )
    
    db.add(db_session)
    db.commit()
    
    return {"message": "Login successful", "session_token": session_token}

@app.post("/api/logout/")
async def logout(logout_request: LogoutRequest, db: Session = Depends(get_db)):
    # Find and delete session from database
    session = db.query(UserSession).filter(UserSession.session_token == logout_request.session_token).first()
    if session:
        db.delete(session)
        db.commit()
    return {"message": "Logout successful"}

@app.get("/api/user/")
async def get_user_profile(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    }

@app.get("/api/tip/")
async def get_daily_tip():
    tips = [
        "Stay hydrated! Your brain is 75% water - keep it functioning at its best.",
        "Take deep breaths throughout the day to reduce stress and improve focus.",
        "Regular exercise boosts mood and energy levels naturally.",
        "A good night's sleep is essential for both physical and mental health.",
        "Practice gratitude daily - it can improve your overall well-being.",
        "Limit screen time before bed for better sleep quality.",
        "Connect with nature regularly to reduce stress and improve mood."
    ]
    import random
    return {"tip": random.choice(tips), "date": date.today().isoformat()}

# Hydration game endpoints
@app.post("/api/hydration/log/")
async def log_hydration(log: HydrationLog, username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "hydration", db)
    
    # Update count
    daily_record.count += log.glasses
    
    # Update data JSON
    if daily_record.data_json is None:
        data_list = []
    else:
        data_list = json.loads(daily_record.data_json)
    data_list.append({
        "glasses": log.glasses,
        "timestamp": datetime.now().isoformat()
    })
    daily_record.data_json = json.dumps(data_list)
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Logged {log.glasses} glass(es)", "total_today": daily_record.count}

@app.get("/api/hydration/status/")
async def get_hydration_status(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "hydration", db)
    return {"glasses_today": daily_record.count, "goal": 8}

@app.post("/api/hydration/reset/")
async def reset_hydration(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "hydration", db)
    
    # Reset count and data
    daily_record.count = 0
    daily_record.data_json = "[]"
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Hydration data reset for today"}

# Brushing teeth endpoints
@app.post("/api/brushing/log/")
async def log_brushing(log: BrushingLog, username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "brushing", db)
    
    # Update count
    daily_record.count += 1
    
    # Update data JSON
    if daily_record.data_json is None:
        data_list = []
    else:
        data_list = json.loads(daily_record.data_json)
    data_list.append({
        "session_type": log.session_type,
        "timestamp": datetime.now().isoformat()
    })
    daily_record.data_json = json.dumps(data_list)
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Logged {log.session_type} brushing", "total_today": daily_record.count}

@app.get("/api/brushing/status/")
async def get_brushing_status(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "brushing", db)
    return {"brushing_today": daily_record.count, "goal": 2}

@app.get("/api/brushing/detailed/")
async def get_brushing_detailed(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "brushing", db)
    
    # Parse the detailed data from JSON
    if daily_record.data_json is None:
        brushing_sessions = []
    else:
        brushing_sessions = json.loads(daily_record.data_json)
    
    # Determine which sessions were completed
    morning_completed = any(session["session_type"] == "morning" for session in brushing_sessions)
    night_completed = any(session["session_type"] == "night" for session in brushing_sessions)
    
    return {
        "brushing_today": daily_record.count,
        "goal": 2,
        "morning_completed": morning_completed,
        "night_completed": night_completed,
        "sessions": brushing_sessions
    }

@app.post("/api/brushing/reset/")
async def reset_brushing(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "brushing", db)
    
    # Reset count and data
    daily_record.count = 0
    daily_record.data_json = "[]"
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Brushing data reset for today"}

# Breathing exercise endpoints
@app.post("/api/breathing/log/")
async def log_breathing(log: BreathingLog, username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "breathing", db)
    
    # Update count
    daily_record.count += 1
    
    # Update data JSON
    if daily_record.data_json is None:
        data_list = []
    else:
        data_list = json.loads(daily_record.data_json)
    data_list.append({
        "duration_seconds": log.duration_seconds,
        "timestamp": datetime.now().isoformat()
    })
    daily_record.data_json = json.dumps(data_list)
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Logged breathing session", "total_today": daily_record.count}

@app.get("/api/breathing/status/")
async def get_breathing_status(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "breathing", db)
    return {"sessions_today": daily_record.count}

# Brain puzzle endpoints
@app.get("/api/puzzles/")
async def get_puzzles():
    puzzles = [
        {"id": "sequence_1", "type": "sequence", "difficulty": 1},
        {"id": "sequence_2", "type": "sequence", "difficulty": 2},
        {"id": "sequence_3", "type": "sequence", "difficulty": 3},
    ]
    return {"puzzles": puzzles}

@app.post("/api/puzzles/submit/")
async def submit_puzzle_response(response: PuzzleResponse, username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "puzzles", db)
    
    # Update count
    daily_record.count += 1
    
    # Update data JSON
    if daily_record.data_json is None:
        data_list = []
    else:
        data_list = json.loads(daily_record.data_json)
    data_list.append({
        "puzzle_id": response.puzzle_id,
        "user_sequence": response.user_sequence,
        "correct": response.correct,
        "timestamp": datetime.now().isoformat()
    })
    daily_record.data_json = json.dumps(data_list)
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Puzzle response logged", "correct": response.correct}

@app.get("/api/puzzles/status/")
async def get_puzzle_status(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "puzzles", db)
    
    # Calculate high score from today's data
    high_score = 0
    if daily_record.data_json:
        try:
            data_list = json.loads(daily_record.data_json)
            # Count consecutive correct answers to find high score
            current_score = 0
            for entry in data_list:
                if entry.get("correct", False):
                    current_score += 1
                    high_score = max(high_score, current_score)
                else:
                    current_score = 0
        except:
            pass
    
    return {"high_score_today": high_score}

# Emotional awareness endpoints
@app.get("/api/emotions/session/")
async def get_emotion_scenario():
    scenarios = [
        {"id": "scenario_1", "text": "You missed the bus this morning and had to walk to work in the rain."},
        {"id": "scenario_2", "text": "Your friend surprised you with your favorite coffee."},
        {"id": "scenario_3", "text": "You received a compliment from your boss about your recent project."},
        {"id": "scenario_4", "text": "You're stuck in traffic and running late for an important meeting."},
        {"id": "scenario_5", "text": "You found a $20 bill on the sidewalk."},
    ]
    import random
    return random.choice(scenarios)

@app.post("/api/emotions/log/")
async def log_emotion(log: EmotionLog, username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "emotions", db)
    
    # Update count
    daily_record.count += 1
    
    # Update data JSON
    if daily_record.data_json is None:
        data_list = []
    else:
        data_list = json.loads(daily_record.data_json)
    data_list.append({
        "scenario_id": log.scenario_id,
        "selected_mood": log.selected_mood,
        "timestamp": datetime.now().isoformat()
    })
    daily_record.data_json = json.dumps(data_list)
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Emotion logged successfully"}

@app.get("/api/emotions/status/")
async def get_emotion_status(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "emotions", db)
    return {"scenarios_today": daily_record.count}

@app.get("/api/emotions/tip/")
async def get_emotion_tip(mood: str):
    tips = {
        "happy": "It's wonderful to feel happy! Try to savor these positive moments and share your joy with others.",
        "sad": "It's okay to feel sad sometimes. Consider talking to someone you trust or doing something that usually brings you comfort.",
        "anxious": "Anxiety is a normal emotion. Try deep breathing exercises or grounding techniques to help manage these feelings.",
        "calm": "Feeling calm is great for your well-being. This is a good time for reflection or mindfulness practices.",
        "excited": "Excitement can be energizing! Channel this positive energy into productive activities or creative pursuits.",
        "frustrated": "Frustration is a natural response. Try to identify what's causing it and take small steps to address the situation."
    }
    return {"tip": tips.get(mood, "All emotions are valid. Take time to understand and process your feelings.")}

# Affirmation builder endpoints
@app.get("/api/affirmations/words/")
async def get_affirmation_words():
    words = [
        "I", "am", "strong", "capable", "worthy", "loved", "brave", "confident", "peaceful", "grateful",
        "will", "can", "deserve", "choose", "believe", "create", "achieve", "grow", "heal", "thrive",
        "today", "always", "everyday", "moment", "journey", "life", "future", "present", "past", "now"
    ]
    return {"words": words}

@app.post("/api/affirmations/submit/")
async def submit_affirmation(affirmation: AffirmationSubmit, username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "affirmations", db)
    
    # Update count
    daily_record.count += 1
    
    # Update data JSON
    if daily_record.data_json is None:
        data_list = []
    else:
        data_list = json.loads(daily_record.data_json)
    data_list.append({
        "words": affirmation.words,
        "generated_affirmation": affirmation.generated_affirmation,
        "timestamp": datetime.now().isoformat()
    })
    daily_record.data_json = json.dumps(data_list)
    daily_record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Affirmation saved successfully"}

@app.get("/api/affirmations/status/")
async def get_affirmation_status(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "affirmations", db)
    return {"affirmations_today": daily_record.count}

@app.get("/api/affirmations/generate/")
async def generate_affirmation(words: str):
    # Simple affirmation generator
    word_list = words.split(",")
    base_affirmation = " ".join(word_list)
    generated = f'"{base_affirmation}." - You have the power to create positive change in your life.'
    return {"generated_affirmation": generated}

@app.get("/api/affirmations/history/")
async def get_affirmation_history(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    daily_record = get_user_daily_data(username, "affirmations", db)
    if daily_record.data_json is None:
        history_data = []
    else:
        history_data = json.loads(daily_record.data_json)
    return {"history": history_data}

@app.post("/api/stats/reset/")
async def reset_all_stats(username: str = Depends(get_current_user), db: Session = Depends(get_db)):
    """Reset all wellness stats for the current user"""
    today = date.today().strftime("%Y-%m-%d")
    
    # Get user object first
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all daily records for today
    records = db.query(DailyWellnessData).filter(
        DailyWellnessData.user_id == user.id,
        DailyWellnessData.date == today
    ).all()
    
    # Reset counts and clear data_json for all wellness data types
    wellness_types = ["hydration", "brushing", "breathing", "puzzles", "emotions", "affirmations"]
    
    for record in records:
        if record.data_type in wellness_types:
            record.count = 0
            record.data_json = "[]"
            record.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "message": "All wellness stats have been reset",
        "reset_date": today,
        "reset_types": wellness_types
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
