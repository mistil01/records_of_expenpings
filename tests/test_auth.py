import pytest
from asgi_lifespan import LifespanManager
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_register():
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/register", json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            })
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"