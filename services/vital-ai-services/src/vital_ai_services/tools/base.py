"""
Base Tool Interface - Shared AI Service

TAG: SHARED_AI_SERVICES_LIBRARY

Provides abstract base class for all tools in the VITAL platform.

All tools must inherit from BaseTool and implement:
- name property
- description property
- execute() method

Features:
- Standardized input/output via shared models
- Automatic execution tracking (count, cost, success rate)
- Built-in error handling
- Structured logging
- Cost tracking
- Type safety

Usage:
    from vital_ai_services.tools import BaseTool
    from vital_ai_services.core.models import ToolInput, ToolOutput
    
    class MyTool(BaseTool):
        @property
        def name(self) -> str:
            return "my_tool"
        
        @property
        def description(self) -> str:
            return "Does something useful"
        
        async def execute(self, tool_input: ToolInput) -> ToolOutput:
            # Tool logic here
            return ToolOutput(
                success=True,
                tool_name="my_tool",
                data={"result": "success"}
            )
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime
import structlog

# Import shared models from core
from vital_ai_services.core.models import ToolInput, ToolOutput
from vital_ai_services.core.exceptions import ToolExecutionError

logger = structlog.get_logger()


# ============================================================================
# BASE TOOL ABSTRACT CLASS
# ============================================================================

class BaseTool(ABC):
    """
    Abstract base class for all tools.
    
    TAG: BASE_TOOL
    
    Provides:
    - Standardized interface (name, description, execute)
    - Automatic execution tracking
    - Cost tracking
    - Success rate calculation
    - Structured logging
    - Error handling
    
    Subclasses must implement:
    - name property (unique identifier)
    - description property (for LLM tool selection)
    - execute() method (core tool logic)
    """
    
    def __init__(self):
        """Initialize tool with tracking metrics."""
        self.execution_count = 0
        self.total_cost_usd = 0.0
        self.success_count = 0
        self.failure_count = 0
        self.total_duration_ms = 0.0
    
    # ========================================================================
    # ABSTRACT PROPERTIES (Must be implemented by subclasses)
    # ========================================================================
    
    @property
    @abstractmethod
    def name(self) -> str:
        """
        Unique tool identifier.
        
        Should be:
        - Lowercase with underscores (e.g., "rag_search")
        - Descriptive and memorable
        - Unique across all tools
        
        Returns:
            Tool name string
        """
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """
        Human-readable description for LLM tool selection.
        
        Should explain:
        - What the tool does
        - When to use it
        - What kind of input it expects
        - What kind of output it produces
        
        This is shown to the LLM when planning tool chains.
        
        Returns:
            Tool description string
        """
        pass
    
    @property
    def category(self) -> str:
        """
        Tool category for classification and filtering.
        
        Common categories:
        - "retrieval": RAG search, web search, database queries
        - "analysis": Data analysis, comparison, validation
        - "generation": Content generation, summarization
        - "transformation": Data transformation, formatting
        - "validation": Checking, verifying, validating
        - "general": Miscellaneous tools
        
        Returns:
            Category string (default: "general")
        """
        return "general"
    
    @property
    def requires_tenant_access(self) -> bool:
        """
        Whether tool requires tenant-specific access control.
        
        Returns:
            True if tool should check tenant permissions (default: True)
        """
        return True
    
    # ========================================================================
    # ABSTRACT METHOD (Must be implemented by subclasses)
    # ========================================================================
    
    @abstractmethod
    async def execute(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute the tool's core logic.
        
        This is where the actual work happens. Subclasses implement
        their specific functionality here.
        
        Args:
            tool_input: Standardized input containing data and context
            
        Returns:
            ToolOutput with success status, data, and metadata
            
        Raises:
            Should not raise exceptions - catch them and return
            ToolOutput with success=False and error_message
        """
        pass
    
    # ========================================================================
    # TRACKING & EXECUTION
    # ========================================================================
    
    async def execute_with_tracking(self, tool_input: ToolInput) -> ToolOutput:
        """
        Execute tool with automatic tracking and logging.
        
        This is the main entry point that should be called by external
        systems. It wraps the execute() method with:
        - Execution counting
        - Cost tracking
        - Success rate calculation
        - Duration tracking
        - Structured logging
        - Error handling
        
        Args:
            tool_input: Tool input
            
        Returns:
            Tool output with tracking metadata
        """
        start_time = datetime.utcnow()
        self.execution_count += 1
        
        logger.info(
            "tool_execution_started",
            tool=self.name,
            category=self.category,
            execution_count=self.execution_count,
            input_preview=str(tool_input.data)[:100] if tool_input.data else None
        )
        
        try:
            # Execute the tool
            output = await self.execute(tool_input)
            
            # Update tracking metrics
            duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
            self.total_duration_ms += duration_ms
            self.total_cost_usd += (output.cost_usd or 0.0)
            
            if output.success:
                self.success_count += 1
            else:
                self.failure_count += 1
            
            # Log completion
            logger.info(
                "tool_execution_completed",
                tool=self.name,
                success=output.success,
                duration_ms=duration_ms,
                cost_usd=output.cost_usd,
                execution_count=self.execution_count,
                success_rate=self.get_success_rate()
            )
            
            # Update output with tracking metadata
            output.execution_time_ms = duration_ms
            output.metadata.update({
                'execution_count': self.execution_count,
                'duration_ms': duration_ms,
                'tool_category': self.category
            })
            
            return output
            
        except Exception as e:
            # Handle unexpected errors
            duration_ms = (datetime.utcnow() - start_time).total_seconds() * 1000
            self.failure_count += 1
            
            logger.error(
                "tool_execution_failed",
                tool=self.name,
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=duration_ms,
                execution_count=self.execution_count
            )
            
            return ToolOutput(
                success=False,
                tool_name=self.name,
                data=None,
                error_message=f"{type(e).__name__}: {str(e)}",
                execution_time_ms=duration_ms,
                metadata={
                    'error_type': type(e).__name__,
                    'execution_count': self.execution_count,
                    'duration_ms': duration_ms,
                    'tool_category': self.category
                }
            )
    
    # ========================================================================
    # METRICS & STATISTICS
    # ========================================================================
    
    def get_success_rate(self) -> float:
        """
        Calculate success rate.
        
        Returns:
            Success rate as float between 0.0 and 1.0
        """
        if self.execution_count == 0:
            return 0.0
        return self.success_count / self.execution_count
    
    def get_avg_duration_ms(self) -> float:
        """
        Calculate average execution duration.
        
        Returns:
            Average duration in milliseconds
        """
        if self.execution_count == 0:
            return 0.0
        return self.total_duration_ms / self.execution_count
    
    def get_avg_cost_usd(self) -> float:
        """
        Calculate average execution cost.
        
        Returns:
            Average cost in USD
        """
        if self.execution_count == 0:
            return 0.0
        return self.total_cost_usd / self.execution_count
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive tool statistics.
        
        Returns:
            Dictionary with all tracking metrics
        """
        return {
            'tool_name': self.name,
            'category': self.category,
            'execution_count': self.execution_count,
            'success_count': self.success_count,
            'failure_count': self.failure_count,
            'success_rate': self.get_success_rate(),
            'total_cost_usd': self.total_cost_usd,
            'avg_cost_usd': self.get_avg_cost_usd(),
            'total_duration_ms': self.total_duration_ms,
            'avg_duration_ms': self.get_avg_duration_ms()
        }
    
    def reset_stats(self):
        """Reset all tracking statistics."""
        self.execution_count = 0
        self.total_cost_usd = 0.0
        self.success_count = 0
        self.failure_count = 0
        self.total_duration_ms = 0.0
        
        logger.info(f"Tool statistics reset: {self.name}")
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def __repr__(self) -> str:
        """String representation of the tool."""
        return (
            f"{self.__class__.__name__}("
            f"name='{self.name}', "
            f"category='{self.category}', "
            f"executions={self.execution_count}, "
            f"success_rate={self.get_success_rate():.2%})"
        )

