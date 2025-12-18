"""
VITAL Platform Orchestration - Workflow Patterns (Layer 3)

Registry and abstraction layer for LangGraph workflow patterns.
Actual implementations live in langgraph_workflows/.

14 Core Patterns (All Production-Ready):
├── Sequential     - Linear chain of nodes
├── Parallel       - Concurrent execution with aggregation
├── Router         - Dynamic routing based on conditions
├── Consensus      - Multi-agent agreement building
├── Iterative      - Loop until quality threshold met
├── Reflection     - Self-critique and refinement
├── Hierarchical   - L1→L2→L3→L4→L5 delegation
├── HITL           - Human-in-the-loop checkpoints
├── Streaming      - Real-time token streaming
├── Debate         - Turn-based adversarial discussion
├── FamilyRunner   - Domain-specific reasoning patterns
├── AgentSelector  - Fusion search for expert selection
├── QualityGate    - Validation checkpoints
└── Resilience     - Error handling and graceful degradation

Pattern Locations:
- langgraph_workflows/ask_expert/     : Mode 1&2 patterns
- langgraph_workflows/modes34/        : Mode 3&4 patterns
- langgraph_workflows/panel_autonomous/ : Panel patterns

Usage:
    from orchestration import PATTERN_REGISTRY, get_pattern
    from orchestration.patterns import SequentialPattern, ParallelPattern

    # Get a registered pattern
    pattern = get_pattern("consensus")
"""

from .patterns import (
    PATTERN_REGISTRY,
    get_pattern,
    list_patterns,
    PatternType,
)

__all__ = [
    "PATTERN_REGISTRY",
    "get_pattern",
    "list_patterns",
    "PatternType",
]

__version__ = "1.0.0"
