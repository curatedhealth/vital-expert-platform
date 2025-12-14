import os
import pytest
import httpx

pytestmark = pytest.mark.skipif(
    os.getenv("RUN_MISSION_STREAM_TEST") != "1",
    reason="Set RUN_MISSION_STREAM_TEST=1 to run live SSE contract test against running api",
)


@pytest.mark.asyncio
async def test_missions_stream_emits_plan_artifact_cost_toolcall():
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            "http://localhost:8000/api/missions/stream",
            json={"mode": 3, "goal": "Contract test mission", "agent_id": "regulatory", "budget_limit": 5},
            headers={"Accept": "text/event-stream"},
        )
        assert resp.status_code == 200
        content = resp.iter_text()
        seen = {"plan": False, "artifact": False, "cost": False, "tool_call": False, "done": False}
        async for chunk in content:
            for line in chunk.split("\n\n"):
                if line.startswith("event:"):
                    event_type = line.split("event:")[1].strip()
                    if event_type in seen:
                        seen[event_type] = True
            if all(seen.values()):
                break
        assert seen["plan"]
        assert seen["artifact"]
        assert seen["cost"]
        assert seen["tool_call"]
        assert seen["done"]
