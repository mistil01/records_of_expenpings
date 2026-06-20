from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Transaction, User
from routers.auth import get_current_user
from schemas import TransactionCreate, TransactionResponse

router = APIRouter()


@router.post("/create_transactions", response_model=TransactionResponse)
async def create_transact(
    transactions: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_transaction = Transaction(
        user_id=current_user.id,
        amount=transactions.amount,
        type=transactions.type,
        category=transactions.category,
        description=transactions.description,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)
    return new_transaction


@router.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == current_user.id)
    )
    transactions = result.scalars().all()
    return transactions


@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transactions: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.amount = transactions.amount
    transaction.type = transactions.type
    transaction.category = transactions.category
    transaction.description = transactions.description

    await db.commit()
    await db.refresh(transaction)
    return transaction


@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    await db.delete(transaction)
    await db.commit()
    return {"message": "Transaction deleted"}

