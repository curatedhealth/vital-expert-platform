"""
VITAL Path AI Services - Ask Expert Mode 2 Workflow

Mode 2: Automatic Interactive (Smart Copilot)
- System AUTOMATICALLY selects best agent
- Interactive conversation
- Smart routing via Fusion Intelligence
- Target latency: 5-10s first turn

Naming Convention:
- File: ask_expert_mode2_workflow.py
- Class: AskExpertMode2Workflow
- Nodes: ask_expert_mode2_{node_name}
- Logs: ask_expert_mode2_{action}

2×2 Matrix Position: Row=Interactive, Col=Automatic
"""

from typing import Dict, Any
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

from .shared import (
    ask_expert_process_input_node,
    ask_expert_format_response_node,
    AskExpertStreamingMixin,
    AskExpertWorkflowError,
    AskExpertErrorType,
)
from .shared.nodes.rag_retriever import create_ask_expert_rag_node

logger = structlog.get_logger()


class AskExpertMode2Workflow(BaseWorkflow, AskExpertStreamingMixin):
    """
    Ask Expert Mode 2: Automatic Interactive Workflow
    
    Characteristics:
    - Selection: AUTOMATIC (system picks best agent)
    - Execution: INTERACTIVE (multi-turn chat)
    - Latency: 5-10 seconds first turn
    - Routing: Fusion Intelligence with RRF
    """
    
    def __init__(
        self,
        supabase_client,
        rag_service=None,
        agent_orchestrator=None,
        agent_selector=None,
        **kwargs
    ):
        super().__init__(
            workflow_name="AskExpert_Mode2_AutomaticInteractive",
            mode=WorkflowMode.MODE_2_AUTOMATIC,
            enable_checkpoints=True,
        )
        
        self.supabase = supabase_client
        self.rag_service = rag_service
        self.agent_orchestrator = agent_orchestrator
        self.agent_selector = agent_selector
        
        self.rag_node = create_ask_expert_rag_node(
            rag_service=rag_service,
            top_k=10,
        ) if rag_service else None
        
        logger.info("ask_expert_mode2_workflow_initialized")
    
    def build_graph(self) -> StateGraph:
        """Build Mode 2 LangGraph workflow."""
        graph = StateGraph(UnifiedWorkflowState)
        
        # Shared nodes
        graph.add_node("process_input", ask_expert_process_input_node)
        graph.add_node("format_output", ask_expert_format_response_node)
        
        # Mode 2 specific nodes
        graph.add_node("validate_tenant", self._ask_expert_mode2_validate_tenant)
        graph.add_node("select_agent", self._ask_expert_mode2_select_agent)
        graph.add_node("rag_retrieval", self._ask_expert_mode2_rag_retrieval)
        graph.add_node("execute_agent", self._ask_expert_mode2_execute_agent)
        
        # Flow
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "validate_tenant")
        graph.add_edge("validate_tenant", "select_agent")
        graph.add_edge("select_agent", "rag_retrieval")
        graph.add_edge("rag_retrieval", "execute_agent")
        graph.add_edge("execute_agent", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # MODE 2 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("ask_expert_mode2_validate_tenant")
    async def _ask_expert_mode2_validate_tenant(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation."""
        if not state.get('tenant_id'):
            raise AskExpertWorkflowError(
                AskExpertErrorType.TENANT_ERROR,
                "tenant_id is required",
                mode="mode2",
            )
        return {'nodes_executed': ['ask_expert_mode2_validate_tenant']}
    
    @trace_node("ask_expert_mode2_select_agent")
    async def _ask_expert_mode2_select_agent(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        AUTOMATIC agent selection - Mode 2 key differentiator.
        
        Uses hybrid RRF (Reciprocal Rank Fusion):
        - Vector similarity (60%)
        - Domain matching (25%)
        - Capability matching (10%)
        - Graph relationships (5%)
        """
        query = state.get('query', '')
        tenant_id = state.get('tenant_id')
        
        logger.info(
            "ask_expert_mode2_select_agent_started",
            tenant_id=tenant_id,
            query_preview=query[:50],
        )
        
        try:
            if self.agent_selector:
                selection = await self.agent_selector.select_agent(
                    query=query,
                    tenant_id=tenant_id,
                )
                
                logger.info(
                    "ask_expert_mode2_agent_selected",
                    agent_id=selection.agent_id,
                    confidence=selection.confidence,
                    method="fusion_intelligence",
                )
                
                return {
                    'selected_agents': [selection.agent_id],
                    'selected_agent_id': selection.agent_id,
                    'selection_confidence': selection.confidence,
                    'selection_reasoning': selection.reasoning,
                    'selection_method': 'hybrid_rrf',
                    'nodes_executed': ['ask_expert_mode2_select_agent'],
                }
            
            # Fallback: RPC function
            result = self.supabase.rpc('select_agent_for_query', {
                'query_text': query,
                'tenant_uuid': tenant_id,
            }).execute()
            
            if result.data and len(result.data) > 0:
                agent = result.data[0]
                return {
                    'selected_agents': [agent['id']],
                    'selected_agent_id': agent['id'],
                    'selection_confidence': agent.get('score', 0.5),
                    'selection_method': 'database_rpc',
                    'nodes_executed': ['ask_expert_mode2_select_agent'],
                }
            
            return {
                'selected_agents': ['default-agent'],
                'selection_method': 'fallback',
                'nodes_executed': ['ask_expert_mode2_select_agent'],
            }
            
        except Exception as e:
            logger.error("ask_expert_mode2_select_agent_failed", error=str(e))
            return {
                'selected_agents': ['default-agent'],
                'errors': [str(e)],
                'nodes_executed': ['ask_expert_mode2_select_agent'],
            }
    
    @trace_node("ask_expert_mode2_rag_retrieval")
    async def _ask_expert_mode2_rag_retrieval(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """RAG retrieval for Mode 2."""
        if self.rag_node:
            result = await self.rag_node(state)
            result['nodes_executed'] = ['ask_expert_mode2_rag_retrieval']
            return result
        return {
            'retrieved_documents': [],
            'nodes_executed': ['ask_expert_mode2_rag_retrieval'],
        }
    
    @trace_node("ask_expert_mode2_execute_agent")
    async def _ask_expert_mode2_execute_agent(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Execute automatically selected agent with context injection.
        
        NEW (Phase 2.5): Uses AgentInstantiationService to:
        1. Instantiate agent with context
        2. Apply personality configuration
        3. Track session metrics
        
        Reference: HANDOVER_BACKEND_INTEGRATION.md
        """
        from langchain_core.messages import HumanMessage, SystemMessage
        import time
        
        query = state.get('query', '')
        selected_agent = state.get('selected_agent_id')
        documents = state.get('retrieved_documents', [])
        tenant_id = state.get('tenant_id')
        user_id = state.get('user_id')
        
        # Get context from state (frontend passes these via AgentInstantiationModal)
        region_id = state.get('context_region_id')
        domain_id = state.get('context_domain_id')
        therapeutic_area_id = state.get('context_therapeutic_area_id')
        phase_id = state.get('context_phase_id')
        personality_type_id = state.get('personality_type_id')
        
        # Initialize variables for instantiation
        system_prompt = 'You are a helpful AI assistant.'
        llm_config = {}
        personality_config = {}
        instantiation_session_id = None
        
        # Try to use instantiation service for context injection
        try:
            from services.agent_instantiation_service import AgentInstantiationService
            
            instantiation_service = AgentInstantiationService(self.supabase)
            
            config = await instantiation_service.instantiate_agent(
                agent_id=selected_agent,
                user_id=user_id or tenant_id,
                tenant_id=tenant_id,
                region_id=region_id,
                domain_id=domain_id,
                therapeutic_area_id=therapeutic_area_id,
                phase_id=phase_id,
                personality_type_id=personality_type_id,
                session_mode='interactive',
            )
            
            system_prompt = config.system_prompt
            llm_config = config.llm_config
            personality_config = {
                'slug': config.personality.slug,
                'temperature': config.personality.temperature,
            }
            instantiation_session_id = config.session_id
            
            logger.info(
                "ask_expert_mode2_agent_instantiated",
                agent_id=selected_agent,
                agent_name=config.agent_name,
                session_id=config.session_id,
                personality_slug=config.personality.slug,
            )
            
        except Exception as e:
            logger.warning(
                "ask_expert_mode2_instantiation_fallback",
                error=str(e),
            )
            # Fallback: Direct agent query
            try:
                result = self.supabase.table('agents') \
                    .select('system_prompt') \
                    .eq('id', selected_agent) \
                    .single() \
                    .execute()
                if result.data:
                    system_prompt = result.data.get('system_prompt', system_prompt)
            except Exception:
                pass
        
        # Build context from RAG documents
        context = "\n\n".join([doc.get('content', '')[:500] for doc in documents[:5]])
        full_prompt = f"{system_prompt}\n\nContext:\n{context}" if context else system_prompt
        
        start_time = time.time()
        
        try:
            # Apply personality temperature if available
            temperature = llm_config.get('temperature', 0.2)
            max_tokens = llm_config.get('max_tokens', 4000)
            
            if self.agent_orchestrator and self.agent_orchestrator.llm:
                # Clone LLM with personality settings
                from langchain_anthropic import ChatAnthropic
                
                llm = ChatAnthropic(
                    model=llm_config.get('model', 'claude-sonnet-4-20250514'),
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=llm_config.get('top_p', 0.9),
                )
                
                messages = [
                    SystemMessage(content=full_prompt),
                    HumanMessage(content=query),
                ]
                response = await llm.ainvoke(messages)
                
                response_time_ms = int((time.time() - start_time) * 1000)
                
                # Track metrics if session exists
                if instantiation_session_id:
                    try:
                        from services.agent_instantiation_service import AgentInstantiationService
                        service = AgentInstantiationService(self.supabase)
                        
                        input_tokens = len(full_prompt) // 4 + len(query) // 4
                        output_tokens = len(response.content) // 4
                        
                        if hasattr(response, 'usage_metadata') and response.usage_metadata:
                            input_tokens = response.usage_metadata.get('input_tokens', input_tokens)
                            output_tokens = response.usage_metadata.get('output_tokens', output_tokens)
                        
                        cost_usd = (input_tokens * 0.003 + output_tokens * 0.015) / 1000
                        
                        await service.update_session_metrics(
                            session_id=instantiation_session_id,
                            input_tokens=input_tokens,
                            output_tokens=output_tokens,
                            cost_usd=cost_usd,
                            response_time_ms=response_time_ms,
                        )
                    except Exception as metric_error:
                        logger.warning(
                            "ask_expert_mode2_metrics_failed",
                            error=str(metric_error),
                        )
                
                logger.info(
                    "ask_expert_mode2_agent_executed",
                    temperature=temperature,
                    response_time_ms=response_time_ms,
                    personality_slug=personality_config.get('slug'),
                )
                
                return {
                    'agent_response': response.content,
                    'response_confidence': 0.85,
                    'response_time_ms': response_time_ms,
                    'temperature_used': temperature,
                    'instantiation_session_id': instantiation_session_id,
                    'nodes_executed': ['ask_expert_mode2_execute_agent'],
                }
            
            return {
                'agent_response': "Agent not available.",
                'nodes_executed': ['ask_expert_mode2_execute_agent'],
            }
            
        except Exception as e:
            logger.error("ask_expert_mode2_execute_agent_failed", error=str(e))
            return {
                'agent_response': f"Error: {str(e)}",
                'errors': [str(e)],
                'nodes_executed': ['ask_expert_mode2_execute_agent'],
            }
