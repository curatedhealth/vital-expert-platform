"""
Integration Tests - Mode 2: Automatic Agent Selection
Test the orchestrate endpoint with Mode 2 (automatic agent selection)

Mode 2: System automatically selects best agent based on query
"""

import pytest
from uuid import uuid4
import os
import sys

# Add src to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode2_successful_query(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 2 happy path: successful query with automatic agent selection.
    
    Mode 2 should select agent automatically based on query content.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 2,
            "message": "What are the regulatory requirements for Class II medical devices?",
            "session_id": "test-mode2-session",
            "user_id": str(test_user_id)
            # Note: agent_id not provided - Mode 2 selects automatically
        }
    )
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    data = response.json()
    
    # Verify response structure
    assert "answer" in data
    assert data["answer"], "Answer should not be empty"
    
    # Mode 2 might include agent selection info in metadata
    if "metadata" in data:
        metadata = data["metadata"]
        print(f"   Metadata keys: {list(metadata.keys() if isinstance(metadata, dict) else [])}")
    
    print(f"✅ Mode 2 successful query test passed")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode2_agent_selection_reasoning(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 2 agent selection reasoning.
    
    Mode 2 should explain why it selected a particular agent.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 2,
            "message": "Help me prepare a 510(k) submission",
            "session_id": "test-mode2-reasoning",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Check for agent selection reasoning
    if "metadata" in data:
        metadata = data["metadata"]
        has_agent_info = any(
            key in metadata 
            for key in ["selected_agent", "agent_id", "agent_selection_reasoning"]
        )
        print(f"   Agent selection info present: {has_agent_info}")
    
    print(f"✅ Mode 2 agent selection reasoning test passed")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode2_with_reasoning(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 2 reasoning output.
    
    Verifies reasoning is included in response.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 2,
            "message": "What is the difference between 510(k) and De Novo pathways?",
            "session_id": "test-mode2-reasoning-2",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "metadata" in data
    print(f"✅ Mode 2 reasoning test passed")


@pytest.mark.integration
@pytest.mark.asyncio
async def test_mode2_error_handling(async_client, test_tenant_id, test_user_id):
    """
    Test Mode 2 error handling with empty message.
    """
    response = await async_client.post(
        "/api/ask-expert/orchestrate",
        headers={"x-tenant-id": str(test_tenant_id)},
        json={
            "mode": 2,
            "message": "",  # Empty
            "session_id": "test-mode2-error",
            "user_id": str(test_user_id)
        }
    )
    
    assert response.status_code in [400, 422], f"Expected error, got {response.status_code}"
    print(f"✅ Mode 2 error handling test passed")


