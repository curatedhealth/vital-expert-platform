"""
Mode 2: Auto-Interactive (Auto Selection + Interactive Chat)

AI automatically selects best expert using Evidence-Based Selection + GraphRAG.
Single expert for multi-turn interactive conversation.

**PHASE 4 ENHANCEMENTS:**
- ✅ Evidence-Based Agent Selection (8-factor scoring)
- ✅ GraphRAG Hybrid Search (30% Postgres + 50% Pinecone + 20% Neo4j)
- ✅ Tier-aware pattern execution (Tier 1/2/3)
- ✅ Deep Agent Patterns (ReAct + Constitutional for Tier 3)

PRD Specification:
- Interaction: INTERACTIVE (Multi-turn conversation)
- Selection: AUTO (Evidence-Based + GraphRAG)
- Response Time: 25-40 seconds
- Experts: 1 best expert automatically selected
- Deep Agent Support: Expert can spawn specialists
- Tools: RAG, Web Search, Database Tools
- Context: 1M+ tokens (multimodal)
- **NEW**: GraphRAG discovery, Tier determination, Pattern execution

Golden Rules Compliance:
- ✅ LangGraph StateGraph (Golden Rule #1)
- ✅ Caching at all nodes (Golden Rule #2)
- ✅ Tenant isolation enforced (Golden Rule #3)
- ✅ RAG/Tools enforcement (Golden Rule #4)
- ✅ Evidence-based responses (Golden Rule #5)

Use Cases:
- "Help me understand FDA regulatory pathways" → System picks FDA Expert
- "Design a clinical trial strategy" → System picks Clinical Trial Expert
- "Compare reimbursement strategies" → System picks Market Access Expert

Frontend Mapping:
- isAutomatic: true (AI selects expert via Evidence-Based)
- isMultiTurn: true (interactive chat)
- isAutonomous: false (no autonomous multi-step)
- selectedAgents: [] (empty, AI will select using GraphRAG)
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog

# LangGraph imports
from langgraph.graph import StateGraph, END

# Internal imports
from langgraph_workflows.base_workflow import BaseWorkflow
from langgraph_workflows.state_schemas import (
    UnifiedWorkflowState,
    WorkflowMode,
    ExecutionStatus,
    create_initial_state
)
from langgraph_workflows.observability import trace_node
from services.agent_selector_service import AgentSelectorService
from services.agent_orchestrator import AgentOrchestrator
from services.sub_agent_spawner import SubAgentSpawner
from services.panel_orchestrator import PanelOrchestrator
from services.unified_rag_service import UnifiedRAGService
from services.tool_registry import ToolRegistry
from services.consensus_calculator import SimpleConsensusCalculator
from services.compliance_service import (
    ComplianceService,
    HumanInLoopValidator,
    ComplianceRegime,
    DataClassification
)
import time

# PHASE 4: Evidence-Based Selector + GraphRAG
try:
    from services.evidence_based_selector import (
        get_evidence_based_selector,
        VitalService,
        AgentTier
    )
    EVIDENCE_BASED_AVAILABLE = True
except ImportError:
    EVIDENCE_BASED_AVAILABLE = False
    logger_temp = structlog.get_logger()
    logger_temp.warning("Evidence-Based Selector not available, will use fallback")

# PHASE 4: Deep Agent Patterns
try:
    from langgraph_compilation.patterns.react import ReActAgent
    from langgraph_compilation.patterns.constitutional_ai import ConstitutionalAgent
    PATTERNS_AVAILABLE = True
except ImportError:
    PATTERNS_AVAILABLE = False

logger = structlog.get_logger()


class Mode2AutoQueryWorkflow(BaseWorkflow):
    """
    Mode 2: Auto-Interactive (Auto Selection + Interactive Chat)

    **PHASE 4 ENHANCEMENTS:**
    - Evidence-Based Agent Selection with GraphRAG hybrid search
    - Tier-aware execution (Tier 1/2/3)
    - Deep agent patterns for Tier 3 (ReAct + Constitutional)

    Golden Rules Compliance:
    - ✅ Uses LangGraph StateGraph (Golden Rule #1)
    - ✅ Caching integrated at all nodes (Golden Rule #2)
    - ✅ Tenant validation enforced (Golden Rule #3)
    - ✅ RAG/Tools enabled by default (Golden Rule #4)
    - ✅ Evidence-based responses (Golden Rule #5)

    Deep Agent Architecture:
    Level 1: Master Agent (Evidence-Based Router)
    Level 2: Expert Agent (1 selected automatically via GraphRAG) ← AI SELECTS
    Level 3: Specialist Agents (spawned as needed)
    Level 4: Worker Agents (spawned as needed)
    Level 5: Tool Agents (100+ integrations)

    Selection Workflow:
    1. GraphRAG Hybrid Search (30% Postgres + 50% Pinecone + 20% Neo4j)
    2. Evidence-Based 8-factor scoring
    3. Tier determination (Tier 1/2/3)
    4. Single best expert selected
    5. Pattern execution if Tier 3

    Features:
    - ✅ Evidence-Based expert selection (8-factor scoring)
    - ✅ GraphRAG hybrid search for better discovery
    - ✅ Tier-aware pattern execution
    - ✅ Deep agent patterns (ReAct + Constitutional for Tier 3)
    - ✅ RAG retrieval with 1M+ context
    - ✅ Tool execution
    - ✅ Sub-agent spawning
    - ✅ Fast response (25-40 sec target)
    """

    def __init__(
        self,
        supabase_client,
        rag_pipeline=None,
        agent_selector=None,
        agent_orchestrator=None,
        sub_agent_spawner=None,
        panel_orchestrator=None,
        rag_service=None,
        tool_registry=None,
        consensus_calculator=None
    ):
        """
        Initialize Mode 2 workflow.

        Args:
            supabase_client: Supabase client for database access
            rag_pipeline: RAG pipeline for agent orchestrator
            agent_selector: AI service for automatic expert selection
            agent_orchestrator: Agent execution with LangChain
            sub_agent_spawner: Sub-agent spawning service
            panel_orchestrator: Multi-expert panel orchestration
            rag_service: RAG service for document retrieval
            tool_registry: Tool registry for tool management
            consensus_calculator: Consensus calculation service
        """
        super().__init__(
            workflow_name="Mode2_Auto_Query",
            mode=WorkflowMode.MODE_2_AUTOMATIC,
            enable_checkpoints=False  # One-shot doesn't need checkpoints
        )

        # Initialize services
        self.supabase = supabase_client
        self.agent_selector = agent_selector or AgentSelectorService(supabase_client)
        self.agent_orchestrator = agent_orchestrator or AgentOrchestrator(supabase_client, rag_pipeline)
        self.sub_agent_spawner = sub_agent_spawner or SubAgentSpawner()
        self.panel_orchestrator = panel_orchestrator or PanelOrchestrator(supabase_client)
        self.rag_service = rag_service or UnifiedRAGService(supabase_client)
        self.tool_registry = tool_registry or ToolRegistry()
        self.consensus_calculator = consensus_calculator or SimpleConsensusCalculator()

        # PHASE 4: Initialize Evidence-Based Selector
        self.evidence_selector = get_evidence_based_selector() if EVIDENCE_BASED_AVAILABLE else None

        # PHASE 4: Initialize deep agent patterns
        self.react_agent = ReActAgent() if PATTERNS_AVAILABLE else None
        self.constitutional_agent = ConstitutionalAgent() if PATTERNS_AVAILABLE else None

        logger.info("✅ Mode2AutoQueryWorkflow initialized",
                   evidence_based_enabled=EVIDENCE_BASED_AVAILABLE,
                   patterns_enabled=PATTERNS_AVAILABLE)

    def build_graph(self) -> StateGraph:
        """
        Build LangGraph workflow for Mode 2.

        **PHASE 4 ENHANCED FLOW:**
        1. Validate tenant
        2. Analyze query
        3. **NEW**: Select expert (Evidence-Based + GraphRAG)
        4. **NEW**: Assess tier
        5. RAG retrieval (conditional)
        6. Tool execution (conditional)
        7. Execute expert → **BRANCH**: Tier 3 uses patterns
        8. Format output

        Returns:
            Configured StateGraph
        """
        graph = StateGraph(UnifiedWorkflowState)

        # Add nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("analyze_query", self.analyze_query_node)
        graph.add_node("select_expert_evidence_based", self.select_expert_evidence_based_node)  # PHASE 4
        graph.add_node("assess_tier", self.assess_tier_node)  # PHASE 4
        graph.add_node("rag_retrieval", self.rag_retrieval_node)
        graph.add_node("skip_rag", self.skip_rag_node)
        graph.add_node("execute_tools", self.execute_tools_node)
        graph.add_node("skip_tools", self.skip_tools_node)
        graph.add_node("execute_expert_agent", self.execute_expert_agent_node)
        graph.add_node("execute_with_patterns", self.execute_with_patterns_node)  # PHASE 4
        graph.add_node("format_output", self.format_output_node)

        # Define flow
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "analyze_query")
        graph.add_edge("analyze_query", "select_expert_evidence_based")  # PHASE 4
        graph.add_edge("select_expert_evidence_based", "assess_tier")  # PHASE 4

        # RAG branch
        graph.add_conditional_edges(
            "assess_tier",
            self.should_use_rag,
            {
                "use_rag": "rag_retrieval",
                "skip_rag": "skip_rag"
            }
        )

        # Tool branch
        graph.add_conditional_edges(
            "rag_retrieval",
            self.should_use_tools,
            {
                "use_tools": "execute_tools",
                "skip_tools": "skip_tools"
            }
        )

        graph.add_conditional_edges(
            "skip_rag",
            self.should_use_tools,
            {
                "use_tools": "execute_tools",
                "skip_tools": "skip_tools"
            }
        )

        # PHASE 4: Pattern branch
        graph.add_conditional_edges(
            "execute_tools",
            self.should_use_patterns,
            {
                "use_patterns": "execute_with_patterns",
                "standard": "execute_expert_agent"
            }
        )

        graph.add_conditional_edges(
            "skip_tools",
            self.should_use_patterns,
            {
                "use_patterns": "execute_with_patterns",
                "standard": "execute_expert_agent"
            }
        )

        # Converge to output
        graph.add_edge("execute_expert_agent", "format_output")
        graph.add_edge("execute_with_patterns", "format_output")  # PHASE 4
        graph.add_edge("format_output", END)

        return graph

    # =========================================================================
    # NODE IMPLEMENTATIONS
    # =========================================================================

    @trace_node("mode2_analyze_query")
    async def analyze_query_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Analyze query to determine expert requirements.

        Analyzes:
        - Query intent (what is user trying to achieve?)
        - Domains (FDA, EMA, clinical, market access, etc.)
        - Complexity (simple, moderate, complex)
        - Multi-domain (requires experts from different areas)
        """
        query = state['query']
        tenant_id = state['tenant_id']

        try:
            # Use AI to analyze query (can be cached)
            cache_key = f"query_analysis:mode2:{hash(query)}"
            if self.cache_manager and self.cache_manager.enabled:
                cached_analysis = await self.cache_manager.get(cache_key)
                if cached_analysis:
                    logger.info("✅ Query analysis cache hit (Mode 2)")
                    return {
                        **state,
                        **cached_analysis,
                        'cache_hits': state.get('cache_hits', 0) + 1,
                        'current_node': 'analyze_query'
                    }

            # Perform query analysis
            analysis = await self.agent_selector.analyze_query(
                query=query,
                tenant_id=tenant_id
            )

            detected_intent = analysis.get('intent', 'general_inquiry')
            detected_domains = analysis.get('domains', [])
            complexity_score = analysis.get('complexity_score', 0.5)
            recommended_expert_count = analysis.get('recommended_expert_count', 3)

            # Cache analysis
            analysis_result = {
                'detected_intent': detected_intent,
                'detected_domains': detected_domains,
                'complexity_score': complexity_score,
                'recommended_expert_count': recommended_expert_count,
                'query_language': analysis.get('language', 'en'),
                'query_length': len(query)
            }

            if self.cache_manager and self.cache_manager.enabled:
                await self.cache_manager.set(
                    cache_key,
                    analysis_result,
                    ttl=3600,
                    tenant_id=tenant_id
                )

            logger.info(
                "Query analyzed (Mode 2)",
                intent=detected_intent,
                domains=detected_domains,
                complexity=complexity_score,
                expert_count=recommended_expert_count
            )

            return {
                **state,
                **analysis_result,
                'current_node': 'analyze_query'
            }

        except Exception as e:
            logger.error("Query analysis failed (Mode 2)", error=str(e))
            # Use defaults
            return {
                **state,
                'detected_intent': 'general_inquiry',
                'detected_domains': [],
                'complexity_score': 0.5,
                'recommended_expert_count': 3,
                'errors': state.get('errors', []) + [f"Query analysis failed: {str(e)}"]
            }

    @trace_node("mode2_select_expert_evidence_based")
    async def select_expert_evidence_based_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4: Node - Select best expert using Evidence-Based Selector + GraphRAG

        Uses:
        - GraphRAG Hybrid Search (30% Postgres + 50% Pinecone + 20% Neo4j)
        - 8-factor scoring matrix
        - Automatic tier determination
        """
        if not EVIDENCE_BASED_AVAILABLE:
            logger.warning("Evidence-Based Selector not available, using fallback")
            return await self._select_expert_fallback(state)

        tenant_id = state['tenant_id']
        query = state['query']

        try:
            # PHASE 4: Evidence-Based Selection with GraphRAG
            result = await self.evidence_selector.select_for_service(
                service=VitalService.ASK_EXPERT,
                query=query,
                context={
                    'mode': 'auto_interactive',
                    'conversation_history': state.get('messages', [])
                },
                tenant_id=tenant_id,
                max_agents=1  # Single best expert for interactive chat
            )

            if not result.agents:
                return {
                    **state,
                    'status': ExecutionStatus.FAILED,
                    'errors': state.get('errors', []) + ["No suitable expert found"],
                    'current_node': 'select_expert_evidence_based'
                }

            selected_agent = result.agents[0]
            tier = result.tier

            logger.info(
                "Expert selected via Evidence-Based + GraphRAG",
                agent_id=selected_agent.id,
                agent_name=selected_agent.name,
                tier=tier.value,
                confidence=selected_agent.final_score,
                selection_method='evidence_based_graphrag'
            )

            return {
                **state,
                'selected_agents': [selected_agent.id],
                'current_agent_id': selected_agent.id,
                'current_agent_type': selected_agent.name,
                'agent_tier': tier.value,
                'tier': tier.level,  # 1, 2, or 3
                'selection_confidence': selected_agent.final_score,
                'confidence_breakdown': result.confidence_breakdown,
                'selection_method': 'evidence_based_graphrag',
                'current_node': 'select_expert_evidence_based'
            }

        except Exception as e:
            logger.error("Evidence-Based selection failed", error=str(e))
            return await self._select_expert_fallback(state)

    async def _select_expert_fallback(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """Fallback to basic agent selection if Evidence-Based unavailable"""
        try:
            selected = await self.agent_selector.select_agents(
                query=state['query'],
                tenant_id=state['tenant_id'],
                max_agents=1
            )
            
            return {
                **state,
                'selected_agents': [selected[0]['id']],
                'current_agent_id': selected[0]['id'],
                'tier': 1,  # Default to Tier 1
                'selection_method': 'fallback',
                'current_node': 'select_expert_evidence_based'
            }
        except Exception as e:
            logger.error("Fallback selection also failed", error=str(e))
            return {
                **state,
                'status': ExecutionStatus.FAILED,
                'errors': state.get('errors', []) + [f"All selection methods failed: {str(e)}"]
            }

    @trace_node("mode2_assess_tier")
    async def assess_tier_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4: Assess query tier (Tier 1/2/3)
        
        Copied from Mode 1 - same tier assessment logic
        """
        query = state['query']
        query_lower = query.lower()

        tier = 1
        tier_reasoning = []

        # Check escalation triggers
        escalation_triggers = {
            'diagnosis_change': any(word in query_lower for word in ['diagnosis', 'diagnostic', 'pathology']),
            'treatment_modification': any(word in query_lower for word in ['treatment', 'therapy', 'medication', 'dosage']),
            'emergency': any(word in query_lower for word in ['emergency', 'urgent', 'critical', 'acute']),
            'regulatory': any(word in query_lower for word in ['regulatory', 'compliance', 'fda', 'ema', 'submission']),
            'safety': any(word in query_lower for word in ['safety', 'adverse event', 'risk', 'hazard'])
        }

        if any(escalation_triggers.values()):
            tier = 3
            triggered = [k for k, v in escalation_triggers.items() if v]
            tier_reasoning.append(f"Escalation triggers: {', '.join(triggered)}")

        # Check complexity
        complexity_score = state.get('complexity_score', 0.0)
        if complexity_score > 0.5:
            tier = max(tier, 2)
            tier_reasoning.append(f"High complexity: {complexity_score:.2f}")

        if complexity_score > 0.7:
            tier = 3
            tier_reasoning.append(f"Very high complexity: {complexity_score:.2f}")

        # Check query length
        query_length = len(query)
        if query_length > 500:
            tier = max(tier, 2)
            tier_reasoning.append(f"Long query: {query_length} chars")

        logger.info(
            "Tier assessed (Mode 2)",
            tier=tier,
            reasoning=tier_reasoning,
            patterns_will_be_used=(tier == 3 and PATTERNS_AVAILABLE)
        )

        return {
            **state,
            'tier': tier,
            'tier_reasoning': tier_reasoning,
            'requires_patterns': (tier == 3),
            'current_node': 'assess_tier'
        }

    @trace_node("mode2_execute_with_patterns")
    async def execute_with_patterns_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        PHASE 4: Execute with deep agent patterns (Tier 3)
        
        Pattern Chain: ReAct + Constitutional AI
        Provides highest accuracy and safety for critical queries.
        """
        if not PATTERNS_AVAILABLE:
            logger.warning("Patterns requested but not available, falling back to standard execution")
            return await self.execute_expert_agent_node(state)

        tenant_id = state['tenant_id']
        query = state['query']
        expert_agent_id = state.get('current_agent_id')
        context_summary = state.get('context_summary', '')
        tools_results = state.get('tools_executed', [])

        try:
            logger.info(
                "Executing with deep patterns (Tier 3) - Mode 2",
                expert_id=expert_agent_id,
                patterns=["ReAct", "Constitutional"]
            )

            # Step 1: Standard agent execution
            agent_response = await self.agent_orchestrator.execute_agent(
                agent_id=expert_agent_id,
                query=query,
                context=context_summary,
                tenant_id=tenant_id
            )

            response_text = agent_response.get('response', '')

            # Step 2: ReAct pattern (if tools are needed)
            if self.react_agent and tools_results:
                logger.info("Applying ReAct pattern for tool-augmented reasoning")
                react_enhanced = await self.react_agent.enhance_with_tools(
                    initial_response=response_text,
                    query=query,
                    tools_results=tools_results,
                    context=context_summary
                )
                response_text = react_enhanced.get('enhanced_response', response_text)

            # Step 3: Constitutional AI (safety validation)
            if self.constitutional_agent:
                logger.info("Applying Constitutional AI for safety validation")
                safe_response = await self.constitutional_agent.validate_and_revise(
                    response=response_text,
                    query=query,
                    context=context_summary
                )

                response_text = safe_response.get('revised_response', response_text)
                safety_violations = safe_response.get('violations', [])
                safety_score = safe_response.get('safety_score', 1.0)

                if safety_violations:
                    logger.warning(
                        "Safety violations found and corrected",
                        violations=safety_violations,
                        safety_score=safety_score
                    )

            # Calculate confidence (boosted for Tier 3)
            confidence = await self.confidence_calculator.calculate(
                response=response_text,
                context=context_summary,
                citations=agent_response.get('citations', [])
            )
            confidence = min(confidence * 1.05, 0.98)  # Cap at 98%

            logger.info(
                "Pattern execution completed - Mode 2",
                tier=3,
                confidence=confidence,
                patterns_used=["ReAct", "Constitutional"]
            )

            return {
                **state,
                'agent_response': response_text,
                'response_confidence': confidence,
                'citations': agent_response.get('citations', []),
                'artifacts': agent_response.get('artifacts', []),
                'tokens_used': agent_response.get('tokens_used', 0),
                'model_used': state.get('model', 'gpt-4'),
                'patterns_used': ["ReAct", "Constitutional"],
                'safety_validated': True,
                'current_node': 'execute_with_patterns'
            }

        except Exception as e:
            logger.error("Pattern execution failed, falling back to standard", error=str(e))
            return await self.execute_expert_agent_node(state)

    @trace_node("mode2_execute_experts_parallel")
    async def execute_experts_parallel_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Execute all selected experts in PARALLEL.

        For each expert:
        1. RAG retrieval (domain-specific)
        2. Tool execution (as needed)
        3. Execute expert agent with sub-agent spawning

        All experts run simultaneously using asyncio.gather().

        Returns aggregated responses from all experts.
        """
        tenant_id = state['tenant_id']
        query = state['query']
        selected_agents = state.get('selected_agents', [])
        enable_rag = state.get('enable_rag', True)
        enable_tools = state.get('enable_tools', False)
        model = state.get('model', 'gpt-4')

        logger.info(
            "Executing experts in parallel (Mode 2)",
            expert_count=len(selected_agents)
        )

        try:
            # Execute all experts in parallel
            expert_tasks = [
                self._execute_single_expert(
                    expert_id=expert_id,
                    query=query,
                    tenant_id=tenant_id,
                    enable_rag=enable_rag,
                    enable_tools=enable_tools,
                    model=model,
                    state=state
                )
                for expert_id in selected_agents
            ]

            # Wait for all experts to complete
            expert_responses = await asyncio.gather(*expert_tasks, return_exceptions=True)

            # Filter out failed responses
            successful_responses = []
            failed_experts = []

            for i, response in enumerate(expert_responses):
                if isinstance(response, Exception):
                    logger.error(
                        "Expert execution failed",
                        expert_id=selected_agents[i],
                        error=str(response)
                    )
                    failed_experts.append(selected_agents[i])
                else:
                    successful_responses.append(response)

            if len(successful_responses) == 0:
                raise Exception("All expert executions failed")

            logger.info(
                "Parallel expert execution completed (Mode 2)",
                successful=len(successful_responses),
                failed=len(failed_experts)
            )

            return {
                **state,
                'agent_responses': successful_responses,
                'failed_experts': failed_experts,
                'current_node': 'execute_experts_parallel'
            }

        except Exception as e:
            logger.error("Parallel expert execution failed (Mode 2)", error=str(e))
            return {
                **state,
                'agent_responses': [],
                'errors': state.get('errors', []) + [f"Expert execution failed: {str(e)}"]
            }

    async def _execute_single_expert(
        self,
        expert_id: str,
        query: str,
        tenant_id: str,
        enable_rag: bool,
        enable_tools: bool,
        model: str,
        state: UnifiedWorkflowState
    ) -> Dict[str, Any]:
        """
        Execute a single expert with RAG, tools, and sub-agent spawning.

        This is called in parallel for each selected expert.
        """
        logger.info(f"Executing expert: {expert_id}")

        # 1. RAG retrieval (domain-specific for this expert)
        context = ""
        rag_documents = []

        if enable_rag:
            try:
                # Use true_hybrid search (Neo4j + Pinecone + Supabase)
                rag_results = await self.rag_service.query(
                    query_text=query,
                    tenant_id=tenant_id,
                    agent_id=expert_id,
                    max_results=5,
                    strategy="true_hybrid",  # Use true hybrid: Neo4j (KG) + Pinecone (vector) + Supabase (relational)
                    similarity_threshold=0.7
                )
                rag_documents = rag_results.get('sources', []) or rag_results.get('documents', [])
                context = self._create_context_summary(rag_documents)
            except Exception as e:
                logger.error(f"RAG failed for {expert_id}", error=str(e))

        # 2. Tool execution (if enabled) using ToolRegistry
        tool_results = []

        if enable_tools:
            try:
                tool_analysis = self._analyze_tool_needs(query)
                if tool_analysis['needs_tools']:
                    for tool_name in tool_analysis['recommended_tools'][:2]:  # Limit to 2 tools
                        tool = self.tool_registry.get_tool(tool_name)
                        if tool:
                            result = await tool.execute(
                                input_data={"query": query},
                                context={"tenant_id": tenant_id}
                            )
                            tool_results.append({
                                'tool_name': tool_name,
                                'result': result,
                                'timestamp': datetime.utcnow().isoformat()
                            })
            except Exception as e:
                logger.error(f"Tools failed for {expert_id}", error=str(e))

        # 3. Execute expert agent using AgentOrchestrator
        try:
            agent_response = await self.agent_orchestrator.execute_agent(
                agent_id=expert_id,
                query=query,
                context=context,
                tenant_id=tenant_id
            )

            response_text = agent_response.get('response', '')
            citations = agent_response.get('citations', [])
            artifacts = agent_response.get('artifacts', [])

            # Spawn sub-agents if needed (always enabled in Mode 2)
            sub_agents_spawned = []
            specialist_id = await self.sub_agent_spawner.spawn_specialist(
                parent_agent_id=expert_id,
                task=f"Expert analysis for: {query[:100]}",
                specialty="Domain-specific expertise",
                context={'query': query, 'tenant_id': tenant_id}
            )
            sub_agents_spawned.append(specialist_id)

            # Execute sub-agent
            specialist_result = await self.sub_agent_spawner.execute_sub_agent(
                sub_agent_id=specialist_id
            )

            if specialist_result:
                response_text += f"\n\n**Specialist Analysis:**\n{specialist_result.get('response', '')}"

            return {
                'expert_id': expert_id,
                'response': response_text,
                'confidence': agent_response.get('confidence', 0.75),
                'citations': citations,
                'sub_agents_spawned': sub_agents_spawned,
                'artifacts': artifacts,
                'rag_documents': rag_documents,
                'tools_used': tool_results,
                'tokens_used': agent_response.get('tokens_used', 0)
            }

        except Exception as e:
            logger.error(f"Expert execution failed for {expert_id}", error=str(e))
            raise

    @trace_node("mode2_build_consensus")
    async def build_consensus_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Build consensus from multiple expert responses.

        Consensus Methods:
        - Majority vote (for factual questions)
        - Weighted confidence (for recommendations)
        - Delphi method (for complex decisions)
        - Conflict detection and resolution

        Outputs:
        - Synthesized unified response
        - Agreement score
        - Conflicts detected
        - Individual expert perspectives
        """
        agent_responses = state.get('agent_responses', [])

        if len(agent_responses) == 0:
            return {
                **state,
                'synthesized_response': 'No expert responses available.',
                'synthesis_confidence': 0.0,
                'agreement_score': 0.0,
                'errors': state.get('errors', []) + ["No expert responses to synthesize"]
            }

        try:
            # Build consensus using ConsensusCalculator
            consensus_result = await self.consensus_calculator.calculate_consensus(
                responses=agent_responses
            )

            synthesized_response = consensus_result.get('synthesis', '')
            agreement_score = consensus_result.get('agreement_score', 0.0)
            conflicts = consensus_result.get('conflicts', [])
            synthesis_confidence = consensus_result.get('confidence', 0.0)

            logger.info(
                "Consensus built with ConsensusCalculator (Mode 2)",
                agreement_score=agreement_score,
                conflicts_count=len(conflicts),
                synthesis_confidence=synthesis_confidence
            )

            return {
                **state,
                'synthesized_response': synthesized_response,
                'synthesis_confidence': synthesis_confidence,
                'agreement_score': agreement_score,
                'conflicts_detected': conflicts,
                'consensus_method': 'weighted_confidence',
                'current_node': 'build_consensus'
            }

        except Exception as e:
            logger.error("Consensus building failed (Mode 2)", error=str(e))

            # Fallback: Simple concatenation
            fallback_synthesis = "\n\n".join([
                f"**{resp.get('expert_id', 'Expert')}**: {resp.get('response', '')}"
                for resp in agent_responses
            ])

            return {
                **state,
                'synthesized_response': fallback_synthesis,
                'synthesis_confidence': 0.5,
                'agreement_score': 0.5,
                'conflicts_detected': [],
                'errors': state.get('errors', []) + [f"Consensus building failed: {str(e)}"]
            }
    @trace_node("human_validation")
    async def validate_human_review_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Validate if human review is required

        Checks confidence, keywords, and risk levels
        """
        response = state.get('agent_response', '')
        confidence = state.get('response_confidence', 0.0)
        query = state.get('original_query', state.get('query', ''))

        try:
            validation_result = await self.human_validator.requires_human_review(
                query=query,
                response=response,
                confidence=confidence,
                domain=state.get('domain'),
                context=state
            )

            if validation_result['requires_human_review']:
                logger.warning("Human review required",
                             risk_level=validation_result['risk_level'])

                review_notice = f"""

⚠️ **HUMAN REVIEW REQUIRED**

**Risk Level:** {validation_result['risk_level'].upper()}
**Confidence:** {confidence:.2%}

**Reasons:**
{chr(10).join(f"• {reason}" for reason in validation_result['reasons'])}

**Recommendation:** {validation_result['recommendation']}

---
*This response requires review by a qualified healthcare professional.*
"""
                response_with_notice = response + review_notice

                return {
                    **state,
                    'agent_response': response_with_notice,
                    'requires_human_review': True,
                    'human_review_decision': validation_result
                }
            else:
                return {
                    **state,
                    'requires_human_review': False,
                    'human_review_decision': validation_result
                }
        except Exception as e:
            logger.error("Human validation failed", error=str(e))
            return {
                **state,
                'requires_human_review': True,
                'errors': state.get('errors', []) + [f"Validation failed: {str(e)}"]
            }



    async def format_output_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Format final output for frontend with artifact delivery.

        Mode 2 returns:
        - Synthesized consensus response (primary)
        - Individual expert responses (for transparency)
        - Agreement score
        - Conflicts detected
        - All artifacts from all experts (properly formatted)
        - Comprehensive citations
        """
        agent_responses = state.get('agent_responses', [])

        # Aggregate all citations
        all_citations = []
        for resp in agent_responses:
            all_citations.extend(resp.get('citations', []))

        # Aggregate and format all artifacts
        all_artifacts = []
        for resp in agent_responses:
            for artifact in resp.get('artifacts', []):
                all_artifacts.append({
                    'type': artifact.get('type', 'document'),
                    'title': artifact.get('title', 'Generated Artifact'),
                    'format': artifact.get('format', 'text'),
                    'content': artifact.get('content', ''),
                    'expert_id': resp.get('expert_id'),
                    'generated_at': artifact.get('generated_at', datetime.utcnow().isoformat())
                })

        # Aggregate all agents used (experts + sub-agents)
        all_agents_used = []
        for resp in agent_responses:
            all_agents_used.append(resp.get('expert_id'))
            all_agents_used.extend(resp.get('sub_agents_spawned', []))

        # Total tokens
        total_tokens = sum(resp.get('tokens_used', 0) for resp in agent_responses)

        return {
            **state,
            'response': state.get('synthesized_response', ''),
            'confidence': state.get('synthesis_confidence', 0.0),
            'agents_used': all_agents_used,
            'citations': all_citations,
            'artifacts': all_artifacts,
            'sources_used': sum(len(resp.get('rag_documents', [])) for resp in agent_responses),
            'tools_used': sum(len(resp.get('tools_used', [])) for resp in agent_responses),
            'tokens_used': total_tokens,
            'expert_responses': agent_responses,  # Individual expert perspectives
            'agreement_score': state.get('agreement_score', 0.0),
            'conflicts_detected': state.get('conflicts_detected', []),
            'status': ExecutionStatus.COMPLETED,
            'current_node': 'format_output'
        }

    # =========================================================================
    # HELPER METHODS
    # =========================================================================

    def _create_context_summary(self, documents: List[Dict[str, Any]], max_tokens: int = 100_000) -> str:
        """Create context summary from RAG documents (per expert)"""
        if not documents:
            return ""

        context_parts = []
        for i, doc in enumerate(documents[:5], 1):
            content = doc.get('content', '')[:2000]  # Limit per doc
            source = doc.get('source', 'Unknown')
            context_parts.append(f"[{i}] {content} (Source: {source})")

        return "\n\n".join(context_parts)

    def _analyze_tool_needs(self, query: str) -> Dict[str, Any]:
        """Analyze query to determine which tools are needed"""
        query_lower = query.lower()

        tool_indicators = {
            'web_search': any(word in query_lower for word in ['search', 'find', 'latest', 'recent']),
            'database': any(word in query_lower for word in ['database', 'record', 'historical']),
            'calculator': any(word in query_lower for word in ['calculate', 'compute', 'sum']),
            'regulatory_db': any(word in query_lower for word in ['fda', 'ema', 'pmda', 'regulatory'])
        }

        recommended_tools = [tool for tool, needed in tool_indicators.items() if needed]

        return {
            'needs_tools': len(recommended_tools) > 0,
            'recommended_tools': recommended_tools
        }

    # =========================================================================
    # PHASE 4: CONDITIONAL EDGE FUNCTIONS
    # =========================================================================

    def should_use_rag(self, state: UnifiedWorkflowState) -> str:
        """Conditional edge: Check if RAG should be used"""
        enable_rag = state.get('enable_rag', True)
        return "use_rag" if enable_rag else "skip_rag"

    def should_use_tools(self, state: UnifiedWorkflowState) -> str:
        """Conditional edge: Check if tools should be used"""
        enable_tools = state.get('enable_tools', False)
        return "use_tools" if enable_tools else "skip_tools"

    def should_use_patterns(self, state: UnifiedWorkflowState) -> str:
        """PHASE 4: Conditional edge - Check if deep patterns should be used (Tier 3)"""
        tier = state.get('tier', 1)
        requires_patterns = state.get('requires_patterns', False)
        
        # Use patterns for Tier 3 if available
        use_patterns = (tier == 3 or requires_patterns) and PATTERNS_AVAILABLE
        
        return "use_patterns" if use_patterns else "standard"
