"""
Authentication utilities for password hashing and verification
"""

import bcrypt
from datetime import datetime, timedelta
import secrets

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_session_token() -> str:
    """Generate a secure session token"""
    # Generate a random token with timestamp
    timestamp = str(int(datetime.utcnow().timestamp()))
    # Use secrets.token_urlsafe for a secure random string
    random_part = secrets.token_urlsafe(32)
    return f"session_{timestamp}_{random_part}"

def get_token_expiry() -> datetime:
    """Get expiry time for session token (24 hours from now)"""
    return datetime.utcnow() + timedelta(hours=24)

def is_token_expired(expires_at: datetime) -> bool:
    """Check if a token has expired"""
    return datetime.utcnow() > expires_at
