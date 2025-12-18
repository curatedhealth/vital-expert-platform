"""
Orchestration Patterns Registry

Maps pattern types to their implementations in langgraph_workflows/.
"""

from enum import Enum
from typing import Dict, Any, Optional
from dataclasses import dataclass


class PatternType(str, Enum):
    """14 core orchestration patterns."""

    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    ROUTER = "router"
    CONSENSUS = "consensus"
    ITERATIVE = "iterative"
    REFLECTION = "reflection"
    HIERARCHICAL = "hierarchical"
    HITL = "hitl"
    STREAMING = "streaming"
    DEBATE = "debate"
    FAMILY_RUNNER = "family_runner"
    AGENT_SELECTOR = "agent_selector"
    QUALITY_GATE = "quality_gate"
    RESILIENCE = "resilience"


@dataclass
class PatternInfo:
    """Metadata about an orchestration pattern."""

    pattern_type: PatternType
    name: str
    description: str
    primary_file: str
    related_files: list[str]
    when_to_use: str


# Pattern registry with implementation locations
PATTERN_REGISTRY: Dict[PatternType, PatternInfo] = {
    PatternType.SEQUENTIAL: PatternInfo(
        pattern_type=PatternType.SEQUENTIAL,
        name="Sequential Pattern",
        description="Linear chain of nodes with direct edges",
        primary_file="langgraph_workflows/ask_expert/unified_interactive_workflow.py",
        related_files=[
            "langgraph_workflows/base_workflow.py",
        ],
        when_to_use="Simple linear workflows where each step depends on the previous",
    ),
    PatternType.PARALLEL: PatternInfo(
        pattern_type=PatternType.PARALLEL,
        name="Parallel Execution Pattern",
        description="Concurrent execution with fan-out/fan-in aggregation",
        primary_file="langgraph_workflows/ask_expert/shared/nodes/parallel_tools_executor.py",
        related_files=[
            "langgraph_workflows/panel_autonomous/graphs/parallel.py",
            "langgraph_workflows/ask_expert/shared/nodes/l3_context_engineer.py",
        ],
        when_to_use="Independent tasks that can run concurrently (multi-expert, multi-tool)",
    ),
    PatternType.ROUTER: PatternInfo(
        pattern_type=PatternType.ROUTER,
        name="Router/Conditional Edge Pattern",
        description="Dynamic routing based on state conditions",
        primary_file="langgraph_workflows/modes34/unified_autonomous_workflow.py",
        related_files=[
            "langgraph_workflows/panel_autonomous/workflow.py",
        ],
        when_to_use="Branching logic based on confidence, quality, or mode selection",
    ),
    PatternType.CONSENSUS: PatternInfo(
        pattern_type=PatternType.CONSENSUS,
        name="Consensus Building Pattern",
        description="Multi-agent agreement analysis and synthesis",
        primary_file="langgraph_workflows/panel_autonomous/nodes/consensus.py",
        related_files=[
            "services/panel/consensus_analyzer.py",
            "services/panel/consensus_calculator.py",
        ],
        when_to_use="Panel discussions requiring agreement measurement",
    ),
    PatternType.ITERATIVE: PatternInfo(
        pattern_type=PatternType.ITERATIVE,
        name="Iterative Refinement Pattern",
        description="Loop until quality threshold met with max iterations",
        primary_file="langgraph_workflows/modes34/research_quality.py",
        related_files=[
            "langgraph_workflows/modes34/runners/deep_research_runner.py",
        ],
        when_to_use="Research tasks requiring confidence gates and iterative improvement",
    ),
    PatternType.REFLECTION: PatternInfo(
        pattern_type=PatternType.REFLECTION,
        name="Self-Reflection Pattern",
        description="Self-critique and refinement loop",
        primary_file="langgraph_workflows/modes34/research_quality.py",
        related_files=[
            "langgraph_workflows/modes34/runners/deep_research_runner.py",
        ],
        when_to_use="Complex reasoning requiring self-evaluation",
    ),
    PatternType.HIERARCHICAL: PatternInfo(
        pattern_type=PatternType.HIERARCHICAL,
        name="Hierarchical Orchestration Pattern",
        description="L1→L2→L3→L4→L5 delegation chain",
        primary_file="agents/orchestrators/l1_master.py",
        related_files=[
            "langgraph_workflows/ask_expert/shared/nodes/l3_context_engineer.py",
            "langgraph_workflows/modes34/wrappers/l2_wrapper.py",
            "langgraph_workflows/modes34/wrappers/l3_wrapper.py",
            "langgraph_workflows/modes34/wrappers/l4_wrapper.py",
        ],
        when_to_use="Complex tasks requiring multi-level agent coordination",
    ),
    PatternType.HITL: PatternInfo(
        pattern_type=PatternType.HITL,
        name="Human-in-the-Loop Pattern",
        description="Checkpoint-based human intervention",
        primary_file="langgraph_workflows/task_runners/execute/__init__.py",
        related_files=[
            "services/workflows/hitl_service.py",
            "services/workflows/hitl_websocket_service.py",
        ],
        when_to_use="High-stakes decisions requiring human approval",
    ),
    PatternType.STREAMING: PatternInfo(
        pattern_type=PatternType.STREAMING,
        name="Streaming/Async Pattern",
        description="Real-time token streaming with SSE",
        primary_file="langgraph_workflows/ask_expert/shared/mixins/streaming.py",
        related_files=[
            "streaming/",
        ],
        when_to_use="Real-time response streaming to UI",
    ),
    PatternType.DEBATE: PatternInfo(
        pattern_type=PatternType.DEBATE,
        name="Debate/Adversarial Pattern",
        description="Turn-based multi-expert discussion",
        primary_file="langgraph_workflows/panel_autonomous/graphs/debate.py",
        related_files=[
            "langgraph_workflows/panel_autonomous/state.py",
        ],
        when_to_use="Adversarial exploration of complex topics",
    ),
    PatternType.FAMILY_RUNNER: PatternInfo(
        pattern_type=PatternType.FAMILY_RUNNER,
        name="Family Runner Pattern",
        description="Domain-specific reasoning patterns (12 families)",
        primary_file="langgraph_workflows/modes34/runners/base_family_runner.py",
        related_files=[
            "langgraph_workflows/modes34/runners/deep_research_runner.py",
            "langgraph_workflows/modes34/runners/monitoring_runner.py",
            "langgraph_workflows/modes34/runners/evaluation_runner.py",
        ],
        when_to_use="Domain-specific workflows (research, monitoring, evaluation, etc.)",
    ),
    PatternType.AGENT_SELECTOR: PatternInfo(
        pattern_type=PatternType.AGENT_SELECTOR,
        name="Agent Selection Pattern",
        description="Fusion search for expert selection (PostgreSQL + Pinecone + Neo4j)",
        primary_file="langgraph_workflows/ask_expert/unified_agent_selector.py",
        related_files=[
            "langgraph_workflows/modes34/agent_selector.py",
        ],
        when_to_use="Automatic expert selection based on query context",
    ),
    PatternType.QUALITY_GATE: PatternInfo(
        pattern_type=PatternType.QUALITY_GATE,
        name="Quality Gate Pattern",
        description="Validation checkpoints (citations, quality, compliance)",
        primary_file="langgraph_workflows/modes34/validation/research_quality_validator.py",
        related_files=[
            "langgraph_workflows/modes34/validation/citation_validator.py",
        ],
        when_to_use="Research outputs requiring validation before finalization",
    ),
    PatternType.RESILIENCE: PatternInfo(
        pattern_type=PatternType.RESILIENCE,
        name="Resilience/Error Handling Pattern",
        description="Retry, timeout, and graceful degradation",
        primary_file="langgraph_workflows/modes34/resilience/node_error_handler.py",
        related_files=[
            "langgraph_workflows/modes34/resilience/llm_timeout.py",
            "langgraph_workflows/modes34/resilience/graceful_degradation.py",
        ],
        when_to_use="All production workflows requiring fault tolerance",
    ),
}


def get_pattern(pattern_type: PatternType | str) -> Optional[PatternInfo]:
    """Get pattern info by type."""
    if isinstance(pattern_type, str):
        pattern_type = PatternType(pattern_type)
    return PATTERN_REGISTRY.get(pattern_type)


def list_patterns() -> list[PatternInfo]:
    """List all registered patterns."""
    return list(PATTERN_REGISTRY.values())


__all__ = [
    "PatternType",
    "PatternInfo",
    "PATTERN_REGISTRY",
    "get_pattern",
    "list_patterns",
]
