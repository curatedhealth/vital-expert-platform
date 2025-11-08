"""
BaseWorkflow Template for VITAL Shared Library

Enhanced base workflow that integrates all vital_shared services.
All mode-specific workflows (Mode 1, 2, 3, 4) inherit from this.

Benefits:
- Shared services accessible to all modes
- Common node implementations (agent loading, RAG, tools)
- Consistent error handling
- Standardized state management
- Built-in observability

Usage:
    class Mode1ManualWorkflow(BaseWorkflow):
        def build_graph(self):
            graph = StateGraph(Mode1State)
            
            # Use shared nodes
            graph.add_node("load_agent", self.load_agent_node)
            graph.add_node("rag_retrieval", self.rag_retrieval_node)
            graph.add_node("execute_llm", self.execute_llm_node)
            
            # Add mode-specific nodes
            graph.add_node("await_confirmation", self.await_confirmation_node)
            
            return graph
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog
import uuid

# LangGraph
from langgraph.graph import StateGraph, END

# Vital Shared Services
from vital_shared.services.agent_service import AgentService
from vital_shared.services.unified_rag_service import UnifiedRAGService
from vital_shared.services.tool_service import ToolService
from vital_shared.services.memory_service import MemoryService
from vital_shared.services.streaming_service import StreamingService

# Vital Shared Models
from vital_shared.models.workflow_state import (
    BaseWorkflowState,
    validate_base_state,
    initialize_base_state
)
from vital_shared.models.workflow_io import WorkflowInput, WorkflowOutput, WorkflowMode
from vital_shared.models.citation import Citation, RAGResponse

logger = structlog.get_logger()


class BaseWorkflow(ABC):
    """
    Base workflow template for all VITAL modes.
    
    Provides:
    - Shared service access (Agent, RAG, Tool, Memory, Streaming)
    - Common node implementations
    - Consistent error handling
    - State validation
    - Observability
    
    Architecture:
    - Services injected via constructor (dependency injection)
    - Shared nodes handle 80% of common logic
    - Mode-specific workflows override/extend as needed
    """
    
    def __init__(
        self,
        workflow_name: str,
        mode: int,
        agent_service: AgentService,
        rag_service: UnifiedRAGService,
        tool_service: ToolService,
        memory_service: MemoryService,
        streaming_service: StreamingService
    ):
        """
        Initialize base workflow with all services.
        
        Args:
            workflow_name: Human-readable workflow name
            mode: Mode number (1, 2, 3, or 4)
            agent_service: Agent management service
            rag_service: RAG retrieval service
            tool_service: Tool orchestration service
            memory_service: Conversation storage service
            streaming_service: SSE streaming service
        """
        self.workflow_name = workflow_name
        self.mode = mode
        
        # Inject services
        self.agent_service = agent_service
        self.rag_service = rag_service
        self.tool_service = tool_service
        self.memory_service = memory_service
        self.streaming_service = streaming_service
        
        # Graph
        self.graph: Optional[StateGraph] = None
        self.compiled_graph = None
        
        # Metrics
        self._execution_count = 0
        self._error_count = 0
        
        self.logger = logger.bind(
            workflow=workflow_name,
            mode=mode
        )
        
        self.logger.info("base_workflow_initialized")
    
    @abstractmethod
    def build_graph(self) -> StateGraph:
        """
        Build the LangGraph workflow graph.
        
        Must be implemented by each mode-specific workflow.
        
        Returns:
            Configured StateGraph
            
        Example:
            def build_graph(self):
                graph = StateGraph(Mode1State)
                
                # Use shared nodes
                graph.add_node("load_agent", self.load_agent_node)
                graph.add_node("rag_retrieval", self.rag_retrieval_node)
                
                # Add mode-specific nodes
                graph.add_node("await_confirmation", self.await_confirmation_node)
                
                # Define flow
                graph.set_entry_point("load_agent")
                graph.add_edge("load_agent", "rag_retrieval")
                graph.add_edge("rag_retrieval", "await_confirmation")
                graph.add_edge("await_confirmation", END)
                
                return graph
        """
        pass
    
    async def initialize(self):
        """Initialize workflow by building and compiling graph."""
        try:
            self.logger.info("initializing_workflow")
            
            # Initialize RAG service
            await self.rag_service.initialize()
            
            # Build graph
            self.graph = self.build_graph()
            
            # Compile graph
            self.compiled_graph = self.graph.compile()
            
            self.logger.info("workflow_initialized_successfully")
            
        except Exception as e:
            self.logger.error("workflow_initialization_failed", error=str(e))
            raise
    
    async def execute(
        self,
        user_id: str,
        tenant_id: str,
        session_id: str,
        query: str,
        agent_id: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute workflow.
        
        Args:
            user_id: User ID
            tenant_id: Tenant ID (REQUIRED for multi-tenancy)
            session_id: Session ID
            query: User query
            agent_id: Optional agent ID
            **kwargs: Additional parameters
            
        Returns:
            Final workflow state
        """
        try:
            start_time = datetime.now()
            
            self.logger.info(
                "workflow_execution_started",
                user_id=user_id,
                tenant_id=tenant_id,
                session_id=session_id
            )
            
            # Initialize state
            initial_state = initialize_base_state(
                user_id=user_id,
                tenant_id=tenant_id,
                session_id=session_id,
                query=query,
                mode=self.mode,
                agent_id=agent_id,
                **kwargs
            )
            
            # Validate state
            if not validate_base_state(initial_state):
                raise ValueError("Invalid workflow state")
            
            # Execute graph
            self._execution_count += 1
            result = await self.compiled_graph.ainvoke(initial_state)
            
            # Calculate metrics
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            result["processing_time_ms"] = processing_time
            
            self.logger.info(
                "workflow_execution_completed",
                processing_time_ms=processing_time,
                has_error=result.get("error") is not None
            )
            
            return result
            
        except Exception as e:
            self._error_count += 1
            self.logger.error(
                "workflow_execution_failed",
                error=str(e),
                error_type=type(e).__name__
            )
            raise
    
    async def execute_typed(
        self,
        input: WorkflowInput
    ) -> WorkflowOutput:
        """
        Execute workflow with type-safe input/output (Hybrid State Management).
        
        This method implements the recommended Hybrid approach:
        - Input: Strict Pydantic validation (external → workflow)
        - Internal: Flexible Dict (LangGraph compatibility)
        - Output: Strict Pydantic formatting (workflow → external)
        
        Args:
            input: WorkflowInput with validated fields
            
        Returns:
            WorkflowOutput with quality indicators
        """
        try:
            start_time = datetime.now()
            
            self.logger.info(
                "workflow_execution_started_typed",
                user_id=input.user_id,
                tenant_id=input.tenant_id,
                mode=input.mode.value,
                query_length=len(input.query)
            )
            
            # Convert Pydantic input to Dict (for LangGraph)
            state_dict = input.to_state_dict()
            state_dict["started_at"] = start_time
            state_dict["session_id"] = input.conversation_id or str(uuid.uuid4())
            
            # Validate state
            if not validate_base_state(state_dict):
                raise ValueError("Invalid workflow state")
            
            # Execute graph (internal Dict state)
            self._execution_count += 1
            result_dict = await self.compiled_graph.ainvoke(state_dict)
            
            # Convert Dict result to Pydantic output
            output = WorkflowOutput.from_state_dict(result_dict)
            
            # Track execution
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds()
            self._total_execution_time += execution_time
            
            self.logger.info(
                "workflow_execution_completed_typed",
                execution_time=execution_time,
                quality_score=output.quality_score,
                is_degraded=output.is_degraded,
                warnings_count=len(output.warnings)
            )
            
            return output
            
        except Exception as e:
            self._error_count += 1
            self.logger.error(
                "workflow_execution_failed_typed",
                error=str(e),
                error_type=type(e).__name__
            )
            
            # Return degraded response instead of raising
            # (graceful degradation - Decision #2)
            return WorkflowOutput(
                response=f"I apologize, but I encountered an error processing your request: {str(e)}",
                quality_score=0.0,
                degradation_reasons=["critical_error"],
                warnings=[
                    "The system encountered a critical error",
                    "Please try again or contact support if the issue persists"
                ],
                metadata={"error": str(e), "error_type": type(e).__name__}
            )
    
    # =========================================================================
    # SHARED NODES - Used by all modes
    # =========================================================================
    
    async def load_agent_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Shared Node: Load agent profile.
        
        Loads agent from database using AgentService.
        Updates state with agent metadata.
        """
        try:
            agent_id = state.get("agent_id")
            tenant_id = state["tenant_id"]
            
            if not agent_id:
                self.logger.info("no_agent_specified_using_default")
                return state
            
            self.logger.info("loading_agent", agent_id=agent_id)
            
            # Load agent
            agent = await self.agent_service.load_agent(agent_id, tenant_id)
            
            # Update state
            return {
                **state,
                "agent_name": agent["name"],
                "agent_system_prompt": agent["system_prompt"],
                "metadata": {
                    **state.get("metadata", {}),
                    "agent_loaded": True,
                    "agent_model": agent.get("model", "gpt-4-turbo-preview"),
                    "agent_temperature": agent.get("temperature", 0.7)
                }
            }
            
        except Exception as e:
            self.logger.error("load_agent_failed", error=str(e))
            return {
                **state,
                "error": f"Agent loading failed: {str(e)}",
                "error_code": "AGENT_LOAD_ERROR"
            }
    
    async def rag_retrieval_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Shared Node: RAG retrieval.
        
        Retrieves relevant sources using UnifiedRAGService.
        Converts to standardized Citation format.
        """
        try:
            query = state["query"]
            agent_id = state.get("agent_id")
            tenant_id = state["tenant_id"]
            enable_rag = state.get("enable_rag", True)
            
            if not enable_rag:
                self.logger.info("rag_disabled_skipping")
                return state
            
            self.logger.info("rag_retrieval_started", query=query[:100])
            
            # Get agent's domains
            domain_ids = []
            if agent_id:
                domain_ids = await self.agent_service.get_agent_domains(
                    agent_id,
                    tenant_id
                )
            
            # Query RAG
            rag_response = await self.rag_service.query(
                query_text=query,
                strategy=state.get("rag_strategy", "hybrid"),
                domain_ids=domain_ids,
                max_results=state.get("max_results", 10)
            )
            
            # Extract sources and citations
            has_sources = rag_response.get("hasSources", False)
            citations = rag_response.get("citations", [])
            
            self.logger.info(
                "rag_retrieval_completed",
                has_sources=has_sources,
                source_count=len(citations)
            )
            
            return {
                **state,
                "rag_sources": citations,
                "rag_citations": citations,
                "rag_confidence": rag_response.get("confidence", 0.0),
                "rag_total_sources": len(citations),
                "metadata": {
                    **state.get("metadata", {}),
                    "rag_executed": True,
                    "rag_strategy": rag_response.get("searchStrategy"),
                    "rag_processing_time_ms": rag_response.get("processingTimeMs")
                }
            }
            
        except Exception as e:
            self.logger.error("rag_retrieval_failed", error=str(e))
            return {
                **state,
                "rag_sources": [],
                "rag_citations": [],
                "rag_total_sources": 0,
                "metadata": {
                    **state.get("metadata", {}),
                    "rag_error": str(e)
                }
            }
    
    async def tool_suggestion_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Shared Node: Tool suggestion.
        
        Analyzes query and suggests relevant tools.
        """
        try:
            query = state["query"]
            agent_id = state.get("agent_id")
            tenant_id = state["tenant_id"]
            enable_tools = state.get("enable_tools", True)
            
            if not enable_tools:
                self.logger.info("tools_disabled_skipping")
                return {
                    **state,
                    "suggested_tools": [],
                    "tools_awaiting_confirmation": False
                }
            
            self.logger.info("tool_suggestion_started")
            
            # Get agent's available tools
            agent_capabilities = []
            if agent_id:
                agent_capabilities = await self.agent_service.get_agent_tools(
                    agent_id,
                    tenant_id
                )
            
            # Suggest tools
            suggestion = await self.tool_service.decide_tools(
                query=query,
                requested_tools=None,
                agent_capabilities=agent_capabilities
            )
            
            suggested_tools = suggestion.get("suggested_tools", [])
            needs_confirmation = suggestion.get("needs_confirmation", False)
            
            self.logger.info(
                "tool_suggestion_completed",
                suggested_tools=suggested_tools,
                needs_confirmation=needs_confirmation
            )
            
            return {
                **state,
                "suggested_tools": suggested_tools,
                "tools_awaiting_confirmation": needs_confirmation,
                "metadata": {
                    **state.get("metadata", {}),
                    "tool_suggestion_reasoning": suggestion.get("reasoning")
                }
            }
            
        except Exception as e:
            self.logger.error("tool_suggestion_failed", error=str(e))
            return {
                **state,
                "suggested_tools": [],
                "tools_awaiting_confirmation": False
            }
    
    async def tool_execution_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Shared Node: Tool execution.
        
        Executes confirmed/approved tools.
        """
        try:
            confirmed_tools = state.get("confirmed_tools", [])
            
            if not confirmed_tools:
                self.logger.info("no_tools_to_execute")
                return state
            
            self.logger.info("tool_execution_started", tools=confirmed_tools)
            
            # Execute tools
            results = await self.tool_service.execute_tools(
                tools=confirmed_tools,
                context={"query": state["query"]}
            )
            
            self.logger.info(
                "tool_execution_completed",
                result_count=len(results)
            )
            
            return {
                **state,
                "tool_results": results,
                "metadata": {
                    **state.get("metadata", {}),
                    "tools_executed": confirmed_tools
                }
            }
            
        except Exception as e:
            self.logger.error("tool_execution_failed", error=str(e))
            return {
                **state,
                "tool_results": [],
                "metadata": {
                    **state.get("metadata", {}),
                    "tool_execution_error": str(e)
                }
            }
    
    async def save_conversation_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Shared Node: Save conversation turn.
        
        Saves user message and assistant response to memory.
        """
        try:
            session_id = state["session_id"]
            query = state["query"]
            response = state.get("response", "")
            
            if not response:
                self.logger.info("no_response_to_save")
                return state
            
            self.logger.info("saving_conversation_turn")
            
            # Save turn
            turn_id = await self.memory_service.save_turn(
                session_id=session_id,
                user_message=query,
                assistant_message=response,
                metadata={
                    "agent_id": state.get("agent_id"),
                    "citations": state.get("rag_citations", []),
                    "tools_used": state.get("confirmed_tools", []),
                    "cost": state.get("total_cost_usd", 0.0),
                    "mode": self.mode
                }
            )
            
            self.logger.info("conversation_turn_saved", turn_id=turn_id)
            
            return {
                **state,
                "metadata": {
                    **state.get("metadata", {}),
                    "turn_saved": True,
                    "turn_id": turn_id
                }
            }
            
        except Exception as e:
            self.logger.error("save_conversation_failed", error=str(e))
            return state
    
    # =========================================================================
    # UTILITY METHODS
    # =========================================================================
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get workflow execution metrics."""
        return {
            "workflow_name": self.workflow_name,
            "mode": self.mode,
            "execution_count": self._execution_count,
            "error_count": self._error_count,
            "success_rate": (
                (self._execution_count - self._error_count) / self._execution_count
                if self._execution_count > 0 else 0.0
            )
        }

