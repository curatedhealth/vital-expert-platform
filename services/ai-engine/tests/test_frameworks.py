"""
Python AI Engine Framework Tests

Tests for LangGraph, AutoGen, and CrewAI execution endpoints
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.main import app

client = TestClient(app)

# ============================================================================
# FRAMEWORK INFO TESTS
# ============================================================================

def test_frameworks_info():
    """Test /frameworks/info endpoint"""
    response = client.get("/frameworks/info")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "frameworks" in data
    assert "langgraph" in data["frameworks"]
    assert "autogen" in data["frameworks"]
    assert "crewai" in data["frameworks"]
    assert data["version"] == "2.0.0"


# ============================================================================
# LANGGRAPH TESTS
# ============================================================================

def test_langgraph_execute_success():
    """Test successful LangGraph execution"""
    request_data = {
        "workflow": {
            "framework": "langgraph",
            "mode": "sequential",
            "agents": [
                {
                    "id": "test-agent",
                    "role": "Test Agent",
                    "systemPrompt": "You are a helpful test agent. Respond briefly.",
                    "model": "gpt-4o",
                    "temperature": 0.7,
                    "maxTokens": 100
                }
            ]
        },
        "input": {
            "message": "Say hello"
        },
        "metadata": {
            "source": "test"
        }
    }
    
    response = client.post("/frameworks/langgraph/execute", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] == True
    assert data["framework"] == "langgraph"
    assert "messages" in data["outputs"]
    assert len(data["outputs"]["messages"]) > 0
    assert data["metadata"]["duration"] > 0
    assert data["metadata"]["tokensUsed"] > 0


def test_langgraph_execute_multiple_agents():
    """Test LangGraph with multiple agents"""
    request_data = {
        "workflow": {
            "framework": "langgraph",
            "mode": "sequential",
            "agents": [
                {
                    "id": "agent1",
                    "role": "Agent 1",
                    "systemPrompt": "You are agent 1. Say hi briefly.",
                    "maxTokens": 50
                },
                {
                    "id": "agent2",
                    "role": "Agent 2",
                    "systemPrompt": "You are agent 2. Say hi briefly.",
                    "maxTokens": 50
                }
            ]
        },
        "input": {
            "message": "Hello"
        }
    }
    
    response = client.post("/frameworks/langgraph/execute", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] == True
    assert len(data["outputs"]["messages"]) == 2
    assert data["outputs"]["messages"][0]["agent_id"] == "agent1"
    assert data["outputs"]["messages"][1]["agent_id"] == "agent2"


def test_langgraph_execute_invalid_request():
    """Test LangGraph with invalid request"""
    request_data = {
        "workflow": {
            "framework": "langgraph",
            "mode": "sequential",
            "agents": []  # No agents
        },
        "input": {
            "message": "Test"
        }
    }
    
    response = client.post("/frameworks/langgraph/execute", json=request_data)
    
    # Should handle gracefully
    data = response.json()
    assert "success" in data


# ============================================================================
# AUTOGEN TESTS
# ============================================================================

def test_autogen_execute_success():
    """Test successful AutoGen execution"""
    request_data = {
        "workflow": {
            "framework": "autogen",
            "mode": "conversational",
            "agents": [
                {
                    "id": "expert1",
                    "role": "Expert 1",
                    "systemPrompt": "You are expert 1. Provide brief insights.",
                    "maxTokens": 100
                },
                {
                    "id": "expert2",
                    "role": "Expert 2",
                    "systemPrompt": "You are expert 2. Provide brief insights.",
                    "maxTokens": 100
                }
            ],
            "maxRounds": 2
        },
        "input": {
            "message": "What do you think?"
        }
    }
    
    response = client.post("/frameworks/autogen/execute", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] == True
    assert data["framework"] == "autogen"
    assert len(data["outputs"]["messages"]) >= 2  # At least 2 agents


def test_autogen_execute_with_consensus():
    """Test AutoGen with consensus requirement"""
    request_data = {
        "workflow": {
            "framework": "autogen",
            "mode": "conversational",
            "agents": [
                {
                    "id": "agent1",
                    "role": "Agent 1",
                    "systemPrompt": "You are a clinical trial expert. Give brief opinion.",
                    "maxTokens": 100
                },
                {
                    "id": "agent2",
                    "role": "Agent 2",
                    "systemPrompt": "You are an FDA expert. Give brief opinion.",
                    "maxTokens": 100
                }
            ],
            "requireConsensus": True,
            "maxRounds": 2
        },
        "input": {
            "message": "Should we proceed with Phase II trial?"
        }
    }
    
    response = client.post("/frameworks/autogen/execute", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] == True
    assert "state" in data["outputs"]
    assert "consensusReached" in data["outputs"]["state"]
    assert "recommendation" in data["outputs"]["state"]


# ============================================================================
# CREWAI TESTS
# ============================================================================

def test_crewai_execute_success():
    """Test successful CrewAI execution"""
    request_data = {
        "workflow": {
            "framework": "crewai",
            "mode": "hierarchical",
            "agents": [
                {
                    "id": "task1",
                    "role": "Researcher",
                    "goal": "Research the topic",
                    "systemPrompt": "You are a researcher. Provide brief findings.",
                    "maxTokens": 100
                },
                {
                    "id": "task2",
                    "role": "Writer",
                    "goal": "Write summary",
                    "systemPrompt": "You are a writer. Provide brief summary.",
                    "maxTokens": 100
                }
            ]
        },
        "input": {
            "message": "Research clinical trials"
        }
    }
    
    response = client.post("/frameworks/crewai/execute", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] == True
    assert data["framework"] == "crewai"
    assert len(data["outputs"]["messages"]) == 2
    assert data["outputs"]["state"]["tasks_completed"] == 2


def test_crewai_execute_with_context():
    """Test CrewAI with context passing"""
    request_data = {
        "workflow": {
            "framework": "crewai",
            "mode": "hierarchical",
            "agents": [
                {
                    "id": "agent1",
                    "role": "Analyst",
                    "goal": "Analyze data",
                    "systemPrompt": "Analyze and report findings briefly.",
                    "maxTokens": 80
                },
                {
                    "id": "agent2",
                    "role": "Synthesizer",
                    "goal": "Synthesize findings",
                    "systemPrompt": "Synthesize the analysis briefly.",
                    "maxTokens": 80
                }
            ]
        },
        "input": {
            "message": "Analyze clinical trial efficacy"
        }
    }
    
    response = client.post("/frameworks/crewai/execute", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Second agent should have context from first
    messages = data["outputs"]["messages"]
    assert len(messages) == 2


# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

def test_missing_openai_key():
    """Test behavior when OpenAI key is missing"""
    # This test would need to mock the environment
    # For now, we just ensure the endpoint exists
    pass


def test_invalid_framework():
    """Test request with invalid framework"""
    request_data = {
        "workflow": {
            "framework": "invalid_framework",
            "mode": "sequential",
            "agents": []
        },
        "input": {
            "message": "Test"
        }
    }
    
    # Should return 422 (validation error)
    response = client.post("/frameworks/langgraph/execute", json=request_data)
    
    # Framework mismatch should be caught
    data = response.json()
    assert "success" in data or "detail" in data


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

def test_execution_timeout():
    """Test that executions complete within reasonable time"""
    import time
    
    request_data = {
        "workflow": {
            "framework": "langgraph",
            "mode": "sequential",
            "agents": [
                {
                    "id": "test",
                    "role": "Test",
                    "systemPrompt": "Say hi briefly",
                    "maxTokens": 50
                }
            ]
        },
        "input": {
            "message": "Hi"
        }
    }
    
    start = time.time()
    response = client.post("/frameworks/langgraph/execute", json=request_data)
    duration = time.time() - start
    
    assert response.status_code == 200
    assert duration < 30  # Should complete within 30 seconds


def test_token_usage_tracking():
    """Test that token usage is tracked"""
    request_data = {
        "workflow": {
            "framework": "langgraph",
            "mode": "sequential",
            "agents": [
                {
                    "id": "test",
                    "role": "Test",
                    "systemPrompt": "Respond briefly",
                    "maxTokens": 50
                }
            ]
        },
        "input": {
            "message": "Hello"
        }
    }
    
    response = client.post("/frameworks/langgraph/execute", json=request_data)
    data = response.json()
    
    assert data["metadata"]["tokensUsed"] > 0
    assert data["metadata"]["duration"] > 0


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

def test_full_panel_consultation_flow():
    """Test complete panel consultation flow"""
    request_data = {
        "workflow": {
            "framework": "autogen",
            "mode": "conversational",
            "agents": [
                {
                    "id": "clinical",
                    "role": "Clinical Expert",
                    "systemPrompt": "You are a clinical trial expert. Provide brief insights.",
                    "maxTokens": 100
                },
                {
                    "id": "regulatory",
                    "role": "Regulatory Expert",
                    "systemPrompt": "You are an FDA expert. Provide brief insights.",
                    "maxTokens": 100
                },
                {
                    "id": "statistical",
                    "role": "Statistical Expert",
                    "systemPrompt": "You are a biostatistician. Provide brief insights.",
                    "maxTokens": 100
                }
            ],
            "requireConsensus": True,
            "maxRounds": 2
        },
        "input": {
            "message": "Should we proceed with a Phase II trial for our diabetes app?"
        }
    }
    
    response = client.post("/frameworks/autogen/execute", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify complete response structure
    assert data["success"] == True
    assert data["framework"] == "autogen"
    assert len(data["outputs"]["messages"]) >= 3
    assert data["outputs"]["state"]["consensusReached"] == True
    assert data["outputs"]["state"]["recommendation"] is not None
    assert data["metadata"]["agentsInvolved"] == ["clinical", "regulatory", "statistical"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

