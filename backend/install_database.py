#!/usr/bin/env python3
"""
Quick database installation script for Wellness Arcade
This script installs dependencies and initializes the SQLite database
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required Python packages"""
    print("📦 Installing database dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def initialize_database():
    """Initialize the SQLite database"""
    print("🗄️ Initializing SQLite database...")
    try:
        from database import init_database
        init_database()
        print("✅ Database initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        return False

def main():
    """Main installation process"""
    print("🚀 Wellness Arcade Database Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ Please run this script from the backend directory")
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Initialize database
    if not initialize_database():
        return False
    
    print("\n🎉 Setup complete!")
    print("You can now start the server with: cd .. && python main.py")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
