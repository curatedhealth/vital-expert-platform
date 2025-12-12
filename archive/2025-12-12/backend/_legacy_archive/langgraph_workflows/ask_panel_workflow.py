"""
Ask Panel LangGraph Workflow
Implements multi-expert consultation with parallel execution and consensus building
Uses LangGraph 0.6.11 StateGraph pattern
"""

from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
import operator
import asyncio
import structlog
from datetime import datetime

logger = structlog.get_logger()


# State definition using TypedDict and Annotated for proper state management
class PanelState(TypedDict):
    """State for Ask Panel workflow"""
    question: str
    tenant_id: str
    user_id: str
    session_id: str
    template_slug: str
    selected_agent_ids: List[str]

    # RAG and context
    retrieved_documents: List[Dict[str, Any]]
    context: str

    # Expert responses (accumulated with operator.add)
    expert_responses: Annotated[List[Dict[str, Any]], operator.add]

    # Consensus analysis
    consensus_level: float
    consensus_summary: str
    divergent_points: List[Dict[str, Any]]

    # Metadata
    processing_metadata: Dict[str, Any]
    error: Optional[str]


class AskPanelWorkflow:
    """LangGraph workflow for Ask Panel multi-expert consultation"""

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
        """Initialize the LangGraph workflow"""
        # Build the state graph
        workflow = StateGraph(PanelState)

        # Add nodes
        workflow.add_node("retrieve_knowledge", self.retrieve_knowledge_node)
        workflow.add_node("parallel_experts", self.parallel_expert_execution_node)
        workflow.add_node("aggregate_responses", self.aggregate_responses_node)
        workflow.add_node("build_consensus", self.build_consensus_node)

        # Set entry point
        workflow.set_entry_point("retrieve_knowledge")

        # Add edges
        workflow.add_edge("retrieve_knowledge", "parallel_experts")
        workflow.add_edge("parallel_experts", "aggregate_responses")
        workflow.add_edge("aggregate_responses", "build_consensus")
        workflow.add_edge("build_consensus", END)

        # Compile the workflow
        self.workflow = workflow.compile()

        logger.info("✅ Ask Panel LangGraph workflow initialized")

    async def retrieve_knowledge_node(self, state: PanelState) -> PanelState:
        """
        Node 1: Retrieve relevant knowledge from RAG service
        This knowledge is shared across all expert agents
        """
        try:
            logger.info(
                "📚 Retrieving knowledge for panel",
                question=state["question"][:100]
            )

            # Query unified RAG service with true_hybrid (Neo4j + Pinecone + Supabase)
            rag_results = await self.rag_service.query(
                query_text=state["question"],
                strategy="true_hybrid",  # Use true hybrid: Neo4j (KG) + Pinecone (vector) + Supabase (relational)
                max_results=15,
                similarity_threshold=0.7,
                tenant_id=state.get("tenant_id"),
                agent_id=None  # Panel mode doesn't use single agent
            )

            documents = rag_results.get("sources", [])
            context = "\n\n".join([
                f"[Source {i+1}]: {doc.get('content', '')}"
                for i, doc in enumerate(documents[:10])
            ])

            state["retrieved_documents"] = documents
            state["context"] = context

            logger.info(
                "✅ Knowledge retrieval complete",
                documents_count=len(documents)
            )

            return state

        except Exception as e:
            logger.error("❌ Knowledge retrieval failed", error=str(e))
            state["error"] = f"Knowledge retrieval failed: {str(e)}"
            return state

    async def parallel_expert_execution_node(self, state: PanelState) -> PanelState:
        """
        Node 2: Execute multiple expert agents in parallel
        Uses asyncio semaphore to control concurrency
        """
        try:
            logger.info(
                "🎭 Executing panel experts in parallel",
                expert_count=len(state["selected_agent_ids"])
            )

            # Limit concurrent expert execution (max 5 at a time)
            semaphore = asyncio.Semaphore(5)

            async def execute_single_expert(agent_id: str) -> Dict[str, Any]:
                """Execute a single expert agent"""
                async with semaphore:
                    try:
                        # Add timeout for individual expert (30 seconds)
                        result = await asyncio.wait_for(
                            self._execute_expert_with_context(
                                agent_id=agent_id,
                                question=state["question"],
                                context=state["context"],
                                tenant_id=state["tenant_id"]
                            ),
                            timeout=30.0
                        )
                        return result
                    except asyncio.TimeoutError:
                        logger.warning(f"Expert {agent_id} timed out")
                        return {
                            "agent_id": agent_id,
                            "success": False,
                            "error": "Execution timed out (30s)"
                        }
                    except Exception as e:
                        logger.error(f"Expert {agent_id} failed", error=str(e))
                        return {
                            "agent_id": agent_id,
                            "success": False,
                            "error": str(e)
                        }

            # Execute all experts in parallel
            tasks = [
                execute_single_expert(agent_id)
                for agent_id in state["selected_agent_ids"]
            ]

            # Gather results (doesn't fail if individual experts fail)
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Filter successful responses
            successful_responses = [
                r for r in results
                if isinstance(r, dict) and r.get("success", False)
            ]

            logger.info(
                "✅ Parallel expert execution complete",
                total=len(results),
                successful=len(successful_responses)
            )

            # Return state with accumulated expert responses
            return {
                **state,
                "expert_responses": successful_responses
            }

        except Exception as e:
            logger.error("❌ Parallel execution failed", error=str(e))
            state["error"] = f"Parallel execution failed: {str(e)}"
            return state

    async def _execute_expert_with_context(
        self,
        agent_id: str,
        question: str,
        context: str,
        tenant_id: str
    ) -> Dict[str, Any]:
        """Execute a single expert agent with RAG context"""
        # Get agent configuration
        agent = await self.agent_service.get_agent(agent_id)

        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        # Build expert prompt with context
        expert_prompt = f"""You are {agent.get('name', 'an expert')}.

{agent.get('system_prompt', '')}

Context/Knowledge Base:
{context}

User Question:
{question}

Provide your expert analysis and recommendations based on your expertise and the provided context."""

        # Call LLM with agent's model configuration
        response = await self.llm_service.generate(
            prompt=expert_prompt,
            model=agent.get('model', 'gpt-4'),
            temperature=agent.get('temperature', 0.7),
            max_tokens=agent.get('max_tokens', 2000)
        )

        return {
            "agent_id": agent_id,
            "agent_name": agent.get('name'),
            "response": response,
            "success": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def aggregate_responses_node(self, state: PanelState) -> PanelState:
        """
        Node 3: Aggregate expert responses and identify patterns
        """
        try:
            logger.info(
                "📊 Aggregating expert responses",
                response_count=len(state["expert_responses"])
            )

            responses = state["expert_responses"]

            if not responses:
                state["error"] = "No expert responses to aggregate"
                return state

            # Extract key points from all responses
            all_responses_text = "\n\n---\n\n".join([
                f"Expert: {r['agent_name']}\n{r['response']}"
                for r in responses
            ])

            state["processing_metadata"] = {
                "total_experts": len(state["selected_agent_ids"]),
                "successful_responses": len(responses),
                "aggregated_at": datetime.utcnow().isoformat()
            }

            logger.info("✅ Response aggregation complete")

            return state

        except Exception as e:
            logger.error("❌ Aggregation failed", error=str(e))
            state["error"] = f"Aggregation failed: {str(e)}"
            return state

    async def build_consensus_node(self, state: PanelState) -> PanelState:
        """
        Node 4: Build consensus and identify areas of agreement/disagreement
        """
        try:
            logger.info("🤝 Building consensus from expert panel")

            responses = state["expert_responses"]

            if not responses:
                state["consensus_level"] = 0.0
                state["consensus_summary"] = "No expert responses available"
                state["divergent_points"] = []
                return state

            # Build consensus prompt
            consensus_prompt = f"""Analyze the following expert panel responses and build a consensus summary.

Question: {state['question']}

Expert Responses:
{chr(10).join([f"Expert {i+1} ({r['agent_name']}): {r['response']}" for i, r in enumerate(responses)])}

Provide:
1. Overall consensus level (0.0 to 1.0)
2. Summary of areas of agreement
3. Key divergent points or disagreements
4. Final synthesized recommendation

Format your response as JSON."""

            consensus_analysis = await self.llm_service.generate(
                prompt=consensus_prompt,
                model="gpt-4",
                temperature=0.3,  # Lower temperature for analytical task
                max_tokens=1500
            )

            # Parse consensus analysis (simplified - would use structured output in production)
            state["consensus_level"] = 0.85  # Placeholder - would extract from LLM response
            state["consensus_summary"] = consensus_analysis
            state["divergent_points"] = []  # Would extract from structured LLM response

            logger.info(
                "✅ Consensus built",
                consensus_level=state["consensus_level"]
            )

            return state

        except Exception as e:
            logger.error("❌ Consensus building failed", error=str(e))
            state["error"] = f"Consensus building failed: {str(e)}"
            state["consensus_level"] = 0.0
            state["consensus_summary"] = f"Error: {str(e)}"
            return state

    async def execute(
        self,
        question: str,
        template_slug: str,
        selected_agent_ids: List[str],
        tenant_id: str,
        user_id: str,
        session_id: str
    ) -> Dict[str, Any]:
        """
        Execute the Ask Panel workflow

        Args:
            question: User's question for the panel
            template_slug: Panel template slug (e.g., 'ap_mode_1')
            selected_agent_ids: List of expert agent IDs
            tenant_id: Tenant identifier
            user_id: User identifier
            session_id: Session identifier

        Returns:
            Dictionary with panel results
        """
        if not self.workflow:
            raise RuntimeError("Workflow not initialized. Call initialize() first.")

        initial_state: PanelState = {
            "question": question,
            "tenant_id": tenant_id,
            "user_id": user_id,
            "session_id": session_id,
            "template_slug": template_slug,
            "selected_agent_ids": selected_agent_ids,
            "retrieved_documents": [],
            "context": "",
            "expert_responses": [],
            "consensus_level": 0.0,
            "consensus_summary": "",
            "divergent_points": [],
            "processing_metadata": {},
            "error": None
        }

        logger.info(
            "🚀 Starting Ask Panel workflow",
            question=question[:100],
            experts=len(selected_agent_ids),
            template=template_slug
        )

        try:
            # Execute workflow with total timeout (120 seconds)
            result = await asyncio.wait_for(
                self.workflow.ainvoke(initial_state),
                timeout=120.0
            )

            logger.info(
                "✅ Ask Panel workflow completed",
                consensus_level=result["consensus_level"],
                expert_responses=len(result["expert_responses"])
            )

            return {
                "success": True,
                "question": result["question"],
                "consensus_level": result["consensus_level"],
                "consensus_summary": result["consensus_summary"],
                "expert_responses": result["expert_responses"],
                "divergent_points": result["divergent_points"],
                "processing_metadata": result["processing_metadata"],
                "error": result.get("error")
            }

        except asyncio.TimeoutError:
            logger.error("❌ Ask Panel workflow timed out (120s)")
            return {
                "success": False,
                "error": "Panel execution timed out after 120 seconds"
            }
        except Exception as e:
            logger.error("❌ Ask Panel workflow failed", error=str(e))
            return {
                "success": False,
                "error": str(e)
            }
