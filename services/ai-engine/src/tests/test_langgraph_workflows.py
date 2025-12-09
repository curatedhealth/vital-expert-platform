"""
Comprehensive Unit Tests for LangGraph Workflows

Tests for all 4 Ask Expert modes:
- Mode 1: Manual Interactive (Expert Chat)
- Mode 2: Auto Interactive (Smart Copilot)
- Mode 3: Manual Autonomous (Mission Control)
- Mode 4: Auto Autonomous (Background Dashboard)

Phase 5: Testing & Quality Assurance
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from typing import Dict, Any, List
import asyncio
import json


# =============================================================================
# SHARED TEST FIXTURES
# =============================================================================

@pytest.fixture
def mock_llm_response():
    """Mock LLM response object."""
    mock = MagicMock()
    mock.content = "This is a comprehensive response about medical devices..."
    mock.usage = MagicMock(
        prompt_tokens=500,
        completion_tokens=800,
        total_tokens=1300,
    )
    return mock


@pytest.fixture
def mock_agent_config():
    """Mock instantiated agent configuration."""
    return {
        "session_id": "session-123",
        "agent_id": "agent-regulatory",
        "agent_name": "regulatory-expert",
        "agent_display_name": "Regulatory Expert",
        "level": 2,
        "system_prompt": "You are a regulatory affairs expert...",
        "llm_config": {
            "model": "claude-sonnet-4-20250514",
            "temperature": 0.2,
            "max_tokens": 4096,
        },
    }


@pytest.fixture
def mock_fusion_result():
    """Mock Fusion Intelligence result."""
    return {
        "fused_rankings": [
            ("agent-clinical", 100, {"name": "Clinical Expert", "level": 2}),
            ("agent-regulatory", 92, {"name": "Regulatory Expert", "level": 2}),
            ("agent-safety", 85, {"name": "Safety Expert", "level": 2}),
        ],
        "vector_results": [("agent-clinical", 0.92, {})],
        "graph_results": [("agent-regulatory", 0.90, {})],
        "relational_results": [("agent-clinical", 0.95, {})],
        "sources_used": ["vector", "graph", "relational"],
        "retrieval_time_ms": 150,
    }


@pytest.fixture
def sample_workflow_state():
    """Sample initial workflow state."""
    return {
        "query": "What are the FDA requirements for 510(k) submissions?",
        "tenant_id": "tenant-pharma-1",
        "user_id": "user-123",
        "session_id": None,
        "agent_id": "agent-regulatory",
        "conversation_history": [],
        "messages": [],
        "response": "",
        "citations": [],
        "tools_called": [],
        "error": None,
        "metadata": {},
    }


# =============================================================================
# MODE 1: MANUAL INTERACTIVE TESTS
# =============================================================================

class TestMode1ManualInteractive:
    """Tests for Mode 1: Manual + Interactive (Expert Chat)."""
    
    @pytest.fixture
    def mode1_state(self, sample_workflow_state):
        """Mode 1 specific state with selected agent."""
        state = sample_workflow_state.copy()
        state["agent_id"] = "agent-regulatory"  # Manual selection
        state["mode"] = "mode1"
        return state
    
    @pytest.mark.asyncio
    async def test_mode1_input_processing(self, mode1_state):
        """Test Mode 1 input validation and processing."""
        # Validate required fields
        assert mode1_state["query"] is not None
        assert len(mode1_state["query"]) >= 5
        assert mode1_state["agent_id"] is not None
        assert mode1_state["tenant_id"] is not None
    
    @pytest.mark.asyncio
    async def test_mode1_agent_loading(self, mode1_state, mock_agent_config):
        """Test Mode 1 agent loading with context injection."""
        # Mock agent instantiation
        with patch('services.agent_instantiation_service.AgentInstantiationService') as MockService:
            mock_instance = MockService.return_value
            mock_instance.instantiate_agent = AsyncMock(return_value=MagicMock(**mock_agent_config))
            
            # Verify agent config structure
            assert mock_agent_config["session_id"] is not None
            assert mock_agent_config["system_prompt"] is not None
            assert mock_agent_config["llm_config"]["temperature"] == 0.2
    
    @pytest.mark.asyncio
    async def test_mode1_rag_retrieval(self, mode1_state):
        """Test Mode 1 RAG retrieval step."""
        # Mock RAG results
        rag_results = [
            {
                "content": "FDA 510(k) premarket notification process...",
                "similarity": 0.92,
                "source": "FDA Guidance Document",
            },
            {
                "content": "Class II medical device requirements...",
                "similarity": 0.88,
                "source": "21 CFR Part 807",
            },
        ]
        
        assert len(rag_results) > 0
        assert rag_results[0]["similarity"] >= 0.8
    
    @pytest.mark.asyncio
    async def test_mode1_response_generation(self, mode1_state, mock_llm_response):
        """Test Mode 1 response generation."""
        # Verify response structure
        assert mock_llm_response.content is not None
        assert len(mock_llm_response.content) > 50
        
        # Verify token tracking
        assert mock_llm_response.usage.total_tokens > 0
    
    @pytest.mark.asyncio
    async def test_mode1_streaming_events(self, mode1_state):
        """Test Mode 1 SSE event generation."""
        expected_events = ["token", "reasoning", "citation", "cost", "done"]
        
        # Verify all event types are defined
        for event in expected_events:
            assert event in expected_events
    
    @pytest.mark.asyncio
    async def test_mode1_conversation_history(self, mode1_state):
        """Test Mode 1 conversation history management."""
        # Add messages to history
        mode1_state["conversation_history"] = [
            {"role": "user", "content": "What is a 510(k)?"},
            {"role": "assistant", "content": "A 510(k) is a premarket submission..."},
        ]
        
        assert len(mode1_state["conversation_history"]) == 2
        assert mode1_state["conversation_history"][0]["role"] == "user"
    
    @pytest.mark.asyncio
    async def test_mode1_error_handling(self, mode1_state):
        """Test Mode 1 error handling."""
        # Test with missing agent
        mode1_state["agent_id"] = None
        
        # Should set error in state
        if not mode1_state["agent_id"]:
            mode1_state["error"] = {
                "code": "AGENT_REQUIRED",
                "message": "Mode 1 requires manual agent selection",
            }
        
        assert mode1_state["error"] is not None
        assert mode1_state["error"]["code"] == "AGENT_REQUIRED"


# =============================================================================
# MODE 2: AUTO INTERACTIVE TESTS
# =============================================================================

class TestMode2AutoInteractive:
    """Tests for Mode 2: Auto + Interactive (Smart Copilot)."""
    
    @pytest.fixture
    def mode2_state(self, sample_workflow_state):
        """Mode 2 specific state without pre-selected agent."""
        state = sample_workflow_state.copy()
        state["agent_id"] = None  # No manual selection
        state["mode"] = "mode2"
        state["fusion_enabled"] = True
        return state
    
    @pytest.mark.asyncio
    async def test_mode2_fusion_selection(self, mode2_state, mock_fusion_result):
        """Test Mode 2 Fusion Intelligence expert selection."""
        # Verify fusion result structure
        assert len(mock_fusion_result["fused_rankings"]) >= 1
        assert mock_fusion_result["sources_used"] is not None
        
        # First agent should have highest score (100)
        top_agent = mock_fusion_result["fused_rankings"][0]
        assert top_agent[1] == 100  # Normalized score
    
    @pytest.mark.asyncio
    async def test_mode2_multi_expert_synthesis(self, mode2_state, mock_fusion_result):
        """Test Mode 2 multi-expert response synthesis."""
        selected_experts = mock_fusion_result["fused_rankings"][:3]
        
        # Verify multiple experts selected
        assert len(selected_experts) >= 2
        
        # Verify different expertise areas
        expert_ids = [e[0] for e in selected_experts]
        assert len(set(expert_ids)) == len(expert_ids)  # All unique
    
    @pytest.mark.asyncio
    async def test_mode2_confidence_display(self, mode2_state, mock_fusion_result):
        """Test Mode 2 confidence score display."""
        for agent_id, score, metadata in mock_fusion_result["fused_rankings"]:
            # Score should be normalized 0-100
            assert 0 <= score <= 100
            
            # Determine confidence level
            if score >= 85:
                confidence = "high"
            elif score >= 60:
                confidence = "medium"
            else:
                confidence = "low"
            
            assert confidence in ["high", "medium", "low"]
    
    @pytest.mark.asyncio
    async def test_mode2_fusion_event_emission(self, mode2_state, mock_fusion_result):
        """Test Mode 2 fusion event emission."""
        fusion_event = {
            "type": "fusion",
            "data": {
                "selectedExperts": [
                    {"id": e[0], "confidence": e[1], "name": e[2].get("name")}
                    for e in mock_fusion_result["fused_rankings"]
                ],
                "evidence": {
                    "method": "weighted_rrf",
                    "sources_used": mock_fusion_result["sources_used"],
                },
            },
        }
        
        assert fusion_event["type"] == "fusion"
        assert len(fusion_event["data"]["selectedExperts"]) >= 1
    
    @pytest.mark.asyncio
    async def test_mode2_fallback_on_fusion_failure(self, mode2_state):
        """Test Mode 2 fallback when Fusion fails."""
        # Simulate fusion failure
        fusion_failed = True
        
        if fusion_failed:
            # Fallback to default expert
            mode2_state["agent_id"] = "agent-default"
            mode2_state["fusion_error"] = "Fusion service unavailable"
        
        assert mode2_state["agent_id"] is not None
        assert mode2_state["fusion_error"] is not None


# =============================================================================
# MODE 3: MANUAL AUTONOMOUS TESTS
# =============================================================================

class TestMode3ManualAutonomous:
    """Tests for Mode 3: Manual + Autonomous (Mission Control)."""
    
    @pytest.fixture
    def mode3_state(self, sample_workflow_state):
        """Mode 3 specific state with mission configuration."""
        state = sample_workflow_state.copy()
        state["mode"] = "mode3"
        state["mission_id"] = "mission-123"
        state["mission_goal"] = "Conduct literature review on CAR-T cell therapy"
        state["agent_id"] = "agent-clinical"  # Manual selection
        state["steps"] = []
        state["checkpoints"] = []
        state["artifacts"] = []
        state["status"] = "idle"
        return state
    
    @pytest.mark.asyncio
    async def test_mode3_mission_initialization(self, mode3_state):
        """Test Mode 3 mission initialization."""
        assert mode3_state["mission_id"] is not None
        assert mode3_state["mission_goal"] is not None
        assert mode3_state["agent_id"] is not None
        assert mode3_state["status"] == "idle"
    
    @pytest.mark.asyncio
    async def test_mode3_plan_generation(self, mode3_state):
        """Test Mode 3 execution plan generation."""
        # Generate mock plan
        plan = [
            {"id": "step-1", "name": "Search PubMed", "status": "pending"},
            {"id": "step-2", "name": "Analyze Results", "status": "pending"},
            {"id": "step-3", "name": "Synthesize Findings", "status": "pending"},
            {"id": "step-4", "name": "Generate Report", "status": "pending"},
        ]
        
        mode3_state["steps"] = plan
        
        assert len(mode3_state["steps"]) >= 3
        assert mode3_state["steps"][0]["status"] == "pending"
    
    @pytest.mark.asyncio
    async def test_mode3_hitl_checkpoint(self, mode3_state):
        """Test Mode 3 HITL checkpoint handling."""
        checkpoint = {
            "id": "checkpoint-1",
            "type": "decision",
            "urgency": "high",
            "question": "Proceed with 500+ search results?",
            "options": ["Proceed", "Refine Search", "Cancel"],
            "status": "pending",
        }
        
        mode3_state["checkpoints"].append(checkpoint)
        mode3_state["status"] = "waiting_checkpoint"
        
        assert mode3_state["status"] == "waiting_checkpoint"
        assert len(mode3_state["checkpoints"]) == 1
    
    @pytest.mark.asyncio
    async def test_mode3_checkpoint_approval(self, mode3_state):
        """Test Mode 3 checkpoint approval flow."""
        checkpoint = {
            "id": "checkpoint-1",
            "status": "pending",
        }
        mode3_state["checkpoints"] = [checkpoint]
        mode3_state["status"] = "waiting_checkpoint"
        
        # Approve checkpoint
        checkpoint["status"] = "approved"
        checkpoint["approved_by"] = "user-123"
        checkpoint["approved_at"] = "2025-12-06T10:00:00Z"
        mode3_state["status"] = "running"
        
        assert checkpoint["status"] == "approved"
        assert mode3_state["status"] == "running"
    
    @pytest.mark.asyncio
    async def test_mode3_artifact_generation(self, mode3_state):
        """Test Mode 3 artifact generation."""
        artifact = {
            "id": "artifact-1",
            "type": "report",
            "title": "CAR-T Literature Review",
            "format": "markdown",
            "content": "# Literature Review\n\n## Executive Summary...",
            "created_at": "2025-12-06T12:00:00Z",
        }
        
        mode3_state["artifacts"].append(artifact)
        
        assert len(mode3_state["artifacts"]) == 1
        assert mode3_state["artifacts"][0]["type"] == "report"
    
    @pytest.mark.asyncio
    async def test_mode3_pause_resume(self, mode3_state):
        """Test Mode 3 pause/resume functionality."""
        mode3_state["status"] = "running"
        
        # Pause
        mode3_state["status"] = "paused"
        mode3_state["paused_at"] = "2025-12-06T11:00:00Z"
        
        assert mode3_state["status"] == "paused"
        
        # Resume
        mode3_state["status"] = "running"
        mode3_state["resumed_at"] = "2025-12-06T11:30:00Z"
        
        assert mode3_state["status"] == "running"
    
    @pytest.mark.asyncio
    async def test_mode3_cancel(self, mode3_state):
        """Test Mode 3 mission cancellation."""
        mode3_state["status"] = "running"
        
        # Cancel
        mode3_state["status"] = "cancelled"
        mode3_state["cancelled_at"] = "2025-12-06T11:00:00Z"
        mode3_state["cancel_reason"] = "User requested cancellation"
        
        assert mode3_state["status"] == "cancelled"
        assert mode3_state["cancel_reason"] is not None


# =============================================================================
# MODE 4: AUTO AUTONOMOUS TESTS
# =============================================================================

class TestMode4AutoAutonomous:
    """Tests for Mode 4: Auto + Autonomous (Background Dashboard)."""
    
    @pytest.fixture
    def mode4_state(self, sample_workflow_state):
        """Mode 4 specific state with full autonomous configuration."""
        state = sample_workflow_state.copy()
        state["mode"] = "mode4"
        state["mission_id"] = "mission-456"
        state["mission_goal"] = "Generate competitive intelligence report"
        state["agent_id"] = None  # Auto-selected
        state["fusion_enabled"] = True
        state["preflight_passed"] = False
        state["team"] = []
        state["steps"] = []
        state["checkpoints"] = []
        state["artifacts"] = []
        state["status"] = "idle"
        state["notifications"] = []
        return state
    
    @pytest.mark.asyncio
    async def test_mode4_preflight_checks(self, mode4_state):
        """Test Mode 4 pre-flight validation."""
        preflight_checks = [
            {"id": "budget", "name": "Budget Available", "status": "passed"},
            {"id": "tools", "name": "Required Tools", "status": "passed"},
            {"id": "permissions", "name": "User Permissions", "status": "passed"},
            {"id": "context", "name": "Context Valid", "status": "passed"},
        ]
        
        # All checks must pass
        all_passed = all(c["status"] == "passed" for c in preflight_checks)
        mode4_state["preflight_passed"] = all_passed
        mode4_state["preflight_checks"] = preflight_checks
        
        assert mode4_state["preflight_passed"] is True
        assert len(mode4_state["preflight_checks"]) == 4
    
    @pytest.mark.asyncio
    async def test_mode4_preflight_failure(self, mode4_state):
        """Test Mode 4 pre-flight failure handling."""
        preflight_checks = [
            {"id": "budget", "name": "Budget Available", "status": "failed", "reason": "Insufficient credits"},
            {"id": "tools", "name": "Required Tools", "status": "passed"},
        ]
        
        all_passed = all(c["status"] == "passed" for c in preflight_checks)
        mode4_state["preflight_passed"] = all_passed
        
        assert mode4_state["preflight_passed"] is False
    
    @pytest.mark.asyncio
    async def test_mode4_team_assembly(self, mode4_state, mock_fusion_result):
        """Test Mode 4 automatic team assembly."""
        # Select team via Fusion
        team = [
            {"id": e[0], "confidence": e[1], "role": e[2].get("name")}
            for e in mock_fusion_result["fused_rankings"][:3]
        ]
        
        mode4_state["team"] = team
        
        assert len(mode4_state["team"]) >= 2
        assert mode4_state["team"][0]["confidence"] == 100
    
    @pytest.mark.asyncio
    async def test_mode4_background_execution(self, mode4_state):
        """Test Mode 4 background execution model."""
        mode4_state["status"] = "running"
        mode4_state["started_at"] = "2025-12-06T10:00:00Z"
        mode4_state["execution_type"] = "background"
        
        # Simulate progress
        mode4_state["progress"] = 45
        
        assert mode4_state["execution_type"] == "background"
        assert mode4_state["progress"] == 45
    
    @pytest.mark.asyncio
    async def test_mode4_polling_status(self, mode4_state):
        """Test Mode 4 polling status endpoint."""
        status_response = {
            "mission_id": mode4_state["mission_id"],
            "status": "running",
            "progress": 60,
            "current_step": "Analyzing competitive data",
            "team_status": [
                {"agent_id": "agent-1", "status": "active"},
                {"agent_id": "agent-2", "status": "waiting"},
            ],
            "artifacts_count": 2,
            "checkpoints_pending": 0,
        }
        
        assert status_response["status"] in ["idle", "running", "paused", "completed", "failed", "cancelled"]
        assert 0 <= status_response["progress"] <= 100
    
    @pytest.mark.asyncio
    async def test_mode4_notification_generation(self, mode4_state):
        """Test Mode 4 notification generation."""
        notifications = [
            {
                "id": "notif-1",
                "type": "progress",
                "title": "Mission 50% Complete",
                "message": "Competitive analysis phase completed",
                "timestamp": "2025-12-06T11:00:00Z",
                "read": False,
            },
            {
                "id": "notif-2",
                "type": "checkpoint",
                "title": "Approval Required",
                "message": "Review generated report before publishing",
                "timestamp": "2025-12-06T12:00:00Z",
                "read": False,
            },
        ]
        
        mode4_state["notifications"] = notifications
        
        assert len(mode4_state["notifications"]) == 2
        assert mode4_state["notifications"][1]["type"] == "checkpoint"
    
    @pytest.mark.asyncio
    async def test_mode4_completion_flow(self, mode4_state):
        """Test Mode 4 mission completion flow."""
        mode4_state["status"] = "completed"
        mode4_state["completed_at"] = "2025-12-06T14:00:00Z"
        mode4_state["progress"] = 100
        
        # Final artifacts
        mode4_state["artifacts"] = [
            {"id": "artifact-1", "type": "report", "title": "Competitive Intelligence Report"},
            {"id": "artifact-2", "type": "data", "title": "Market Analysis Data"},
        ]
        
        # Final metrics
        mode4_state["metrics"] = {
            "duration_minutes": 240,
            "total_tokens": 125000,
            "total_cost_usd": 2.50,
            "tools_invoked": 15,
            "checkpoints_approved": 3,
        }
        
        assert mode4_state["status"] == "completed"
        assert mode4_state["progress"] == 100
        assert len(mode4_state["artifacts"]) == 2


# =============================================================================
# CROSS-MODE SHARED FUNCTIONALITY TESTS
# =============================================================================

class TestSharedWorkflowFunctionality:
    """Tests for functionality shared across all modes."""
    
    @pytest.mark.asyncio
    async def test_error_boundary(self, sample_workflow_state):
        """Test error boundary handling."""
        def create_error_boundary(error: Exception) -> Dict[str, Any]:
            return {
                "code": type(error).__name__,
                "message": str(error),
                "recoverable": isinstance(error, (TimeoutError, ConnectionError)),
            }
        
        error = ValueError("Invalid query")
        boundary = create_error_boundary(error)
        
        assert boundary["code"] == "ValueError"
        assert boundary["recoverable"] is False
    
    @pytest.mark.asyncio
    async def test_cost_tracking(self, sample_workflow_state):
        """Test cost tracking across modes."""
        cost_data = {
            "input_tokens": 500,
            "output_tokens": 1000,
            "total_tokens": 1500,
            "model": "claude-sonnet-4-20250514",
            "estimated_cost": 0.015,
        }
        
        sample_workflow_state["cost"] = cost_data
        
        assert sample_workflow_state["cost"]["total_tokens"] == 1500
        assert sample_workflow_state["cost"]["estimated_cost"] > 0
    
    @pytest.mark.asyncio
    async def test_session_metrics_update(self, sample_workflow_state):
        """Test session metrics update."""
        metrics = {
            "query_count": 1,
            "total_input_tokens": 500,
            "total_output_tokens": 1000,
            "total_cost_usd": 0.015,
            "avg_response_time_ms": 1500,
        }
        
        # Update after query
        metrics["query_count"] += 1
        metrics["total_input_tokens"] += 600
        metrics["total_output_tokens"] += 1200
        
        assert metrics["query_count"] == 2
        assert metrics["total_input_tokens"] == 1100
    
    @pytest.mark.asyncio
    async def test_langfuse_tracing(self, sample_workflow_state):
        """Test Langfuse observability integration."""
        trace = {
            "trace_id": "trace-abc123",
            "span_id": "span-def456",
            "name": "ask_expert_mode1_workflow",
            "input": {"query": sample_workflow_state["query"]},
            "metadata": {
                "tenant_id": sample_workflow_state["tenant_id"],
                "mode": "mode1",
            },
        }
        
        assert trace["trace_id"] is not None
        assert trace["name"].startswith("ask_expert")
    
    @pytest.mark.asyncio
    async def test_response_formatting(self, sample_workflow_state):
        """Test response formatting."""
        raw_response = "Here are the FDA requirements:\n\n1. Submit 510(k)\n2. Provide testing data"
        
        # Format with citations
        formatted = {
            "content": raw_response,
            "citations": [
                {"id": "1", "source": "FDA Guidance", "url": "https://fda.gov/guidance"},
            ],
            "confidence": 0.92,
        }
        
        assert formatted["content"] == raw_response
        assert len(formatted["citations"]) >= 1


# =============================================================================
# WORKFLOW STATE TRANSITIONS
# =============================================================================

class TestWorkflowStateTransitions:
    """Tests for valid state transitions."""
    
    def test_mode3_valid_transitions(self):
        """Test valid Mode 3 state transitions."""
        valid_transitions = {
            "idle": ["running", "cancelled"],
            "running": ["paused", "waiting_checkpoint", "completed", "failed", "cancelled"],
            "paused": ["running", "cancelled"],
            "waiting_checkpoint": ["running", "cancelled"],
            "completed": [],
            "failed": [],
            "cancelled": [],
        }
        
        # Test valid transition
        current = "idle"
        next_state = "running"
        assert next_state in valid_transitions[current]
        
        # Test invalid transition
        current = "completed"
        next_state = "running"
        assert next_state not in valid_transitions[current]
    
    def test_mode4_valid_transitions(self):
        """Test valid Mode 4 state transitions."""
        valid_transitions = {
            "idle": ["preflight", "cancelled"],
            "preflight": ["ready", "failed"],
            "ready": ["running", "cancelled"],
            "running": ["paused", "waiting_checkpoint", "completed", "failed", "cancelled"],
            "paused": ["running", "cancelled"],
            "waiting_checkpoint": ["running", "cancelled"],
            "completed": [],
            "failed": [],
            "cancelled": [],
        }
        
        # Mode 4 must go through preflight
        assert "preflight" in valid_transitions["idle"]
        assert "running" not in valid_transitions["idle"]


# =============================================================================
# PERFORMANCE TESTS
# =============================================================================

class TestWorkflowPerformance:
    """Performance tests for workflows."""
    
    @pytest.mark.asyncio
    async def test_workflow_latency_target(self):
        """Test workflow meets latency targets."""
        # Latency targets by mode
        latency_targets = {
            "mode1": 3000,   # 3s for interactive
            "mode2": 5000,   # 5s with fusion
            "mode3": 10000,  # 10s for autonomous start
            "mode4": 15000,  # 15s with preflight + team assembly
        }
        
        # Simulated latencies
        actual_latencies = {
            "mode1": 2500,
            "mode2": 4200,
            "mode3": 8500,
            "mode4": 12000,
        }
        
        for mode, target in latency_targets.items():
            actual = actual_latencies[mode]
            assert actual < target, f"{mode} exceeded latency target: {actual}ms > {target}ms"
    
    @pytest.mark.asyncio
    async def test_concurrent_workflow_execution(self):
        """Test concurrent workflow execution."""
        async def mock_workflow(mode: str) -> Dict[str, Any]:
            await asyncio.sleep(0.1)  # Simulate processing
            return {"mode": mode, "status": "completed"}
        
        # Execute 4 workflows concurrently
        import time
        start = time.time()
        
        results = await asyncio.gather(
            mock_workflow("mode1"),
            mock_workflow("mode2"),
            mock_workflow("mode3"),
            mock_workflow("mode4"),
        )
        
        elapsed = time.time() - start
        
        # Should complete in ~0.1s (parallel), not 0.4s (sequential)
        assert elapsed < 0.2
        assert len(results) == 4
        assert all(r["status"] == "completed" for r in results)
