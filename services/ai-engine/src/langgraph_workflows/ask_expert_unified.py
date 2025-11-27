"""
Ask Expert Unified LangGraph Workflow
Implements 4 execution modes for expert consultation
- Mode 1: Single Expert (1:1 consultation)
- Mode 2: Multi-Expert Panel (1:N parallel consultation with consensus)
- Mode 3: Expert Recommendation (suggest best expert for query)
- Mode 4: Custom Workflow (user-defined multi-step execution)

Uses LangGraph 0.6.11 StateGraph pattern (compatible with 1.0.3)
Created: 2025-11-27
"""

from typing import TypedDict, Annotated, List, Dict, Any, Optional, Literal
from enum import Enum
from langgraph.graph import StateGraph, END
import operator
import asyncio
import structlog
from datetime import datetime
from uuid import uuid4
import json

logger = structlog.get_logger()


# ============================================================================
# Enums and Constants
# ============================================================================

class ExecutionMode(str, Enum):
    """Supported execution modes"""
    SINGLE_EXPERT = "single_expert"
    MULTI_EXPERT_PANEL = "multi_expert_panel"
    EXPERT_RECOMMENDATION = "expert_recommendation"
    CUSTOM_WORKFLOW = "custom_workflow"


class ExpertTier(int, Enum):
    """Expert tier levels"""
    TIER_1_FOUNDATIONAL = 1
    TIER_2_SPECIALIST = 2
    TIER_3_ULTRA_SPECIALIST = 3


# ============================================================================
# State Schema
# ============================================================================

class WorkflowState(TypedDict):
    """
    Unified state for all Ask Expert execution modes
    Uses Annotated for proper state accumulation
    """
    # Input parameters
    query: str
    mode: ExecutionMode
    tenant_id: str
    user_id: str
    session_id: str

    # Mode-specific inputs
    expert_id: Optional[str]  # Mode 1
    expert_ids: Optional[List[str]]  # Mode 2
    workflow_steps: Optional[List[Dict[str, Any]]]  # Mode 4

    # RAG context
    retrieved_documents: Optional[List[Dict[str, Any]]]
    context: str

    # Single expert response (Mode 1)
    expert_response: Optional[Dict[str, Any]]

    # Multi-expert responses (Mode 2) - accumulated with operator.add
    expert_responses: Annotated[Optional[List[Dict[str, Any]]], operator.add]

    # Aggregated response (Mode 2)
    aggregated_response: Optional[Dict[str, Any]]
    consensus_level: Optional[float]

    # Expert recommendation (Mode 3)
    expert_recommendation: Optional[Dict[str, Any]]
    recommended_expert_ids: Optional[List[str]]

    # Custom workflow execution (Mode 4)
    current_step: int
    step_results: Annotated[Optional[List[Dict[str, Any]]], operator.add]

    # Metadata and error handling
    error: Optional[str]
    retry_count: int
    execution_time_ms: Optional[int]
    metadata: Dict[str, Any]


# ============================================================================
# Ask Expert Workflow Class
# ============================================================================

class AskExpertUnifiedWorkflow:
    """
    Unified LangGraph workflow for Ask Expert service
    Supports 4 execution modes with gold-standard error handling
    """

    def __init__(
        self,
        supabase_client,
        agent_service,
        rag_service,
        llm_service
    ):
        self.supabase = supabase_client
        self.agent_service = agent_service
        self.rag_service = rag_service
        self.llm_service = llm_service
        self.workflow = None

    async def initialize(self):
        """Initialize the LangGraph workflow with all modes"""
        # Build the state graph
        workflow = StateGraph(WorkflowState)

        # Add nodes
        workflow.add_node("analyze_query", self.analyze_query_node)
        workflow.add_node("retrieve_knowledge", self.retrieve_knowledge_node)

        # Mode 1: Single Expert
        workflow.add_node("invoke_single_expert", self.invoke_single_expert_node)

        # Mode 2: Multi-Expert Panel
        workflow.add_node("invoke_expert_panel", self.invoke_expert_panel_node)
        workflow.add_node("aggregate_panel_responses", self.aggregate_panel_responses_node)

        # Mode 3: Expert Recommendation
        workflow.add_node("recommend_experts", self.recommend_experts_node)

        # Mode 4: Custom Workflow
        workflow.add_node("execute_workflow_step", self.execute_workflow_step_node)

        # Error handling
        workflow.add_node("error_handler", self.error_handler_node)

        # Set entry point
        workflow.set_entry_point("analyze_query")

        # Add conditional routing based on mode
        workflow.add_conditional_edges(
            "analyze_query",
            self.route_by_mode,
            {
                ExecutionMode.SINGLE_EXPERT: "retrieve_knowledge",
                ExecutionMode.MULTI_EXPERT_PANEL: "retrieve_knowledge",
                ExecutionMode.EXPERT_RECOMMENDATION: "recommend_experts",
                ExecutionMode.CUSTOM_WORKFLOW: "execute_workflow_step",
                "error": "error_handler"
            }
        )

        # Mode 1: Single Expert flow
        workflow.add_edge("retrieve_knowledge", "invoke_single_expert")
        workflow.add_edge("invoke_single_expert", END)

        # Mode 2: Multi-Expert Panel flow (override above if mode 2)
        workflow.add_conditional_edges(
            "invoke_expert_panel",
            lambda state: "aggregate" if state.get("expert_responses") else "error",
            {
                "aggregate": "aggregate_panel_responses",
                "error": "error_handler"
            }
        )
        workflow.add_edge("aggregate_panel_responses", END)

        # Mode 3: Expert Recommendation flow
        workflow.add_edge("recommend_experts", END)

        # Mode 4: Custom Workflow flow (loop until complete)
        workflow.add_conditional_edges(
            "execute_workflow_step",
            self.check_workflow_complete,
            {
                "continue": "execute_workflow_step",
                "complete": END,
                "error": "error_handler"
            }
        )

        # Error handler
        workflow.add_edge("error_handler", END)

        # Compile the workflow
        self.workflow = workflow.compile()

        logger.info("✅ Ask Expert Unified LangGraph workflow initialized")

    # ========================================================================
    # Node Functions
    # ========================================================================

    async def analyze_query_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Analyze query and validate mode-specific inputs
        This is the entry point for all modes
        """
        try:
            logger.info(
                "🔍 Analyzing query",
                mode=state["mode"],
                query=state["query"][:100]
            )

            # Validate mode-specific inputs
            mode = state["mode"]

            if mode == ExecutionMode.SINGLE_EXPERT:
                if not state.get("expert_id"):
                    state["error"] = "expert_id required for single_expert mode"
                    return state

            elif mode == ExecutionMode.MULTI_EXPERT_PANEL:
                expert_ids = state.get("expert_ids", [])
                if not expert_ids or len(expert_ids) < 2:
                    state["error"] = "At least 2 expert_ids required for multi_expert_panel mode"
                    return state

            elif mode == ExecutionMode.CUSTOM_WORKFLOW:
                if not state.get("workflow_steps"):
                    state["error"] = "workflow_steps required for custom_workflow mode"
                    return state

            # Initialize metadata
            if "metadata" not in state:
                state["metadata"] = {}

            state["metadata"]["analyzed_at"] = datetime.utcnow().isoformat()
            state["metadata"]["query_length"] = len(state["query"])

            # Initialize retry count
            if "retry_count" not in state:
                state["retry_count"] = 0

            logger.info(
                "✅ Query analysis complete",
                mode=mode,
                has_error=bool(state.get("error"))
            )

            return state

        except Exception as e:
            logger.error("❌ Query analysis failed", error=str(e))
            state["error"] = f"Query analysis failed: {str(e)}"
            return state

    async def retrieve_knowledge_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Retrieve relevant knowledge from RAG service
        Used by Mode 1 and Mode 2
        """
        try:
            logger.info(
                "📚 Retrieving knowledge",
                query=state["query"][:100]
            )

            # Query unified RAG service
            rag_results = await self.rag_service.query(
                query_text=state["query"],
                strategy="true_hybrid",  # Neo4j + Pinecone + Supabase
                max_results=15,
                tenant_id=state["tenant_id"]
            )

            # Store retrieved documents
            state["retrieved_documents"] = rag_results.get("results", [])

            # Build context string for expert prompts
            context_parts = []
            for doc in state["retrieved_documents"]:
                context_parts.append(
                    f"Source: {doc.get('source', 'Unknown')}\n{doc.get('content', '')}"
                )

            state["context"] = "\n\n".join(context_parts)

            logger.info(
                "✅ Knowledge retrieval complete",
                doc_count=len(state["retrieved_documents"]),
                context_length=len(state["context"])
            )

            return state

        except Exception as e:
            logger.error("❌ Knowledge retrieval failed", error=str(e))
            state["error"] = f"Knowledge retrieval failed: {str(e)}"
            return state

    async def invoke_single_expert_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Invoke single expert (Mode 1)
        """
        try:
            expert_id = state["expert_id"]

            logger.info(
                "👤 Invoking single expert",
                expert_id=expert_id
            )

            # Get expert agent details
            agent = await self.agent_service.get_agent(
                agent_id=expert_id,
                tenant_id=state["tenant_id"]
            )

            if not agent:
                state["error"] = f"Expert {expert_id} not found"
                return state

            # Build expert prompt with context
            prompt = self._build_expert_prompt(
                query=state["query"],
                context=state.get("context", ""),
                agent=agent
            )

            # Invoke LLM
            start_time = datetime.utcnow()
            response = await self.llm_service.ainvoke(
                prompt=prompt,
                model=agent.get("model", "gpt-4"),
                temperature=agent.get("temperature", 0.2),
                max_tokens=agent.get("max_tokens", 4000)
            )
            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Store response
            state["expert_response"] = {
                "expert_id": expert_id,
                "expert_name": agent.get("display_name", "Unknown"),
                "tier": agent.get("tier", 2),
                "response": response.get("content", ""),
                "confidence": response.get("confidence", 0.85),
                "sources": state.get("retrieved_documents", []),
                "execution_time_ms": execution_time
            }

            state["execution_time_ms"] = execution_time

            logger.info(
                "✅ Single expert invocation complete",
                expert_id=expert_id,
                execution_time_ms=execution_time
            )

            return state

        except Exception as e:
            logger.error("❌ Single expert invocation failed", error=str(e))
            state["error"] = f"Single expert invocation failed: {str(e)}"
            return state

    async def invoke_expert_panel_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Invoke multiple experts in parallel (Mode 2)
        """
        try:
            expert_ids = state["expert_ids"]

            logger.info(
                "👥 Invoking expert panel",
                expert_count=len(expert_ids)
            )

            # Define async function for parallel execution
            async def invoke_expert(expert_id: str) -> Dict[str, Any]:
                try:
                    # Get agent details
                    agent = await self.agent_service.get_agent(
                        agent_id=expert_id,
                        tenant_id=state["tenant_id"]
                    )

                    if not agent:
                        return {
                            "expert_id": expert_id,
                            "error": f"Expert {expert_id} not found"
                        }

                    # Build prompt
                    prompt = self._build_expert_prompt(
                        query=state["query"],
                        context=state.get("context", ""),
                        agent=agent
                    )

                    # Invoke LLM
                    start_time = datetime.utcnow()
                    response = await self.llm_service.ainvoke(
                        prompt=prompt,
                        model=agent.get("model", "gpt-4"),
                        temperature=agent.get("temperature", 0.2),
                        max_tokens=agent.get("max_tokens", 4000)
                    )
                    execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

                    return {
                        "expert_id": expert_id,
                        "expert_name": agent.get("display_name", "Unknown"),
                        "tier": agent.get("tier", 2),
                        "response": response.get("content", ""),
                        "confidence": response.get("confidence", 0.85),
                        "execution_time_ms": execution_time
                    }

                except Exception as e:
                    logger.error(
                        "❌ Expert invocation failed",
                        expert_id=expert_id,
                        error=str(e)
                    )
                    return {
                        "expert_id": expert_id,
                        "error": str(e)
                    }

            # Execute in parallel
            start_time = datetime.utcnow()
            responses = await asyncio.gather(
                *[invoke_expert(expert_id) for expert_id in expert_ids],
                return_exceptions=True
            )
            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Filter out errors and exceptions
            valid_responses = []
            for r in responses:
                if isinstance(r, dict) and not r.get("error"):
                    valid_responses.append(r)

            # Store responses (using operator.add accumulation)
            state["expert_responses"] = valid_responses
            state["execution_time_ms"] = execution_time

            logger.info(
                "✅ Expert panel invocation complete",
                total_experts=len(expert_ids),
                successful=len(valid_responses),
                execution_time_ms=execution_time
            )

            return state

        except Exception as e:
            logger.error("❌ Expert panel invocation failed", error=str(e))
            state["error"] = f"Expert panel invocation failed: {str(e)}"
            return state

    async def aggregate_panel_responses_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Aggregate multi-expert panel responses using LLM (Mode 2)
        """
        try:
            responses = state.get("expert_responses", [])

            logger.info(
                "🔗 Aggregating panel responses",
                response_count=len(responses)
            )

            if not responses:
                state["error"] = "No expert responses to aggregate"
                return state

            # Build aggregation prompt
            aggregation_prompt = self._build_aggregation_prompt(
                query=state["query"],
                responses=responses
            )

            # Use LLM to aggregate responses
            start_time = datetime.utcnow()
            aggregated = await self.llm_service.ainvoke(
                prompt=aggregation_prompt,
                model="gpt-4",  # Always use GPT-4 for aggregation
                temperature=0.2,
                max_tokens=4000
            )
            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Calculate consensus level (simple average of confidence scores)
            avg_confidence = sum(r.get("confidence", 0) for r in responses) / len(responses)

            # Store aggregated response
            state["aggregated_response"] = {
                "consensus": aggregated.get("content", ""),
                "confidence_avg": avg_confidence,
                "agreement_score": self._calculate_agreement_score(responses),
                "individual_responses": responses,
                "aggregation_time_ms": execution_time
            }

            state["consensus_level"] = avg_confidence
            state["execution_time_ms"] = (state.get("execution_time_ms", 0) + execution_time)

            logger.info(
                "✅ Panel aggregation complete",
                consensus_level=avg_confidence,
                aggregation_time_ms=execution_time
            )

            return state

        except Exception as e:
            logger.error("❌ Panel aggregation failed", error=str(e))
            state["error"] = f"Panel aggregation failed: {str(e)}"
            return state

    async def recommend_experts_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Recommend best experts for query (Mode 3)
        """
        try:
            logger.info(
                "🎯 Recommending experts",
                query=state["query"][:100]
            )

            # Get all available experts for tenant
            agents = await self.agent_service.list_agents(
                tenant_id=state["tenant_id"],
                status="active"
            )

            # Score each agent based on query match
            scored_agents = []
            for agent in agents:
                score = await self._score_agent_for_query(
                    query=state["query"],
                    agent=agent
                )
                scored_agents.append({
                    "expert_id": agent["id"],
                    "expert_name": agent.get("display_name", "Unknown"),
                    "tier": agent.get("tier", 2),
                    "match_score": score,
                    "reasoning": f"Best match for {agent.get('knowledge_domains', ['general'])[0]} queries"
                })

            # Sort by score descending
            scored_agents.sort(key=lambda x: x["match_score"], reverse=True)

            # Take top 3
            top_experts = scored_agents[:3]

            state["expert_recommendation"] = {
                "recommended_experts": top_experts,
                "match_scores": [e["match_score"] for e in top_experts],
                "reasoning": f"Based on query analysis: domain={self._extract_domain(state['query'])}, complexity=2"
            }

            state["recommended_expert_ids"] = [e["expert_id"] for e in top_experts]

            logger.info(
                "✅ Expert recommendation complete",
                top_expert=top_experts[0]["expert_name"] if top_experts else None
            )

            return state

        except Exception as e:
            logger.error("❌ Expert recommendation failed", error=str(e))
            state["error"] = f"Expert recommendation failed: {str(e)}"
            return state

    async def execute_workflow_step_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Execute custom workflow step (Mode 4)
        """
        try:
            current_step = state.get("current_step", 0)
            workflow_steps = state.get("workflow_steps", [])

            if current_step >= len(workflow_steps):
                # Workflow complete
                return state

            step = workflow_steps[current_step]

            logger.info(
                "⚙️  Executing workflow step",
                step_number=current_step + 1,
                total_steps=len(workflow_steps)
            )

            # Execute step based on type
            step_type = step.get("type")
            step_result = None

            if step_type == "query_expert":
                # Query a specific expert
                expert_id = step.get("expert_id")
                step_result = await self._execute_expert_query_step(
                    expert_id=expert_id,
                    query=step.get("query", state["query"]),
                    state=state
                )

            elif step_type == "aggregate_experts":
                # Query multiple experts and aggregate
                expert_ids = step.get("expert_ids", [])
                step_result = await self._execute_aggregate_step(
                    expert_ids=expert_ids,
                    query=step.get("query", state["query"]),
                    state=state
                )

            elif step_type == "retrieve_knowledge":
                # Retrieve knowledge from RAG
                step_result = await self._execute_retrieve_step(
                    query=step.get("query", state["query"]),
                    state=state
                )

            else:
                step_result = {"error": f"Unknown step type: {step_type}"}

            # Store step result (using operator.add accumulation)
            if "step_results" not in state or state["step_results"] is None:
                state["step_results"] = []

            state["step_results"].append({
                "step_number": current_step + 1,
                "step_type": step_type,
                "result": step_result
            })

            # Increment step counter
            state["current_step"] = current_step + 1

            logger.info(
                "✅ Workflow step complete",
                step_number=current_step + 1
            )

            return state

        except Exception as e:
            logger.error("❌ Workflow step execution failed", error=str(e))
            state["error"] = f"Workflow step execution failed: {str(e)}"
            return state

    async def error_handler_node(self, state: WorkflowState) -> WorkflowState:
        """
        Node: Handle errors and provide fallback responses
        """
        error = state.get("error", "Unknown error")

        logger.error(
            "⚠️  Error handler invoked",
            error=error,
            mode=state.get("mode")
        )

        # Increment retry count
        state["retry_count"] = state.get("retry_count", 0) + 1

        # Add error metadata
        if "metadata" not in state:
            state["metadata"] = {}

        state["metadata"]["error"] = error
        state["metadata"]["error_timestamp"] = datetime.utcnow().isoformat()
        state["metadata"]["retry_count"] = state["retry_count"]

        return state

    # ========================================================================
    # Routing Functions
    # ========================================================================

    def route_by_mode(self, state: WorkflowState) -> str:
        """Route to appropriate node based on execution mode"""
        if state.get("error"):
            return "error"

        mode = state.get("mode")

        if mode == ExecutionMode.SINGLE_EXPERT:
            return ExecutionMode.SINGLE_EXPERT
        elif mode == ExecutionMode.MULTI_EXPERT_PANEL:
            return ExecutionMode.MULTI_EXPERT_PANEL
        elif mode == ExecutionMode.EXPERT_RECOMMENDATION:
            return ExecutionMode.EXPERT_RECOMMENDATION
        elif mode == ExecutionMode.CUSTOM_WORKFLOW:
            return ExecutionMode.CUSTOM_WORKFLOW
        else:
            return "error"

    def check_workflow_complete(self, state: WorkflowState) -> str:
        """Check if custom workflow is complete"""
        if state.get("error"):
            return "error"

        current_step = state.get("current_step", 0)
        workflow_steps = state.get("workflow_steps", [])

        if current_step >= len(workflow_steps):
            return "complete"
        else:
            return "continue"

    # ========================================================================
    # Helper Functions
    # ========================================================================

    def _build_expert_prompt(
        self,
        query: str,
        context: str,
        agent: Dict[str, Any]
    ) -> str:
        """Build expert prompt with context and system instructions"""
        system_prompt = agent.get("system_prompt", "You are a helpful expert.")

        prompt = f"""# System Role
{system_prompt}

# Retrieved Knowledge Context
{context}

# User Query
{query}

# Instructions
Provide a comprehensive, evidence-based response to the user's query.
Use the retrieved knowledge context to support your answer.
If you're uncertain, acknowledge it explicitly.
Cite sources when applicable.
"""
        return prompt

    def _build_aggregation_prompt(
        self,
        query: str,
        responses: List[Dict[str, Any]]
    ) -> str:
        """Build aggregation prompt for panel consensus"""
        response_text = "\n\n".join([
            f"Expert {i+1} ({r['expert_name']}, Tier {r['tier']}, Confidence: {r['confidence']}):\n{r['response']}"
            for i, r in enumerate(responses)
        ])

        prompt = f"""# Task: Aggregate Expert Panel Responses

# Original Query
{query}

# Expert Responses
{response_text}

# Instructions
Synthesize the expert responses above into a single consensus response.

1. Identify areas of agreement across experts
2. Note any significant divergent opinions
3. Weigh responses by expert tier and confidence
4. Provide a balanced, comprehensive answer
5. Acknowledge uncertainty where experts disagree

Format your response as a coherent synthesis that addresses the original query.
"""
        return prompt

    async def _score_agent_for_query(
        self,
        query: str,
        agent: Dict[str, Any]
    ) -> float:
        """Score agent relevance for query (0.0 to 1.0)"""
        # Simple keyword-based scoring (could be enhanced with embeddings)
        query_lower = query.lower()
        agent_domains = agent.get("knowledge_domains", [])

        score = 0.5  # Base score

        # Boost score for domain matches
        for domain in agent_domains:
            if domain.lower() in query_lower:
                score += 0.3

        # Tier weighting
        tier = agent.get("tier", 2)
        if "clinical" in query_lower or "safety" in query_lower:
            # Prefer higher tier for clinical/safety queries
            score += (tier / 3) * 0.2

        return min(score, 1.0)

    def _extract_domain(self, query: str) -> str:
        """Extract domain from query (simple keyword matching)"""
        query_lower = query.lower()

        domains = {
            "clinical": ["clinical", "trial", "patient", "dosing"],
            "regulatory": ["fda", "regulatory", "compliance", "submission"],
            "pharmaceutical": ["drug", "pharmaceutical", "compound", "molecule"],
            "safety": ["safety", "adverse", "pharmacovigilance", "adr"]
        }

        for domain_name, keywords in domains.items():
            for keyword in keywords:
                if keyword in query_lower:
                    return domain_name

        return "general"

    def _calculate_agreement_score(self, responses: List[Dict[str, Any]]) -> float:
        """Calculate agreement score between responses (0.0 to 1.0)"""
        if len(responses) < 2:
            return 1.0

        # Simple heuristic: average of all pairwise confidence similarities
        # In production, use embeddings for semantic similarity
        confidences = [r.get("confidence", 0.5) for r in responses]
        avg_confidence = sum(confidences) / len(confidences)
        variance = sum((c - avg_confidence) ** 2 for c in confidences) / len(confidences)

        # Lower variance = higher agreement
        agreement = 1.0 - min(variance, 0.3) / 0.3

        return agreement

    async def _execute_expert_query_step(
        self,
        expert_id: str,
        query: str,
        state: WorkflowState
    ) -> Dict[str, Any]:
        """Execute a single expert query step"""
        # Reuse single expert logic
        temp_state = {
            **state,
            "expert_id": expert_id,
            "query": query
        }
        result = await self.invoke_single_expert_node(temp_state)
        return result.get("expert_response", {})

    async def _execute_aggregate_step(
        self,
        expert_ids: List[str],
        query: str,
        state: WorkflowState
    ) -> Dict[str, Any]:
        """Execute multi-expert aggregation step"""
        temp_state = {
            **state,
            "expert_ids": expert_ids,
            "query": query
        }
        panel_result = await self.invoke_expert_panel_node(temp_state)
        agg_result = await self.aggregate_panel_responses_node(panel_result)
        return agg_result.get("aggregated_response", {})

    async def _execute_retrieve_step(
        self,
        query: str,
        state: WorkflowState
    ) -> Dict[str, Any]:
        """Execute knowledge retrieval step"""
        temp_state = {
            **state,
            "query": query
        }
        result = await self.retrieve_knowledge_node(temp_state)
        return {
            "documents": result.get("retrieved_documents", []),
            "context": result.get("context", "")
        }


# ============================================================================
# Factory Function
# ============================================================================

def create_ask_expert_workflow(
    supabase_client,
    agent_service,
    rag_service,
    llm_service
) -> AskExpertUnifiedWorkflow:
    """
    Factory function to create and initialize Ask Expert workflow

    Usage:
        workflow = create_ask_expert_workflow(supabase, agent_svc, rag_svc, llm_svc)
        await workflow.initialize()

        result = await workflow.workflow.ainvoke({
            "query": "What are pediatric dosing considerations?",
            "mode": ExecutionMode.SINGLE_EXPERT,
            "expert_id": "expert_001",
            "tenant_id": "...",
            "user_id": "...",
            "session_id": str(uuid4())
        })
    """
    workflow = AskExpertUnifiedWorkflow(
        supabase_client=supabase_client,
        agent_service=agent_service,
        rag_service=rag_service,
        llm_service=llm_service
    )
    return workflow


# ============================================================================
# Module-level Initialization (for direct import by API)
# ============================================================================

# This allows the API to import ask_expert_graph directly
# The workflow will be initialized on first use
ask_expert_graph = None

try:
    # Lazy initialization - will be initialized when services are available
    logger.info("ask_expert_unified module loaded, graph will be initialized on first use")
except Exception as e:
    logger.error("Failed to initialize ask_expert_unified module", error=str(e))
