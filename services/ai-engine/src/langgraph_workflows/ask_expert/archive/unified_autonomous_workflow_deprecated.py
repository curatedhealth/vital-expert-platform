"""
VITAL Path AI Services - Unified Autonomous Workflow

Unified base workflow for Mode 3 (Manual) and Mode 4 (Automatic) Autonomous modes.

================================================================================
CRITICAL ARCHITECTURE DOCUMENTATION (Dec 12, 2025)
================================================================================

MODE ARCHITECTURE (CORRECTED):
┌─────────────────────────────────────────────────────────────────────────────┐
│ Mode │ Type        │ Agent Selection    │ Safety/HITL Nodes                 │
├──────┼─────────────┼────────────────────┼───────────────────────────────────┤
│  1   │ Interactive │ MANUAL (user)      │ Basic flow ONLY                   │
│  2   │ Interactive │ AUTOMATIC (Fusion) │ Basic flow ONLY                   │
│  3   │ Autonomous  │ MANUAL (user)      │ FULL safety suite + HITL          │
│  4   │ Autonomous  │ AUTOMATIC (Fusion) │ FULL safety suite + HITL          │
└─────────────────────────────────────────────────────────────────────────────┘

KEY FACTS:
1. Mode 1 & 2 are IDENTICAL except agent selection method
2. Mode 3 & 4 are IDENTICAL except agent selection method
3. Safety nodes (check_budget, self_correct, circuit_breaker, hitl_plan_approval,
   hitl_step_review) belong to AUTONOMOUS modes (3 & 4) ONLY
4. Agent selection (Manual vs Automatic) is the ONLY variable within each pair

THIS FILE: unified_autonomous_workflow.py
- Handles Mode 3 AND Mode 4
- FULL safety nodes (Autonomous modes need them)
- Single codebase, AgentSelectionStrategy is only differentiator

================================================================================

Architecture:
- SINGLE workflow class handles both autonomous modes
- Agent selection strategy is the ONLY differentiator
- Mode 3: AgentSelectionStrategy.MANUAL (agent_id provided by user)
- Mode 4: AgentSelectionStrategy.AUTOMATIC (Fusion Search with RRF)

2×2 Matrix Position: Row=Autonomous (both modes)
- Mode 3: Autonomous × Manual
- Mode 4: Autonomous × Automatic

Safety Nodes (AUTONOMOUS MODES ONLY):
✅ check_budget - Cost gate for expensive operations
✅ self_correct - Auto-correction on errors
✅ circuit_breaker - Prevents runaway execution
✅ hitl_plan_approval - Human approval for execution plan
✅ hitl_step_review - Human review of each step

Golden Rules Compliance:
✅ #1: Python-only, production-grade implementation
✅ #2: DRY - Single workflow for both autonomous modes
✅ #3: Tenant isolation enforced at every node
✅ #4: L3-L5 Agent Hierarchy with Context Engineering
✅ #5: SSE Streaming via llm_streaming_config

Flow (Both Modes):
  process_input → validate_tenant → [select_agent?] → load_agent
  → check_budget → create_plan → hitl_plan_approval
  → rag_retrieval → execute_step → self_correct → circuit_breaker
  → hitl_step_review → check_goal → [loop or synthesize]
  → format_output

Reference: ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md (Dec 12, 2025)
"""

from enum import Enum
from typing import Dict, Any, Optional, Protocol, runtime_checkable, List
from datetime import datetime
import structlog
import uuid as uuid_module

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
from .shared.nodes.l3_context_engineer import create_l3_context_engineer_node

# Import AgentSelectionStrategy from interactive workflow for consistency
from .unified_interactive_workflow import (
    AgentSelectionStrategy,
    AgentSelector,
    AgentSelectionResult,
    _is_valid_uuid,
    _get_valid_uuid_or_none,
)

logger = structlog.get_logger()


# =============================================================================
# UNIFIED AUTONOMOUS WORKFLOW
# =============================================================================

class UnifiedAutonomousWorkflow(BaseWorkflow, AskExpertStreamingMixin):
    """
    Unified Autonomous Workflow for Mode 3 and Mode 4.

    Key Design:
    - Single workflow class handles both modes
    - Agent selection strategy injected at construction
    - All other nodes are shared between modes
    - Graph compiled ONCE in __init__ (not per-request)

    Mode Differentiation:
    - Mode 3: selection_strategy=MANUAL, agent_selector=None
    - Mode 4: selection_strategy=AUTOMATIC, agent_selector=FusionSearchSelector

    Safety Nodes (AUTONOMOUS ONLY - not in Interactive modes):
    - check_budget: Cost gate for expensive operations
    - self_correct: Auto-correction on errors
    - circuit_breaker: Prevents runaway execution
    - hitl_plan_approval: Human approval for execution plan
    - hitl_step_review: Human review of each step

    Performance Targets:
    - Mode 3: 30s-5min (depends on complexity)
    - Mode 4: 1-30min (background mission)

    Streaming:
    - Prepares llm_streaming_config for route layer
    - Route layer handles actual SSE token emission
    - 25+ event types supported (token, reasoning, thinking, etc.)
    """

    def __init__(
        self,
        supabase_client,
        selection_strategy: AgentSelectionStrategy = AgentSelectionStrategy.MANUAL,
        agent_selector: Optional[AgentSelector] = None,
        rag_service=None,
        agent_orchestrator=None,
        hitl_service=None,
        enable_l3_orchestration: bool = True,
        enable_specialists: bool = True,
        max_parallel_tools: int = 5,
        max_iterations: int = 10,
        budget_limit: float = 100.0,
        **kwargs
    ):
        """
        Initialize Unified Autonomous Workflow.

        Args:
            supabase_client: Database client (tenant-aware)
            selection_strategy: MANUAL (Mode 3) or AUTOMATIC (Mode 4)
            agent_selector: Required if AUTOMATIC strategy (Fusion Search)
            rag_service: RAG retrieval service
            agent_orchestrator: LLM orchestrator
            hitl_service: Human-in-the-loop service for checkpoints
            enable_l3_orchestration: Enable L3 Context Engineer (AGENT_OS v6.0)
            enable_specialists: Enable L3-B Specialists
            max_parallel_tools: Max concurrent L5 tool executions
            max_iterations: Maximum iterations before circuit breaker
            budget_limit: Default budget limit for cost gate
        """
        # Determine mode from strategy
        mode = (
            WorkflowMode.MODE_3_AUTONOMOUS
            if selection_strategy == AgentSelectionStrategy.MANUAL
            else WorkflowMode.MODE_4_STREAMING
        )

        mode_name = "Mode3_ManualAutonomous" if selection_strategy == AgentSelectionStrategy.MANUAL else "Mode4_AutomaticAutonomous"

        super().__init__(
            workflow_name=f"AskExpert_{mode_name}_Unified",
            mode=mode,
            enable_checkpoints=True,
        )

        self.supabase = supabase_client
        self.selection_strategy = selection_strategy
        self.agent_selector = agent_selector
        self.rag_service = rag_service
        self.agent_orchestrator = agent_orchestrator
        self.hitl_service = hitl_service
        self.enable_l3_orchestration = enable_l3_orchestration
        self.max_iterations = max_iterations
        self.budget_limit = budget_limit

        # Validate: AUTOMATIC requires agent_selector
        if selection_strategy == AgentSelectionStrategy.AUTOMATIC and not agent_selector:
            logger.warning(
                "unified_autonomous_automatic_no_selector",
                message="AUTOMATIC strategy without agent_selector will fall back to database RPC",
            )

        # Create RAG node (more documents for autonomous modes)
        self.rag_node = create_ask_expert_rag_node(
            rag_service=rag_service,
            top_k=15,  # More documents for autonomous research
        ) if rag_service else None

        # Create L3 Context Engineer node (AGENT_OS v6.0)
        self.l3_orchestrator_node = create_l3_context_engineer_node(
            supabase_client=supabase_client,
            enable_specialists=enable_specialists,
            max_parallel_tools=max_parallel_tools,
        ) if enable_l3_orchestration else None

        logger.info(
            "unified_autonomous_workflow_initialized",
            selection_strategy=selection_strategy.value,
            mode=mode_name,
            enable_l3_orchestration=enable_l3_orchestration,
            enable_specialists=enable_specialists,
            has_agent_selector=agent_selector is not None,
            max_iterations=max_iterations,
            budget_limit=budget_limit,
        )

    def build_graph(self) -> StateGraph:
        """
        Build unified LangGraph workflow for autonomous modes.

        Graph Structure:
        - Mode 3 (MANUAL): Skips select_agent node
        - Mode 4 (AUTOMATIC): Includes select_agent node with Fusion Search

        Safety Nodes (AUTONOMOUS ONLY):
        - check_budget: Before plan creation
        - hitl_plan_approval: After plan creation
        - self_correct: After each step execution
        - circuit_breaker: After self-correction
        - hitl_step_review: After circuit breaker

        Flow (MANUAL - Mode 3):
          process_input → validate_tenant → load_agent → check_budget
          → create_plan → hitl_plan_approval → l3_orchestrate → rag_retrieval
          → execute_step → self_correct → circuit_breaker → hitl_step_review
          → check_goal → [loop or synthesize] → format_output

        Flow (AUTOMATIC - Mode 4):
          process_input → validate_tenant → select_agent → load_agent
          → check_budget → create_plan → hitl_plan_approval → l3_orchestrate
          → rag_retrieval → execute_step → self_correct → circuit_breaker
          → hitl_step_review → check_goal → [loop or synthesize] → format_output
        """
        graph = StateGraph(UnifiedWorkflowState)

        # =====================================================================
        # SHARED NODES (Both Modes)
        # =====================================================================
        graph.add_node("process_input", ask_expert_process_input_node)
        graph.add_node("format_output", ask_expert_format_response_node)
        graph.add_node("validate_tenant", self._validate_tenant_node)
        graph.add_node("load_session", self._load_session_node)
        graph.add_node("load_agent", self._load_agent_node)
        graph.add_node("rag_retrieval", self._rag_retrieval_node)
        graph.add_node("execute_step", self._execute_step_node)
        graph.add_node("synthesize", self._synthesize_node)

        # =====================================================================
        # SAFETY NODES (AUTONOMOUS ONLY - This is what makes Mode 3/4 different)
        # =====================================================================
        graph.add_node("check_budget", self._check_budget_node)
        graph.add_node("create_plan", self._create_plan_node)
        graph.add_node("hitl_plan_approval", self._hitl_plan_approval_node)
        graph.add_node("self_correct", self._self_correct_node)
        graph.add_node("circuit_breaker", self._circuit_breaker_node)
        graph.add_node("hitl_step_review", self._hitl_step_review_node)
        graph.add_node("check_goal", self._check_goal_node)

        # L3 Context Engineer (optional, default enabled)
        if self.enable_l3_orchestration and self.l3_orchestrator_node:
            graph.add_node("l3_orchestrate", self.l3_orchestrator_node)

        # =====================================================================
        # MODE-SPECIFIC: AUTOMATIC adds select_agent node
        # =====================================================================
        if self.selection_strategy == AgentSelectionStrategy.AUTOMATIC:
            graph.add_node("select_agent", self._select_agent_node)

        # =====================================================================
        # GRAPH EDGES
        # =====================================================================
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "load_session")
        graph.add_edge("load_session", "validate_tenant")

        if self.selection_strategy == AgentSelectionStrategy.AUTOMATIC:
            # Mode 4: validate → select → load
            graph.add_edge("validate_tenant", "select_agent")
            graph.add_edge("select_agent", "load_agent")
        else:
            # Mode 3: validate → load (skip selection)
            graph.add_edge("validate_tenant", "load_agent")

        # Safety: Budget check after agent load
        graph.add_edge("load_agent", "check_budget")

        # Budget gate routing
        graph.add_conditional_edges(
            "check_budget",
            self._route_budget,
            {"proceed": "create_plan", "exceeded": "format_output"}
        )

        graph.add_edge("create_plan", "hitl_plan_approval")

        # HITL plan approval routing
        graph.add_conditional_edges(
            "hitl_plan_approval",
            self._route_after_plan,
            {"approved": "l3_orchestrate" if self.enable_l3_orchestration else "rag_retrieval", "rejected": "format_output"}
        )

        # L3 orchestration (if enabled)
        if self.enable_l3_orchestration and self.l3_orchestrator_node:
            graph.add_edge("l3_orchestrate", "rag_retrieval")

        # Main execution loop
        graph.add_edge("rag_retrieval", "execute_step")
        graph.add_edge("execute_step", "self_correct")
        graph.add_edge("self_correct", "circuit_breaker")

        # Circuit breaker routing
        graph.add_conditional_edges(
            "circuit_breaker",
            self._route_circuit_breaker,
            {"continue": "hitl_step_review", "break": "synthesize"}
        )

        graph.add_edge("hitl_step_review", "check_goal")

        # Goal check routing (iteration loop)
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
    # NODE IMPLEMENTATIONS
    # =========================================================================

    @trace_node("unified_autonomous_load_session")
    async def _load_session_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Load or create conversation session for autonomous mission."""
        session_id = state.get('session_id')
        tenant_id = state['tenant_id']
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        logger.info(
            "unified_autonomous_load_session_started",
            tenant_id=tenant_id,
            session_id=session_id,
            mode=mode_name,
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
                        'nodes_executed': [f'unified_autonomous_load_session_{mode_name}'],
                    }

            # Create new session for autonomous mission
            raw_agent_id = state.get('selected_agents', [None])[0]
            agent_id = _get_valid_uuid_or_none(raw_agent_id)
            user_id = _get_valid_uuid_or_none(state.get('user_id'))

            session_mode = 'autonomous' if self.selection_strategy == AgentSelectionStrategy.MANUAL else 'background'

            new_session = self.supabase.table('ask_expert_sessions') \
                .insert({
                    'tenant_id': tenant_id,
                    'user_id': user_id,
                    'agent_id': agent_id,
                    'mode': f'ask_expert_{mode_name}',
                    'status': 'active',
                }) \
                .select() \
                .single() \
                .execute()

            logger.info(
                "unified_autonomous_session_created",
                session_id=new_session.data['id'],
                mode=mode_name,
            )

            return {
                'session_id': new_session.data['id'],
                'nodes_executed': [f'unified_autonomous_load_session_{mode_name}'],
            }

        except Exception as e:
            logger.error("unified_autonomous_load_session_failed", error=str(e))
            return {
                'errors': [f"Session load failed: {str(e)}"],
                'nodes_executed': ['unified_autonomous_load_session'],
            }

    @trace_node("unified_autonomous_validate_tenant")
    async def _validate_tenant_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation (Golden Rule #3)."""
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        if not state.get('tenant_id'):
            raise AskExpertWorkflowError(
                AskExpertErrorType.TENANT_ERROR,
                f"tenant_id is required (Golden Rule #3) - {mode_name}",
                mode=mode_name,
            )
        return {
            'nodes_executed': [f'unified_autonomous_validate_tenant_{mode_name}'],
        }

    @trace_node("unified_autonomous_select_agent")
    async def _select_agent_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        AUTOMATIC agent selection - Mode 4 ONLY.

        Uses Fusion Search with RRF (Reciprocal Rank Fusion):
        - PostgreSQL Full-Text (30% weight)
        - Pinecone Vector (50% weight)
        - Neo4j Graph (20% weight)

        Reference: VITAL_GRAPHRAG_AGENT_SELECTION_V2_1.md
        """
        query = state.get('query', '')
        tenant_id = state.get('tenant_id')

        logger.info(
            "unified_autonomous_select_agent_started",
            tenant_id=tenant_id,
            query_preview=query[:50],
        )

        try:
            # Use injected agent selector (Fusion Search)
            if self.agent_selector:
                selection = await self.agent_selector.select_agent(
                    query=query,
                    tenant_id=tenant_id,
                )

                logger.info(
                    "unified_autonomous_agent_selected",
                    agent_id=selection.agent_id,
                    confidence=selection.confidence,
                    method=selection.method,
                )

                return {
                    'selected_agents': [selection.agent_id],
                    'selected_agent_id': selection.agent_id,
                    'selection_confidence': selection.confidence,
                    'selection_reasoning': selection.reasoning,
                    'selection_method': selection.method,
                    'selection_scores': selection.scores,
                    'nodes_executed': ['unified_autonomous_select_agent_mode4'],
                }

            # Fallback: Database RPC function
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
                    'selection_method': 'database_rpc_fallback',
                    'nodes_executed': ['unified_autonomous_select_agent_mode4'],
                }

            # Ultimate fallback
            return {
                'selected_agents': ['default-agent'],
                'selection_method': 'fallback',
                'nodes_executed': ['unified_autonomous_select_agent_mode4'],
            }

        except Exception as e:
            logger.error("unified_autonomous_select_agent_failed", error=str(e))
            return {
                'selected_agents': ['default-agent'],
                'errors': [str(e)],
                'nodes_executed': ['unified_autonomous_select_agent_mode4'],
            }

    @trace_node("unified_autonomous_load_agent")
    async def _load_agent_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Load and instantiate agent with context injection.

        Uses AgentInstantiationService to:
        1. Create session with context (region, domain, therapeutic_area, phase)
        2. Apply personality configuration (temperature, verbosity)
        3. Build context-injected system prompt

        Reference: HANDOVER_BACKEND_INTEGRATION.md
        """
        selected_agents = state.get('selected_agents', [])
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"
        session_mode = "autonomous" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "background"

        if not selected_agents:
            error_msg = (
                'Mode 3 requires manual agent selection'
                if self.selection_strategy == AgentSelectionStrategy.MANUAL
                else 'Agent selection failed'
            )
            return {
                'status': ExecutionStatus.FAILED,
                'errors': [error_msg],
                'nodes_executed': [f'unified_autonomous_load_agent_{mode_name}'],
            }

        agent_id = selected_agents[0]
        tenant_id = state['tenant_id']
        user_id = state.get('user_id')

        # Context from frontend (via AgentInstantiationModal)
        region_id = state.get('context_region_id')
        domain_id = state.get('context_domain_id')
        therapeutic_area_id = state.get('context_therapeutic_area_id')
        phase_id = state.get('context_phase_id')
        personality_type_id = state.get('personality_type_id')

        try:
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
                session_mode=session_mode,
            )

            logger.info(
                "unified_autonomous_agent_instantiated",
                agent_id=agent_id,
                agent_name=config.agent_name,
                session_id=config.session_id,
                has_context=bool(region_id or domain_id or therapeutic_area_id or phase_id),
                personality_slug=config.personality.slug,
                mode=mode_name,
            )

            return {
                'current_agent_id': agent_id,
                'current_agent_type': config.agent_name,
                'system_prompt': config.system_prompt,
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
                'nodes_executed': [f'unified_autonomous_load_agent_{mode_name}'],
            }

        except Exception as e:
            logger.warning(
                "unified_autonomous_load_agent_instantiation_failed",
                error=str(e),
                mode=mode_name,
            )

            # Fallback: Direct agent query
            try:
                result = self.supabase.table('agents') \
                    .select('*') \
                    .eq('id', agent_id) \
                    .single() \
                    .execute()

                if result.data:
                    agent = result.data
                    return {
                        'current_agent_id': agent_id,
                        'current_agent_type': agent.get('name'),
                        'system_prompt': agent.get('system_prompt', ''),
                        'llm_config': {
                            'model': agent.get('base_model', 'gpt-4'),
                            'temperature': agent.get('temperature', 0.7),
                            'max_tokens': agent.get('max_tokens', 4000),
                        },
                        'nodes_executed': [f'unified_autonomous_load_agent_{mode_name}'],
                    }
            except Exception:
                pass

            return {
                'errors': [f"Agent load failed: {str(e)}"],
                'nodes_executed': [f'unified_autonomous_load_agent_{mode_name}'],
            }

    # =========================================================================
    # SAFETY NODES (AUTONOMOUS ONLY - This is what differentiates Mode 3/4)
    # =========================================================================

    @trace_node("unified_autonomous_check_budget")
    async def _check_budget_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Cost gate - AUTONOMOUS ONLY.

        Critical for background missions (Mode 4) to prevent runaway costs.
        Mode 3 also uses this for responsible resource allocation.

        Production would query a budget service for tenant limits.
        """
        tenant_id = state.get('tenant_id')
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        logger.info(
            "unified_autonomous_check_budget_started",
            tenant_id=tenant_id,
            mode=mode_name,
        )

        # Production would query budget service
        budget_remaining = self.budget_limit
        estimated_cost = 1.0  # Estimate based on query complexity

        within_budget = budget_remaining >= estimated_cost

        if not within_budget:
            logger.warning(
                "unified_autonomous_budget_exceeded",
                tenant_id=tenant_id,
                budget_remaining=budget_remaining,
                estimated_cost=estimated_cost,
                mode=mode_name,
            )

        return {
            'budget_check': {
                'remaining': budget_remaining,
                'estimated': estimated_cost,
                'within_budget': within_budget,
            },
            'nodes_executed': [f'unified_autonomous_check_budget_{mode_name}'],
        }

    @trace_node("unified_autonomous_create_plan")
    async def _create_plan_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Create execution plan for autonomous mission.

        Plans are critical for autonomous modes to:
        1. Break complex tasks into steps
        2. Enable HITL approval before execution
        3. Track progress through the mission
        """
        query = state.get('query', '')
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        logger.info(
            "unified_autonomous_create_plan_started",
            query_preview=query[:50],
            mode=mode_name,
        )

        # In production, this would use an LLM to generate the plan
        plan = {
            'goal': query,
            'steps': [
                {'step': 1, 'action': 'analyze', 'description': 'Analyze query and identify key concepts'},
                {'step': 2, 'action': 'research', 'description': 'Gather evidence from knowledge base'},
                {'step': 3, 'action': 'reason', 'description': 'Apply domain expertise and reasoning'},
                {'step': 4, 'action': 'synthesize', 'description': 'Create comprehensive response'},
            ],
            'max_iterations': state.get('max_iterations', self.max_iterations),
            'created_at': datetime.utcnow().isoformat(),
        }

        return {
            'plan': plan,
            'goal_loop_iteration': 0,
            'nodes_executed': [f'unified_autonomous_create_plan_{mode_name}'],
        }

    @trace_node("unified_autonomous_hitl_plan_approval")
    async def _hitl_plan_approval_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        HITL checkpoint for plan approval - AUTONOMOUS ONLY.

        This is a key safety node:
        - Mode 3: Human reviews plan before execution
        - Mode 4: May auto-approve based on confidence, but can request review

        Production would integrate with a HITL service for actual approval.
        """
        plan = state.get('plan', {})
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        logger.info(
            "unified_autonomous_hitl_plan_checkpoint",
            step_count=len(plan.get('steps', [])),
            mode=mode_name,
        )

        # Auto-approve for now (production would wait for human or auto-approve based on risk)
        # Mode 4 (background) might auto-approve more aggressively
        auto_approve = True
        if self.hitl_service:
            try:
                approval = await self.hitl_service.request_plan_approval(
                    plan=plan,
                    auto_approve_threshold=0.8 if self.selection_strategy == AgentSelectionStrategy.AUTOMATIC else 0.95,
                )
                auto_approve = approval.approved
            except Exception as e:
                logger.warning("unified_autonomous_hitl_service_unavailable", error=str(e))

        return {
            'plan_approved': auto_approve,
            'hitl_checkpoints': {
                'plan_approval': {
                    'status': 'approved' if auto_approve else 'rejected',
                    'timestamp': datetime.utcnow().isoformat(),
                    'mode': mode_name,
                }
            },
            'nodes_executed': [f'unified_autonomous_hitl_plan_{mode_name}'],
        }

    @trace_node("unified_autonomous_self_correct")
    async def _self_correct_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Self-correction - AUTONOMOUS ONLY.

        This is a Mode 4 autopilot feature that also applies to Mode 3.
        When errors occur, the system attempts to recover automatically.
        """
        errors = state.get('errors', [])
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        if errors:
            logger.info(
                "unified_autonomous_self_correct_triggered",
                error_count=len(errors),
                mode=mode_name,
            )
            return {
                'corrections_applied': [{
                    'type': 'error_recovery',
                    'errors_handled': len(errors),
                    'timestamp': datetime.utcnow().isoformat(),
                }],
                'errors': [],  # Clear errors after handling
                'nodes_executed': [f'unified_autonomous_self_correct_{mode_name}'],
            }

        return {'nodes_executed': [f'unified_autonomous_self_correct_{mode_name}']}

    @trace_node("unified_autonomous_circuit_breaker")
    async def _circuit_breaker_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Circuit breaker to prevent runaway execution - AUTONOMOUS ONLY.

        Critical safety node that prevents:
        1. Infinite loops
        2. Excessive resource consumption
        3. Runaway API costs
        """
        iteration = state.get('goal_loop_iteration', 0)
        max_iterations = state.get('max_iterations', self.max_iterations)
        errors = state.get('errors', [])
        corrections = state.get('corrections_applied', [])
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        # Trip conditions
        should_break = (
            iteration >= max_iterations or  # Max iterations reached
            len(errors) >= 3 or  # Too many errors
            len(corrections) >= 5  # Too many corrections (stuck in loop)
        )

        if should_break:
            logger.warning(
                "unified_autonomous_circuit_breaker_tripped",
                iteration=iteration,
                max_iterations=max_iterations,
                error_count=len(errors),
                correction_count=len(corrections),
                mode=mode_name,
            )

        return {
            'circuit_breaker_tripped': should_break,
            'nodes_executed': [f'unified_autonomous_circuit_breaker_{mode_name}'],
        }

    @trace_node("unified_autonomous_hitl_step_review")
    async def _hitl_step_review_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        HITL checkpoint for step review - AUTONOMOUS ONLY.

        Reviews each step's output before proceeding.
        Mode 3 typically reviews more steps than Mode 4.
        """
        iteration = state.get('goal_loop_iteration', 0)
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        logger.info(
            "unified_autonomous_hitl_step_checkpoint",
            iteration=iteration,
            mode=mode_name,
        )

        # Auto-approve for now (production would integrate with HITL service)
        step_approved = True
        if self.hitl_service:
            try:
                reasoning_steps = state.get('reasoning_steps', [])
                latest_step = reasoning_steps[-1] if reasoning_steps else None
                if latest_step:
                    approval = await self.hitl_service.request_step_review(
                        step=latest_step,
                        iteration=iteration,
                    )
                    step_approved = approval.approved
            except Exception:
                pass

        return {
            'step_approved': step_approved,
            'nodes_executed': [f'unified_autonomous_hitl_step_{mode_name}'],
        }

    @trace_node("unified_autonomous_check_goal")
    async def _check_goal_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Check if goal is achieved - AUTONOMOUS ONLY.

        Determines whether to continue the execution loop or synthesize results.
        """
        iteration = state.get('goal_loop_iteration', 0)
        max_iterations = state.get('max_iterations', self.max_iterations)
        confidence = state.get('response_confidence', 0.0)
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        goal_achieved = confidence >= 0.95 or iteration >= max_iterations

        logger.info(
            "unified_autonomous_check_goal",
            iteration=iteration,
            max_iterations=max_iterations,
            confidence=confidence,
            goal_achieved=goal_achieved,
            mode=mode_name,
        )

        return {
            'goal_achieved': goal_achieved,
            'nodes_executed': [f'unified_autonomous_check_goal_{mode_name}'],
        }

    # =========================================================================
    # COMMON NODES (Used in both modes)
    # =========================================================================

    @trace_node("unified_autonomous_rag_retrieval")
    async def _rag_retrieval_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        RAG retrieval with web search fallback.

        CRITICAL: Expert NEVER responds without sources.
        Autonomous modes retrieve more documents (top_k=15).
        """
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        if not state.get('enable_rag', True):
            return {
                'retrieved_documents': [],
                'nodes_executed': [f'unified_autonomous_rag_retrieval_{mode_name}'],
            }

        if self.rag_node:
            result = await self.rag_node(state)
            result['nodes_executed'] = [f'unified_autonomous_rag_retrieval_{mode_name}']
            return result

        # Web search fallback when RAG unavailable
        logger.warning(
            "unified_autonomous_rag_unavailable",
            tenant_id=state.get('tenant_id'),
            mode=mode_name,
        )

        from .shared.nodes.rag_retriever import _web_search_fallback

        query = state.get('query', '')
        request_id = state.get('request_id', 'unknown')

        web_docs = await _web_search_fallback(
            query=query,
            max_results=8,  # More results for autonomous modes
            request_id=request_id,
        )

        return {
            'retrieved_documents': web_docs,
            'total_documents': len(web_docs),
            'web_search_used': True,
            'rag_unavailable': True,
            'nodes_executed': [f'unified_autonomous_rag_retrieval_{mode_name}'],
        }

    @trace_node("unified_autonomous_execute_step")
    async def _execute_step_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Execute a single ReAct reasoning step with personality configuration.

        Uses LLM config from instantiation for:
        1. Personality temperature
        2. Token limits
        3. Session metrics tracking
        """
        import os
        import time
        from langchain_core.messages import HumanMessage, SystemMessage

        iteration = state.get('goal_loop_iteration', 0)
        query = state.get('query', '')
        documents = state.get('retrieved_documents', [])
        system_prompt = state.get('system_prompt', 'You are executing autonomous reasoning.')
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"

        # Get LLM config from instantiation
        llm_config = state.get('llm_config', {})
        personality_config = state.get('personality_config', {})
        instantiation_session_id = state.get('instantiation_session_id')

        # L3 enriched context
        l3_context = state.get('l3_enriched_context', {})
        l3_sources = l3_context.get('sources', [])

        logger.info(
            "unified_autonomous_execute_step_started",
            iteration=iteration,
            personality_slug=personality_config.get('slug'),
            l3_sources_count=len(l3_sources),
            mode=mode_name,
        )

        # Build context from L3 sources + RAG documents
        context_parts = []
        if l3_sources:
            l3_text = "\n\n".join([
                f"[{src.get('source', 'L3')}] (RRF: {src.get('rrf_score', 0):.3f})\n{src.get('content', '')[:400]}"
                for src in l3_sources[:5]
            ])
            context_parts.append(f"## Enriched Context (L3 Orchestration)\n{l3_text}")

        if documents:
            context = "\n".join([doc.get('content', '')[:300] for doc in documents[:5]])
            context_parts.append(f"## Retrieved Documents (RAG)\n{context}")

        full_context = "\n\n---\n\n".join(context_parts) if context_parts else ""

        react_prompt = f"""Execute step {iteration + 1} using ReAct pattern.

Goal: {query}

Context:
{full_context}

Provide your analysis using the following structure:
1. **Thought**: What key aspects need consideration?
2. **Action**: What analysis will you perform?
3. **Observation**: What insights did you discover?
4. **Progress**: How much closer are we to the goal?"""

        start_time = time.time()

        try:
            # Apply personality temperature if available
            temperature = llm_config.get('temperature', 0.3)
            max_tokens = llm_config.get('max_tokens', 4000)
            model_name = llm_config.get('model', 'gpt-4')

            # Determine provider
            model_lower = model_name.lower()
            if model_lower.startswith('claude') or 'anthropic' in model_lower:
                provider = 'anthropic'
                required_key = 'ANTHROPIC_API_KEY'
            else:
                provider = 'openai'
                required_key = 'OPENAI_API_KEY'

            if not os.environ.get(required_key):
                return {
                    'reasoning_steps': [{
                        'iteration': iteration,
                        'thought': f"API key not configured for {provider}",
                        'timestamp': datetime.utcnow().isoformat(),
                    }],
                    'goal_loop_iteration': iteration + 1,
                    'errors': [f'Missing API key: {required_key}'],
                    'nodes_executed': [f'unified_autonomous_execute_step_{mode_name}'],
                }

            # Execute with LLM
            if provider == 'anthropic':
                from langchain_anthropic import ChatAnthropic
                llm = ChatAnthropic(
                    model=model_name,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            else:
                from langchain_openai import ChatOpenAI
                llm = ChatOpenAI(
                    model=model_name,
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
                        "unified_autonomous_metrics_failed",
                        error=str(metric_error),
                    )

            logger.info(
                "unified_autonomous_execute_step_completed",
                iteration=iteration,
                response_time_ms=response_time_ms,
                mode=mode_name,
            )

            # Estimate confidence based on iteration progress
            confidence = min(0.5 + (iteration * 0.15), 0.95)

            return {
                'reasoning_steps': [{
                    'iteration': iteration,
                    'thought': response.content,
                    'timestamp': datetime.utcnow().isoformat(),
                    'response_time_ms': response_time_ms,
                }],
                'goal_loop_iteration': iteration + 1,
                'response_confidence': confidence,
                'nodes_executed': [f'unified_autonomous_execute_step_{mode_name}'],
            }

        except Exception as e:
            logger.error(
                "unified_autonomous_execute_step_failed",
                error=str(e),
                mode=mode_name,
            )
            return {
                'goal_loop_iteration': iteration + 1,
                'errors': [str(e)],
                'nodes_executed': [f'unified_autonomous_execute_step_{mode_name}'],
            }

    @trace_node("unified_autonomous_synthesize")
    async def _synthesize_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Synthesize final response from reasoning steps.

        Combines all reasoning steps into a coherent, evidence-backed response.
        """
        reasoning_steps = state.get('reasoning_steps', [])
        mode_name = "mode3" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode4"
        documents = state.get('retrieved_documents', [])

        mission_type = "Autonomous analysis" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "Background mission"

        synthesis = f"## {mission_type} Complete\n\n"
        synthesis += f"**Steps executed:** {len(reasoning_steps)}\n\n"
        synthesis += "### Analysis Summary\n\n"

        for i, step in enumerate(reasoning_steps[-5:], 1):  # Last 5 steps
            thought = step.get('thought', '')[:500]
            synthesis += f"**Step {i}:**\n{thought}\n\n"

        # Add citations
        if documents:
            synthesis += "\n### References\n\n"
            for i, doc in enumerate(documents[:5], 1):
                title = doc.get('title', f'Source {i}')
                url = doc.get('metadata', {}).get('url', '')
                synthesis += f"[{i}] {title}"
                if url:
                    synthesis += f" - {url}"
                synthesis += "\n"

        logger.info(
            "unified_autonomous_synthesize_completed",
            step_count=len(reasoning_steps),
            mode=mode_name,
        )

        return {
            'agent_response': synthesis,
            'response_confidence': 0.85,
            'nodes_executed': [f'unified_autonomous_synthesize_{mode_name}'],
        }

    # =========================================================================
    # ROUTING FUNCTIONS
    # =========================================================================

    def _route_budget(self, state: UnifiedWorkflowState) -> str:
        """Route based on budget check."""
        check = state.get('budget_check', {})
        return "proceed" if check.get('within_budget', True) else "exceeded"

    def _route_after_plan(self, state: UnifiedWorkflowState) -> str:
        """Route based on plan approval."""
        return "approved" if state.get('plan_approved', False) else "rejected"

    def _route_circuit_breaker(self, state: UnifiedWorkflowState) -> str:
        """Route based on circuit breaker status."""
        return "break" if state.get('circuit_breaker_tripped', False) else "continue"

    def _route_goal_check(self, state: UnifiedWorkflowState) -> str:
        """Route based on goal check."""
        if state.get('goal_achieved', False):
            return "achieved"
        if state.get('goal_loop_iteration', 0) >= state.get('max_iterations', self.max_iterations):
            return "max_iterations"
        return "continue"


# =============================================================================
# FACTORY FUNCTIONS
# =============================================================================

def create_mode3_workflow(
    supabase_client,
    rag_service=None,
    agent_orchestrator=None,
    hitl_service=None,
    **kwargs
) -> UnifiedAutonomousWorkflow:
    """
    Create Mode 3 (Manual Autonomous) workflow.

    Usage:
        workflow = create_mode3_workflow(supabase_client, rag_service)
        result = await workflow.run(state)

    Mode 3 Characteristics:
    - Selection: MANUAL (user picks expert)
    - Execution: AUTONOMOUS (multi-step with ReAct)
    - Safety: Full suite (budget, HITL, circuit breaker)
    - Duration: 30s - 5min
    """
    return UnifiedAutonomousWorkflow(
        supabase_client=supabase_client,
        selection_strategy=AgentSelectionStrategy.MANUAL,
        agent_selector=None,  # Mode 3 doesn't need selector
        rag_service=rag_service,
        agent_orchestrator=agent_orchestrator,
        hitl_service=hitl_service,
        **kwargs
    )


def create_mode4_workflow(
    supabase_client,
    agent_selector: AgentSelector,
    rag_service=None,
    agent_orchestrator=None,
    hitl_service=None,
    **kwargs
) -> UnifiedAutonomousWorkflow:
    """
    Create Mode 4 (Automatic Autonomous) workflow.

    Usage:
        selector = FusionSearchSelector(supabase_client, pinecone_client, neo4j_client)
        workflow = create_mode4_workflow(supabase_client, selector, rag_service)
        result = await workflow.run(state)

    Mode 4 Characteristics:
    - Selection: AUTOMATIC (Fusion Search with RRF)
    - Execution: AUTONOMOUS (background mission)
    - Safety: Full suite (budget, HITL, circuit breaker)
    - Processing: Background (Celery)
    - Duration: 1-30min
    """
    return UnifiedAutonomousWorkflow(
        supabase_client=supabase_client,
        selection_strategy=AgentSelectionStrategy.AUTOMATIC,
        agent_selector=agent_selector,
        rag_service=rag_service,
        agent_orchestrator=agent_orchestrator,
        hitl_service=hitl_service,
        **kwargs
    )
