import pytest
import httpx
from api.app_factory import create_app
from api.routes.register import register_routes

app = create_app()
register_routes(app)
transport = httpx.ASGITransport(app=app)


@pytest.mark.asyncio
async def test_mode3_stream_starts():
    payload = {
        "mode": 3,
        "goal": "test objective",
        "agent_id": "regulatory",
        "mission_id": "test-mission-1",
        "template_id": "deep_research",
    }
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/missions/stream",
            json=payload,
            headers={"x-tenant-id": "00000000-0000-0000-0000-000000000001"},
        )
        assert resp.status_code == 200
