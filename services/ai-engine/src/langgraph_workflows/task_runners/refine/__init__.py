"""
REFINE Category - Optimization Runners

This category contains atomic cognitive operations for iterative improvement
through the Reflexion Loop: Critique → Mutate → Verify → Select.

Runners (6 total):
    - CriticRunner: Identify weaknesses (analytical critique)
    - MutateRunner: Generate variation (hill climbing step)
    - VerifyRunner: Test improvement (A/B comparison)
    - SelectRunner: Choose best (fitness selection)
    - PackagingOptimizerRunner: Optimize packaging (packaging optimization)
    - ValueOptimizerRunner: Optimize value proposition (value optimization)

Core Logic: Stochastic Hill Climbing / Evolutionary Heuristics / Reflexion Loop

The Reflexion Loop:
    1. INGEST & BENCHMARK: Receive artifact C₀, establish Score(C₀)
    2. CRITIQUE: Analyze C₀ to identify weaknesses
    3. MUTATE: Generate variations C₁, C₂, ... Cₙ
    4. VERIFY & SELECT: If Score(Cₙ) > Score(C₀), adopt Cₙ
    5. TERMINATE: Stop when score plateaus or max iterations reached

REFINE vs SOLVE:
    - SOLVE: Reach a valid solution (constraint solving, pathfinding)
    - REFINE: Reach the BEST solution (hill climbing, evolutionary)

Each runner is designed for:
    - 60-150 second execution time
    - Single refinement operation
    - Stateless operation (no memory between invocations)
    - Composable: Critic → Mutate → Verify → Select (loop)
"""

from .critic_runner import (
    CriticRunner,
    CriticInput,
    CriticOutput,
    Weakness,
)
from .mutate_runner import (
    MutateRunner,
    MutateInput,
    MutateOutput,
    Mutation,
)
from .verify_runner import (
    VerifyRunner,
    VerifyInput,
    VerifyOutput,
    DimensionComparison,
)
from .select_runner import (
    SelectRunner,
    SelectInput,
    SelectOutput,
    VariantEvaluation,
    VariantCandidate,
)
from .packaging_optimizer_runner import (
    PackagingOptimizerRunner,
    PackagingOptimizerInput,
    PackagingOptimizerOutput,
    PackageComponent,
    PackageOption,
)
from .value_optimizer_runner import (
    ValueOptimizerRunner,
    ValueOptimizerInput,
    ValueOptimizerOutput,
    ValueDriver,
    ValueGap,
)

__all__ = [
    # Runners
    "CriticRunner",
    "MutateRunner",
    "VerifyRunner",
    "SelectRunner",
    "PackagingOptimizerRunner",
    "ValueOptimizerRunner",
    # Critic schemas
    "CriticInput",
    "CriticOutput",
    "Weakness",
    # Mutate schemas
    "MutateInput",
    "MutateOutput",
    "Mutation",
    # Verify schemas
    "VerifyInput",
    "VerifyOutput",
    "DimensionComparison",
    # Select schemas
    "SelectInput",
    "SelectOutput",
    "VariantEvaluation",
    "VariantCandidate",
    # Packaging Optimizer schemas
    "PackagingOptimizerInput",
    "PackagingOptimizerOutput",
    "PackageComponent",
    "PackageOption",
    # Value Optimizer schemas
    "ValueOptimizerInput",
    "ValueOptimizerOutput",
    "ValueDriver",
    "ValueGap",
]
