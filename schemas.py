from datetime import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str
    email: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    amount: float
    type: str
    category: str
    description: str | None = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    type: str
    category: str
    description: str | None = None
    created_at: datetime

