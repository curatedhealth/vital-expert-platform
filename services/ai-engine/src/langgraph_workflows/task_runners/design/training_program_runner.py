"""
TrainingProgramDesignerRunner - Design training programs.

Algorithmic Core: Training Design
- Designs comprehensive training programs
- Maps learning objectives to modules
- Creates development pathways
"""

import logging
from typing import Any, Dict, List, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field
from ..base_task_runner import TaskRunner, TaskRunnerCategory, TaskRunnerInput, TaskRunnerOutput
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


class TrainingModule(TaskRunnerOutput):
    """Training module definition."""
    module_id: str = Field(default="")
    module_name: str = Field(default="")
    description: str = Field(default="")
    learning_objectives: List[str] = Field(default_factory=list)
    delivery_method: str = Field(default="", description="classroom | virtual | self_paced | blended | coaching")
    duration_hours: float = Field(default=0.0)
    prerequisites: List[str] = Field(default_factory=list)
    assessments: List[str] = Field(default_factory=list)


class TrainingProgramInput(TaskRunnerInput):
    """Input schema for TrainingProgramDesignerRunner."""
    skill_gaps: List[Dict[str, Any]] = Field(default_factory=list, description="Skill gaps to address")
    target_audience: List[str] = Field(default_factory=list, description="Target audience")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="Budget/time constraints")


class TrainingProgramOutput(TaskRunnerOutput):
    """Output schema for TrainingProgramDesignerRunner."""
    modules: List[TrainingModule] = Field(default_factory=list, description="Training modules")
    learning_paths: Dict[str, List[str]] = Field(default_factory=dict, description="Learning paths by role")
    program_timeline: Dict[str, Any] = Field(default_factory=dict, description="Program timeline")
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, description="Resource requirements")


@register_task_runner
class TrainingProgramDesignerRunner(TaskRunner[TrainingProgramInput, TrainingProgramOutput]):
    """Design training programs."""

    runner_id = "training_program_designer"
    category = TaskRunnerCategory.DESIGN
    algorithmic_core = "training_design"
    max_duration_seconds = 90
    temperature = 0.4

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(model="gpt-4-turbo-preview", temperature=self.temperature, max_tokens=3000)

    async def execute(self, input_data: TrainingProgramInput) -> TrainingProgramOutput:
        logger.info("Executing TrainingProgramDesignerRunner")
        prompt = f"""Design training program:
Gaps: {input_data.skill_gaps[:10]}
Audience: {input_data.target_audience}
Constraints: {input_data.constraints}

Return JSON:
- modules[]: module_id, module_name, description, learning_objectives[], delivery_method, duration_hours, prerequisites[], assessments[]
- learning_paths{{}}
- program_timeline{{}}
- resource_requirements{{}}"""

        try:
            response = await self.llm.ainvoke([SystemMessage(content="You are a learning and development expert."), HumanMessage(content=prompt)])
            result = self._parse_json(response.content)
            return TrainingProgramOutput(
                modules=[TrainingModule(**m) for m in result.get("modules", [])],
                learning_paths=result.get("learning_paths", {}),
                program_timeline=result.get("program_timeline", {}),
                resource_requirements=result.get("resource_requirements", {}),
                quality_score=0.8 if result.get("modules") else 0.4,
            )
        except Exception as e:
            logger.error(f"TrainingProgramDesignerRunner failed: {e}")
            return TrainingProgramOutput(error=str(e), quality_score=0.0)

    def _parse_json(self, content: str) -> Dict[str, Any]:
        import json
        try:
            if "```json" in content: content = content.split("```json")[1].split("```")[0]
            elif "```" in content: content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except: return {}


__all__ = ["TrainingProgramDesignerRunner", "TrainingProgramInput", "TrainingProgramOutput", "TrainingModule"]
