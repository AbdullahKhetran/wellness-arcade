#!/usr/bin/env python3
"""
Wellness Arcade Backend Server
Run this script to start the FastAPI server
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("🌿 Starting Wellness Arcade Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("🔄 Press Ctrl+C to stop the server")
    
    uvicorn.run(
        "main:app",  # Import string instead of app object
        host="0.0.0.0", 
        port=8000, 
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
