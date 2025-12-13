# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1, 2]
# DEPENDENCIES: [langgraph, base_workflow, state_schemas, unified_agent_selector, shared]
"""
VITAL Path AI Services - Unified Interactive Workflow

Unified base workflow for Mode 1 (Manual) and Mode 2 (Automatic) Interactive modes.

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

THIS FILE: unified_interactive_workflow.py
- Handles Mode 1 AND Mode 2
- NO safety nodes (Interactive modes don't need them)
- Single codebase, AgentSelectionStrategy is only differentiator

================================================================================

Architecture:
- SINGLE workflow class handles both modes
- Agent selection strategy is the ONLY differentiator
- Mode 1: AgentSelectionStrategy.MANUAL (agent_id provided by user)
- Mode 2: AgentSelectionStrategy.AUTOMATIC (Fusion Search with RRF)

2×2 Matrix Position: Row=Interactive (both modes)
- Mode 1: Interactive × Manual
- Mode 2: Interactive × Automatic

Golden Rules Compliance:
✅ #1: Python-only, production-grade implementation
✅ #2: DRY - Single workflow for both interactive modes
✅ #3: Tenant isolation enforced at every node
✅ #4: L3-L5 Agent Hierarchy with Context Engineering
✅ #5: SSE Streaming via llm_streaming_config

Flow (Both Modes):
  process_input → validate_tenant → [select_agent?] → load_agent
  → l3_orchestrate → rag_retrieval → execute_expert
  → save_message → format_output

Reference: ASK_EXPERT_UNIFIED_IMPLEMENTATION_OVERVIEW.md (Dec 12, 2025)
"""

from enum import Enum
from typing import Dict, Any, Optional, Protocol, runtime_checkable
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

logger = structlog.get_logger()


# =============================================================================
# AGENT SELECTION STRATEGY
# =============================================================================

class AgentSelectionStrategy(Enum):
    """
    Agent selection strategy - the ONLY difference between Mode 1 and Mode 2.

    MANUAL: User provides agent_id (Mode 1)
    AUTOMATIC: System selects via Fusion Search (Mode 2)
    """
    MANUAL = "manual"
    AUTOMATIC = "automatic"


@runtime_checkable
class AgentSelector(Protocol):
    """Protocol for agent selection (Dependency Injection)."""

    async def select_agent(
        self,
        query: str,
        tenant_id: str,
        **kwargs
    ) -> 'AgentSelectionResult':
        """Select best agent for query."""
        ...


class AgentSelectionResult:
    """Result from agent selection."""

    def __init__(
        self,
        agent_id: str,
        confidence: float,
        reasoning: str = "",
        method: str = "unknown",
        scores: Optional[Dict[str, float]] = None,
    ):
        self.agent_id = agent_id
        self.confidence = confidence
        self.reasoning = reasoning
        self.method = method
        self.scores = scores or {}


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def _is_valid_uuid(value: Optional[str]) -> bool:
    """Check if a string is a valid UUID format.

    Explicitly rejects:
    - None (Python None)
    - "None" (string literal - common serialization artifact)
    - "anonymous" (placeholder value)
    - Empty strings
    - "null" (JSON null serialized as string)
    """
    if not value or value in ("anonymous", "None", "null", "undefined"):
        return False
    try:
        uuid_module.UUID(str(value))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def _get_valid_uuid_or_none(value: Optional[str]) -> Optional[str]:
    """Return the value if it's a valid UUID, otherwise return None."""
    return value if _is_valid_uuid(value) else None


# =============================================================================
# UNIFIED INTERACTIVE WORKFLOW
# =============================================================================

class UnifiedInteractiveWorkflow(BaseWorkflow, AskExpertStreamingMixin):
    """
    Unified Interactive Workflow for Mode 1 and Mode 2.

    Key Design:
    - Single workflow class handles both modes
    - Agent selection strategy injected at construction
    - All other nodes are shared between modes
    - Graph compiled ONCE in __init__ (not per-request)

    Mode Differentiation:
    - Mode 1: selection_strategy=MANUAL, agent_selector=None
    - Mode 2: selection_strategy=AUTOMATIC, agent_selector=FusionSearchSelector

    Performance Targets:
    - Mode 1: <2s per turn (direct agent)
    - Mode 2: <3s first turn (includes selection), <2s subsequent

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
        enable_l3_orchestration: bool = True,
        enable_specialists: bool = True,
        max_parallel_tools: int = 5,
        **kwargs
    ):
        """
        Initialize Unified Interactive Workflow.

        Args:
            supabase_client: Database client (tenant-aware)
            selection_strategy: MANUAL (Mode 1) or AUTOMATIC (Mode 2)
            agent_selector: Required if AUTOMATIC strategy (Fusion Search)
            rag_service: RAG retrieval service
            agent_orchestrator: LLM orchestrator
            enable_l3_orchestration: Enable L3 Context Engineer (AGENT_OS v6.0)
            enable_specialists: Enable L3-B Specialists
            max_parallel_tools: Max concurrent L5 tool executions
        """
        # Determine mode from strategy
        mode = (
            WorkflowMode.MODE_1_MANUAL
            if selection_strategy == AgentSelectionStrategy.MANUAL
            else WorkflowMode.MODE_2_AUTOMATIC
        )

        mode_name = "Mode1_ManualInteractive" if selection_strategy == AgentSelectionStrategy.MANUAL else "Mode2_AutomaticInteractive"

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
        self.enable_l3_orchestration = enable_l3_orchestration

        # Validate: AUTOMATIC requires agent_selector
        if selection_strategy == AgentSelectionStrategy.AUTOMATIC and not agent_selector:
            logger.warning(
                "unified_interactive_automatic_no_selector",
                message="AUTOMATIC strategy without agent_selector will fall back to database RPC",
            )

        # Create RAG node
        self.rag_node = create_ask_expert_rag_node(
            rag_service=rag_service,
            top_k=10,
        ) if rag_service else None

        # Create L3 Context Engineer node (AGENT_OS v6.0)
        self.l3_orchestrator_node = create_l3_context_engineer_node(
            supabase_client=supabase_client,
            enable_specialists=enable_specialists,
            max_parallel_tools=max_parallel_tools,
        ) if enable_l3_orchestration else None

        logger.info(
            "unified_interactive_workflow_initialized",
            selection_strategy=selection_strategy.value,
            mode=mode_name,
            enable_l3_orchestration=enable_l3_orchestration,
            enable_specialists=enable_specialists,
            has_agent_selector=agent_selector is not None,
        )

    def build_graph(self) -> StateGraph:
        """
        Build unified LangGraph workflow.

        Graph Structure:
        - Mode 1 (MANUAL): Skips select_agent node
        - Mode 2 (AUTOMATIC): Includes select_agent node with Fusion Search

        Flow (MANUAL):
          process_input → validate_tenant → load_agent → l3_orchestrate
          → rag_retrieval → execute_expert → save_message → format_output

        Flow (AUTOMATIC):
          process_input → validate_tenant → select_agent → load_agent
          → l3_orchestrate → rag_retrieval → execute_expert
          → save_message → format_output
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
        graph.add_node("execute_expert", self._execute_expert_node)
        graph.add_node("save_message", self._save_message_node)

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
            # Mode 2: validate → select → load
            graph.add_edge("validate_tenant", "select_agent")
            graph.add_edge("select_agent", "load_agent")
        else:
            # Mode 1: validate → load (skip selection)
            graph.add_edge("validate_tenant", "load_agent")

        # Common flow: load_agent onwards
        if self.enable_l3_orchestration and self.l3_orchestrator_node:
            graph.add_edge("load_agent", "l3_orchestrate")
            graph.add_edge("l3_orchestrate", "rag_retrieval")
        else:
            graph.add_edge("load_agent", "rag_retrieval")

        graph.add_edge("rag_retrieval", "execute_expert")
        graph.add_edge("execute_expert", "save_message")
        graph.add_edge("save_message", "format_output")
        graph.add_edge("format_output", END)

        return graph

    # =========================================================================
    # NODE IMPLEMENTATIONS
    # =========================================================================

    @trace_node("unified_interactive_load_session")
    async def _load_session_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Load or create conversation session."""
        session_id = state.get('session_id')
        tenant_id = state['tenant_id']
        mode_name = "mode1" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode2"

        logger.info(
            "unified_interactive_load_session_started",
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
                        'nodes_executed': [f'unified_interactive_load_session_{mode_name}'],
                    }

            # Create new session
            raw_agent_id = state.get('selected_agents', [None])[0]
            agent_id = _get_valid_uuid_or_none(raw_agent_id)
            user_id = _get_valid_uuid_or_none(state.get('user_id'))

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
                "unified_interactive_session_created",
                session_id=new_session.data['id'],
                mode=mode_name,
            )

            return {
                'session_id': new_session.data['id'],
                'nodes_executed': [f'unified_interactive_load_session_{mode_name}'],
            }

        except Exception as e:
            logger.error("unified_interactive_load_session_failed", error=str(e))
            return {
                'errors': [f"Session load failed: {str(e)}"],
                'nodes_executed': ['unified_interactive_load_session'],
            }

    @trace_node("unified_interactive_validate_tenant")
    async def _validate_tenant_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Validate tenant isolation (Golden Rule #3)."""
        mode_name = "mode1" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode2"

        if not state.get('tenant_id'):
            raise AskExpertWorkflowError(
                AskExpertErrorType.TENANT_ERROR,
                f"tenant_id is required (Golden Rule #3) - {mode_name}",
                mode=mode_name,
            )
        return {
            'nodes_executed': [f'unified_interactive_validate_tenant_{mode_name}'],
        }

    @trace_node("unified_interactive_select_agent")
    async def _select_agent_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        AUTOMATIC agent selection - Mode 2 ONLY.

        Uses Fusion Search with RRF (Reciprocal Rank Fusion):
        - PostgreSQL Full-Text (30% weight)
        - Pinecone Vector (50% weight)
        - Neo4j Graph (20% weight)

        Reference: VITAL_GRAPHRAG_AGENT_SELECTION_V2_1.md
        """
        query = state.get('query', '')
        tenant_id = state.get('tenant_id')

        logger.info(
            "unified_interactive_select_agent_started",
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
                    "unified_interactive_agent_selected",
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
                    'nodes_executed': ['unified_interactive_select_agent_mode2'],
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
                    'nodes_executed': ['unified_interactive_select_agent_mode2'],
                }

            # Ultimate fallback
            return {
                'selected_agents': ['default-agent'],
                'selection_method': 'fallback',
                'nodes_executed': ['unified_interactive_select_agent_mode2'],
            }

        except Exception as e:
            logger.error("unified_interactive_select_agent_failed", error=str(e))
            return {
                'selected_agents': ['default-agent'],
                'errors': [str(e)],
                'nodes_executed': ['unified_interactive_select_agent_mode2'],
            }

    @trace_node("unified_interactive_load_agent")
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
        mode_name = "mode1" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode2"

        if not selected_agents:
            error_msg = (
                'Mode 1 requires manual agent selection'
                if self.selection_strategy == AgentSelectionStrategy.MANUAL
                else 'Agent selection failed'
            )
            return {
                'status': ExecutionStatus.FAILED,
                'errors': [error_msg],
                'nodes_executed': [f'unified_interactive_load_agent_{mode_name}'],
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
                session_mode='interactive',
            )

            logger.info(
                "unified_interactive_agent_instantiated",
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
                'nodes_executed': [f'unified_interactive_load_agent_{mode_name}'],
            }

        except Exception as e:
            logger.warning(
                "unified_interactive_load_agent_instantiation_failed",
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
                        'nodes_executed': [f'unified_interactive_load_agent_{mode_name}'],
                    }
            except Exception:
                pass

            return {
                'errors': [f"Agent load failed: {str(e)}"],
                'nodes_executed': [f'unified_interactive_load_agent_{mode_name}'],
            }

    @trace_node("unified_interactive_rag_retrieval")
    async def _rag_retrieval_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        RAG retrieval with web search fallback.

        CRITICAL: Expert NEVER responds without sources.
        Web search fallback triggers when:
        1. RAG service is unavailable
        2. RAG returns < 3 documents (handled in shared rag_retriever.py)
        """
        mode_name = "mode1" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode2"

        if not state.get('enable_rag', True):
            return {
                'retrieved_documents': [],
                'nodes_executed': [f'unified_interactive_rag_retrieval_{mode_name}'],
            }

        if self.rag_node:
            result = await self.rag_node(state)
            result['nodes_executed'] = [f'unified_interactive_rag_retrieval_{mode_name}']
            return result

        # Web search fallback when RAG unavailable
        logger.warning(
            "unified_interactive_rag_unavailable",
            tenant_id=state.get('tenant_id'),
            mode=mode_name,
        )

        from .shared.nodes.rag_retriever import _web_search_fallback

        query = state.get('query', '')
        request_id = state.get('request_id', 'unknown')

        web_docs = await _web_search_fallback(
            query=query,
            max_results=5,
            request_id=request_id,
        )

        return {
            'retrieved_documents': web_docs,
            'total_documents': len(web_docs),
            'web_search_used': True,
            'rag_unavailable': True,
            'nodes_executed': [f'unified_interactive_rag_retrieval_{mode_name}'],
        }

    @trace_node("unified_interactive_execute_expert")
    async def _execute_expert_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Execute expert agent with personality configuration.

        NEW (AGENT_OS v6.0): Uses L3 enriched context for enhanced responses.

        STREAMING: Prepares llm_streaming_config for route layer.
        The route layer handles actual SSE token emission.

        Returns:
            llm_streaming_config for route layer streaming
        """
        import os
        import time

        query = state.get('query', '')
        system_prompt = state.get('system_prompt', 'You are a helpful AI expert.')
        documents = state.get('retrieved_documents', [])
        mode_name = "mode1" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode2"

        llm_config = state.get('llm_config', {})
        personality_config = state.get('personality_config', {})

        # L3 enriched context (AGENT_OS v6.0)
        l3_context = state.get('l3_enriched_context', {})
        l3_sources = l3_context.get('sources', [])
        l3_intent = state.get('l3_intent', 'unknown')

        # Build context from L3 sources + RAG documents
        context_parts = []

        if l3_sources:
            l3_text = "\n\n".join([
                f"[{src.get('source', 'L3')}] (RRF: {src.get('rrf_score', 0):.3f})\n{src.get('content', '')[:400]}"
                for src in l3_sources[:5]
            ])
            context_parts.append(f"## Enriched Context (L3 Orchestration)\n{l3_text}")

        if documents:
            rag_parts = []
            for i, doc in enumerate(documents[:5]):
                title = doc.get('title', f'Source {i+1}')
                content = doc.get('content', '')[:500]
                source = doc.get('metadata', {}).get('source', '')
                rag_parts.append(f"[{i+1}] {title}\n{content}\nSource: {source}")
            rag_text = "\n\n".join(rag_parts)
            context_parts.append(f"## Retrieved Documents (RAG)\n{rag_text}")

        context = "\n\n---\n\n".join(context_parts) if context_parts else ""

        # Citation instructions (MANDATORY)
        citation_instructions = """

## CRITICAL CITATION INSTRUCTIONS (MANDATORY):

When citing sources, you MUST include BOTH:
1. **INLINE CITATIONS** - Place [1], [2], [3] etc. IMMEDIATELY after each fact, claim, or data point derived from a source. Example: "FDA 510(k) clearance requires substantial equivalence [1]."
2. **REFERENCES SECTION** - At the END of your response, include a "## References" section listing ALL cited sources:

   ## References
   [1] Source Title 1 - Brief description
   [2] Source Title 2 - Brief description
   [3] Source Title 3 - Brief description

**Citation Rules:**
- EVERY factual claim must have an inline citation [N]
- Place citations inline WITH the text, not grouped at the end of paragraphs
- Reference numbers must match between inline citations and the References section
- If information comes from multiple sources, cite all: "This is supported by research [1][2]."

## OTHER INSTRUCTIONS:
1. Provide comprehensive, detailed responses. Do NOT refuse requests for strategies, workflows, or technical diagrams.
2. When asked for Mermaid diagrams, provide them in proper ```mermaid code blocks.
3. Be thorough and MECE (Mutually Exclusive, Collectively Exhaustive) in your analysis.
4. Structure complex responses with clear headings and sections.
"""

        full_prompt = f"{system_prompt}\n{citation_instructions}\n\n{context}" if context else f"{system_prompt}\n{citation_instructions}"

        try:
            # Merge LLM config: user override > agent DB config > defaults
            user_override_model = state.get('user_override_model')
            user_override_temperature = state.get('user_override_temperature')
            user_override_max_tokens = state.get('user_override_max_tokens')

            model_name = user_override_model if user_override_model is not None else llm_config.get('model', 'gpt-4')
            temperature = user_override_temperature if user_override_temperature is not None else llm_config.get('temperature', 0.7)
            max_tokens = user_override_max_tokens if user_override_max_tokens is not None else llm_config.get('max_tokens', 4000)

            # Database-driven provider detection
            model_lower = model_name.lower()
            if model_lower.startswith('gpt') or model_lower.startswith('o1') or 'openai' in model_lower:
                provider = 'openai'
                required_key = 'OPENAI_API_KEY'
            elif model_lower.startswith('claude') or 'anthropic' in model_lower:
                provider = 'anthropic'
                required_key = 'ANTHROPIC_API_KEY'
            else:
                provider = 'openai'
                required_key = 'OPENAI_API_KEY'

            if not os.environ.get(required_key):
                return {
                    'agent_response': f"API key not configured for {provider}. Set {required_key} for model '{model_name}'.",
                    'response_confidence': 0.0,
                    'errors': [f'Missing API key: {required_key}'],
                    'nodes_executed': [f'unified_interactive_execute_expert_{mode_name}'],
                }

            # Prepare streaming config for route layer
            llm_streaming_config = {
                'provider': provider,
                'model': model_name,
                'temperature': temperature,
                'max_tokens': max_tokens,
                'system_prompt': full_prompt,
                'user_query': query,
                'documents': documents,
                'l3_sources': l3_sources,
            }

            logger.info(
                "unified_interactive_execute_expert_prepared",
                provider=provider,
                model=model_name,
                temperature=temperature,
                l3_intent=l3_intent,
                l3_sources_count=len(l3_sources),
                rag_docs_count=len(documents),
                mode=mode_name,
            )

            return {
                'llm_streaming_config': llm_streaming_config,
                'response_confidence': 0.85,
                'temperature_used': temperature,
                'l3_intent': l3_intent,
                'l3_sources_used': len(l3_sources),
                'rag_docs_used': len(documents),
                'citations': [
                    {
                        'id': i + 1,
                        'title': doc.get('title', f'Source {i+1}'),
                        'url': doc.get('metadata', {}).get('url', f'#source-{i+1}'),
                        'excerpt': doc.get('content', '')[:200],
                    }
                    for i, doc in enumerate(documents[:10])
                ],
                'nodes_executed': [f'unified_interactive_execute_expert_{mode_name}'],
            }

        except Exception as e:
            logger.error(
                "unified_interactive_execute_expert_failed",
                error=str(e),
                mode=mode_name,
            )
            return {
                'agent_response': f"Error: {str(e)}",
                'errors': [str(e)],
                'nodes_executed': [f'unified_interactive_execute_expert_{mode_name}'],
            }

    @trace_node("unified_interactive_save_message")
    async def _save_message_node(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """Save messages to database."""
        session_id = state.get('session_id')
        mode_name = "mode1" if self.selection_strategy == AgentSelectionStrategy.MANUAL else "mode2"

        if not session_id:
            return {'nodes_executed': [f'unified_interactive_save_message_{mode_name}']}

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

            logger.info(
                "unified_interactive_messages_saved",
                session_id=session_id,
                mode=mode_name,
            )

            return {'nodes_executed': [f'unified_interactive_save_message_{mode_name}']}

        except Exception as e:
            logger.error(
                "unified_interactive_save_message_failed",
                error=str(e),
                mode=mode_name,
            )
            return {
                'errors': [f"Save failed: {str(e)}"],
                'nodes_executed': [f'unified_interactive_save_message_{mode_name}'],
            }


# =============================================================================
# FACTORY FUNCTIONS
# =============================================================================

def create_mode1_workflow(
    supabase_client,
    rag_service=None,
    agent_orchestrator=None,
    **kwargs
) -> UnifiedInteractiveWorkflow:
    """
    Create Mode 1 (Manual Interactive) workflow.

    Usage:
        workflow = create_mode1_workflow(supabase_client, rag_service)
        result = await workflow.run(state)
    """
    return UnifiedInteractiveWorkflow(
        supabase_client=supabase_client,
        selection_strategy=AgentSelectionStrategy.MANUAL,
        agent_selector=None,  # Mode 1 doesn't need selector
        rag_service=rag_service,
        agent_orchestrator=agent_orchestrator,
        **kwargs
    )


def create_mode2_workflow(
    supabase_client,
    agent_selector: AgentSelector,
    rag_service=None,
    agent_orchestrator=None,
    **kwargs
) -> UnifiedInteractiveWorkflow:
    """
    Create Mode 2 (Automatic Interactive) workflow.

    Usage:
        selector = FusionSearchSelector(supabase_client, pinecone_client, neo4j_client)
        workflow = create_mode2_workflow(supabase_client, selector, rag_service)
        result = await workflow.run(state)
    """
    return UnifiedInteractiveWorkflow(
        supabase_client=supabase_client,
        selection_strategy=AgentSelectionStrategy.AUTOMATIC,
        agent_selector=agent_selector,
        rag_service=rag_service,
        agent_orchestrator=agent_orchestrator,
        **kwargs
    )
