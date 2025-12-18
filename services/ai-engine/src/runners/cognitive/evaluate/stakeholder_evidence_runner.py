"""
StakeholderEvidenceAnalystRunner - Analyze stakeholder evidence needs.

Algorithmic Core: Evidence Needs Analysis
- Analyzes what evidence stakeholders need
- Maps evidence gaps by stakeholder type
- Prioritizes evidence generation
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class EvidenceNeed(TaskRunnerOutput):
    """Evidence need for stakeholder."""
    stakeholder_type: str = Field(default="")
    evidence_type: str = Field(default="", description="clinical | economic | real_world | comparative")
    priority: str = Field(default="medium", description="critical | high | medium | low")
    current_status: str = Field(default="", description="available | partial | missing")
    gap_description: str = Field(default="")
    recommended_action: str = Field(default="")


class StakeholderEvidenceInput(TaskRunnerInput):
    """Input schema for StakeholderEvidenceAnalystRunner."""
    stakeholder_types: List[str] = Field(default_factory=list, description="Stakeholder types to analyze")
    available_evidence: List[Dict[str, Any]] = Field(default_factory=list, description="Available evidence")
    strategic_context: str = Field(default="", description="Strategic context")


class StakeholderEvidenceOutput(TaskRunnerOutput):
    """Output schema for StakeholderEvidenceAnalystRunner."""
    evidence_needs: List[EvidenceNeed] = Field(default_factory=list, description="Evidence needs by stakeholder")
    needs_by_stakeholder: Dict[str, List[str]] = Field(default_factory=dict, description="Needs matrix")
    priority_gaps: List[str] = Field(default_factory=list, description="Priority evidence gaps")
    evidence_strategy: Dict[str, Any] = Field(default_factory=dict, description="Evidence strategy")


@register_task_runner
class StakeholderEvidenceAnalystRunner(TaskRunner[StakeholderEvidenceInput, StakeholderEvidenceOutput]):
    """Analyze stakeholder evidence needs."""

    runner_id = "stakeholder_evidence_analyst"
    category = TaskRunnerCategory.EVALUATE
    algorithmic_core = "evidence_needs_analysis"
    max_duration_seconds = 90
    temperature = 0.3

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: StakeholderEvidenceInput) -> StakeholderEvidenceOutput:
        logger.info("Executing StakeholderEvidenceAnalystRunner")
        prompt = f"""Analyze stakeholder evidence needs:
Stakeholders: {input_data.stakeholder_types}
Available evidence: {input_data.available_evidence[:10]}
Context: {input_data.strategic_context}

Return JSON:
- evidence_needs[]: stakeholder_type, evidence_type, priority, current_status, gap_description, recommended_action
- needs_by_stakeholder{{}}
- priority_gaps[]
- evidence_strategy{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are an evidence strategy expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return StakeholderEvidenceOutput(
                evidence_needs=[EvidenceNeed(**n) for n in result.get("evidence_needs", [])],
                needs_by_stakeholder=result.get("needs_by_stakeholder", {}),
                priority_gaps=result.get("priority_gaps", []),
                evidence_strategy=result.get("evidence_strategy", {}),
                quality_score=0.8 if result.get("evidence_needs") else 0.4,
            )
        except Exception as e:
            logger.error(f"StakeholderEvidenceAnalystRunner failed: {e}")
            return StakeholderEvidenceOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["StakeholderEvidenceAnalystRunner", "StakeholderEvidenceInput", "StakeholderEvidenceOutput", "EvidenceNeed"]
