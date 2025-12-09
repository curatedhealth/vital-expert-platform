"""
Mode 2: Automatic Interactive - Smart Copilot (REFACTORED)

Phase 1 Refactoring: Task 1.3.2
Target: <500 lines (original: 1,432 lines)

Mode 2 Specifics:
- System AUTOMATICALLY selects best agent based on query
- Interactive conversation
- Smart routing via Fusion Intelligence
- Proactive suggestions
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog

from langgraph.graph import StateGraph, END

from langgraph_workflows.base_workflow import BaseWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
)
from langgraph_workflows.observability import trace_node

# Shared Kernel imports
from langgraph_workflows.shared import (
    StateFactory,
    process_input_node,
    create_rag_retriever_node,
    format_response_node,
    StreamingMixin,
    WorkflowError,
    WorkflowErrorType,
)

logger = structlog.get_logger()


class Mode2AutomaticInteractiveWorkflowRefactored(BaseWorkflow, StreamingMixin):
    """
    Mode 2: Automatic Interactive - Smart Copilot (Refactored)
    
    Key difference from Mode 1:
    - Agent selection is AUTOMATIC (not manual)
    - Uses hybrid RRF search for agent selection
    - Provides proactive suggestions
    """
    
    def __init__(
        self,
        supabase_client,
        rag_service=None,
        agent_orchestrator=None,
        agent_selector=None,
        **kwargs
    ):
        """Initialize Mode 2 workflow."""
        super().__init__(
            workflow_name="Mode2_Automatic_Interactive_Refactored",
            mode=WorkflowMode.MODE_2_AUTOMATIC,
            enable_checkpoints=True
        )
        
        self.supabase = supabase_client
        self.rag_service = rag_service
        self.agent_orchestrator = agent_orchestrator
        self.agent_selector = agent_selector
        
        # Create RAG node using shared kernel
        self.rag_node = create_rag_retriever_node(
            rag_service=rag_service,
            top_k=10,
        ) if rag_service else None
        
        logger.info("Mode2 workflow initialized with shared kernel")
    
    def build_graph(self) -> StateGraph:
        """Build LangGraph workflow for Mode 2."""
        graph = StateGraph(UnifiedWorkflowState)
        
        # Shared nodes
        graph.add_node("process_input", process_input_node)
        graph.add_node("format_output", format_response_node)
        
        # Mode-specific nodes
        graph.add_node("validate_tenant", self._validate_tenant_node)
        graph.add_node("select_agent", self._select_agent_node)  # KEY DIFFERENCE
        graph.add_node("rag_retrieval", self._rag_retrieval_node)
        graph.add_node("execute_agent", self._execute_agent_node)
        
        # Define flow
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "validate_tenant")
        graph.add_edge("validate_tenant", "select_agent")  # Auto-select
        graph.add_edge("select_agent", "rag_retrieval")
        graph.add_edge("rag_retrieval", "execute_agent")
        graph.add_edge("execute_agent", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # MODE 2 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("mode2_validate_tenant")
    async def _validate_tenant_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation."""
        if not state.get('tenant_id'):
            raise WorkflowError(
                WorkflowErrorType.TENANT_ERROR,
                "tenant_id is required",
                recoverable=False,
            )
        return {
            'nodes_executed': ['validate_tenant'],
            'updated_at': datetime.utcnow(),
        }
    
    @trace_node("mode2_select_agent")
    async def _select_agent_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        AUTOMATIC agent selection - KEY MODE 2 DIFFERENTIATOR
        
        Uses hybrid RRF (Reciprocal Rank Fusion) search:
        - Vector similarity (60%)
        - Domain matching (25%)
        - Capability matching (10%)
        - Graph relationships (5%)
        """
        query = state.get('query', '')
        tenant_id = state.get('tenant_id')
        
        try:
            # Use agent selector service for automatic selection
            if self.agent_selector:
                selection = await self.agent_selector.select_agent(
                    query=query,
                    tenant_id=tenant_id,
                )
                
                return {
                    'selected_agents': [selection.agent_id],
                    'selected_agent_id': selection.agent_id,
                    'selected_agent_name': selection.agent_name,
                    'selection_confidence': selection.confidence,
                    'selection_reasoning': selection.reasoning,
                    'selection_method': 'hybrid_rrf',
                    'nodes_executed': ['select_agent'],
                    'updated_at': datetime.utcnow(),
                }
            
            # Fallback: Query-based selection from database
            result = self.supabase.rpc('select_agent_for_query', {
                'query_text': query,
                'tenant_uuid': tenant_id,
            }).execute()
            
            if result.data and len(result.data) > 0:
                agent = result.data[0]
                return {
                    'selected_agents': [agent['id']],
                    'selected_agent_id': agent['id'],
                    'selected_agent_name': agent.get('name', 'Unknown'),
                    'selection_confidence': agent.get('score', 0.5),
                    'selection_method': 'database_rpc',
                    'nodes_executed': ['select_agent'],
                    'updated_at': datetime.utcnow(),
                }
            
            # Default fallback
            return {
                'selected_agents': ['default-agent'],
                'selection_confidence': 0.3,
                'selection_method': 'fallback',
                'nodes_executed': ['select_agent'],
            }
            
        except Exception as e:
            logger.error("Agent selection failed", error=str(e))
            return {
                'selected_agents': ['default-agent'],
                'selection_confidence': 0.1,
                'errors': [f"Agent selection failed: {str(e)}"],
                'nodes_executed': ['select_agent'],
            }
    
    @trace_node("mode2_rag_retrieval")
    async def _rag_retrieval_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """RAG retrieval using shared node."""
        if not state.get('enable_rag', True):
            return {'retrieved_documents': [], 'nodes_executed': ['rag_retrieval']}
        
        if self.rag_node:
            return await self.rag_node(state)
        
        return {
            'retrieved_documents': [],
            'nodes_executed': ['rag_retrieval'],
        }
    
    @trace_node("mode2_execute_agent")
    async def _execute_agent_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Execute automatically selected agent."""
        from langchain_core.messages import HumanMessage, SystemMessage
        
        query = state.get('query', '')
        selected_agent = state.get('selected_agent_id')
        documents = state.get('retrieved_documents', [])
        
        # Load agent profile
        try:
            result = self.supabase.table('agents') \
                .select('*') \
                .eq('id', selected_agent) \
                .single() \
                .execute()
            
            agent = result.data if result.data else {}
            system_prompt = agent.get('system_prompt', 'You are a helpful AI assistant.')
            
        except Exception:
            system_prompt = 'You are a helpful AI assistant.'
        
        # Build context
        context = "\n\n".join([doc.get('content', '')[:500] for doc in documents[:5]])
        full_prompt = f"{system_prompt}\n\nContext:\n{context}" if context else system_prompt
        
        try:
            if self.agent_orchestrator and self.agent_orchestrator.llm:
                messages = [
                    SystemMessage(content=full_prompt),
                    HumanMessage(content=query),
                ]
                response = await self.agent_orchestrator.llm.ainvoke(messages)
                
                return {
                    'agent_response': response.content,
                    'response_confidence': 0.85,
                    'nodes_executed': ['execute_agent'],
                    'updated_at': datetime.utcnow(),
                }
            
            return {
                'agent_response': "Agent not available.",
                'response_confidence': 0.0,
                'nodes_executed': ['execute_agent'],
            }
            
        except Exception as e:
            logger.error("Agent execution failed", error=str(e))
            return {
                'agent_response': f"Error: {str(e)}",
                'errors': [str(e)],
                'nodes_executed': ['execute_agent'],
            }
