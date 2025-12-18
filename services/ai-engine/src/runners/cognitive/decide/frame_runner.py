"""
FrameRunner - Structure decision using decision tree construction.

Algorithmic Core: Decision Tree Construction
- Structures complex decisions into clear frameworks
- Identifies decision nodes, chance nodes, and outcomes
- Maps dependencies and sequences

Use Cases:
- Strategic decision structuring
- Investment decision framing
- Go/no-go decision setup
- Portfolio prioritization framing
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import Field

from ..base_task_runner import (
    TaskRunner,
    TaskRunnerCategory,
    TaskRunnerInput,
    TaskRunnerOutput,
)
from ..registry import register_task_runner

logger = logging.getLogger(__name__)


# =============================================================================
# Input/Output Schemas
# =============================================================================

class FrameInput(TaskRunnerInput):
    """Input schema for FrameRunner."""

    context: str = Field(..., description="Decision context and background")
    decision_question: Optional[str] = Field(
        default=None,
        description="Explicit decision question (if not clear from context)"
    )
    stakeholders: List[str] = Field(
        default_factory=list,
        description="Key stakeholders in the decision"
    )
    constraints: List[str] = Field(
        default_factory=list,
        description="Known constraints or boundaries"
    )
    time_horizon: Optional[str] = Field(
        default=None,
        description="Decision time horizon (e.g., '6 months', 'Q2 2025')"
    )


class DecisionNode(TaskRunnerOutput):
    """A node in the decision tree."""

    node_id: str = Field(default="", description="Unique node identifier")
    node_type: str = Field(default="decision", description="decision | chance | outcome")
    label: str = Field(default="", description="Node label/question")
    description: str = Field(default="", description="Detailed description")
    parent_id: Optional[str] = Field(default=None, description="Parent node ID")
    branches: List[str] = Field(default_factory=list, description="Possible branches/options")
    probability: Optional[float] = Field(default=None, description="Probability for chance nodes")


class FrameOutput(TaskRunnerOutput):
    """Output schema for FrameRunner."""

    decision_statement: str = Field(
        default="",
        description="Clear statement of the decision"
    )
    decision_type: str = Field(
        default="",
        description="Type: binary | multi-option | sequential | portfolio"
    )
    decision_tree: List[DecisionNode] = Field(
        default_factory=list,
        description="Decision tree structure"
    )
    key_uncertainties: List[str] = Field(
        default_factory=list,
        description="Key uncertainties affecting the decision"
    )
    success_criteria: List[str] = Field(
        default_factory=list,
        description="Criteria for a successful decision"
    )
    stakeholder_interests: Dict[str, str] = Field(
        default_factory=dict,
        description="Stakeholder interests mapping"
    )
    decision_boundaries: List[str] = Field(
        default_factory=list,
        description="What is in/out of scope"
    )
    information_gaps: List[str] = Field(
        default_factory=list,
        description="Information needed before deciding"
    )


# =============================================================================
# FrameRunner Implementation
# =============================================================================

@register_task_runner
class FrameRunner(TaskRunner[FrameInput, FrameOutput]):
    """
    Decision tree construction runner.

    This runner structures complex decisions into clear frameworks,
    identifying decision points, uncertainties, and outcomes.

    Algorithmic Pattern:
        1. Parse decision context
        2. Identify the core decision question
        3. Decompose into decision nodes
        4. Identify chance nodes (uncertainties)
        5. Map outcome nodes
        6. Define success criteria

    Best Used For:
        - Strategic decision structuring
        - Complex choice framing
        - Investment decisions
        - Go/no-go decisions
    """

    runner_id = "frame"
    name = "Frame Runner"
    description = "Structure decision using decision tree construction"
    category = TaskRunnerCategory.DECIDE
    algorithmic_core = "decision_tree_construction"
    max_duration_seconds = 90

    InputType = FrameInput
    OutputType = FrameOutput

    def __init__(self, llm: Optional[ChatOpenAI] = None, **kwargs: Any):
        """Initialize FrameRunner with LLM."""
        super().__init__(llm=llm, **kwargs)
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3,
            max_tokens=2500,
        )

    async def execute(self, input: FrameInput) -> FrameOutput:
        """
        Execute decision framing.

        Args:
            input: Framing parameters including context and constraints

        Returns:
            FrameOutput with decision tree and framework
        """
        start_time = datetime.utcnow()
        tokens_used = 0

        try:
            # Build context
            stakeholders_text = ""
            if input.stakeholders:
                stakeholders_text = f"\nKey stakeholders: {', '.join(input.stakeholders)}"

            constraints_text = ""
            if input.constraints:
                constraints_text = f"\nConstraints: {', '.join(input.constraints)}"

            horizon_text = ""
            if input.time_horizon:
                horizon_text = f"\nTime horizon: {input.time_horizon}"

            question_text = ""
            if input.decision_question:
                question_text = f"\nDecision question: {input.decision_question}"

            system_prompt = f"""You are an expert decision analyst structuring complex decisions.

Your task is to frame a decision using decision tree methodology.

Decision framing approach:
1. Identify the core decision to be made
2. Classify the decision type:
   - binary: yes/no, go/no-go
   - multi-option: choose among alternatives
   - sequential: series of dependent decisions
   - portfolio: allocate across options
3. Build a decision tree with:
   - Decision nodes (squares): points where choices are made
   - Chance nodes (circles): uncertainties that affect outcomes
   - Outcome nodes (triangles): end states
4. Identify key uncertainties
5. Define success criteria
6. Map stakeholder interests
7. Note information gaps

Return a structured JSON response with:
- decision_statement: Clear 1-sentence statement of the decision
- decision_type: binary | multi-option | sequential | portfolio
- decision_tree: Array of nodes with:
  - node_id: D1, C1, O1, etc. (D=decision, C=chance, O=outcome)
  - node_type: decision | chance | outcome
  - label: Short label
  - description: Detailed description
  - parent_id: Parent node ID (null for root)
  - branches: List of branch labels
  - probability: For chance nodes (0.0-1.0)
- key_uncertainties: Major unknowns
- success_criteria: How to measure success
- stakeholder_interests: {{stakeholder: interest}}
- decision_boundaries: In/out of scope
- information_gaps: What's needed to decide"""

            user_prompt = f"""Frame this decision:

CONTEXT:
{input.context}
{question_text}
{stakeholders_text}
{constraints_text}
{horizon_text}

Structure the decision and return JSON."""

            # Execute LLM call
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])

            # Parse response
            result = self._parse_frame_response(response.content)
            tokens_used = response.response_metadata.get("token_usage", {}).get("total_tokens", 0)

            # Build decision tree
            nodes_data = result.get("decision_tree", [])
            decision_tree = [
                DecisionNode(
                    node_id=n.get("node_id", f"N{i+1}"),
                    node_type=n.get("node_type", "decision"),
                    label=n.get("label", ""),
                    description=n.get("description", ""),
                    parent_id=n.get("parent_id"),
                    branches=n.get("branches", []),
                    probability=n.get("probability"),
                )
                for i, n in enumerate(nodes_data)
            ]

            duration = (datetime.utcnow() - start_time).total_seconds()

            return FrameOutput(
                success=True,
                decision_statement=result.get("decision_statement", ""),
                decision_type=result.get("decision_type", "multi-option"),
                decision_tree=decision_tree,
                key_uncertainties=result.get("key_uncertainties", []),
                success_criteria=result.get("success_criteria", []),
                stakeholder_interests=result.get("stakeholder_interests", {}),
                decision_boundaries=result.get("decision_boundaries", []),
                information_gaps=result.get("information_gaps", []),
                confidence_score=0.85,
                quality_score=0.85,
                duration_seconds=duration,
                tokens_used=tokens_used,
                runner_id=self.runner_id,
            )

        except Exception as e:
            logger.error(f"FrameRunner failed: {e}")
            duration = (datetime.utcnow() - start_time).total_seconds()
            return FrameOutput(
                success=False,
                error=str(e),
                duration_seconds=duration,
                runner_id=self.runner_id,
            )

    def _parse_frame_response(self, content: str) -> Dict[str, Any]:
        """Parse LLM response into structured data."""
        import json

        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]

            return json.loads(content)
        except (json.JSONDecodeError, IndexError):
            return {
                "decision_statement": content[:200],
                "decision_type": "multi-option",
                "decision_tree": [],
                "key_uncertainties": [],
                "success_criteria": [],
                "stakeholder_interests": {},
                "decision_boundaries": [],
                "information_gaps": [],
            }
