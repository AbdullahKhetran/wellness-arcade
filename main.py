#!/usr/bin/env python3
"""
Railway entry point for Wellness Arcade
This file helps Railway detect this as a Python project
"""

import sys
import os
import subprocess

# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Change to backend directory
os.chdir(backend_path)

# Import and run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    from main import app
    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
