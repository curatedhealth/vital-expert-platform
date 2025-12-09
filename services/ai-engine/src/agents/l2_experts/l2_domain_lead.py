"""
L2 Domain Lead - Expert-level agent that generates responses using LLM.

Uses the agent's system prompt and model configuration to generate
evidence-based responses to user queries.

Architecture Pattern:
- PostgreSQL agents table: Agent-specific config (model, temperature, max_tokens)
- Environment variables: L2_LLM_MODEL, L2_LLM_TEMPERATURE, L2_LLM_MAX_TOKENS
- Python: NO hardcoded model/temperature/max_tokens values
"""

from typing import Any, Dict, List, Optional
import structlog

from ..base_agent import AgentConfig, BaseAgent
from infrastructure.llm.config_service import get_llm_config_for_level

logger = structlog.get_logger()

# Get L2 defaults from environment variables
_L2_DEFAULTS = get_llm_config_for_level("L2")


class L2DomainLead(BaseAgent):
    """
    L2 Domain Expert - generates LLM-based responses.

    - Uses agent's system_prompt and base_model for generation
    - Incorporates enriched context (citations, evidence) into responses
    - Falls back to simple review if LLM unavailable
    """

    def __init__(self, config: AgentConfig):
        super().__init__(config)
        self._llm = None
        self._init_llm()

    def _init_llm(self):
        """Initialize LLM based on agent config, falling back to L2 env defaults."""
        model_params = self.get_model_params()
        # Use agent config if provided, otherwise fall back to L2 env defaults
        model = model_params.get("model") or _L2_DEFAULTS.model
        temperature = model_params.get("temperature") or _L2_DEFAULTS.temperature
        max_tokens = model_params.get("max_tokens") or _L2_DEFAULTS.max_tokens

        try:
            from langchain_openai import ChatOpenAI

            self._llm = ChatOpenAI(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            logger.info(
                "l2_domain_lead_llm_initialized",
                agent_id=self.config.id,
                model=model,
                temperature=temperature,
            )
        except ImportError:
            logger.warning("l2_domain_lead_llm_not_available", agent_id=self.config.id)
            self._llm = None

    async def generate(self, goal: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a response using LLM with the agent's system prompt."""
        if not self._llm:
            return {
                "content": "LLM not available for generation.",
                "citations": [],
            }

        # Build context from enriched data
        enriched = context.get("enriched_context") or context
        citations = enriched.get("citations") or []
        evidence_text = ""
        if citations:
            evidence_text = "\n\n## Available Evidence:\n"
            for i, cite in enumerate(citations[:5], 1):
                title = cite.get("title", "Unknown")
                snippet = cite.get("snippet", cite.get("text", ""))[:200]
                evidence_text += f"{i}. {title}: {snippet}...\n"

        # Construct messages
        from langchain_core.messages import SystemMessage, HumanMessage

        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=f"{goal}{evidence_text}"),
        ]

        try:
            response = await self._llm.ainvoke(messages)
            content = response.content
            logger.info(
                "l2_domain_lead_generated",
                agent_id=self.config.id,
                response_length=len(content),
            )
            return {
                "content": content,
                "citations": citations,
            }
        except Exception as exc:
            logger.error(
                "l2_domain_lead_generation_failed",
                agent_id=self.config.id,
                error=str(exc),
            )
            return {
                "content": f"Generation failed: {str(exc)}",
                "citations": [],
            }

    async def plan(self, goal: str, strategy: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        steps = [
            {"step": 1, "action": "clarify_intent", "owner": "L3"},
            {"step": 2, "action": "gather_evidence", "owner": "L4"},
            {"step": 3, "action": "draft_analysis", "owner": "L3"},
            {"step": 4, "action": "review_and_finalize", "owner": "L2"},
        ]
        if strategy:
            steps.insert(1, {"step": 1, "action": "apply_strategy", "owner": "L3", "details": strategy})
        return {"plan": steps, "goal": goal}

    async def review(self, artifacts: List[Dict[str, Any]], goal: str) -> Dict[str, Any]:
        approved = bool(artifacts)
        notes = "Approved" if approved else "Needs more evidence"
        citations: List[Dict[str, Any]] = []
        for art in artifacts:
            data = art.get("citations") or []
            if isinstance(data, list):
                citations.extend(data)
        return {
            "approved": approved,
            "notes": notes,
            "goal": goal,
            "citations": citations,
        }

    async def execute(self, task: str, params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute agent task - generate response or review artifacts.

        For 'review' or 'generate' tasks, uses LLM to generate full response.
        For 'plan' tasks, returns task decomposition.
        """
        goal = params.get("goal") or context.get("goal") or task

        if params.get("action") == "plan":
            return {"output": await self.plan(goal, params.get("strategy")), "citations": []}

        # Default: Generate a proper response using LLM
        result = await self.generate(goal, context)
        return {
            "output": result.get("content", "No response generated."),
            "analysis": result.get("content"),  # For compatibility with l2_nodes.py
            "citations": result.get("citations", []),
        }
