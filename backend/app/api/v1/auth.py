from fastapi import APIRouter, HTTPException, status
from app.models.schemas import UserSignup, UserLogin, Token
from app.core.supabase import supabase_client
from app.core.config import settings
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    to_encode = {"sub": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignup):
    try:
        res = supabase_client.auth.sign_up({
            "email": user.email,
            "password": user.password,
            "options": {"data": {"full_name": user.full_name}}
        })
        if res.user is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User could not be created, it may already exist.")
        
        access_token = create_access_token(str(res.user.id))
        return Token(access_token=access_token)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Signup failed: {e}")

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    try:
        res = supabase_client.auth.sign_in_with_password({"email": user.email, "password": user.password})
        if res.user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        access_token = create_access_token(str(res.user.id))
        return Token(access_token=access_token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
