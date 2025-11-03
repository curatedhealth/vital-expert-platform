"""
Integration Tests - Mode 4: Autonomous Manual
Test the orchestrate endpoint with Mode 4 (autonomous with manual agent selection)

Mode 4: User selects agent, system handles autonomously
"""

import pytest
from uuid import uuid4
import os
import sys

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode4_successful_query(async_client, test_tenant_id, test_user_id, test_agent_id):
    """
    Test Mode 4 happy path: autonomous with specified agent.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 4,
            "message": "Develop a complete regulatory submission package",
            "agent_id": str(test_agent_id),
            "session_id": "test-mode4-session",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert "answer" in data
    assert data["answer"], "Answer should not be empty"
    
    print(f"✅ Mode 4 successful query test passed")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode4_with_reasoning(async_client, test_tenant_id, test_user_id, test_agent_id):
    """
    Test Mode 4 reasoning output.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 4,
            "message": "Plan the entire regulatory approval process",
            "agent_id": str(test_agent_id),
            "session_id": "test-mode4-reasoning",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    
    print(f"✅ Mode 4 reasoning test passed")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode4_missing_agent_id(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 4 error handling: missing agent_id.
    
    Mode 4 requires agent_id.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 4,
            "message": "Test query",
            # agent_id missing
            "session_id": "test-mode4-error",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code in [400, 422, 500], f"Expected error, got {response.status_code}"
    print(f"✅ Mode 4 missing agent_id error handling passed")


