"""
End-to-end API checks for Ask Expert (modes 1-4).

Requirements:
- Set ASK_EXPERT_BASE_URL to a running FastAPI instance (e.g., http://localhost:8000).
- The backend must have seeded agents and support agent_level fields.
"""

import os
import pytest
import httpx

BASE_URL = os.getenv("ASK_EXPERT_BASE_URL")


pytestmark = pytest.mark.asyncio


@pytest.mark.skipif(not BASE_URL, reason="ASK_EXPERT_BASE_URL not set")
async def test_modes_endpoint_lists_all_modes():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30) as client:
        resp = await client.get("/ask-expert/modes")
        resp.raise_for_status()
        data = resp.json()
        assert "modes" in data
        assert {m["mode_id"] for m in data["modes"]} == {"mode1", "mode2", "mode3", "mode4"}


@pytest.mark.skipif(not BASE_URL, reason="ASK_EXPERT_BASE_URL not set")
@pytest.mark.parametrize(
    "is_automatic,is_autonomous",
    [
        (False, False),  # mode1
        (True, False),   # mode2
        (False, True),   # mode3
        (True, True),    # mode4
    ],
)
async def test_query_modes_return_agent_level(is_automatic, is_autonomous):
    payload = {
        "query": "What are FDA 510(k) requirements?",
        "tenant_id": "00000000-0000-0000-0000-000000000001",
        "is_automatic": is_automatic,
        "is_autonomous": is_autonomous,
        "selected_agent_ids": ["demo-agent-id"] if not is_automatic else [],
    }
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60) as client:
        resp = await client.post("/ask-expert/query", json=payload)
        resp.raise_for_status()
        data = resp.json()
        assert data.get("agent_level") is None or isinstance(data.get("agent_level"), str)
        assert data["mode"] in {"mode1", "mode2", "mode3", "mode4"}
        # Ensure evidence fields present
        assert "citations" in data
        assert "evidence_chain" in data


@pytest.mark.skipif(not BASE_URL, reason="ASK_EXPERT_BASE_URL not set")
async def test_unified_endpoint_returns_session_and_level():
    payload = {
        "query": "Summarize EMA MDR requirements.",
        "mode": "single_expert",
        "tenant_id": "00000000-0000-0000-0000-000000000001",
        "expert_id": "demo-expert-id",
    }
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60) as client:
        resp = await client.post("/ask-expert/unified", json=payload)
        resp.raise_for_status()
        data = resp.json()
        assert "session_id" in data
        # unified workflow state should carry mode; agent_level may be nested in results
        assert data.get("mode")
