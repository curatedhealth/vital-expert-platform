"""
L3 Context Specialist - domain-aware strategist for mission planning.
Analyzes user goals, expands terms, recommends tools, and returns a strategy payload.
"""

from typing import Any, Dict
import json
import structlog

from ..base_agent import AgentConfig, BaseAgent

logger = structlog.get_logger()


class L3ContextSpecialist(BaseAgent):
    """
    Domain-aware L3 specialist (Pharma/Regulatory/Clinical).
    Produces strategy metadata consumed by mission runners.
    """

    def __init__(self, config: AgentConfig):
        super().__init__(config)

    async def analyze_query(self, query: str) -> Dict[str, Any]:
        system_prompt = f"""{self.system_prompt}

You are a Level 3 Context Specialist for pharmaceutical intelligence.
Analyze the query to determine the optimal research strategy.

1) Intent classification: clinical / regulatory / commercial / scientific / safety
2) Expand terms (e.g., "heart attack" -> "myocardial infarction"; "side effects" -> "adverse events", "toxicity").
3) Identify entities/topics to map the landscape.
4) Recommend tools (L5-PM, L5-CT, L5-OPENFDA, L5-WEB, L5-RAG) appropriate to the intent.

Return JSON with: intent, entities, expanded_terms, strategy_type, recommended_tools.
"""
        try:
            from langchain_openai import ChatOpenAI
        except ImportError:
            logger.warning("l3_context_specialist_llm_missing")
            return self._fallback_strategy(query)

        llm = ChatOpenAI(
            model=self.get_model_params().get("model") or "gpt-4o-mini",
            temperature=self.get_model_params().get("temperature") or 0.0,
        )
        response = await llm.ainvoke([("system", system_prompt), ("user", query)])
        try:
            return json.loads(response.content)
        except Exception:
            logger.warning("l3_context_specialist_parse_fallback")
            return self._fallback_strategy(query)

    async def execute(self, task: str, params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Compatibility wrapper for runner usage."""
        query = params.get("query") or context.get("goal") or task
        strategy = await self.analyze_query(query)
        return {"output": strategy, "citations": []}

    @staticmethod
    def _fallback_strategy(query: str) -> Dict[str, Any]:
        return {
            "intent": "general",
            "entities": [],
            "expanded_terms": [query],
            "strategy_type": "general_research",
            "recommended_tools": ["L5-PM", "L5-WEB"],
        }
