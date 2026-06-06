from datetime import datetime, timedelta, timezone
from typing import Optional, List
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import re

SECRET_KEY = "vendorbridge_secret_key_2026"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

def hash_password(password: str) -> str:
    # Hash password using bcrypt directly
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Verify password using bcrypt directly
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db=None):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if db is None:
        from database import get_db_connection
        conn = get_db_connection()
    else:
        conn = db

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    if user['status'] != 'active':
        raise HTTPException(status_code=403, detail="User account is not active")

    return dict(user)

def require_role(*allowed_roles: str):
    async def check_role(credentials: HTTPAuthorizationCredentials = Depends(security)):
        from database import get_db_connection
        
        token = credentials.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: int = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()

        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        if user['status'] != 'active':
            raise HTTPException(status_code=403, detail="User account is not active")

        if user['role'] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        return dict(user)
    
    return check_role

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    phone = phone.replace(" ", "").replace("-", "")
    return len(phone) == 10 and phone.isdigit()

def validate_username(username: str) -> bool:
    return len(username) >= 3 and username.isalnum()

def validate_gst(gst: str) -> bool:
    return len(gst) == 15 and gst.isalnum()

def validate_username(username: str) -> bool:
    return len(username) >= 3 and username.isalnum()
