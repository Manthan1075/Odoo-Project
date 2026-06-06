from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from database import get_db_connection
from auth_utils import (
    hash_password, verify_password, create_access_token,
    validate_email, validate_username, require_role
)
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    password: str
    phone: str = None
    role: str
    country: str = None
    address: str = None

class LoginRequest(BaseModel):
    email: str
    password: str

def log_activity(db, user_id, action, module, description):
    cursor = db.cursor()
    cursor.execute("""
    INSERT INTO activity_logs (user_id, action, module, description)
    VALUES (?, ?, ?, ?)
    """, (user_id, action, module, description))
    db.commit()

@router.post("/register")
def register(req: RegisterRequest):
    if not validate_email(req.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    if not validate_username(req.username):
        raise HTTPException(status_code=400, detail="Username must be alphanumeric and at least 3 characters")
    
    valid_roles = ["admin", "procurement_officer", "manager", "vendor"]
    if req.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="Email already registered")

    cursor.execute("SELECT id FROM users WHERE username = ?", (req.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=409, detail="Username already taken")

    password_hash = hash_password(req.password)
    
    cursor.execute("""
    INSERT INTO users (username, first_name, last_name, email, password_hash, 
                       phone, role, country, address, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (req.username, req.first_name, req.last_name, req.email, password_hash,
          req.phone, req.role, req.country, req.address, "active"))
    
    conn.commit()
    user_id = cursor.lastrowid

    log_activity(conn, user_id, "register", "auth", f"User registered: {req.username}")
    
    conn.close()
    
    return {
        "id": user_id,
        "username": req.username,
        "email": req.email,
        "role": req.role
    }

@router.post("/login")
def login(req: LoginRequest):
    if not validate_email(req.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(req.password, user['password_hash']):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid password")

    if user['status'] != 'active':
        conn.close()
        raise HTTPException(status_code=403, detail="Account is not active")

    token = create_access_token({"sub": user['id']})
    
    log_activity(conn, user['id'], "login", "auth", f"User logged in: {user['username']}")
    
    conn.close()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user['id'],
            "username": user['username'],
            "email": user['email'],
            "role": user['role'],
            "first_name": user['first_name']
        }
    }

@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(require_role("admin", "procurement_officer", "manager", "vendor"))):
    return {
        "id": current_user['id'],
        "username": current_user['username'],
        "email": current_user['email'],
        "role": current_user['role'],
        "first_name": current_user['first_name'],
        "last_name": current_user['last_name'],
        "phone": current_user['phone'],
        "company_name": current_user['company_name'],
        "country": current_user['country'],
        "address": current_user['address'],
        "status": current_user['status']
    }
