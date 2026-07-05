# Finance API

Personal finance management API built with FastAPI and async SQLAlchemy.

## Features

- User registration and JWT-based authentication
- Transaction management (income/expense tracking)
- Category-based expense organization
- Secure password hashing with bcrypt
- Async database operations with SQLAlchemy

## Tech Stack

- **FastAPI** - Modern async web framework
- **SQLAlchemy** - Async ORM with SQLite
- **JWT** - Token-based authentication
- **Pydantic** - Data validation
- **bcrypt** - Password hashing

## Installation

```bash
git clone https://github.com/mistil01/finance-api.git
cd finance-api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Running

```bash
uvicorn main:app --reload
```

Visit http://127.0.0.1:8000/docs for interactive API documentation.

## Docker

Build and run with Docker:

```bash
docker-compose up --build
```

The API will be available at http://127.0.0.1:8000


## API Endpoints

- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `POST /create_transactions` - Add transaction
- `GET /transactions` - Get user transactions

## Environment

Create `.env` file:

```
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite+aiosqlite:///./finance.db
```
