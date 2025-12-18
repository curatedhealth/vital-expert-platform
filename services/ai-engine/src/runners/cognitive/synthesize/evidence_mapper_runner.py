"""
SYNTHESIZE Category - Evidence Mapper Runner

Maps and integrates evidence from multiple sources into a coherent
evidence portfolio that supports positioning and claims.

Core Logic: Evidence Integration / Source Synthesis
"""

from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

from typing import Any, Dict, List, Optional
from pydantic import Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


# =============================================================================
# DATA SCHEMAS
# =============================================================================

class EvidenceItem(TaskRunnerOutput):
    """A piece of evidence from a source."""
    evidence_id: str = Field(default="")
    source_type: str = Field(default="clinical", description="clinical | real_world | economic | patient_reported | expert_opinion")
    source_name: str = Field(default="")
    evidence_type: str = Field(default="", description="clinical_trial | observational | meta_analysis | registry | survey")
    key_finding: str = Field(default="")
    strength: str = Field(default="moderate", description="weak | moderate | strong | definitive")
    relevance: str = Field(default="high", description="low | medium | high")
    limitations: List[str] = Field(default_factory=list)
    citation: str = Field(default="")


class EvidenceCluster(TaskRunnerOutput):
    """A cluster of related evidence supporting a claim."""
    cluster_id: str = Field(default="")
    claim_supported: str = Field(default="")
    evidence_items: List[str] = Field(default_factory=list, description="Evidence IDs in this cluster")
    overall_strength: str = Field(default="moderate", description="weak | moderate | strong | definitive")
    consistency: str = Field(default="consistent", description="unanimous | consistent | mixed | contradictory")
    gaps_identified: List[str] = Field(default_factory=list)


class EvidenceMapperInput(TaskRunnerInput):
    """Input for evidence mapping."""
    claims_to_support: List[str] = Field(..., description="Claims that need evidence support")
    evidence_sources: List[Dict[str, Any]] = Field(default_factory=list, description="Available evidence sources")
    stakeholder_requirements: Dict[str, List[str]] = Field(default_factory=dict, description="Evidence needs by stakeholder")
    mapping_depth: str = Field(default="standard", description="quick | standard | comprehensive")


class EvidenceMapperOutput(TaskRunnerOutput):
    """Output from evidence mapping."""
    evidence_items: List[EvidenceItem] = Field(default_factory=list)
    evidence_clusters: List[EvidenceCluster] = Field(default_factory=list)
    evidence_matrix: Dict[str, List[str]] = Field(default_factory=dict, description="Claim -> Evidence IDs")
    coverage_assessment: Dict[str, str] = Field(default_factory=dict, description="Claim -> Coverage level")
    evidence_gaps: List[str] = Field(default_factory=list)
    priority_gaps: List[str] = Field(default_factory=list)
    stakeholder_coverage: Dict[str, str] = Field(default_factory=dict)
    mapping_summary: str = Field(default="")


# =============================================================================
# EVIDENCE MAPPER RUNNER
# =============================================================================

@register_task_runner
class EvidenceMapperRunner(TaskRunner[EvidenceMapperInput, EvidenceMapperOutput]):
    """
    Map evidence from multiple sources to support claims.

    Algorithmic Core: evidence_integration
    Temperature: 0.2 (precise mapping)

    Maps:
    - Evidence to claims matrix
    - Evidence strength by source type
    - Gaps in evidence coverage
    - Stakeholder-specific evidence needs
    """
    runner_id = "evidence_mapper"
    name = "Evidence Mapper Runner"
    description = "Map evidence to claims using evidence integration"
    category = TaskRunnerCategory.SYNTHESIZE
    algorithmic_core = "evidence_integration"
    max_duration_seconds = 150
    InputType = EvidenceMapperInput
    OutputType = EvidenceMapperOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=0.2, max_tokens=4000)

    async def execute(self, input: EvidenceMapperInput) -> EvidenceMapperOutput:
        start_time = datetime.utcnow()
        try:
            prompt = f"""Map evidence from sources to support claims.

Claims to Support: {input.claims_to_support}
Evidence Sources: {input.evidence_sources[:10] if input.evidence_sources else 'Not provided - infer typical evidence types'}
Stakeholder Requirements: {input.stakeholder_requirements}
Mapping Depth: {input.mapping_depth}

Create an evidence map that:
1. Extracts key evidence from each source
2. Maps evidence to claims it supports
3. Clusters related evidence together
4. Assesses coverage and identifies gaps
5. Evaluates stakeholder-specific coverage

Return JSON with:
- evidence_items: array of {{evidence_id, source_type (clinical|real_world|economic|patient_reported|expert_opinion), source_name, evidence_type (clinical_trial|observational|meta_analysis|registry|survey), key_finding, strength (weak|moderate|strong|definitive), relevance (low|medium|high), limitations[], citation}}
- evidence_clusters: array of {{cluster_id, claim_supported, evidence_items[] (IDs), overall_strength, consistency (unanimous|consistent|mixed|contradictory), gaps_identified[]}}
- evidence_matrix: dict mapping claim -> list of evidence_ids
- coverage_assessment: dict mapping claim -> coverage level (none|weak|moderate|strong|comprehensive)
- evidence_gaps: array of missing evidence
- priority_gaps: array of critical gaps to address first
- stakeholder_coverage: dict mapping stakeholder -> coverage level
- mapping_summary: overall evidence portfolio assessment
"""

            response = await self.llm.ainvoke([
                SystemMessage(content="You are an evidence mapping specialist. Create comprehensive evidence maps that show how available evidence supports claims, identify gaps, and assess overall coverage."),
                HumanMessage(content=prompt)
            ])
            result = self._parse_json(response.content)

            evidence_items = [EvidenceItem(**e) for e in result.get("evidence_items", [])]
            evidence_clusters = [EvidenceCluster(**c) for c in result.get("evidence_clusters", [])]

            return EvidenceMapperOutput(
                success=True,
                evidence_items=evidence_items,
                evidence_clusters=evidence_clusters,
                evidence_matrix=result.get("evidence_matrix", {}),
                coverage_assessment=result.get("coverage_assessment", {}),
                evidence_gaps=result.get("evidence_gaps", []),
                priority_gaps=result.get("priority_gaps", []),
                stakeholder_coverage=result.get("stakeholder_coverage", {}),
                mapping_summary=result.get("mapping_summary", ""),
                confidence_score=0.85,
                quality_score=len(evidence_items) * 0.1 + len(evidence_clusters) * 0.15,
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )
        except Exception as e:
            logger.error(f"EvidenceMapperRunner error: {e}")
            return EvidenceMapperOutput(
                success=False,
                error=str(e),
                duration_seconds=(datetime.utcnow()-start_time).total_seconds(),
                runner_id=self.runner_id
            )

    def _parse_json(self, content: str) -> Dict:
        import json
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content)
        except:
            return {}
