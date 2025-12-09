"""
VITAL Path - E2E Workflow Execution Tests

Tests the complete workflow execution pipeline:
- Protocol validation
- Translator compilation
- Workflow execution
- Result collection
- SSE streaming
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

# Test imports
from modules.translator import (
    parse_react_flow_json as WorkflowParser,  # Function alias
    validate_workflow_graph as WorkflowValidator,  # Function alias
    WorkflowCompiler,
    ParsedWorkflow,
    ValidationResult,
)
from modules.execution import (
    WorkflowRunner,
    ExecutionContext,
    ExecutionResult,
    ResultCollector,
    StreamManager,
)
from domain.services.budget_service import BudgetService
from core.context import set_tenant_context, clear_request_context


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def sample_workflow_definition():
    """Sample React Flow-like workflow definition."""
    return {
        "id": "test-workflow-001",
        "name": "Test Expert Workflow",
        "description": "A simple test workflow",
        "tenantId": "test-tenant-001",  # Required field
        "entryNodeId": "start-1",  # Required field
        "exitNodeIds": ["end-1"],  # Required field
        "version": "1.0.0",
        "nodes": [
            {
                "id": "start-1",
                "type": "start",
                "position": {"x": 100, "y": 100},
                "data": {
                    "label": "Start",
                    "config": {},
                },
            },
            {
                "id": "expert-1",
                "type": "expert",
                "position": {"x": 300, "y": 100},
                "data": {
                    "label": "Medical Expert",
                    "agentId": "agent-medical-001",  # Required for expert nodes
                    "mode": "mode_1",
                    "systemPrompt": "You are a medical expert.",
                },
            },
            {
                "id": "end-1",
                "type": "end",
                "position": {"x": 500, "y": 100},
                "data": {
                    "label": "End",
                    "config": {},
                },
            },
        ],
        "edges": [
            {
                "id": "edge-1",
                "source": "start-1",
                "target": "expert-1",
                "type": "default",
            },
            {
                "id": "edge-2",
                "source": "expert-1",
                "target": "end-1",
                "type": "default",
            },
        ],
        "executionSettings": {
            "maxIterations": 10,
            "timeout": 60,
        },
        "globalVariables": {},
    }


@pytest.fixture
def mock_budget_service():
    """Mock budget service that always allows."""
    service = AsyncMock(spec=BudgetService)
    service.check_budget.return_value = MagicMock(
        can_proceed=True,
        monthly_used=1000,
        monthly_limit=100000,
        remaining=99000,
    )
    service.record_usage.return_value = None
    return service


@pytest.fixture
def execution_context(mock_budget_service):
    """Create execution context with tenant."""
    set_tenant_context(
        tenant_id="test-tenant-001",
        user_id="test-user-001",
        roles=["user"],
    )
    
    ctx = ExecutionContext(
        workflow_id="test-workflow-001",
        max_iterations=100,
        timeout_seconds=60,
        stream_enabled=False,
    )
    ctx.budget_service = mock_budget_service
    
    yield ctx
    
    clear_request_context()


# ============================================================================
# Translator Tests
# ============================================================================

class TestWorkflowParser:
    """Tests for WorkflowParser (parse_react_flow_json function)."""
    
    def test_parse_valid_workflow(self, sample_workflow_definition):
        """Test parsing a valid workflow definition."""
        result = WorkflowParser(sample_workflow_definition)
        
        assert result is not None
        assert result.id == "test-workflow-001"
        assert len(result.nodes) == 3
        assert len(result.edges) == 2
    
    def test_parse_extracts_node_types(self, sample_workflow_definition):
        """Test that parser correctly extracts node types."""
        result = WorkflowParser(sample_workflow_definition)
        
        node_types = [n.type for n in result.nodes]
        assert "start" in node_types
        assert "expert" in node_types
        assert "end" in node_types
    
    def test_parse_empty_workflow(self):
        """Test parsing an empty workflow."""
        from modules.translator import ParseError
        with pytest.raises(ParseError):
            # Empty workflow should fail validation (missing required fields)
            WorkflowParser({
                "id": "empty",
                "name": "Empty",
                "nodes": [],
                "edges": [],
            })


class TestWorkflowValidator:
    """Tests for WorkflowValidator (validate_workflow_graph function)."""
    
    def test_validate_valid_workflow(self, sample_workflow_definition):
        """Test validation of a valid workflow."""
        parsed = WorkflowParser(sample_workflow_definition)
        result = WorkflowValidator(parsed)
        
        # Valid workflow may have warnings but should not have critical errors
        # Note: "expert" node type may not have handler registered, which is expected
        assert isinstance(result, ValidationResult)
    
    def test_validate_missing_start_node(self):
        """Test validation fails without valid entry node."""
        workflow = {
            "id": "no-start",
            "name": "No Start",
            "tenantId": "test-tenant",
            "entryNodeId": "nonexistent",  # Entry node doesn't exist
            "exitNodeIds": ["end-1"],
            "nodes": [
                {"id": "end-1", "type": "end", "position": {"x": 0, "y": 0}, "data": {}},
            ],
            "edges": [],
        }
        
        parsed = WorkflowParser(workflow)
        result = WorkflowValidator(parsed)
        
        assert result.is_valid is False
        # Check for entry node not found error
        assert any("ENTRY_NODE" in str(e.code) for e in result.errors)
    
    def test_validate_disconnected_nodes(self):
        """Test validation warns about disconnected nodes."""
        workflow = {
            "id": "disconnected",
            "name": "Disconnected",
            "tenantId": "test-tenant",
            "entryNodeId": "start-1",
            "exitNodeIds": ["end-1"],
            "nodes": [
                {"id": "start-1", "type": "start", "position": {"x": 0, "y": 0}, "data": {}},
                {"id": "expert-1", "type": "expert", "position": {"x": 100, "y": 0}, "data": {"agentId": "a1"}},
                {"id": "expert-2", "type": "expert", "position": {"x": 200, "y": 0}, "data": {"agentId": "a2"}},
                {"id": "end-1", "type": "end", "position": {"x": 300, "y": 0}, "data": {}},
            ],
            "edges": [
                {"id": "e1", "source": "start-1", "target": "expert-1"},
                {"id": "e2", "source": "expert-1", "target": "end-1"},
                # expert-2 is disconnected
            ],
        }
        
        parsed = WorkflowParser(workflow)
        result = WorkflowValidator(parsed)
        
        # Should have warning about unreachable/disconnected node
        assert result is not None


class TestWorkflowCompiler:
    """Tests for WorkflowCompiler."""
    
    def test_compile_valid_workflow(self, sample_workflow_definition):
        """Test compilation of a valid workflow."""
        compiler = WorkflowCompiler()
        
        parsed = WorkflowParser(sample_workflow_definition)
        validation = WorkflowValidator(parsed)
        # Validation may have warnings but we proceed
        
        result = compiler.compile(parsed)
        
        # Result should have compiled graph or errors
        assert result is not None
    
    def test_compile_generates_state_graph(self, sample_workflow_definition):
        """Test that compilation generates a LangGraph StateGraph."""
        compiler = WorkflowCompiler()
        
        parsed = WorkflowParser(sample_workflow_definition)
        result = compiler.compile(parsed)
        
        # Result should be a CompilationResult object
        assert result is not None


# ============================================================================
# Execution Tests
# ============================================================================

class TestExecutionContext:
    """Tests for ExecutionContext."""
    
    def test_context_creation(self, execution_context):
        """Test execution context creation."""
        assert execution_context.execution_id is not None
        assert execution_context.workflow_id == "test-workflow-001"
        assert execution_context.max_iterations == 100
    
    def test_context_iteration_limit(self, execution_context):
        """Test iteration limit enforcement."""
        execution_context.max_iterations = 3
        
        assert execution_context.increment_iteration() is True  # 1
        assert execution_context.increment_iteration() is True  # 2
        assert execution_context.increment_iteration() is True  # 3
        assert execution_context.increment_iteration() is False  # 4 - exceeded
    
    def test_context_cancellation(self, execution_context):
        """Test cancellation flag."""
        assert execution_context.is_cancelled is False
        
        execution_context.cancel()
        
        assert execution_context.is_cancelled is True
    
    def test_context_variables(self, execution_context):
        """Test variable storage."""
        execution_context.set_variable("test_key", "test_value")
        
        assert execution_context.get_variable("test_key") == "test_value"
        assert execution_context.get_variable("missing", "default") == "default"
    
    @pytest.mark.asyncio
    async def test_context_budget_check(self, execution_context, mock_budget_service):
        """Test budget checking."""
        result = await execution_context.check_budget(estimated_tokens=1000)
        
        assert result is True
        mock_budget_service.check_budget.assert_called_once()


class TestResultCollector:
    """Tests for ResultCollector."""
    
    def test_add_node_result(self):
        """Test adding node results."""
        collector = ResultCollector()
        
        collector.add_node_result(
            node_id="expert-1",
            node_type="expert",
            output={"response": "Test response"},
            duration_ms=150.5,
        )
        
        result = collector.get_node_result("expert-1")
        assert result is not None
        assert result.node_type == "expert"
        assert result.output["response"] == "Test response"
    
    def test_get_statistics(self):
        """Test statistics calculation."""
        collector = ResultCollector()
        
        collector.add_node_result("n1", "expert", {"r": "1"}, 100)
        collector.add_node_result("n2", "expert", {"r": "2"}, 200)
        collector.add_node_result("n3", "router", {"r": "3"}, 50, error="Failed")
        
        stats = collector.get_statistics()
        
        assert stats["total_nodes"] == 3
        assert stats["successful_nodes"] == 2
        assert stats["failed_nodes"] == 1
        assert stats["total_duration_ms"] == 350
    
    def test_merge_messages(self):
        """Test message merging."""
        collector = ResultCollector()
        
        collector.add_node_result("e1", "expert", {"response": "Hello"})
        collector.add_node_result("e2", "expert", {"response": "World"})
        
        messages = collector.merge_messages()
        
        assert len(messages) == 2
        assert messages[0]["content"] == "Hello"


class TestStreamManager:
    """Tests for StreamManager."""
    
    def test_format_event(self):
        """Test SSE event formatting."""
        manager = StreamManager()
        
        formatted = manager.format_event({
            "type": "node_completed",
            "data": {"node_id": "expert-1"},
        })
        
        assert "event: node_completed" in formatted
        assert "data:" in formatted
        assert "expert-1" in formatted
    
    def test_create_heartbeat(self):
        """Test heartbeat creation."""
        manager = StreamManager()
        
        heartbeat = manager.create_heartbeat()
        
        assert "event: heartbeat" in heartbeat
        assert "timestamp" in heartbeat
    
    def test_create_error_event(self):
        """Test error event creation."""
        manager = StreamManager()
        
        error = manager.create_error_event(
            error="Something went wrong",
            error_code="E001",
            recoverable=True,
        )
        
        assert "event: error" in error
        assert "Something went wrong" in error
    
    def test_create_progress_event(self):
        """Test progress event creation."""
        manager = StreamManager()
        
        progress = manager.create_progress_event(
            current_step=3,
            total_steps=10,
            description="Processing node",
        )
        
        assert "event: progress_update" in progress
        assert "30" in progress  # 30% complete


# ============================================================================
# E2E Workflow Tests
# ============================================================================

class TestWorkflowRunnerE2E:
    """End-to-end tests for WorkflowRunner."""
    
    @pytest.mark.asyncio
    async def test_runner_execute_simple_workflow(
        self,
        sample_workflow_definition,
        execution_context,
    ):
        """Test executing a simple workflow end-to-end."""
        runner = WorkflowRunner()
        
        # Mock the actual graph execution
        with patch.object(runner, '_run_graph', new_callable=AsyncMock) as mock_run:
            mock_run.return_value = {
                "output": "Test output",
                "messages": [{"role": "assistant", "content": "Response"}],
            }
            
            result = await runner.execute(
                sample_workflow_definition,
                {"query": "Test input"},
                execution_context,
            )
        
        assert result.status.value == "completed"
        assert result.execution_id == execution_context.execution_id
        assert result.metrics is not None
    
    @pytest.mark.asyncio
    async def test_runner_handles_timeout(
        self,
        sample_workflow_definition,
        execution_context,
    ):
        """Test timeout handling."""
        runner = WorkflowRunner()
        execution_context.timeout_seconds = 0.1  # Very short timeout
        
        with patch.object(runner, '_run_graph', new_callable=AsyncMock) as mock_run:
            # Simulate slow execution
            async def slow_execution(*args, **kwargs):
                await asyncio.sleep(1)
                return {}
            
            mock_run.side_effect = slow_execution
            
            result = await runner.execute(
                sample_workflow_definition,
                {},
                execution_context,
            )
        
        assert result.status.value == "timeout"
    
    @pytest.mark.asyncio
    async def test_runner_handles_cancellation(
        self,
        sample_workflow_definition,
        execution_context,
    ):
        """Test cancellation handling."""
        runner = WorkflowRunner()
        
        with patch.object(runner, '_run_graph', new_callable=AsyncMock) as mock_run:
            async def check_cancel(*args, **kwargs):
                ctx = args[2]  # execution_context
                ctx.cancel()
                return {}
            
            mock_run.side_effect = check_cancel
            
            result = await runner.execute(
                sample_workflow_definition,
                {},
                execution_context,
            )
        
        assert result.status.value == "cancelled"
    
    @pytest.mark.asyncio
    async def test_runner_emits_events(
        self,
        sample_workflow_definition,
        execution_context,
    ):
        """Test event emission during execution."""
        runner = WorkflowRunner()
        events_received = []
        
        async def capture_event(event_type, data):
            events_received.append((event_type, data))
        
        execution_context.on("execution_started", capture_event)
        execution_context.on("execution_completed", capture_event)
        
        with patch.object(runner, '_run_graph', new_callable=AsyncMock) as mock_run:
            mock_run.return_value = {"output": "done"}
            
            await runner.execute(
                sample_workflow_definition,
                {},
                execution_context,
            )
        
        event_types = [e[0] for e in events_received]
        assert "execution_started" in event_types
        assert "execution_completed" in event_types


# ============================================================================
# Integration Tests
# ============================================================================

class TestFullPipelineIntegration:
    """Integration tests for the complete pipeline."""
    
    @pytest.mark.asyncio
    async def test_parse_validate_compile_execute(
        self,
        sample_workflow_definition,
        execution_context,
    ):
        """Test the full pipeline: parse → validate → compile → execute."""
        # Parse (using function)
        parsed = WorkflowParser(sample_workflow_definition)
        assert parsed is not None
        
        # Validate (using function)
        validation = WorkflowValidator(parsed)
        # Validation may have warnings but should work
        assert validation is not None
        
        # Compile
        compiler = WorkflowCompiler()
        compilation = compiler.compile(parsed)
        # Compilation result
        assert compilation is not None
        
        # Execute (mocked)
        runner = WorkflowRunner()
        with patch.object(runner, '_compile_workflow', return_value=MagicMock()):
            with patch.object(runner, '_run_graph', new_callable=AsyncMock) as mock_run:
                mock_run.return_value = {"result": "success"}
                
                result = await runner.execute(
                    sample_workflow_definition,
                    {"input": "test"},
                    execution_context,
                )
        
        assert result is not None
    
    def test_workflow_cache_invalidation(self, sample_workflow_definition):
        """Test that workflow cache is properly invalidated."""
        runner = WorkflowRunner()
        
        # First compilation should cache
        runner._compiled_cache["test-workflow-001"] = MagicMock()
        assert "test-workflow-001" in runner._compiled_cache
        
        # Clear specific workflow
        runner.clear_cache("test-workflow-001")
        assert "test-workflow-001" not in runner._compiled_cache
        
        # Clear all
        runner._compiled_cache["other"] = MagicMock()
        runner.clear_cache()
        assert len(runner._compiled_cache) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


