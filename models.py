from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column(unique=True)

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    amount: Mapped[float] = mapped_column()
    type: Mapped[str] = mapped_column()
    category: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column()