"""
VITAL Path AI Services - Ask Expert Mode 1 Workflow

Mode 1: Manual Interactive (Expert Chat)
- User MANUALLY selects an agent
- Interactive multi-turn conversation
- Single expert execution
- Target latency: 3-5s per turn

Naming Convention:
- File: ask_expert_mode1_workflow.py
- Class: AskExpertMode1Workflow
- Nodes: ask_expert_mode1_{node_name}
- Logs: ask_expert_mode1_{action}

2×2 Matrix Position: Row=Interactive, Col=Manual
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
    AskExpertStateFactory,
    ask_expert_process_input_node,
    ask_expert_format_response_node,
    AskExpertStreamingMixin,
    AskExpertWorkflowError,
    AskExpertErrorType,
)
from .shared.nodes.rag_retriever import create_ask_expert_rag_node

logger = structlog.get_logger()


class AskExpertMode1Workflow(BaseWorkflow, AskExpertStreamingMixin):
    """
    Ask Expert Mode 1: Manual Interactive Workflow
    
    Characteristics:
    - Selection: MANUAL (user picks expert)
    - Execution: INTERACTIVE (multi-turn chat)
    - Latency: 3-5 seconds per turn
    - Experts: 1 selected expert
    - Context: Full conversation history
    """
    
    def __init__(
        self,
        supabase_client,
        rag_service=None,
        agent_orchestrator=None,
        **kwargs
    ):
        super().__init__(
            workflow_name="AskExpert_Mode1_ManualInteractive",
            mode=WorkflowMode.MODE_1_MANUAL,
            enable_checkpoints=True,
        )
        
        self.supabase = supabase_client
        self.rag_service = rag_service
        self.agent_orchestrator = agent_orchestrator
        
        # Create RAG node with proper naming
        self.rag_node = create_ask_expert_rag_node(
            rag_service=rag_service,
            top_k=10,
        ) if rag_service else None
        
        logger.info("ask_expert_mode1_workflow_initialized")
    
    def build_graph(self) -> StateGraph:
        """Build Mode 1 LangGraph workflow."""
        graph = StateGraph(UnifiedWorkflowState)
        
        # Shared nodes
        graph.add_node("process_input", ask_expert_process_input_node)
        graph.add_node("format_output", ask_expert_format_response_node)
        
        # Mode 1 specific nodes
        graph.add_node("load_session", self._ask_expert_mode1_load_session)
        graph.add_node("validate_tenant", self._ask_expert_mode1_validate_tenant)
        graph.add_node("load_agent", self._ask_expert_mode1_load_agent)
        graph.add_node("rag_retrieval", self._ask_expert_mode1_rag_retrieval)
        graph.add_node("execute_expert", self._ask_expert_mode1_execute_expert)
        graph.add_node("save_message", self._ask_expert_mode1_save_message)
        
        # Flow
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "load_session")
        graph.add_edge("load_session", "validate_tenant")
        graph.add_edge("validate_tenant", "load_agent")
        graph.add_edge("load_agent", "rag_retrieval")
        graph.add_edge("rag_retrieval", "execute_expert")
        graph.add_edge("execute_expert", "save_message")
        graph.add_edge("save_message", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # MODE 1 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("ask_expert_mode1_load_session")
    async def _ask_expert_mode1_load_session(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Load or create conversation session."""
        session_id = state.get('session_id')
        tenant_id = state['tenant_id']
        
        logger.info(
            "ask_expert_mode1_load_session_started",
            tenant_id=tenant_id,
            session_id=session_id,
        )
        
        try:
            if session_id:
                result = self.supabase.table('ask_expert_sessions') \
                    .select('*') \
                    .eq('id', session_id) \
                    .eq('tenant_id', tenant_id) \
                    .single() \
                    .execute()
                
                if result.data:
                    return {
                        'session_id': session_id,
                        'nodes_executed': ['ask_expert_mode1_load_session'],
                    }
            
            # Create new session
            agent_id = state.get('selected_agents', [None])[0]
            new_session = self.supabase.table('ask_expert_sessions') \
                .insert({
                    'tenant_id': tenant_id,
                    'user_id': state.get('user_id'),
                    'agent_id': agent_id,
                    'mode': 'ask_expert_mode1',
                    'status': 'active',
                }) \
                .select() \
                .single() \
                .execute()
            
            logger.info(
                "ask_expert_mode1_session_created",
                session_id=new_session.data['id'],
            )
            
            return {
                'session_id': new_session.data['id'],
                'nodes_executed': ['ask_expert_mode1_load_session'],
            }
            
        except Exception as e:
            logger.error("ask_expert_mode1_load_session_failed", error=str(e))
            return {
                'errors': [f"Session load failed: {str(e)}"],
                'nodes_executed': ['ask_expert_mode1_load_session'],
            }
    
    @trace_node("ask_expert_mode1_validate_tenant")
    async def _ask_expert_mode1_validate_tenant(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation (Golden Rule #3)."""
        if not state.get('tenant_id'):
            raise AskExpertWorkflowError(
                AskExpertErrorType.TENANT_ERROR,
                "tenant_id is required (Golden Rule #3)",
                mode="mode1",
            )
        return {
            'nodes_executed': ['ask_expert_mode1_validate_tenant'],
        }
    
    @trace_node("ask_expert_mode1_load_agent")
    async def _ask_expert_mode1_load_agent(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Load and instantiate agent with context injection.
        
        NEW (Phase 2.5): Uses AgentInstantiationService to:
        1. Create session with context
        2. Resolve context IDs to names
        3. Apply personality configuration
        4. Build context-injected system prompt
        
        Reference: HANDOVER_BACKEND_INTEGRATION.md
        """
        selected_agents = state.get('selected_agents', [])
        
        if not selected_agents:
            return {
                'status': ExecutionStatus.FAILED,
                'errors': ['Mode 1 requires manual agent selection'],
                'nodes_executed': ['ask_expert_mode1_load_agent'],
            }
        
        agent_id = selected_agents[0]
        tenant_id = state['tenant_id']
        user_id = state.get('user_id')
        
        # Get context from state (frontend passes these via AgentInstantiationModal)
        region_id = state.get('context_region_id')
        domain_id = state.get('context_domain_id')
        therapeutic_area_id = state.get('context_therapeutic_area_id')
        phase_id = state.get('context_phase_id')
        personality_type_id = state.get('personality_type_id')
        
        try:
            # NEW: Use instantiation service for context injection
            from services.agent_instantiation_service import AgentInstantiationService
            
            instantiation_service = AgentInstantiationService(self.supabase)
            
            config = await instantiation_service.instantiate_agent(
                agent_id=agent_id,
                user_id=user_id or tenant_id,  # Fallback to tenant if no user
                tenant_id=tenant_id,
                region_id=region_id,
                domain_id=domain_id,
                therapeutic_area_id=therapeutic_area_id,
                phase_id=phase_id,
                personality_type_id=personality_type_id,
                session_mode='interactive',
            )
            
            logger.info(
                "ask_expert_mode1_agent_instantiated",
                agent_id=agent_id,
                agent_name=config.agent_name,
                session_id=config.session_id,
                has_context=bool(region_id or domain_id or therapeutic_area_id or phase_id),
                personality_slug=config.personality.slug,
            )
            
            return {
                'current_agent_id': agent_id,
                'current_agent_type': config.agent_name,
                'system_prompt': config.system_prompt,  # Context-injected!
                'instantiation_session_id': config.session_id,
                'llm_config': config.llm_config,  # temperature from personality
                'personality_config': {
                    'slug': config.personality.slug,
                    'temperature': config.personality.temperature,
                    'verbosity_level': config.personality.verbosity_level,
                    'reasoning_approach': config.personality.reasoning_approach,
                },
                'resolved_context': {
                    'region': config.context.region,
                    'domain': config.context.domain,
                    'therapeutic_area': config.context.therapeutic_area,
                    'phase': config.context.phase,
                },
                'nodes_executed': ['ask_expert_mode1_load_agent'],
            }
            
        except Exception as e:
            logger.error("ask_expert_mode1_load_agent_failed", error=str(e))
            
            # Fallback: Direct agent query (backwards compatible)
            try:
                result = self.supabase.table('agents') \
                    .select('*') \
                    .eq('id', agent_id) \
                    .single() \
                    .execute()
                
                if result.data:
                    agent = result.data
                    logger.warning(
                        "ask_expert_mode1_fallback_to_direct_query",
                        agent_id=agent_id,
                    )
                    return {
                        'current_agent_id': agent_id,
                        'current_agent_type': agent.get('name'),
                        'system_prompt': agent.get('system_prompt', ''),
                        'nodes_executed': ['ask_expert_mode1_load_agent'],
                    }
            except Exception:
                pass
            
            return {
                'errors': [f"Agent load failed: {str(e)}"],
                'nodes_executed': ['ask_expert_mode1_load_agent'],
            }
    
    @trace_node("ask_expert_mode1_rag_retrieval")
    async def _ask_expert_mode1_rag_retrieval(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """RAG retrieval for Mode 1."""
        if not state.get('enable_rag', True):
            return {
                'retrieved_documents': [],
                'nodes_executed': ['ask_expert_mode1_rag_retrieval'],
            }
        
        if self.rag_node:
            result = await self.rag_node(state)
            result['nodes_executed'] = ['ask_expert_mode1_rag_retrieval']
            return result
        
        return {
            'retrieved_documents': [],
            'nodes_executed': ['ask_expert_mode1_rag_retrieval'],
        }
    
    @trace_node("ask_expert_mode1_execute_expert")
    async def _ask_expert_mode1_execute_expert(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Execute expert agent with personality configuration.
        
        NEW (Phase 2.5): Uses llm_config from instantiation to:
        1. Apply personality temperature
        2. Apply token limits
        3. Track usage metrics
        
        Reference: HANDOVER_BACKEND_INTEGRATION.md
        """
        from langchain_core.messages import HumanMessage, SystemMessage
        import time
        
        query = state.get('query', '')
        system_prompt = state.get('system_prompt', 'You are a helpful AI expert.')
        documents = state.get('retrieved_documents', [])
        
        # Get LLM config from instantiation (NEW)
        llm_config = state.get('llm_config', {})
        personality_config = state.get('personality_config', {})
        instantiation_session_id = state.get('instantiation_session_id')
        
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
                
                # Track metrics if session exists (NEW)
                if instantiation_session_id:
                    try:
                        from services.agent_instantiation_service import AgentInstantiationService
                        service = AgentInstantiationService(self.supabase)
                        
                        # Estimate tokens (actual comes from response.usage if available)
                        input_tokens = len(full_prompt) // 4 + len(query) // 4
                        output_tokens = len(response.content) // 4
                        
                        # Use actual usage if available
                        if hasattr(response, 'usage_metadata') and response.usage_metadata:
                            input_tokens = response.usage_metadata.get('input_tokens', input_tokens)
                            output_tokens = response.usage_metadata.get('output_tokens', output_tokens)
                        
                        # Estimate cost (Claude Sonnet 4 pricing)
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
                            "ask_expert_mode1_metrics_failed",
                            error=str(metric_error),
                        )
                
                logger.info(
                    "ask_expert_mode1_expert_executed",
                    temperature=temperature,
                    response_time_ms=response_time_ms,
                    personality_slug=personality_config.get('slug'),
                )
                
                return {
                    'agent_response': response.content,
                    'response_confidence': 0.85,
                    'response_time_ms': response_time_ms,
                    'temperature_used': temperature,
                    'nodes_executed': ['ask_expert_mode1_execute_expert'],
                }
            
            return {
                'agent_response': "Agent not available.",
                'response_confidence': 0.0,
                'nodes_executed': ['ask_expert_mode1_execute_expert'],
            }
            
        except Exception as e:
            logger.error("ask_expert_mode1_execute_expert_failed", error=str(e))
            return {
                'agent_response': f"Error: {str(e)}",
                'errors': [str(e)],
                'nodes_executed': ['ask_expert_mode1_execute_expert'],
            }
    
    @trace_node("ask_expert_mode1_save_message")
    async def _ask_expert_mode1_save_message(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Save messages to database."""
        session_id = state.get('session_id')
        if not session_id:
            return {'nodes_executed': ['ask_expert_mode1_save_message']}
        
        try:
            tenant_id = state.get('tenant_id')
            
            # Save user message
            self.supabase.table('ask_expert_messages').insert({
                'session_id': session_id,
                'tenant_id': tenant_id,
                'role': 'user',
                'content': state.get('query', ''),
            }).execute()
            
            # Save assistant message
            self.supabase.table('ask_expert_messages').insert({
                'session_id': session_id,
                'tenant_id': tenant_id,
                'role': 'assistant',
                'content': state.get('agent_response', ''),
            }).execute()
            
            logger.info("ask_expert_mode1_messages_saved", session_id=session_id)
            
            return {'nodes_executed': ['ask_expert_mode1_save_message']}
            
        except Exception as e:
            logger.error("ask_expert_mode1_save_message_failed", error=str(e))
            return {
                'errors': [f"Save failed: {str(e)}"],
                'nodes_executed': ['ask_expert_mode1_save_message'],
            }
