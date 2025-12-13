# PRODUCTION_TAG: PRODUCTION_READY
# LAST_VERIFIED: 2025-12-13
# MODES_SUPPORTED: [1]
# DEPENDENCIES: [langgraph, base_workflow, state_schemas, observability, shared.*]
"""
VITAL Path AI Services - Ask Expert Mode 1 Workflow

Mode 1: Manual Interactive (Expert Chat)
- User MANUALLY selects an agent
- Interactive multi-turn conversation
- Single expert execution
- Target latency: 3-5s per turn

Architecture (AGENT_OS_GOLD_STANDARD v6.0):
- L3-A Context Engineer: Orchestrates parallel tool execution
- L4 Workers: Evidence grading, citation building
- L5 Tools: Literature search, clinical trials, regulatory, etc.

Flow:
  process_input → load_session → validate_tenant → load_agent
  → l3_orchestrate → rag_retrieval → execute_expert
  → save_message → format_output

Naming Convention:
- File: ask_expert_mode1_workflow.py
- Class: AskExpertMode1Workflow
- Nodes: ask_expert_mode1_{node_name}
- Logs: ask_expert_mode1_{action}

2×2 Matrix Position: Row=Interactive, Col=Manual
"""

from typing import Dict, Any, Optional
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


def _is_valid_uuid(value: Optional[str]) -> bool:
    """Check if a string is a valid UUID format."""
    if not value or value == "anonymous":
        return False
    try:
        uuid_module.UUID(str(value))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def _get_valid_uuid_or_none(value: Optional[str]) -> Optional[str]:
    """Return the value if it's a valid UUID, otherwise return None."""
    return value if _is_valid_uuid(value) else None


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
        enable_l3_orchestration: bool = True,
        enable_specialists: bool = True,
        max_parallel_tools: int = 5,
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
        self.enable_l3_orchestration = enable_l3_orchestration

        # Create RAG node with proper naming
        self.rag_node = create_ask_expert_rag_node(
            rag_service=rag_service,
            top_k=10,
        ) if rag_service else None

        # NEW: Create L3 Context Engineer node (AGENT_OS v6.0)
        # The L3-A Context Engineer orchestrates parallel L5 tools
        # and can invoke L3-B Specialists for deep domain expertise
        self.l3_orchestrator_node = create_l3_context_engineer_node(
            supabase_client=supabase_client,
            enable_specialists=enable_specialists,
            max_parallel_tools=max_parallel_tools,
        ) if enable_l3_orchestration else None

        logger.info(
            "ask_expert_mode1_workflow_initialized",
            enable_l3_orchestration=enable_l3_orchestration,
            enable_specialists=enable_specialists,
            max_parallel_tools=max_parallel_tools,
        )
    
    def build_graph(self) -> StateGraph:
        """
        Build Mode 1 LangGraph workflow.

        NEW Architecture (AGENT_OS v6.0):
        - L3 Context Engineer node inserted between load_agent and rag_retrieval
        - L3 orchestrates parallel L5 tools for context enrichment
        - RAG retrieval enhanced with L3 context

        Flow:
          process_input → load_session → validate_tenant → load_agent
          → l3_orchestrate (NEW) → rag_retrieval → execute_expert
          → save_message → format_output
        """
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

        # NEW: L3 Context Engineer node (AGENT_OS v6.0)
        # Orchestrates parallel L5 tools before RAG retrieval
        if self.enable_l3_orchestration and self.l3_orchestrator_node:
            graph.add_node("l3_orchestrate", self.l3_orchestrator_node)

        # Flow with L3 orchestration
        graph.set_entry_point("process_input")
        graph.add_edge("process_input", "load_session")
        graph.add_edge("load_session", "validate_tenant")
        graph.add_edge("validate_tenant", "load_agent")

        # Insert L3 Context Engineer between load_agent and rag_retrieval
        if self.enable_l3_orchestration and self.l3_orchestrator_node:
            graph.add_edge("load_agent", "l3_orchestrate")
            graph.add_edge("l3_orchestrate", "rag_retrieval")
        else:
            # Fallback: Direct connection (legacy behavior)
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
            # Both agent_id and user_id are UUID columns in ask_expert_sessions table
            # Validate both to prevent "invalid input syntax for type uuid" errors
            raw_agent_id = state.get('selected_agents', [None])[0]
            agent_id = _get_valid_uuid_or_none(raw_agent_id)
            user_id = _get_valid_uuid_or_none(state.get('user_id'))

            # Log validation for debugging
            logger.debug(
                "ask_expert_mode1_session_ids_validated",
                raw_agent_id=raw_agent_id,
                validated_agent_id=agent_id,
                raw_user_id=state.get('user_id'),
                validated_user_id=user_id,
            )

            new_session = self.supabase.table('ask_expert_sessions') \
                .insert({
                    'tenant_id': tenant_id,
                    'user_id': user_id,
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
                        base_model=agent.get('base_model'),
                    )
                    # Include llm_config from agent's database fields for streaming
                    return {
                        'current_agent_id': agent_id,
                        'current_agent_type': agent.get('name'),
                        'system_prompt': agent.get('system_prompt', ''),
                        'llm_config': {
                            'model': agent.get('base_model', 'gpt-4'),
                            'temperature': agent.get('temperature', 0.7),
                            'max_tokens': agent.get('max_tokens', 4000),
                        },
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
        """
        RAG retrieval for Mode 1 with web search fallback.

        CRITICAL FIX (Dec 2025): Web search fallback triggers when:
        1. RAG service is unavailable (rag_node is None)
        2. RAG returns < 3 documents (handled in shared rag_retriever.py)

        This ensures expert NEVER responds without sources.
        """
        if not state.get('enable_rag', True):
            return {
                'retrieved_documents': [],
                'nodes_executed': ['ask_expert_mode1_rag_retrieval'],
            }
        
        if self.rag_node:
            result = await self.rag_node(state)
            result['nodes_executed'] = ['ask_expert_mode1_rag_retrieval']
            return result
        
        # CRITICAL FIX: When RAG service unavailable, go directly to web search
        logger.warning(
            "ask_expert_mode1_rag_unavailable_using_web_search",
            tenant_id=state.get('tenant_id'),
            request_id=state.get('request_id'),
        )

        # Import and use web search fallback directly
        from .shared.nodes.rag_retriever import _web_search_fallback

        query = state.get('query', '')
        request_id = state.get('request_id', 'unknown')

        web_docs = await _web_search_fallback(
            query=query,
            max_results=5,
            request_id=request_id,
        )

        logger.info(
            "ask_expert_mode1_web_search_only",
            request_id=request_id,
            web_docs_count=len(web_docs),
        )

        return {
            'retrieved_documents': web_docs,
            'total_documents': len(web_docs),
            'web_search_used': True,
            'rag_unavailable': True,
            'nodes_executed': ['ask_expert_mode1_rag_retrieval'],
        }

    @trace_node("ask_expert_mode1_execute_expert")
    async def _ask_expert_mode1_execute_expert(self, state: UnifiedWorkflowState) -> Dict[str, Any]:
        """
        Execute expert agent with personality configuration.

        NEW (AGENT_OS v6.0): Uses L3 enriched context for enhanced responses:
        1. L3 Context Engineer provides fused results from parallel tools
        2. RAG documents supplement L3 context
        3. Combined context enables evidence-based responses

        STREAMING: This node prepares the LLM config for streaming execution.
        The actual streaming happens in the route layer via stream_llm_response().

        Reference: AGENT_OS_GOLD_STANDARD.md v6.0
        """
        from langchain_core.messages import HumanMessage, SystemMessage
        import time
        import os

        query = state.get('query', '')
        system_prompt = state.get('system_prompt', 'You are a helpful AI expert.')
        documents = state.get('retrieved_documents', [])

        # Get LLM config from instantiation
        llm_config = state.get('llm_config', {})
        personality_config = state.get('personality_config', {})
        instantiation_session_id = state.get('instantiation_session_id')

        # NEW: Get L3 enriched context (AGENT_OS v6.0)
        l3_context = state.get('l3_enriched_context', {})
        l3_sources = l3_context.get('sources', [])
        l3_intent = state.get('l3_intent', 'unknown')

        # Build context from L3 sources (prioritized) + RAG documents (supplemental)
        context_parts = []

        # L3 enriched sources (from parallel tool execution)
        if l3_sources:
            l3_text = "\n\n".join([
                f"[{src.get('source', 'L3')}] (RRF: {src.get('rrf_score', 0):.3f})\n{src.get('content', '')[:400]}"
                for src in l3_sources[:5]
            ])
            context_parts.append(f"## Enriched Context (L3 Orchestration)\n{l3_text}")

        # RAG documents (supplemental) - include source metadata for citations
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

        # Enhanced system prompt with citation instructions
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

        start_time = time.time()

        try:
            # Apply LLM config with user override support (database-driven)
            # Priority: user explicit override > agent config from Supabase > defaults
            #
            # User overrides only apply when user explicitly provides values in the request.
            # When None, agent's database config (base_model, temperature, max_tokens) is used.
            # This ensures agent personality (linked to temperature) is preserved by default.
            user_override_model = state.get('user_override_model')  # None if not provided
            user_override_temperature = state.get('user_override_temperature')
            user_override_max_tokens = state.get('user_override_max_tokens')

            # Merge: user override > agent DB config > defaults
            model_name = user_override_model if user_override_model is not None else llm_config.get('model', 'gpt-4')
            temperature = user_override_temperature if user_override_temperature is not None else llm_config.get('temperature', 0.7)
            max_tokens = user_override_max_tokens if user_override_max_tokens is not None else llm_config.get('max_tokens', 4000)

            logger.info(
                "llm_config_merged",
                user_override_model=user_override_model,
                user_override_temperature=user_override_temperature,
                user_override_max_tokens=user_override_max_tokens,
                agent_model=llm_config.get('model'),
                agent_temperature=llm_config.get('temperature'),
                final_model=model_name,
                final_temperature=temperature,
                final_max_tokens=max_tokens,
            )

            # Database-driven provider detection:
            # 1. Infer provider from model name (not from which API key exists)
            # 2. Model names like gpt-*, o1-* → OpenAI
            # 3. Model names like claude-* → Anthropic
            model_lower = model_name.lower()
            if model_lower.startswith('gpt') or model_lower.startswith('o1') or 'openai' in model_lower:
                provider = 'openai'
                required_key = 'OPENAI_API_KEY'
            elif model_lower.startswith('claude') or 'anthropic' in model_lower:
                provider = 'anthropic'
                required_key = 'ANTHROPIC_API_KEY'
            else:
                # Default to OpenAI for unknown models
                provider = 'openai'
                required_key = 'OPENAI_API_KEY'

            # Verify the required API key exists in environment
            if not os.environ.get(required_key):
                return {
                    'agent_response': f"API key not configured for {provider}. Set {required_key} in .env for model '{model_name}'.",
                    'response_confidence': 0.0,
                    'errors': [f'Missing API key: {required_key} required for model {model_name}'],
                    'nodes_executed': ['ask_expert_mode1_execute_expert'],
                }

            # Store LLM config for streaming execution in route layer
            # The route will use this to stream tokens in real-time
            llm_streaming_config = {
                'provider': provider,
                'model': model_name,  # Use exact model from database
                'temperature': temperature,
                'max_tokens': max_tokens,
                'system_prompt': full_prompt,
                'user_query': query,
                'documents': documents,
                'l3_sources': l3_sources,
            }

            logger.info(
                "ask_expert_mode1_execute_expert_prepared",
                provider=provider,
                model=model_name,
                temperature=temperature,
                l3_intent=l3_intent,
                l3_sources_count=len(l3_sources),
                rag_docs_count=len(documents),
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
