"""
Unit Tests for BaseWorkflow Shared Nodes

Tests the 5 shared nodes that all modes inherit:
1. load_agent_node
2. rag_retrieval_node
3. tool_suggestion_node
4. tool_execution_node
5. save_conversation_node

Target: 90%+ coverage
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from vital_shared.workflows.base_workflow import BaseWorkflow


class TestBaseWorkflow:
    """Test suite for BaseWorkflow shared functionality."""
    
    @pytest.fixture
    def base_workflow(
        self,
        mock_agent_service,
        mock_rag_service,
        mock_tool_service,
        mock_memory_service,
        mock_streaming_service
    ):
        """Create BaseWorkflow instance with mocked services."""
        # BaseWorkflow is abstract, so we need a concrete implementation
        class ConcreteWorkflow(BaseWorkflow):
            def build_graph(self):
                from langgraph.graph import StateGraph, END
                graph = StateGraph(dict)
                graph.add_node("test", lambda x: x)
                graph.set_entry_point("test")
                graph.add_edge("test", END)
                return graph
        
        return ConcreteWorkflow(
            workflow_name="TestWorkflow",
            mode=1,
            agent_service=mock_agent_service,
            rag_service=mock_rag_service,
            tool_service=mock_tool_service,
            memory_service=mock_memory_service,
            streaming_service=mock_streaming_service
        )
    
    # =========================================================================
    # TEST: load_agent_node
    # =========================================================================
    
    @pytest.mark.asyncio
    async def test_load_agent_node_success(self, base_workflow, initial_state, mock_agent_data):
        """Test successful agent loading."""
        result = await base_workflow.load_agent_node(initial_state)
        
        # Should have agent metadata
        assert result["agent_name"] == mock_agent_data["name"]
        assert result["agent_system_prompt"] == mock_agent_data["system_prompt"]
        assert "metadata" in result
        assert result["metadata"]["agent_loaded"] is True
        assert result["metadata"]["agent_model"] == "gpt-4-turbo-preview"
    
    @pytest.mark.asyncio
    async def test_load_agent_node_no_agent_id(self, base_workflow):
        """Test agent loading when no agent_id provided."""
        state = {
            "tenant_id": "test-tenant",
            "query": "test query"
        }
        
        result = await base_workflow.load_agent_node(state)
        
        # Should return state unchanged
        assert result == state
    
    @pytest.mark.asyncio
    async def test_load_agent_node_error(self, base_workflow, initial_state):
        """Test agent loading error handling."""
        # Mock service to raise error
        base_workflow.agent_service.load_agent = AsyncMock(
            side_effect=Exception("Agent not found")
        )
        
        result = await base_workflow.load_agent_node(initial_state)
        
        # Should have error
        assert "error" in result
        assert "Agent loading failed" in result["error"]
        assert result["error_code"] == "AGENT_LOAD_ERROR"
    
    # =========================================================================
    # TEST: rag_retrieval_node
    # =========================================================================
    
    @pytest.mark.asyncio
    async def test_rag_retrieval_node_success(self, base_workflow, initial_state, mock_rag_citations):
        """Test successful RAG retrieval."""
        result = await base_workflow.rag_retrieval_node(initial_state)
        
        # Should have RAG results
        assert "rag_sources" in result
        assert "rag_citations" in result
        assert len(result["rag_citations"]) == 2
        assert result["rag_total_sources"] == 2
        assert result["metadata"]["rag_executed"] is True
    
    @pytest.mark.asyncio
    async def test_rag_retrieval_node_disabled(self, base_workflow, initial_state):
        """Test RAG retrieval when disabled."""
        state = {**initial_state, "enable_rag": False}
        
        result = await base_workflow.rag_retrieval_node(state)
        
        # Should skip RAG
        assert result == state
    
    @pytest.mark.asyncio
    async def test_rag_retrieval_node_error(self, base_workflow, initial_state):
        """Test RAG retrieval error handling."""
        # Mock service to raise error
        base_workflow.rag_service.query = AsyncMock(
            side_effect=Exception("RAG service unavailable")
        )
        
        result = await base_workflow.rag_retrieval_node(initial_state)
        
        # Should handle error gracefully
        assert result["rag_sources"] == []
        assert result["rag_citations"] == []
        assert result["rag_total_sources"] == 0
        assert "rag_error" in result["metadata"]
    
    # =========================================================================
    # TEST: tool_suggestion_node
    # =========================================================================
    
    @pytest.mark.asyncio
    async def test_tool_suggestion_node_success(self, base_workflow, initial_state):
        """Test successful tool suggestion."""
        result = await base_workflow.tool_suggestion_node(initial_state)
        
        # Should have tool suggestions
        assert "suggested_tools" in result
        assert len(result["suggested_tools"]) == 2
        assert result["tools_awaiting_confirmation"] is True
        assert "tool_suggestion_reasoning" in result["metadata"]
    
    @pytest.mark.asyncio
    async def test_tool_suggestion_node_disabled(self, base_workflow, initial_state):
        """Test tool suggestion when tools disabled."""
        state = {**initial_state, "enable_tools": False}
        
        result = await base_workflow.tool_suggestion_node(state)
        
        # Should skip tools
        assert result["suggested_tools"] == []
        assert result["tools_awaiting_confirmation"] is False
    
    @pytest.mark.asyncio
    async def test_tool_suggestion_node_error(self, base_workflow, initial_state):
        """Test tool suggestion error handling."""
        # Mock service to raise error
        base_workflow.tool_service.decide_tools = AsyncMock(
            side_effect=Exception("Tool service error")
        )
        
        result = await base_workflow.tool_suggestion_node(initial_state)
        
        # Should handle error gracefully
        assert result["suggested_tools"] == []
        assert result["tools_awaiting_confirmation"] is False
    
    # =========================================================================
    # TEST: tool_execution_node
    # =========================================================================
    
    @pytest.mark.asyncio
    async def test_tool_execution_node_success(self, base_workflow, initial_state, mock_tool_results):
        """Test successful tool execution."""
        state = {
            **initial_state,
            "confirmed_tools": ["web_search", "fda_database"]
        }
        
        result = await base_workflow.tool_execution_node(state)
        
        # Should have tool results
        assert "tool_results" in result
        assert len(result["tool_results"]) == 2
        assert result["metadata"]["tools_executed"] == ["web_search", "fda_database"]
    
    @pytest.mark.asyncio
    async def test_tool_execution_node_no_tools(self, base_workflow, initial_state):
        """Test tool execution with no tools to execute."""
        result = await base_workflow.tool_execution_node(initial_state)
        
        # Should skip execution
        assert result == initial_state
    
    @pytest.mark.asyncio
    async def test_tool_execution_node_error(self, base_workflow, initial_state):
        """Test tool execution error handling."""
        state = {
            **initial_state,
            "confirmed_tools": ["web_search"]
        }
        
        # Mock service to raise error
        base_workflow.tool_service.execute_tools = AsyncMock(
            side_effect=Exception("Tool execution failed")
        )
        
        result = await base_workflow.tool_execution_node(state)
        
        # Should handle error gracefully
        assert result["tool_results"] == []
        assert "tool_execution_error" in result["metadata"]
    
    # =========================================================================
    # TEST: save_conversation_node
    # =========================================================================
    
    @pytest.mark.asyncio
    async def test_save_conversation_node_success(self, base_workflow, initial_state):
        """Test successful conversation saving."""
        state = {
            **initial_state,
            "response": "FDA requires comprehensive validation and testing.",
            "rag_citations": [],
            "confirmed_tools": [],
            "total_cost_usd": 0.05
        }
        
        result = await base_workflow.save_conversation_node(state)
        
        # Should have saved metadata
        assert result["metadata"]["turn_saved"] is True
        assert result["metadata"]["turn_id"] == "turn-123"
    
    @pytest.mark.asyncio
    async def test_save_conversation_node_no_response(self, base_workflow, initial_state):
        """Test conversation saving with no response."""
        result = await base_workflow.save_conversation_node(initial_state)
        
        # Should skip saving
        assert result == initial_state
    
    @pytest.mark.asyncio
    async def test_save_conversation_node_error(self, base_workflow, initial_state):
        """Test conversation saving error handling."""
        state = {
            **initial_state,
            "response": "Test response"
        }
        
        # Mock service to raise error
        base_workflow.memory_service.save_turn = AsyncMock(
            side_effect=Exception("Database error")
        )
        
        result = await base_workflow.save_conversation_node(state)
        
        # Should handle error gracefully (return state unchanged)
        assert "response" in result
        # Metadata won't have turn_saved since it failed
        assert result.get("metadata", {}).get("turn_saved") is None
    
    # =========================================================================
    # TEST: Workflow Initialization
    # =========================================================================
    
    @pytest.mark.asyncio
    async def test_workflow_initialize_success(self, base_workflow):
        """Test workflow initialization."""
        await base_workflow.initialize()
        
        # Should have compiled graph
        assert base_workflow.compiled_graph is not None
        
        # RAG service should be initialized
        base_workflow.rag_service.initialize.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_workflow_initialize_error(self, base_workflow):
        """Test workflow initialization error handling."""
        # Mock RAG service to raise error
        base_workflow.rag_service.initialize = AsyncMock(
            side_effect=Exception("Initialization failed")
        )
        
        with pytest.raises(Exception):
            await base_workflow.initialize()
    
    # =========================================================================
    # TEST: Workflow Execution
    # =========================================================================
    
    @pytest.mark.asyncio
    async def test_workflow_execute_success(self, base_workflow):
        """Test full workflow execution."""
        await base_workflow.initialize()
        
        result = await base_workflow.execute(
            user_id="user-123",
            tenant_id="tenant-456",
            session_id="session-789",
            query="Test query"
        )
        
        # Should have result
        assert result is not None
        assert "processing_time_ms" in result
    
    # =========================================================================
    # TEST: Metrics
    # =========================================================================
    
    def test_get_metrics(self, base_workflow):
        """Test metrics retrieval."""
        metrics = base_workflow.get_metrics()
        
        assert metrics["workflow_name"] == "TestWorkflow"
        assert metrics["mode"] == 1
        assert metrics["execution_count"] >= 0
        assert metrics["error_count"] >= 0
        assert "success_rate" in metrics


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

