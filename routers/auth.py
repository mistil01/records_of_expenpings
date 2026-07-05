from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import os

from dotenv import load_dotenv
from database import get_db
from models import User
from schemas import LoginRequest, TokenResponse, UserCreate, UserResponse

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-key")



@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user.username))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="This user already exists")

    hashed_password = pwd_context.hash(user.password)
    new_user = User(username=user.username, password=hashed_password, email=user.email)

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenResponse)
async def login(user: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user.username))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=400, detail="Please enter a correct username and password")

    if not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = jwt.encode({"sub": db_user.username}, SECRET_KEY, algorithm="HS256")
    return {"access_token": token}


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

