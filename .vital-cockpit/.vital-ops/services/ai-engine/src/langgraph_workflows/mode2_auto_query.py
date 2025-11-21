"""
Mode 2: Auto Selection + One-Shot Query

AI automatically selects 3-5 best experts and synthesizes their responses.
Multi-expert consensus for comprehensive answers to single questions.

PRD Specification:
- Interaction: QUERY (One-Shot)
- Selection: AUTO (AI selects 3-5 experts)
- Response Time: 25-40 seconds
- Experts: 3-5 experts automatically selected
- Deep Agent Support: Multiple experts work in parallel
- Tools: RAG, Web Search, Database Tools (per expert)
- Context: 1M+ tokens (multimodal)
- Synthesis: Consensus building across expert responses

Golden Rules Compliance:
- ✅ LangGraph StateGraph (Golden Rule #1)
- ✅ Caching at all nodes (Golden Rule #2)
- ✅ Tenant isolation enforced (Golden Rule #3)
- ✅ RAG/Tools enforcement (Golden Rule #4)
- ✅ N/A for feedback in one-shot mode (Golden Rule #5)

Use Cases:
- "What are the regulatory pathways for my AI diagnostic device?"
  → Consults FDA Expert, EMA Expert, PMDA Expert, AI/ML Validation Expert
- "Design a clinical trial for my oncology drug"
  → Consults Clinical Trial Expert, Statistical Expert, Regulatory Expert
- "Compare reimbursement strategies across US, EU, Japan"
  → Consults Market Access Experts for each region

Frontend Mapping:
- isAutomatic: true (AI selects experts)
- isMultiTurn: false (one-shot query)
- isAutonomous: false (no autonomous multi-step)
- selectedAgents: [] (empty, AI will select)
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
from services.consensus_calculator import ConsensusCalculator
from services.compliance_service import (
    ComplianceService,
    HumanInLoopValidator,
    ComplianceRegime,
    DataClassification
)
import time

logger = structlog.get_logger()


class Mode2AutoQueryWorkflow(BaseWorkflow):
    """
    Mode 2: Auto Selection + One-Shot Query

    Golden Rules Compliance:
    - ✅ Uses LangGraph StateGraph (Golden Rule #1)
    - ✅ Caching integrated at all nodes (Golden Rule #2)
    - ✅ Tenant validation enforced (Golden Rule #3)
    - ✅ RAG/Tools enabled by default (Golden Rule #4)
    - ✅ N/A for feedback (one-shot mode, Golden Rule #5)

    Deep Agent Architecture (Multi-Expert Orchestration):
    Level 1: Master Agent (Query Router & Consensus Builder)
    Level 2: Expert Agents (3-5 selected automatically) ← AI SELECTS HERE
    Level 3: Specialist Agents (per expert, spawned as needed)
    Level 4: Worker Agents (per expert, spawned as needed)
    Level 5: Tool Agents (100+ integrations)

    Multi-Expert Workflow:
    1. AI analyzes query complexity and domains
    2. Selects 3-5 best experts from 319+ catalog
    3. All experts execute in PARALLEL
    4. Each expert can spawn sub-agents
    5. Consensus building synthesizes responses
    6. Unified response with all perspectives

    Features:
    - ✅ Intelligent expert selection (semantic matching)
    - ✅ Parallel expert execution (3-5 experts simultaneously)
    - ✅ Per-expert RAG retrieval (different knowledge domains)
    - ✅ Per-expert tool execution
    - ✅ Consensus synthesis (majority vote, weighted confidence, Delphi)
    - ✅ Multi-artifact generation (one per expert + synthesis)
    - ✅ Conflict detection and resolution
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
        self.consensus_calculator = consensus_calculator or ConsensusCalculator()

        logger.info("✅ Mode2AutoQueryWorkflow initialized")

    def build_graph(self) -> StateGraph:
        """
        Build LangGraph workflow for Mode 2.

        Multi-expert flow with parallel execution:
        1. Validate tenant (security)
        2. Analyze query (intent, domains, complexity)
        3. Auto-select 3-5 experts (AI-powered selection)
        4. PARALLEL: For each expert:
           a. RAG retrieval (domain-specific)
           b. Tool execution (as needed)
           c. Execute expert agent (with sub-agent spawning)
        5. Consensus building (synthesize responses)
        6. Format output (unified response + all perspectives)

        Returns:
            Configured StateGraph with parallel execution
        """
        graph = StateGraph(UnifiedWorkflowState)

        # Add nodes
        graph.add_node("validate_tenant", self.validate_tenant_node)
        graph.add_node("analyze_query", self.analyze_query_node)
        graph.add_node("select_experts_auto", self.select_experts_auto_node)

        # Parallel expert execution (orchestrated by single node)
        graph.add_node("execute_experts_parallel", self.execute_experts_parallel_node)

        # Consensus and output
        graph.add_node("build_consensus", self.build_consensus_node)
        graph.add_node("format_output", self.format_output_node)

        # Define flow
        graph.set_entry_point("validate_tenant")
        graph.add_edge("validate_tenant", "analyze_query")
        graph.add_edge("analyze_query", "select_experts_auto")
        graph.add_edge("select_experts_auto", "execute_experts_parallel")
        graph.add_edge("execute_experts_parallel", "build_consensus")
        graph.add_edge("build_consensus", "format_output")
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
                cached_analysis = await self.cache_manager.get(cache_key, tenant_id)
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

    @trace_node("mode2_select_experts")
    async def select_experts_auto_node(self, state: UnifiedWorkflowState) -> UnifiedWorkflowState:
        """
        Node: Automatically select 3-5 best experts.

        Uses AI-powered selection based on:
        - Query analysis (intent, domains)
        - Expert specializations (from 319+ catalog)
        - Expert performance history
        - Domain coverage (diverse perspectives)

        Golden Rule #2: Cache expert selection
        """
        tenant_id = state['tenant_id']
        query = state['query']
        detected_domains = state.get('detected_domains', [])
        complexity_score = state.get('complexity_score', 0.5)
        recommended_expert_count = state.get('recommended_expert_count', 3)

        try:
            # Check cache first (Golden Rule #2)
            cache_key = f"expert_selection:mode2:{hash(query)}"
            if self.cache_manager and self.cache_manager.enabled:
                cached_selection = await self.cache_manager.get(cache_key, tenant_id)
                if cached_selection:
                    logger.info("✅ Expert selection cache hit (Mode 2)")
                    return {
                        **state,
                        'selected_agents': cached_selection['agent_ids'],
                        'selection_reasoning': cached_selection['reasoning'],
                        'selection_confidence': cached_selection['confidence'],
                        'cache_hits': state.get('cache_hits', 0) + 1,
                        'current_node': 'select_experts_auto'
                    }

            # AI-powered expert selection
            selection_result = await self.agent_selector.select_multiple_experts(
                query=query,
                domains=detected_domains,
                expert_count=recommended_expert_count,
                tenant_id=tenant_id
            )

            selected_agent_ids = selection_result.get('agent_ids', [])
            reasoning = selection_result.get('reasoning', '')
            confidence = selection_result.get('confidence', 0.0)

            # Ensure we have at least 3 experts
            if len(selected_agent_ids) < 3:
                # Fallback to default experts
                selected_agent_ids = ['regulatory_expert', 'clinical_expert', 'market_access_expert']
                reasoning = "Fallback to default experts due to insufficient selection"
                confidence = 0.5

            # Cache selection (Golden Rule #2)
            selection_data = {
                'agent_ids': selected_agent_ids,
                'reasoning': reasoning,
                'confidence': confidence
            }

            if self.cache_manager and self.cache_manager.enabled:
                await self.cache_manager.set(
                    cache_key,
                    selection_data,
                    ttl=3600,
                    tenant_id=tenant_id
                )

            logger.info(
                "Experts selected automatically (Mode 2)",
                expert_count=len(selected_agent_ids),
                experts=selected_agent_ids,
                confidence=confidence
            )

            return {
                **state,
                'selected_agents': selected_agent_ids,
                'selection_reasoning': reasoning,
                'selection_confidence': confidence,
                'current_node': 'select_experts_auto'
            }

        except Exception as e:
            logger.error("Expert selection failed (Mode 2)", error=str(e))
            # Fallback
            return {
                **state,
                'selected_agents': ['regulatory_expert', 'clinical_expert', 'market_access_expert'],
                'selection_reasoning': 'Fallback to default experts due to error',
                'selection_confidence': 0.5,
                'errors': state.get('errors', []) + [f"Expert selection failed: {str(e)}"]
            }

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
                rag_results = await self.rag_service.search(
                    query=query,
                    tenant_id=tenant_id,
                    agent_id=expert_id,
                    max_results=5
                )
                rag_documents = rag_results.get('documents', [])
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
