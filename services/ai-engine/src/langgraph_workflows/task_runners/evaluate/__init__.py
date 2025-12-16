"""
EVALUATE Category - Quality Assessment Runners

This category contains atomic cognitive operations for evaluating,
scoring, comparing, and benchmarking entities against criteria.

Runners:
    - CritiqueRunner: Apply rubric (weighted scoring)
    - CompareRunner: Side-by-side (pairwise comparison)
    - ScoreRunner: Calculate score (weighted aggregation)
    - BenchmarkRunner: Compare to reference (gap analysis)

Core Logic: Multi-Criteria Decision Analysis (MCDA) / Rubric Application

Each runner is designed for:
    - 60-120 second execution time
    - Single evaluation operation
    - Stateless operation (no memory between invocations)
    - Composable output (feeds into decision runners)
"""

from .critique_runner import (
    CritiqueRunner,
    CritiqueInput,
    CritiqueOutput,
    CriterionScore,
    RubricCriterion,
)
from .compare_runner import (
    CompareRunner,
    CompareInput,
    CompareOutput,
    CriterionComparison,
)
from .score_runner import (
    ScoreRunner,
    ScoreInput,
    ScoreOutput,
    FactorScore,
)
from .benchmark_runner import (
    BenchmarkRunner,
    BenchmarkInput,
    BenchmarkOutput,
    DimensionGap,
)

__all__ = [
    # Runners
    "CritiqueRunner",
    "CompareRunner",
    "ScoreRunner",
    "BenchmarkRunner",
    # Critique schemas
    "CritiqueInput",
    "CritiqueOutput",
    "CriterionScore",
    "RubricCriterion",
    # Compare schemas
    "CompareInput",
    "CompareOutput",
    "CriterionComparison",
    # Score schemas
    "ScoreInput",
    "ScoreOutput",
    "FactorScore",
    # Benchmark schemas
    "BenchmarkInput",
    "BenchmarkOutput",
    "DimensionGap",
]
