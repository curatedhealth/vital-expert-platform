"""
InfluenceNetworkAnalyzerRunner - Analyze stakeholder influence networks.

Algorithmic Core: Network Analysis
- Maps influence relationships between stakeholders
- Identifies key connectors and network clusters
- Calculates network metrics (centrality, betweenness)
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class NetworkNode(TaskRunnerOutput):
    """Node in influence network."""
    node_id: str = Field(default="")
    name: str = Field(default="")
    centrality_score: float = Field(default=0.0)
    betweenness_score: float = Field(default=0.0)
    cluster_id: str = Field(default="")
    influence_type: str = Field(default="", description="connector | authority | broker | peripheral")


class NetworkEdge(TaskRunnerOutput):
    """Edge in influence network."""
    source: str = Field(default="")
    target: str = Field(default="")
    relationship_type: str = Field(default="")
    strength: float = Field(default=0.5, description="0-1 relationship strength")


class InfluenceNetworkInput(TaskRunnerInput):
    """Input schema for InfluenceNetworkAnalyzerRunner."""
    stakeholders: List[Dict[str, Any]] = Field(default_factory=list, description="Stakeholders")
    known_relationships: List[Dict[str, Any]] = Field(default_factory=list, description="Known relationships")
    analysis_depth: str = Field(default="standard", description="quick | standard | deep")


class InfluenceNetworkOutput(TaskRunnerOutput):
    """Output schema for InfluenceNetworkAnalyzerRunner."""
    nodes: List[NetworkNode] = Field(default_factory=list, description="Network nodes")
    edges: List[NetworkEdge] = Field(default_factory=list, description="Network edges")
    clusters: Dict[str, List[str]] = Field(default_factory=dict, description="Network clusters")
    key_connectors: List[str] = Field(default_factory=list, description="Key connectors")
    network_density: float = Field(default=0.0, description="Network density 0-1")
    influence_pathways: List[Dict[str, Any]] = Field(default_factory=list, description="Key influence pathways")


@register_task_runner
class InfluenceNetworkAnalyzerRunner(TaskRunner[InfluenceNetworkInput, InfluenceNetworkOutput]):
    """Analyze stakeholder influence networks."""

    runner_id = "influence_network_analyzer"
    category = TaskRunnerCategory.UNDERSTAND
    algorithmic_core = "network_analysis"
    max_duration_seconds = 120
    temperature = 0.2

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=4000)

    async def execute(self, input_data: InfluenceNetworkInput) -> InfluenceNetworkOutput:
        logger.info("Executing InfluenceNetworkAnalyzerRunner")
        prompt = f"""Analyze influence network:
Stakeholders: {input_data.stakeholders[:15]}
Known relationships: {input_data.known_relationships[:10]}
Depth: {input_data.analysis_depth}

Return JSON:
- nodes[]: node_id, name, centrality_score, betweenness_score, cluster_id, influence_type
- edges[]: source, target, relationship_type, strength
- clusters{{}}
- key_connectors[]
- network_density (0-1)
- influence_pathways[]"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a network analysis expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return InfluenceNetworkOutput(
                nodes=[NetworkNode(**n) for n in result.get("nodes", [])],
                edges=[NetworkEdge(**e) for e in result.get("edges", [])],
                clusters=result.get("clusters", {}),
                key_connectors=result.get("key_connectors", []),
                network_density=result.get("network_density", 0.0),
                influence_pathways=result.get("influence_pathways", []),
                quality_score=0.85 if result.get("nodes") else 0.4,
            )
        except Exception as e:
            logger.error(f"InfluenceNetworkAnalyzerRunner failed: {e}")
            return InfluenceNetworkOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["InfluenceNetworkAnalyzerRunner", "InfluenceNetworkInput", "InfluenceNetworkOutput", "NetworkNode", "NetworkEdge"]
