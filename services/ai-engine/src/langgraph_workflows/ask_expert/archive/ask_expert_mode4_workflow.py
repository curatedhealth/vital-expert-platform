"""
VITAL Path AI Services - Ask Expert Mode 4 Workflow

Mode 4: Automatic Autonomous (Background Mission)
- System AUTOMATICALLY selects agent(s)
- AUTONOMOUS multi-step execution
- Full autopilot with self-correction
- Background processing (Celery)
- Cost gates and circuit breakers
- Duration: 1-30 minutes

Naming Convention:
- File: ask_expert_mode4_workflow.py
- Class: AskExpertMode4Workflow
- Nodes: ask_expert_mode4_{node_name}
- Logs: ask_expert_mode4_{action}

2×2 Matrix Position: Row=Autonomous, Col=Automatic
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


class AskExpertMode4Workflow(BaseWorkflow, AskExpertStreamingMixin):
    """
    Ask Expert Mode 4: Automatic Autonomous Workflow
    
    Characteristics:
    - Selection: AUTOMATIC (system picks agents)
    - Execution: AUTONOMOUS (multi-step)
    - Autopilot: Full self-correction
    - Processing: Background (Celery)
    - Safety: Cost gates + circuit breakers
    - Duration: 1-30 minutes
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
            workflow_name="AskExpert_Mode4_AutomaticAutonomous",
            mode=WorkflowMode.MODE_4_STREAMING,
            enable_checkpoints=True,
        )
        
        self.supabase = supabase_client
        self.rag_service = rag_service
        self.agent_orchestrator = agent_orchestrator
        self.agent_selector = agent_selector
        
        self.rag_node = create_ask_expert_rag_node(
            rag_service=rag_service,
            top_k=15,
        ) if rag_service else None
        
        logger.info("ask_expert_mode4_workflow_initialized")
    
    def build_graph(self) -> StateGraph:
        """Build Mode 4 LangGraph workflow."""
        graph = StateGraph(UnifiedWorkflowState)
        
        # Shared nodes
        graph.add_node("process_input", ask_expert_process_input_node)
        graph.add_node("format_output", ask_expert_format_response_node)
        
        # Mode 4 specific nodes
        graph.add_node("validate_tenant", self._ask_expert_mode4_validate_tenant)
        graph.add_node("select_agent", self._ask_expert_mode4_select_agent)
        graph.add_node("check_budget", self._ask_expert_mode4_check_budget)
        graph.add_node("create_plan", self._ask_expert_mode4_create_plan)
        graph.add_node("rag_retrieval", self._ask_expert_mode4_rag_retrieval)
        graph.add_node("execute_step", self._ask_expert_mode4_execute_step)
        graph.add_node("self_correct", self._ask_expert_mode4_self_correct)
        graph.add_node("circuit_breaker", self._ask_expert_mode4_circuit_breaker)
        graph.add_node("check_goal", self._ask_expert_mode4_check_goal)
        graph.add_node("synthesize", self._ask_expert_mode4_synthesize)
        
        # Flow
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "validate_tenant")
        graph.add_edge("validate_tenant", "select_agent")
        graph.add_edge("select_agent", "check_budget")
        
        # Budget gate
        graph.add_conditional_edges(
            "check_budget",
            self._route_budget,
            {"proceed": "create_plan", "exceeded": "format_output"}
        )
        
        graph.add_edge("create_plan", "rag_retrieval")
        graph.add_edge("rag_retrieval", "execute_step")
        graph.add_edge("execute_step", "self_correct")
        graph.add_edge("self_correct", "circuit_breaker")
        
        # Circuit breaker
        graph.add_conditional_edges(
            "circuit_breaker",
            self._route_circuit_breaker,
            {"continue": "check_goal", "break": "synthesize"}
        )
        
        # Goal check loop
        graph.add_conditional_edges(
            "check_goal",
            self._route_goal_check,
            {
                "achieved": "synthesize",
                "continue": "execute_step",
                "max_iterations": "synthesize",
            }
        )
        
        graph.add_edge("synthesize", "format_output")
        graph.add_edge("format_output", END)
        
        return graph
    
    # =========================================================================
    # MODE 4 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("ask_expert_mode4_validate_tenant")
    async def _ask_expert_mode4_validate_tenant(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation."""
        if not state.get('tenant_id'):
            raise AskExpertWorkflowError(
                AskExpertErrorType.TENANT_ERROR,
                "tenant_id is required",
                mode="mode4",
            )
        return {'nodes_executed': ['ask_expert_mode4_validate_tenant']}
    
    @trace_node("ask_expert_mode4_select_agent")
    async def _ask_expert_mode4_select_agent(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Automatic agent selection with context instantiation.
        
        NEW (Phase 2.5): After selection, uses AgentInstantiationService for:
        1. Context injection (region, domain, TA, phase)
        2. Personality configuration
        3. Session tracking for background missions
        
        Reference: HANDOVER_BACKEND_INTEGRATION.md
        """
        query = state.get('query', '')
        tenant_id = state.get('tenant_id')
        user_id = state.get('user_id')
        
        # Get context from state (frontend passes these)
        region_id = state.get('context_region_id')
        domain_id = state.get('context_domain_id')
        therapeutic_area_id = state.get('context_therapeutic_area_id')
        phase_id = state.get('context_phase_id')
        personality_type_id = state.get('personality_type_id')
        
        # Check if pre-selected
        if state.get('selected_agents'):
            selected_agent = state.get('selected_agents')[0]
        else:
            logger.info("ask_expert_mode4_select_agent_started")
            
            try:
                if self.agent_selector:
                    selection = await self.agent_selector.select_agent(
                        query=query,
                        tenant_id=tenant_id,
                    )
                    selected_agent = selection.agent_id
                else:
                    selected_agent = 'default-agent'
            except Exception as e:
                logger.error("ask_expert_mode4_select_agent_failed", error=str(e))
                selected_agent = 'default-agent'
        
        # Now instantiate the selected agent with context
        system_prompt = 'You are executing an autonomous background mission.'
        llm_config = {}
        personality_config = {}
        instantiation_session_id = None
        
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
                session_mode='background',  # Mode 4 is background
            )
            
            system_prompt = config.system_prompt
            llm_config = config.llm_config
            personality_config = {
                'slug': config.personality.slug,
                'temperature': config.personality.temperature,
            }
            instantiation_session_id = config.session_id
            
            logger.info(
                "ask_expert_mode4_agent_instantiated",
                agent_id=selected_agent,
                agent_name=config.agent_name,
                session_id=config.session_id,
                personality_slug=config.personality.slug,
            )
            
        except Exception as e:
            logger.warning(
                "ask_expert_mode4_instantiation_fallback",
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
        
        return {
            'selected_agents': [selected_agent],
            'selected_agent_id': selected_agent,
            'selection_method': 'automatic',
            'system_prompt': system_prompt,
            'llm_config': llm_config,
            'personality_config': personality_config,
            'instantiation_session_id': instantiation_session_id,
            'nodes_executed': ['ask_expert_mode4_select_agent'],
        }
    
    @trace_node("ask_expert_mode4_check_budget")
    async def _ask_expert_mode4_check_budget(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Cost gate - critical for background missions."""
        tenant_id = state.get('tenant_id')
        
        logger.info("ask_expert_mode4_check_budget_started")
        
        # Production would query budget service
        budget_remaining = 100.0
        estimated_cost = 1.0
        
        return {
            'budget_check': {
                'remaining': budget_remaining,
                'estimated': estimated_cost,
                'within_budget': budget_remaining >= estimated_cost,
            },
            'nodes_executed': ['ask_expert_mode4_check_budget'],
        }
    
    @trace_node("ask_expert_mode4_create_plan")
    async def _ask_expert_mode4_create_plan(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Create autonomous execution plan."""
        query = state.get('query', '')
        
        plan = {
            'goal': query,
            'steps': [
                {'step': 1, 'action': 'analyze'},
                {'step': 2, 'action': 'research'},
                {'step': 3, 'action': 'reason'},
                {'step': 4, 'action': 'synthesize'},
            ],
            'max_iterations': state.get('max_iterations', 10),
        }
        
        return {
            'plan': plan,
            'goal_loop_iteration': 0,
            'nodes_executed': ['ask_expert_mode4_create_plan'],
        }
    
    @trace_node("ask_expert_mode4_rag_retrieval")
    async def _ask_expert_mode4_rag_retrieval(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """RAG retrieval for Mode 4."""
        if self.rag_node:
            result = await self.rag_node(state)
            result['nodes_executed'] = ['ask_expert_mode4_rag_retrieval']
            return result
        return {
            'retrieved_documents': [],
            'nodes_executed': ['ask_expert_mode4_rag_retrieval'],
        }
    
    @trace_node("ask_expert_mode4_execute_step")
    async def _ask_expert_mode4_execute_step(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Execute autonomous step with personality configuration.
        
        NEW (Phase 2.5): Uses llm_config from instantiation for:
        1. Personality temperature
        2. Token limits
        3. Session metrics tracking for background missions
        """
        from langchain_core.messages import HumanMessage, SystemMessage
        import time
        
        iteration = state.get('goal_loop_iteration', 0)
        query = state.get('query', '')
        documents = state.get('retrieved_documents', [])
        system_prompt = state.get('system_prompt', 'You are executing an autonomous background mission.')
        
        # Get LLM config from instantiation (NEW)
        llm_config = state.get('llm_config', {})
        personality_config = state.get('personality_config', {})
        instantiation_session_id = state.get('instantiation_session_id')
        
        logger.info(
            "ask_expert_mode4_execute_step_started",
            iteration=iteration,
            personality_slug=personality_config.get('slug'),
        )
        
        context = "\n".join([doc.get('content', '')[:300] for doc in documents[:5]])
        full_prompt = f"{system_prompt}\n\nExecute step {iteration + 1}.\n\nContext:\n{context}"
        
        start_time = time.time()
        
        try:
            # Apply personality temperature if available
            temperature = llm_config.get('temperature', 0.3)
            max_tokens = llm_config.get('max_tokens', 4000)
            
            if self.agent_orchestrator and self.agent_orchestrator.llm:
                from langchain_anthropic import ChatAnthropic
                
                llm = ChatAnthropic(
                    model=llm_config.get('model', 'claude-sonnet-4-20250514'),
                    temperature=temperature,
                    max_tokens=max_tokens,
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
                            "ask_expert_mode4_metrics_failed",
                            error=str(metric_error),
                        )
                
                logger.info(
                    "ask_expert_mode4_execute_step_completed",
                    iteration=iteration,
                    response_time_ms=response_time_ms,
                )
                
                return {
                    'reasoning_steps': [{
                        'iteration': iteration,
                        'response': response.content[:500],
                        'response_time_ms': response_time_ms,
                    }],
                    'goal_loop_iteration': iteration + 1,
                    'nodes_executed': ['ask_expert_mode4_execute_step'],
                }
                
        except Exception as e:
            logger.error("ask_expert_mode4_execute_step_failed", error=str(e))
        
        return {
            'goal_loop_iteration': iteration + 1,
            'nodes_executed': ['ask_expert_mode4_execute_step'],
        }
    
    @trace_node("ask_expert_mode4_self_correct")
    async def _ask_expert_mode4_self_correct(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Self-correction - Mode 4 autopilot feature."""
        errors = state.get('errors', [])
        
        if errors:
            logger.info(
                "ask_expert_mode4_self_correct_triggered",
                error_count=len(errors),
            )
            return {
                'corrections_applied': [{
                    'type': 'error_recovery',
                    'timestamp': datetime.utcnow().isoformat(),
                }],
                'nodes_executed': ['ask_expert_mode4_self_correct'],
            }
        
        return {'nodes_executed': ['ask_expert_mode4_self_correct']}
    
    @trace_node("ask_expert_mode4_circuit_breaker")
    async def _ask_expert_mode4_circuit_breaker(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Circuit breaker to prevent runaway."""
        iteration = state.get('goal_loop_iteration', 0)
        max_iterations = state.get('max_iterations', 10)
        errors = state.get('errors', [])
        
        should_break = iteration >= max_iterations or len(errors) >= 3
        
        if should_break:
            logger.warning(
                "ask_expert_mode4_circuit_breaker_tripped",
                iteration=iteration,
                error_count=len(errors),
            )
        
        return {
            'circuit_breaker_tripped': should_break,
            'nodes_executed': ['ask_expert_mode4_circuit_breaker'],
        }
    
    @trace_node("ask_expert_mode4_check_goal")
    async def _ask_expert_mode4_check_goal(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Check if goal achieved."""
        iteration = state.get('goal_loop_iteration', 0)
        confidence = state.get('response_confidence', 0.0)
        
        goal_achieved = confidence >= 0.95
        
        return {
            'goal_achieved': goal_achieved,
            'nodes_executed': ['ask_expert_mode4_check_goal'],
        }
    
    @trace_node("ask_expert_mode4_synthesize")
    async def _ask_expert_mode4_synthesize(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Synthesize final response."""
        reasoning_steps = state.get('reasoning_steps', [])
        
        synthesis = f"Background mission complete ({len(reasoning_steps)} steps):\n\n"
        for step in reasoning_steps[-3:]:
            synthesis += f"- {step.get('response', '')[:200]}\n"
        
        logger.info("ask_expert_mode4_synthesize_completed")
        
        return {
            'agent_response': synthesis,
            'response_confidence': 0.85,
            'nodes_executed': ['ask_expert_mode4_synthesize'],
        }
    
    # =========================================================================
    # ROUTING
    # =========================================================================
    
    def _route_budget(self, state: UnifiedWorkflowState) -> str:
        check = state.get('budget_check', {})
        return "proceed" if check.get('within_budget', True) else "exceeded"
    
    def _route_circuit_breaker(self, state: UnifiedWorkflowState) -> str:
        return "break" if state.get('circuit_breaker_tripped', False) else "continue"
    
    def _route_goal_check(self, state: UnifiedWorkflowState) -> str:
        if state.get('goal_achieved', False):
            return "achieved"
        if state.get('goal_loop_iteration', 0) >= state.get('max_iterations', 10):
            return "max_iterations"
        return "continue"
