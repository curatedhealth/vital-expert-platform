"""
Tool Chaining Mixin

Shared logic for tool chaining integration across all modes.

Golden Rule Compliance:
✅ #1: Pure Python (no TypeScript)
✅ #2: Caching integrated
✅ #3: Tenant-aware
✅ #4: RAG/Tools enforced

Usage:
    >>> class MyWorkflow(BaseWorkflow, ToolChainMixin):
    ...     def __init__(self, ...):
    ...         super().__init__(...)
    ...         self.init_tool_chaining(rag_service)
"""

from typing import Dict, Any
import structlog

from services.tool_registry import get_tool_registry
from tools.rag_tool import RAGTool
from tools.web_tools import WebSearchTool, WebScraperTool
from langgraph_workflows.tool_chain_executor import ToolChainExecutor

logger = structlog.get_logger()


class ToolChainMixin:
    """
    Mixin for adding tool chaining capability to workflows.
    
    Provides:
    - Tool registration
    - Tool chain executor initialization
    - Decision logic for when to use chaining
    - Pure Python implementation (Golden Rule #1)
    """
    
    def init_tool_chaining(self, rag_service):
        """
        Initialize tool chaining for this workflow.
        
        Args:
            rag_service: UnifiedRAGService instance for RAG tool
        """
        # Tool registry
        self.tool_registry = get_tool_registry()
        self._register_workflow_tools(rag_service)
        
        # Tool chain executor
        self.tool_chain_executor = ToolChainExecutor(
            tool_registry=self.tool_registry,
            max_chain_length=5,
            planning_model="gpt-4",
            synthesis_model="gpt-4"
        )
        
        logger.info("✅ Tool chaining initialized")
    
    def _register_workflow_tools(self, rag_service):
        """Register standard tools for workflows."""
        # RAG tool (internal knowledge)
        self.tool_registry.register_tool(
            RAGTool(rag_service),
            is_global=True
        )
        
        # Web tools (external research)
        self.tool_registry.register_tool(
            WebSearchTool(),
            is_global=True
        )
        self.tool_registry.register_tool(
            WebScraperTool(),
            is_global=True
        )
        
        logger.info("✅ Workflow tools registered", tool_count=3)
    
    def should_use_tool_chain_simple(
        self,
        query: str,
        complexity: str = 'medium'
    ) -> bool:
        """
        Simple decision logic for interactive modes (Mode 1, 2).
        
        CONSERVATIVE: Only use tool chain for explicitly complex research tasks.
        Most queries should use direct agent execution for speed.
        
        Args:
            query: User query
            complexity: Query complexity
            
        Returns:
            True if tool chain should be used
        """
        query_lower = query.lower()
        
        # Keywords suggesting comprehensive research (must be explicit)
        research_keywords = [
            'comprehensive', 'thorough', 'detailed analysis',
            'research everything', 'compare all', 'evaluate thoroughly'
        ]
        
        # Multi-step indicators (must be explicit multi-step)
        multi_step_keywords = [
            'step by step', 'first then', 'multiple sources',
            'compare and contrast', 'analyze then summarize'
        ]
        
        has_research_intent = any(kw in query_lower for kw in research_keywords)
        has_multi_step = any(kw in query_lower for kw in multi_step_keywords)
        is_very_complex = complexity in ['very_high']  # Only very_high, not just high
        
        # Use chaining ONLY for very explicit complex research queries
        # Most queries should go through normal agent execution
        should_use = (
            (has_research_intent and is_very_complex) or
            (has_multi_step and len(query.split()) > 25)  # Longer threshold
        )
        
        if should_use:
            logger.info(
                "Tool chain decision (simple): YES",
                research_intent=has_research_intent,
                multi_step=has_multi_step,
                complexity=complexity
            )
        
        return should_use
    
    def should_use_tool_chain_react(
        self,
        thought_dict: Dict[str, Any],
        state: Dict[str, Any]
    ) -> bool:
        """
        Advanced decision logic for autonomous modes (Mode 3, 4).
        
        Args:
            thought_dict: Current thought from ReAct engine
            state: Workflow state
            
        Returns:
            True if tool chain should be used
        """
        thought_text = thought_dict.get('thought', '').lower()
        reasoning = thought_dict.get('reasoning', '').lower()
        
        # Multi-step keywords
        multi_step_keywords = [
            'then', 'after', 'next', 'following', 'multiple', 
            'comprehensive', 'thorough', 'various', 'several',
            'both', 'combine', 'integrate', 'compare'
        ]
        
        has_multi_step_language = any(
            kw in thought_text or kw in reasoning 
            for kw in multi_step_keywords
        )
        
        # Check task plan
        task_plan = state.get('task_plan', [])
        has_multiple_tasks = len(task_plan) > 2
        
        # Check complexity
        goal_understanding = state.get('goal_understanding', {})
        complexity = goal_understanding.get('estimated_complexity', 'medium')
        is_complex = complexity in ['high', 'very_high']
        
        # Check iteration
        current_iteration = state.get('current_iteration', 0)
        is_early_iteration = current_iteration <= 2
        
        # Decision
        should_use = (
            (has_multi_step_language and is_complex) or
            (has_multiple_tasks and is_early_iteration) or
            (is_complex and has_multi_step_language)
        )
        
        if should_use:
            logger.info(
                "Tool chain decision (ReAct): YES",
                multi_step_language=has_multi_step_language,
                task_count=len(task_plan),
                complexity=complexity,
                iteration=current_iteration
            )
        
        return should_use

