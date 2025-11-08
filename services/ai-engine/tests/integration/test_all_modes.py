"""
Integration Tests for All 4 Mode Workflows

Tests the complete end-to-end flow for each mode:
- Mode 1: Manual Interactive Research
- Mode 2: Automatic Research
- Mode 3: Chat Manual
- Mode 4: Chat Automatic

These tests verify the entire workflow executes correctly
with mocked services.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from langgraph_workflows.modes import (
    Mode1ManualWorkflow,
    Mode2AutomaticWorkflow,
    Mode3ChatManualWorkflow,
    Mode4ChatAutomaticWorkflow
)


class TestMode1Integration:
    """Integration tests for Mode 1: Manual Interactive Research."""
    
    @pytest.fixture
    def mode1_workflow(
        self,
        mock_agent_service,
        mock_rag_service,
        mock_tool_service,
        mock_memory_service,
        mock_streaming_service
    ):
        """Create Mode 1 workflow with mocked services."""
        return Mode1ManualWorkflow(
            agent_service=mock_agent_service,
            rag_service=mock_rag_service,
            tool_service=mock_tool_service,
            memory_service=mock_memory_service,
            streaming_service=mock_streaming_service
        )
    
    @pytest.mark.asyncio
    async def test_mode1_full_flow_with_tools(self, mode1_workflow, initial_state):
        """Test Mode 1 complete flow with tool execution."""
        # Initialize workflow
        await mode1_workflow.initialize()
        
        # Add confirmed tools (user approved)
        state = {
            **initial_state,
            "confirmed_tools": ["web_search", "fda_database"]
        }
        
        # Mock LLM response
        with patch('langchain_openai.ChatOpenAI') as mock_llm:
            mock_llm_instance = AsyncMock()
            mock_llm_instance.ainvoke = AsyncMock(return_value=MagicMock(
                content='{"content": "FDA requires validation [1] and testing [2].", "citations": [], "reasoning_steps": ["Step 1", "Step 2"]}'
            ))
            mock_llm.return_value = mock_llm_instance
            
            # Execute workflow
            result = await mode1_workflow.execute(
                user_id=initial_state["user_id"],
                tenant_id=initial_state["tenant_id"],
                session_id=initial_state["session_id"],
                query=initial_state["query"],
                agent_id=initial_state["agent_id"],
                confirmed_tools=state["confirmed_tools"]
            )
        
        # Verify workflow completed
        assert result is not None
        assert "response" in result
        assert "rag_citations" in result
        assert len(result["rag_citations"]) > 0
        assert "tool_results" in result
        assert len(result["tool_results"]) > 0
    
    @pytest.mark.asyncio
    async def test_mode1_flow_without_tools(self, mode1_workflow, initial_state):
        """Test Mode 1 flow when user declines tools."""
        await mode1_workflow.initialize()
        
        # No confirmed tools (user declined)
        state = {
            **initial_state,
            "confirmed_tools": []
        }
        
        with patch('langchain_openai.ChatOpenAI') as mock_llm:
            mock_llm_instance = AsyncMock()
            mock_llm_instance.ainvoke = AsyncMock(return_value=MagicMock(
                content='{"content": "Based on retrieved sources [1]...", "citations": [], "reasoning_steps": []}'
            ))
            mock_llm.return_value = mock_llm_instance
            
            result = await mode1_workflow.execute(
                user_id=initial_state["user_id"],
                tenant_id=initial_state["tenant_id"],
                session_id=initial_state["session_id"],
                query=initial_state["query"],
                confirmed_tools=[]
            )
        
        # Should complete without tools
        assert result is not None
        assert "response" in result
        assert result.get("tool_results", []) == []


class TestMode2Integration:
    """Integration tests for Mode 2: Automatic Research."""
    
    @pytest.fixture
    def mode2_workflow(
        self,
        mock_agent_service,
        mock_rag_service,
        mock_tool_service,
        mock_memory_service,
        mock_streaming_service
    ):
        """Create Mode 2 workflow with mocked services."""
        return Mode2AutomaticWorkflow(
            agent_service=mock_agent_service,
            rag_service=mock_rag_service,
            tool_service=mock_tool_service,
            memory_service=mock_memory_service,
            streaming_service=mock_streaming_service
        )
    
    @pytest.mark.asyncio
    async def test_mode2_full_auto_flow(self, mode2_workflow, initial_state):
        """Test Mode 2 complete automatic flow."""
        await mode2_workflow.initialize()
        
        with patch('langchain_openai.ChatOpenAI') as mock_llm:
            mock_llm_instance = AsyncMock()
            mock_llm_instance.ainvoke = AsyncMock(return_value=MagicMock(
                content='{"content": "Automatic research found [1] requirements.", "citations": [], "reasoning_steps": []}'
            ))
            mock_llm.return_value = mock_llm_instance
            
            result = await mode2_workflow.execute(
                user_id=initial_state["user_id"],
                tenant_id=initial_state["tenant_id"],
                session_id=initial_state["session_id"],
                query=initial_state["query"]
            )
        
        # Tools should be auto-approved and executed
        assert result is not None
        assert "response" in result
        assert "tool_results" in result
        # Verify auto-approval happened
        assert result["metadata"]["tools_auto_approved"] is True


class TestMode3Integration:
    """Integration tests for Mode 3: Chat Manual."""
    
    @pytest.fixture
    def mode3_workflow(
        self,
        mock_agent_service,
        mock_rag_service,
        mock_tool_service,
        mock_memory_service,
        mock_streaming_service
    ):
        """Create Mode 3 workflow with mocked services."""
        return Mode3ChatManualWorkflow(
            agent_service=mock_agent_service,
            rag_service=mock_rag_service,
            tool_service=mock_tool_service,
            memory_service=mock_memory_service,
            streaming_service=mock_streaming_service
        )
    
    @pytest.mark.asyncio
    async def test_mode3_multi_turn_conversation(self, mode3_workflow, initial_state):
        """Test Mode 3 multi-turn chat flow."""
        await mode3_workflow.initialize()
        
        with patch('langchain_openai.ChatOpenAI') as mock_llm:
            mock_llm_instance = AsyncMock()
            mock_llm_instance.ainvoke = AsyncMock(return_value=MagicMock(
                content='{"content": "Based on our previous discussion [1]...", "citations": [], "reasoning_steps": []}'
            ))
            mock_llm.return_value = mock_llm_instance
            
            result = await mode3_workflow.execute(
                user_id=initial_state["user_id"],
                tenant_id=initial_state["tenant_id"],
                session_id=initial_state["session_id"],
                query="Can you elaborate on that?",  # Follow-up question
                confirmed_tools=[]
            )
        
        # Should have conversation history loaded
        assert result is not None
        assert "conversation_history" in result
        assert len(result["conversation_history"]) > 0
        assert result["metadata"]["history_loaded"] is True
        assert result["metadata"]["history_turn_count"] == 2


class TestMode4Integration:
    """Integration tests for Mode 4: Chat Automatic."""
    
    @pytest.fixture
    def mode4_workflow(
        self,
        mock_agent_service,
        mock_rag_service,
        mock_tool_service,
        mock_memory_service,
        mock_streaming_service
    ):
        """Create Mode 4 workflow with mocked services."""
        return Mode4ChatAutomaticWorkflow(
            agent_service=mock_agent_service,
            rag_service=mock_rag_service,
            tool_service=mock_tool_service,
            memory_service=mock_memory_service,
            streaming_service=mock_streaming_service
        )
    
    @pytest.mark.asyncio
    async def test_mode4_fast_chat_with_auto_tools(self, mode4_workflow, initial_state):
        """Test Mode 4 fast chat with automatic tool execution."""
        await mode4_workflow.initialize()
        
        with patch('langchain_openai.ChatOpenAI') as mock_llm:
            mock_llm_instance = AsyncMock()
            mock_llm_instance.ainvoke = AsyncMock(return_value=MagicMock(
                content='{"content": "Fast response with auto-tools [1].", "citations": [], "reasoning_steps": []}'
            ))
            mock_llm.return_value = mock_llm_instance
            
            result = await mode4_workflow.execute(
                user_id=initial_state["user_id"],
                tenant_id=initial_state["tenant_id"],
                session_id=initial_state["session_id"],
                query="Quick question about FDA"
            )
        
        # Should have conversation history AND auto-executed tools
        assert result is not None
        assert "conversation_history" in result
        assert "tool_results" in result
        assert result["metadata"]["tools_auto_approved"] is True
        assert result["metadata"]["history_loaded"] is True


class TestModeComparison:
    """Comparative tests across all 4 modes."""
    
    @pytest.fixture
    def all_workflows(
        self,
        mock_agent_service,
        mock_rag_service,
        mock_tool_service,
        mock_memory_service,
        mock_streaming_service
    ):
        """Create all 4 workflows."""
        services = {
            "agent_service": mock_agent_service,
            "rag_service": mock_rag_service,
            "tool_service": mock_tool_service,
            "memory_service": mock_memory_service,
            "streaming_service": mock_streaming_service
        }
        
        return {
            "mode1": Mode1ManualWorkflow(**services),
            "mode2": Mode2AutomaticWorkflow(**services),
            "mode3": Mode3ChatManualWorkflow(**services),
            "mode4": Mode4ChatAutomaticWorkflow(**services)
        }
    
    @pytest.mark.asyncio
    async def test_all_modes_use_shared_nodes(self, all_workflows):
        """Verify all modes inherit shared nodes from BaseWorkflow."""
        for mode_name, workflow in all_workflows.items():
            # All modes should have shared node methods
            assert hasattr(workflow, 'load_agent_node')
            assert hasattr(workflow, 'rag_retrieval_node')
            assert hasattr(workflow, 'tool_suggestion_node')
            assert hasattr(workflow, 'tool_execution_node')
            assert hasattr(workflow, 'save_conversation_node')
    
    @pytest.mark.asyncio
    async def test_all_modes_initialize_successfully(self, all_workflows):
        """Verify all modes can initialize."""
        for mode_name, workflow in all_workflows.items():
            await workflow.initialize()
            assert workflow.compiled_graph is not None
    
    def test_mode_differentiation(self, all_workflows):
        """Verify each mode has correct mode number."""
        assert all_workflows["mode1"].mode == 1
        assert all_workflows["mode2"].mode == 2
        assert all_workflows["mode3"].mode == 3
        assert all_workflows["mode4"].mode == 4


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "--asyncio-mode=auto"])

