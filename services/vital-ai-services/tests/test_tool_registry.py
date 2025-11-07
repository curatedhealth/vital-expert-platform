"""
Unit Tests for Tool Registry

TAG: TESTS_TOOL_REGISTRY

Tests the ToolRegistry and BaseTool classes.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime

from vital_ai_services.tools import (
    BaseTool,
    ToolRegistry,
    WebSearchTool,
    RAGTool,
    CalculatorTool
)
from vital_ai_services.core.models import ToolInput, ToolOutput
from vital_ai_services.core.exceptions import ToolExecutionError


# Mock tool for testing
class MockTool(BaseTool):
    """Mock tool for testing."""
    
    def __init__(self, should_succeed=True):
        super().__init__()
        self.should_succeed = should_succeed
    
    @property
    def name(self) -> str:
        return "mock_tool"
    
    @property
    def description(self) -> str:
        return "A mock tool for testing"
    
    @property
    def category(self) -> str:
        return "testing"
    
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        if self.should_succeed:
            return ToolOutput(
                success=True,
                tool_name=self.name,
                data={"result": "success", "input": tool_input.data},
                cost_usd=0.01
            )
        else:
            return ToolOutput(
                success=False,
                tool_name=self.name,
                data={},
                error_message="Mock tool failed"
            )


class TestBaseTool:
    """Test suite for BaseTool."""
    
    def test_initialization(self):
        """Test tool initialization."""
        tool = MockTool()
        
        assert tool.execution_count == 0
        assert tool.total_cost_usd == 0.0
        assert tool.success_count == 0
        assert tool.failure_count == 0
    
    @pytest.mark.asyncio
    async def test_execute_with_tracking(self):
        """Test tool execution with tracking."""
        tool = MockTool()
        tool_input = ToolInput(
            tool_name="mock_tool",
            data="test data"
        )
        
        output = await tool.execute_with_tracking(tool_input)
        
        assert output.success is True
        assert tool.execution_count == 1
        assert tool.success_count == 1
        assert tool.failure_count == 0
        assert tool.total_cost_usd == 0.01
    
    @pytest.mark.asyncio
    async def test_execute_failure(self):
        """Test tool execution failure."""
        tool = MockTool(should_succeed=False)
        tool_input = ToolInput(
            tool_name="mock_tool",
            data="test data"
        )
        
        output = await tool.execute_with_tracking(tool_input)
        
        assert output.success is False
        assert tool.execution_count == 1
        assert tool.success_count == 0
        assert tool.failure_count == 1
    
    @pytest.mark.asyncio
    async def test_exception_handling(self):
        """Test tool exception handling."""
        class FailingTool(BaseTool):
            @property
            def name(self) -> str:
                return "failing_tool"
            
            @property
            def description(self) -> str:
                return "A tool that raises exceptions"
            
            async def execute(self, tool_input: ToolInput) -> ToolOutput:
                raise ValueError("Intentional error")
        
        tool = FailingTool()
        tool_input = ToolInput(tool_name="failing_tool", data="test")
        
        output = await tool.execute_with_tracking(tool_input)
        
        assert output.success is False
        assert "ValueError" in output.error_message
        assert tool.failure_count == 1
    
    def test_get_success_rate(self):
        """Test success rate calculation."""
        tool = MockTool()
        
        # No executions
        assert tool.get_success_rate() == 0.0
        
        # Simulate executions
        tool.execution_count = 10
        tool.success_count = 8
        
        assert tool.get_success_rate() == 0.8
    
    def test_get_stats(self):
        """Test statistics retrieval."""
        tool = MockTool()
        tool.execution_count = 5
        tool.success_count = 4
        tool.failure_count = 1
        tool.total_cost_usd = 0.05
        tool.total_duration_ms = 1000.0
        
        stats = tool.get_stats()
        
        assert stats["tool_name"] == "mock_tool"
        assert stats["execution_count"] == 5
        assert stats["success_count"] == 4
        assert stats["success_rate"] == 0.8
        assert stats["total_cost_usd"] == 0.05
        assert stats["avg_cost_usd"] == 0.01
    
    def test_reset_stats(self):
        """Test statistics reset."""
        tool = MockTool()
        tool.execution_count = 10
        tool.success_count = 8
        
        tool.reset_stats()
        
        assert tool.execution_count == 0
        assert tool.success_count == 0


class TestToolRegistry:
    """Test suite for ToolRegistry."""
    
    def test_initialization(self):
        """Test registry initialization."""
        registry = ToolRegistry()
        
        assert len(registry._tools) == 0
        assert len(registry._execution_history) == 0
    
    def test_register_tool(self):
        """Test tool registration."""
        registry = ToolRegistry()
        tool = MockTool()
        
        registry.register(tool)
        
        assert registry.has_tool("mock_tool")
        assert registry.get_tool("mock_tool") == tool
    
    def test_register_duplicate_tool(self):
        """Test registering duplicate tool name."""
        registry = ToolRegistry()
        tool1 = MockTool()
        tool2 = MockTool()
        
        registry.register(tool1)
        
        with pytest.raises(ToolExecutionError):
            registry.register(tool2)
    
    def test_unregister_tool(self):
        """Test tool unregistration."""
        registry = ToolRegistry()
        tool = MockTool()
        
        registry.register(tool)
        assert registry.has_tool("mock_tool")
        
        result = registry.unregister("mock_tool")
        assert result is True
        assert not registry.has_tool("mock_tool")
    
    def test_list_tools(self):
        """Test listing tools."""
        registry = ToolRegistry()
        registry.register(MockTool())
        registry.register(CalculatorTool())
        
        tools = registry.list_tools()
        
        assert len(tools) >= 2
        assert any(t["name"] == "mock_tool" for t in tools)
        assert any(t["name"] == "calculator" for t in tools)
    
    def test_list_tools_by_category(self):
        """Test listing tools by category."""
        registry = ToolRegistry()
        registry.register(MockTool())
        registry.register(CalculatorTool())
        
        testing_tools = registry.list_tools(category="testing")
        analysis_tools = registry.list_tools(category="analysis")
        
        assert len(testing_tools) == 1
        assert len(analysis_tools) == 1
    
    def test_get_categories(self):
        """Test getting unique categories."""
        registry = ToolRegistry()
        registry.register(MockTool())
        registry.register(CalculatorTool())
        
        categories = registry.get_categories()
        
        assert "testing" in categories
        assert "analysis" in categories
    
    @pytest.mark.asyncio
    async def test_execute_tool(self):
        """Test executing tool through registry."""
        registry = ToolRegistry()
        tool = MockTool()
        registry.register(tool)
        
        output = await registry.execute(
            tool_name="mock_tool",
            input_data="test data",
            tenant_id="tenant-123"
        )
        
        assert output.success is True
        assert output.data["result"] == "success"
        assert len(registry._execution_history) == 1
    
    @pytest.mark.asyncio
    async def test_execute_nonexistent_tool(self):
        """Test executing non-existent tool."""
        registry = ToolRegistry()
        
        with pytest.raises(ToolExecutionError) as exc_info:
            await registry.execute(
                tool_name="nonexistent_tool",
                input_data="test"
            )
        
        assert "not found" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_execute_tenant_aware_tool_without_tenant(self):
        """Test executing tenant-aware tool without tenant_id."""
        registry = ToolRegistry()
        tool = MockTool()
        registry.register(tool)
        
        with pytest.raises(ToolExecutionError) as exc_info:
            await registry.execute(
                tool_name="mock_tool",
                input_data="test"
            )
        
        assert "requires tenant_id" in str(exc_info.value)
    
    def test_get_execution_history(self):
        """Test getting execution history."""
        registry = ToolRegistry()
        
        # Manually add execution records
        from vital_ai_services.core.models import ToolExecution
        
        execution1 = ToolExecution(
            tool_name="mock_tool",
            input_data="test1",
            output_data={"result": "success"},
            success=True,
            execution_time_ms=100.0,
            timestamp=datetime.utcnow()
        )
        registry._execution_history.append(execution1)
        
        history = registry.get_execution_history()
        
        assert len(history) == 1
        assert history[0].tool_name == "mock_tool"
    
    def test_get_stats(self):
        """Test getting registry statistics."""
        registry = ToolRegistry()
        registry.register(MockTool())
        registry.register(CalculatorTool())
        
        stats = registry.get_stats()
        
        assert stats["total_tools"] == 2
        assert len(stats["categories"]) >= 2
        assert "tool_stats" in stats
    
    def test_reset_all_stats(self):
        """Test resetting all tool statistics."""
        registry = ToolRegistry()
        tool = MockTool()
        tool.execution_count = 5
        registry.register(tool)
        
        registry.reset_all_stats()
        
        assert tool.execution_count == 0
        assert len(registry._execution_history) == 0


class TestCalculatorTool:
    """Test suite for CalculatorTool."""
    
    @pytest.mark.asyncio
    async def test_simple_calculation(self):
        """Test simple mathematical calculation."""
        tool = CalculatorTool()
        tool_input = ToolInput(
            tool_name="calculator",
            data="2 + 2"
        )
        
        output = await tool.execute(tool_input)
        
        assert output.success is True
        assert output.data["result"] == 4.0
    
    @pytest.mark.asyncio
    async def test_complex_calculation(self):
        """Test complex calculation."""
        tool = CalculatorTool()
        tool_input = ToolInput(
            tool_name="calculator",
            data="(100 + 50) * 0.15"
        )
        
        output = await tool.execute(tool_input)
        
        assert output.success is True
        assert output.data["result"] == 22.5
    
    @pytest.mark.asyncio
    async def test_invalid_expression(self):
        """Test invalid mathematical expression."""
        tool = CalculatorTool()
        tool_input = ToolInput(
            tool_name="calculator",
            data="invalid expression"
        )
        
        output = await tool.execute(tool_input)
        
        assert output.success is False
        assert "invalid" in output.error_message.lower()
    
    @pytest.mark.asyncio
    async def test_unsafe_expression(self):
        """Test unsafe expression (code injection attempt)."""
        tool = CalculatorTool()
        tool_input = ToolInput(
            tool_name="calculator",
            data="__import__('os').system('ls')"
        )
        
        output = await tool.execute(tool_input)
        
        assert output.success is False
        assert "unsafe" in output.error_message.lower()


@pytest.mark.asyncio
class TestIntegration:
    """Integration tests for tool system."""
    
    async def test_full_tool_workflow(self):
        """Test complete workflow: register, execute, track."""
        registry = ToolRegistry()
        registry.register(MockTool())
        registry.register(CalculatorTool())
        
        # Execute mock tool
        output1 = await registry.execute(
            tool_name="mock_tool",
            input_data="test",
            tenant_id="tenant-123"
        )
        assert output1.success is True
        
        # Execute calculator
        output2 = await registry.execute(
            tool_name="calculator",
            input_data="10 * 5",
            tenant_id="tenant-123"
        )
        assert output2.success is True
        assert output2.data["result"] == 50.0
        
        # Check statistics
        stats = registry.get_stats()
        assert stats["total_executions"] == 2
        assert stats["total_successes"] == 2
        
        # Check history
        history = registry.get_execution_history()
        assert len(history) == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

