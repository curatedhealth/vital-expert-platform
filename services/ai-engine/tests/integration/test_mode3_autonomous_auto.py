"""
Integration Tests - Mode 3: Autonomous Automatic
Test the orchestrate endpoint with Mode 3 (autonomous with automatic agent selection)

Mode 3: Fully autonomous - system handles everything automatically
"""

import pytest
from uuid import uuid4
import os
import sys

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode3_successful_query(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 3 happy path: fully autonomous query processing.
    
    Mode 3 handles everything automatically.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 3,
            "message": "Analyze the regulatory strategy for a new cardiac device",
            "session_id": "test-mode3-session",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert "answer" in data
    assert data["answer"], "Answer should not be empty"
    
    print(f"✅ Mode 3 successful query test passed")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode3_with_reasoning(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 3 reasoning output.
    
    Autonomous mode should provide detailed reasoning.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 3,
            "message": "Create a comprehensive regulatory roadmap",
            "session_id": "test-mode3-reasoning",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    
    print(f"✅ Mode 3 reasoning test passed")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode3_error_handling(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 3 error handling.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 3,
            "message": "",
            "session_id": "test-mode3-error",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code in [400, 422], f"Expected error, got {response.status_code}"
    print(f"✅ Mode 3 error handling test passed")


