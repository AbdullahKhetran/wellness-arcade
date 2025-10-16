from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime, date
import json
import os

app = FastAPI(title="Wellness Arcade API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (in production, use a proper database)
users_db = {}
user_sessions = {}
daily_data = {}

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

# Helper functions
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>" format
    try:
        token = authorization.split(" ")[1]  # Remove "Bearer " prefix
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    if token not in user_sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return user_sessions[token]

def get_user_daily_data(user_id: str, data_type: str):
    today = date.today().isoformat()
    if user_id not in daily_data:
        daily_data[user_id] = {}
    if today not in daily_data[user_id]:
        daily_data[user_id][today] = {}
    if data_type not in daily_data[user_id][today]:
        daily_data[user_id][today][data_type] = {"count": 0, "data": []}
    return daily_data[user_id][today][data_type]

# General endpoints
@app.get("/api/ping/")
async def ping():
    return {"message": "API is working", "timestamp": datetime.now().isoformat()}

@app.post("/api/register/")
async def register(user: UserCreate):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    users_db[user.username] = {
        "username": user.username,
        "email": user.email,
        "password": user.password,  # In production, hash this
        "created_at": datetime.now().isoformat()
    }
    
    return {"message": "User registered successfully", "username": user.username}

@app.post("/api/login/")
async def login(user: UserLogin):
    if user.username not in users_db or users_db[user.username]["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session token (in production, use proper JWT)
    session_token = f"session_{user.username}_{datetime.now().timestamp()}"
    user_sessions[session_token] = user.username
    
    return {"message": "Login successful", "session_token": session_token}

@app.post("/api/logout/")
async def logout(session_token: str):
    if session_token in user_sessions:
        del user_sessions[session_token]
    return {"message": "Logout successful"}

@app.get("/api/user/")
async def get_user_profile(username: str = Depends(get_current_user)):
    user_data = users_db[username]
    return {
        "username": user_data["username"],
        "email": user_data["email"],
        "created_at": user_data["created_at"]
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
async def log_hydration(log: HydrationLog, username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "hydration")
    
    daily_data_obj["count"] += log.glasses
    daily_data_obj["data"].append({
        "glasses": log.glasses,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": f"Logged {log.glasses} glass(es)", "total_today": daily_data_obj["count"]}

@app.get("/api/hydration/status/")
async def get_hydration_status(username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "hydration")
    return {"glasses_today": daily_data_obj["count"], "goal": 8}

@app.post("/api/hydration/reset/")
async def reset_hydration(username: str = Depends(get_current_user)):
    today = date.today().isoformat()
    if username in daily_data and today in daily_data[username]:
        daily_data[username][today]["hydration"] = {"count": 0, "data": []}
    return {"message": "Hydration data reset for today"}

# Brushing teeth endpoints
@app.post("/api/brushing/log/")
async def log_brushing(log: BrushingLog, username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "brushing")
    
    daily_data_obj["count"] += 1
    daily_data_obj["data"].append({
        "session_type": log.session_type,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": f"Logged {log.session_type} brushing", "total_today": daily_data_obj["count"]}

@app.get("/api/brushing/status/")
async def get_brushing_status(username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "brushing")
    return {"brushing_today": daily_data_obj["count"], "goal": 2}

@app.post("/api/brushing/reset/")
async def reset_brushing(username: str = Depends(get_current_user)):
    today = date.today().isoformat()
    if username in daily_data and today in daily_data[username]:
        daily_data[username][today]["brushing"] = {"count": 0, "data": []}
    return {"message": "Brushing data reset for today"}

# Breathing exercise endpoints
@app.post("/api/breathing/log/")
async def log_breathing(log: BreathingLog, username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "breathing")
    
    daily_data_obj["count"] += 1
    daily_data_obj["data"].append({
        "duration_seconds": log.duration_seconds,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": f"Logged breathing session", "total_today": daily_data_obj["count"]}

@app.get("/api/breathing/status/")
async def get_breathing_status(username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "breathing")
    return {"sessions_today": daily_data_obj["count"]}

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
async def submit_puzzle_response(response: PuzzleResponse, username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "puzzles")
    
    daily_data_obj["count"] += 1
    daily_data_obj["data"].append({
        "puzzle_id": response.puzzle_id,
        "user_sequence": response.user_sequence,
        "correct": response.correct,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": "Puzzle response logged", "correct": response.correct}

@app.get("/api/puzzles/status/")
async def get_puzzle_status(username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "puzzles")
    return {"puzzles_completed_today": daily_data_obj["count"]}

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
async def log_emotion(log: EmotionLog, username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "emotions")
    
    daily_data_obj["count"] += 1
    daily_data_obj["data"].append({
        "scenario_id": log.scenario_id,
        "selected_mood": log.selected_mood,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": "Emotion logged successfully"}

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
async def submit_affirmation(affirmation: AffirmationSubmit, username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "affirmations")
    
    daily_data_obj["count"] += 1
    daily_data_obj["data"].append({
        "words": affirmation.words,
        "generated_affirmation": affirmation.generated_affirmation,
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": "Affirmation saved successfully"}

@app.get("/api/affirmations/generate/")
async def generate_affirmation(words: str):
    # Simple affirmation generator
    word_list = words.split(",")
    base_affirmation = " ".join(word_list)
    generated = f'"{base_affirmation}." - You have the power to create positive change in your life.'
    return {"generated_affirmation": generated}

@app.get("/api/affirmations/history/")
async def get_affirmation_history(username: str = Depends(get_current_user)):
    daily_data_obj = get_user_daily_data(username, "affirmations")
    return {"history": daily_data_obj["data"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
