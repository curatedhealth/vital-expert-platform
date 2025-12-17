"""
PrototypeDeveloperRunner - Develop prototype specifications

This runner creates detailed prototype specifications from
solution concepts to enable rapid testing and validation.

Algorithmic Core: prototype_specification
Temperature: 0.4 (balanced creativity and structure)
"""

from typing import Any, List, Literal, Optional, Dict
from pydantic import BaseModel, Field

from ..base_task_runner import TaskRunner, TaskRunnerCategory
from ..registry import register_task_runner


class PrototypeComponent(BaseModel):
    """Component of the prototype."""
    component_id: str = Field(..., description="Unique identifier")
    component_name: str = Field(..., description="Component name")
    component_type: Literal[
        "interface", "functionality", "content", "interaction", "data"
    ] = Field(..., description="Type of component")
    description: str = Field(..., description="What it does")
    fidelity: Literal["low", "medium", "high"] = Field(
        "medium", description="Fidelity level"
    )
    dependencies: List[str] = Field(
        default_factory=list, description="Other component IDs it depends on"
    )


class PrototypeSpec(BaseModel):
    """Complete prototype specification."""
    prototype_id: str = Field(..., description="Unique identifier")
    prototype_name: str = Field(..., description="Prototype name")
    purpose: str = Field(..., description="What this prototype tests")
    fidelity_level: Literal["low", "medium", "high"] = Field(
        ..., description="Overall fidelity"
    )
    prototype_type: Literal[
        "paper", "clickable", "functional", "experience"
    ] = Field(..., description="Type of prototype")
    components: List[PrototypeComponent] = Field(
        default_factory=list, description="Prototype components"
    )
    user_flows: List[str] = Field(
        default_factory=list, description="Key user flows to test"
    )
    test_scenarios: List[str] = Field(
        default_factory=list, description="Test scenarios"
    )
    success_metrics: List[str] = Field(
        default_factory=list, description="How to measure success"
    )
    build_estimate: str = Field(..., description="Time to build")
    tools_needed: List[str] = Field(
        default_factory=list, description="Tools/tech needed"
    )


class PrototypeDeveloperInput(BaseModel):
    """Input for prototype development."""
    solution_concept: str = Field(..., description="Solution to prototype")
    key_assumptions: List[str] = Field(
        default_factory=list, description="Assumptions to test"
    )
    target_users: Optional[str] = Field(
        None, description="Who will test the prototype"
    )
    fidelity_target: Literal["low", "medium", "high"] = Field(
        "medium", description="Desired fidelity level"
    )
    time_budget: Optional[str] = Field(
        None, description="Time available to build"
    )
    tool_constraints: Optional[List[str]] = Field(
        None, description="Available tools/technologies"
    )


class PrototypeDeveloperOutput(BaseModel):
    """Output from prototype development."""
    prototype: PrototypeSpec = Field(
        ..., description="Prototype specification"
    )
    assumptions_mapped: Dict[str, str] = Field(
        default_factory=dict, description="Assumption -> how prototype tests it"
    )
    build_sequence: List[str] = Field(
        default_factory=list, description="Order to build components"
    )
    test_plan: str = Field(
        ..., description="How to test the prototype"
    )
    iteration_suggestions: List[str] = Field(
        default_factory=list, description="Suggested iterations based on results"
    )
    risks: List[str] = Field(
        default_factory=list, description="Prototyping risks"
    )


@register_task_runner("prototype_developer", TaskRunnerCategory.CREATE)
class PrototypeDeveloperRunner(TaskRunner[PrototypeDeveloperInput, PrototypeDeveloperOutput]):
    """
    Develops prototype specifications from solution concepts.

    Creates detailed specifications for building prototypes
    that can test key assumptions efficiently.

    Algorithmic approach:
    1. Identify core assumptions to test
    2. Determine appropriate fidelity
    3. Design prototype components
    4. Define user flows and scenarios
    5. Create test plan
    """

    name = "prototype_developer"
    description = "Develop prototype specifications from solution concepts"
    algorithmic_core = "prototype_specification"
    category = TaskRunnerCategory.CREATE
    temperature = 0.4
    max_tokens = 3500

    async def execute(self, input_data: PrototypeDeveloperInput) -> PrototypeDeveloperOutput:
        """Execute prototype development."""
        prompt = f"""Develop a prototype specification for the following solution.

SOLUTION CONCEPT: {input_data.solution_concept}

KEY ASSUMPTIONS TO TEST:
{chr(10).join(input_data.key_assumptions or ['Derive from concept'])}

TARGET USERS: {input_data.target_users or 'Not specified'}

FIDELITY TARGET: {input_data.fidelity_target}

TIME BUDGET: {input_data.time_budget or 'Not specified'}

TOOL CONSTRAINTS: {', '.join(input_data.tool_constraints or ['No constraints'])}

Create a prototype specification including:

1. PROTOTYPE OVERVIEW:
   - Name and purpose
   - Fidelity level and type (paper/clickable/functional/experience)
   - Build time estimate

2. COMPONENTS:
   - List each component with type, description, fidelity
   - Identify dependencies between components

3. USER FLOWS to test

4. TEST SCENARIOS

5. SUCCESS METRICS

6. BUILD SEQUENCE (order to create components)

7. TEST PLAN (how to run tests)

8. ITERATION SUGGESTIONS (what to try based on results)

Return as JSON matching the PrototypeDeveloperOutput schema."""

        response = await self._call_llm(prompt)
        return self._parse_response(response, PrototypeDeveloperOutput)
