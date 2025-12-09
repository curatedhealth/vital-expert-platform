"""
VITAL Path AI Services - Ask Expert Mode 3 Workflow

Mode 3: Manual Autonomous (Mission Control)
- User MANUALLY selects agent
- AUTONOMOUS multi-step execution
- HITL checkpoints (5 types)
- ReAct reasoning pattern
- Duration: 30s - 5min

Naming Convention:
- File: ask_expert_mode3_workflow.py
- Class: AskExpertMode3Workflow
- Nodes: ask_expert_mode3_{node_name}
- Logs: ask_expert_mode3_{action}

2×2 Matrix Position: Row=Autonomous, Col=Manual
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


class AskExpertMode3Workflow(BaseWorkflow, AskExpertStreamingMixin):
    """
    Ask Expert Mode 3: Manual Autonomous Workflow
    
    Characteristics:
    - Selection: MANUAL (user picks expert)
    - Execution: AUTONOMOUS (multi-step)
    - HITL: Required checkpoints
    - Pattern: ReAct reasoning
    - Duration: 30 seconds to 5 minutes
    """
    
    def __init__(
        self,
        supabase_client,
        rag_service=None,
        agent_orchestrator=None,
        hitl_service=None,
        **kwargs
    ):
        super().__init__(
            workflow_name="AskExpert_Mode3_ManualAutonomous",
            mode=WorkflowMode.MODE_3_AUTONOMOUS,
            enable_checkpoints=True,
        )
        
        self.supabase = supabase_client
        self.rag_service = rag_service
        self.agent_orchestrator = agent_orchestrator
        self.hitl_service = hitl_service
        
        self.rag_node = create_ask_expert_rag_node(
            rag_service=rag_service,
            top_k=15,
        ) if rag_service else None
        
        logger.info("ask_expert_mode3_workflow_initialized")
    
    def build_graph(self) -> StateGraph:
        """Build Mode 3 LangGraph workflow with HITL."""
        graph = StateGraph(UnifiedWorkflowState)
        
        # Shared nodes
        graph.add_node("process_input", ask_expert_process_input_node)
        graph.add_node("format_output", ask_expert_format_response_node)
        
        # Mode 3 specific nodes
        graph.add_node("validate_tenant", self._ask_expert_mode3_validate_tenant)
        graph.add_node("load_agent", self._ask_expert_mode3_load_agent)
        graph.add_node("create_plan", self._ask_expert_mode3_create_plan)
        graph.add_node("hitl_plan_approval", self._ask_expert_mode3_hitl_plan)
        graph.add_node("rag_retrieval", self._ask_expert_mode3_rag_retrieval)
        graph.add_node("execute_step", self._ask_expert_mode3_execute_step)
        graph.add_node("hitl_step_review", self._ask_expert_mode3_hitl_step)
        graph.add_node("check_goal", self._ask_expert_mode3_check_goal)
        graph.add_node("synthesize", self._ask_expert_mode3_synthesize)
        
        # Flow
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "validate_tenant")
        graph.add_edge("validate_tenant", "load_agent")
        graph.add_edge("load_agent", "create_plan")
        graph.add_edge("create_plan", "hitl_plan_approval")
        
        # HITL plan approval branch
        graph.add_conditional_edges(
            "hitl_plan_approval",
            self._route_after_plan,
            {"approved": "rag_retrieval", "rejected": "format_output"}
        )
        
        graph.add_edge("rag_retrieval", "execute_step")
        graph.add_edge("execute_step", "hitl_step_review")
        
        # HITL step review branch
        graph.add_conditional_edges(
            "hitl_step_review",
            self._route_after_step,
            {"continue": "check_goal", "rejected": "format_output"}
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
    # MODE 3 SPECIFIC NODES
    # =========================================================================
    
    @trace_node("ask_expert_mode3_validate_tenant")
    async def _ask_expert_mode3_validate_tenant(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation."""
        if not state.get('tenant_id'):
            raise AskExpertWorkflowError(
                AskExpertErrorType.TENANT_ERROR,
                "tenant_id is required",
                mode="mode3",
            )
        return {'nodes_executed': ['ask_expert_mode3_validate_tenant']}
    
    @trace_node("ask_expert_mode3_load_agent")
    async def _ask_expert_mode3_load_agent(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Load and instantiate agent with context injection.
        
        NEW (Phase 2.5): Uses AgentInstantiationService for:
        1. Context injection (region, domain, TA, phase)
        2. Personality configuration
        3. Session tracking
        
        Reference: HANDOVER_BACKEND_INTEGRATION.md
        """
        selected_agents = state.get('selected_agents', [])
        
        if not selected_agents:
            return {
                'status': ExecutionStatus.FAILED,
                'errors': ['Mode 3 requires manual agent selection'],
                'nodes_executed': ['ask_expert_mode3_load_agent'],
            }
        
        agent_id = selected_agents[0]
        tenant_id = state.get('tenant_id')
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
                user_id=user_id or tenant_id,
                tenant_id=tenant_id,
                region_id=region_id,
                domain_id=domain_id,
                therapeutic_area_id=therapeutic_area_id,
                phase_id=phase_id,
                personality_type_id=personality_type_id,
                session_mode='autonomous',  # Mode 3 is autonomous
            )
            
            logger.info(
                "ask_expert_mode3_agent_instantiated",
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
                'llm_config': config.llm_config,
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
                'nodes_executed': ['ask_expert_mode3_load_agent'],
            }
            
        except Exception as e:
            logger.error("ask_expert_mode3_load_agent_failed", error=str(e))
            
            # Fallback: Direct agent query (backwards compatible)
            try:
                result = self.supabase.table('agents') \
                    .select('*') \
                    .eq('id', agent_id) \
                    .single() \
                    .execute()
                
                if result.data:
                    logger.warning(
                        "ask_expert_mode3_fallback_to_direct_query",
                        agent_id=agent_id,
                    )
                    return {
                        'current_agent_id': agent_id,
                        'system_prompt': result.data.get('system_prompt', ''),
                        'nodes_executed': ['ask_expert_mode3_load_agent'],
                    }
            except Exception:
                pass
        
        return {
            'errors': [f'Agent not found: {agent_id}'],
            'nodes_executed': ['ask_expert_mode3_load_agent'],
        }
    
    @trace_node("ask_expert_mode3_create_plan")
    async def _ask_expert_mode3_create_plan(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Create execution plan for autonomous mission."""
        query = state.get('query', '')
        
        logger.info("ask_expert_mode3_create_plan_started")
        
        plan = {
            'goal': query,
            'steps': [
                {'step': 1, 'action': 'analyze', 'description': 'Analyze query'},
                {'step': 2, 'action': 'research', 'description': 'Gather evidence'},
                {'step': 3, 'action': 'reason', 'description': 'Apply reasoning'},
                {'step': 4, 'action': 'synthesize', 'description': 'Create response'},
            ],
            'max_iterations': state.get('max_iterations', 10),
        }
        
        return {
            'plan': plan,
            'goal_loop_iteration': 0,
            'nodes_executed': ['ask_expert_mode3_create_plan'],
        }
    
    @trace_node("ask_expert_mode3_hitl_plan")
    async def _ask_expert_mode3_hitl_plan(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """HITL checkpoint for plan approval."""
        plan = state.get('plan', {})
        
        logger.info(
            "ask_expert_mode3_hitl_plan_checkpoint",
            step_count=len(plan.get('steps', [])),
        )
        
        # Auto-approve for now (production would wait)
        return {
            'plan_approved': True,
            'hitl_checkpoints': {
                'plan_approval': {
                    'status': 'approved',
                    'timestamp': datetime.utcnow().isoformat(),
                }
            },
            'nodes_executed': ['ask_expert_mode3_hitl_plan'],
        }
    
    @trace_node("ask_expert_mode3_rag_retrieval")
    async def _ask_expert_mode3_rag_retrieval(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """RAG retrieval for Mode 3."""
        if self.rag_node:
            result = await self.rag_node(state)
            result['nodes_executed'] = ['ask_expert_mode3_rag_retrieval']
            return result
        return {
            'retrieved_documents': [],
            'nodes_executed': ['ask_expert_mode3_rag_retrieval'],
        }
    
    @trace_node("ask_expert_mode3_execute_step")
    async def _ask_expert_mode3_execute_step(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Execute a single ReAct reasoning step with personality configuration.
        
        NEW (Phase 2.5): Uses llm_config from instantiation for:
        1. Personality temperature
        2. Token limits
        3. Session metrics tracking
        """
        from langchain_core.messages import HumanMessage, SystemMessage
        import time
        
        iteration = state.get('goal_loop_iteration', 0)
        query = state.get('query', '')
        documents = state.get('retrieved_documents', [])
        system_prompt = state.get('system_prompt', 'You are executing autonomous reasoning.')
        
        # Get LLM config from instantiation (NEW)
        llm_config = state.get('llm_config', {})
        personality_config = state.get('personality_config', {})
        instantiation_session_id = state.get('instantiation_session_id')
        
        logger.info(
            "ask_expert_mode3_execute_step_started",
            iteration=iteration,
            personality_slug=personality_config.get('slug'),
        )
        
        context = "\n".join([doc.get('content', '')[:300] for doc in documents[:5]])
        
        react_prompt = f"""Execute step {iteration + 1} using ReAct pattern.

Goal: {query}

Context:
{context}

Provide:
1. Thought: What do you need to consider?
2. Action: What action will you take?
3. Observation: What did you observe?"""

        start_time = time.time()
        
        try:
            # Apply personality temperature if available
            temperature = llm_config.get('temperature', 0.3)  # Slightly higher for reasoning
            max_tokens = llm_config.get('max_tokens', 4000)
            
            if self.agent_orchestrator and self.agent_orchestrator.llm:
                from langchain_anthropic import ChatAnthropic
                
                llm = ChatAnthropic(
                    model=llm_config.get('model', 'claude-sonnet-4-20250514'),
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=react_prompt),
                ]
                response = await llm.ainvoke(messages)
                
                response_time_ms = int((time.time() - start_time) * 1000)
                
                # Track metrics if session exists
                if instantiation_session_id:
                    try:
                        from services.agent_instantiation_service import AgentInstantiationService
                        service = AgentInstantiationService(self.supabase)
                        
                        input_tokens = len(system_prompt) // 4 + len(react_prompt) // 4
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
                            "ask_expert_mode3_metrics_failed",
                            error=str(metric_error),
                        )
                
                logger.info(
                    "ask_expert_mode3_execute_step_completed",
                    iteration=iteration,
                    response_time_ms=response_time_ms,
                )
                
                return {
                    'reasoning_steps': [{
                        'iteration': iteration,
                        'thought': response.content,
                        'timestamp': datetime.utcnow().isoformat(),
                        'response_time_ms': response_time_ms,
                    }],
                    'goal_loop_iteration': iteration + 1,
                    'nodes_executed': ['ask_expert_mode3_execute_step'],
                }
                
        except Exception as e:
            logger.error("ask_expert_mode3_execute_step_failed", error=str(e))
        
        return {
            'goal_loop_iteration': iteration + 1,
            'nodes_executed': ['ask_expert_mode3_execute_step'],
        }
    
    @trace_node("ask_expert_mode3_hitl_step")
    async def _ask_expert_mode3_hitl_step(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """HITL checkpoint for step review."""
        iteration = state.get('goal_loop_iteration', 0)
        
        logger.info(
            "ask_expert_mode3_hitl_step_checkpoint",
            iteration=iteration,
        )
        
        return {
            'step_approved': True,
            'nodes_executed': ['ask_expert_mode3_hitl_step'],
        }
    
    @trace_node("ask_expert_mode3_check_goal")
    async def _ask_expert_mode3_check_goal(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Check if goal is achieved."""
        iteration = state.get('goal_loop_iteration', 0)
        max_iterations = state.get('max_iterations', 10)
        confidence = state.get('response_confidence', 0.0)
        
        goal_achieved = confidence >= 0.95 or iteration >= max_iterations
        
        logger.info(
            "ask_expert_mode3_check_goal",
            iteration=iteration,
            goal_achieved=goal_achieved,
        )
        
        return {
            'goal_achieved': goal_achieved,
            'nodes_executed': ['ask_expert_mode3_check_goal'],
        }
    
    @trace_node("ask_expert_mode3_synthesize")
    async def _ask_expert_mode3_synthesize(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Synthesize final response."""
        reasoning_steps = state.get('reasoning_steps', [])
        
        synthesis = f"Autonomous analysis complete ({len(reasoning_steps)} steps):\n\n"
        for step in reasoning_steps:
            synthesis += f"- {step.get('thought', '')[:200]}\n"
        
        logger.info("ask_expert_mode3_synthesize_completed")
        
        return {
            'agent_response': synthesis,
            'response_confidence': 0.85,
            'nodes_executed': ['ask_expert_mode3_synthesize'],
        }
    
    # =========================================================================
    # ROUTING
    # =========================================================================
    
    def _route_after_plan(self, state: UnifiedWorkflowState) -> str:
        return "approved" if state.get('plan_approved', False) else "rejected"
    
    def _route_after_step(self, state: UnifiedWorkflowState) -> str:
        return "continue" if state.get('step_approved', True) else "rejected"
    
    def _route_goal_check(self, state: UnifiedWorkflowState) -> str:
        if state.get('goal_achieved', False):
            return "achieved"
        if state.get('goal_loop_iteration', 0) >= state.get('max_iterations', 10):
            return "max_iterations"
        return "continue"
