"""
EVALUATE Category - Quality Assessment Runners

This category contains atomic cognitive operations for evaluating,
scoring, comparing, and benchmarking entities against criteria.

Runners (15 total):
    - CritiqueRunner: Apply rubric (weighted scoring)
    - CompareRunner: Side-by-side (pairwise comparison)
    - ScoreRunner: Calculate score (weighted aggregation)
    - BenchmarkRunner: Compare to reference (gap analysis)
    - TechnologyImpactAssessorRunner: Assess technology impact
    - PortfolioDisruptionScorerRunner: Score disruption risk
    - PeopleCapabilityAssessorRunner: Assess capability gaps
    - PartnerEvaluatorRunner: Evaluate partners (MCDA)
    - OverlapAnalyzerRunner: Analyze portfolio overlap
    - StakeholderEvidenceAnalystRunner: Analyze stakeholder evidence needs
    - TeamCapabilityAssessorRunner: Assess team capabilities
    - IndustryBenchmarkAnalystRunner: Benchmark against industry
    - PainPointAnalystRunner: Analyze and prioritize pain points
    - FeasibilityAssessorRunner: Assess multi-dimensional feasibility
    - FrictionAnalyzerRunner: Analyze friction in experiences

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
from .technology_impact_runner import (
    TechnologyImpactAssessorRunner,
    TechnologyImpactInput,
    TechnologyImpactOutput,
    TechnologyAssessment,
)
from .disruption_scorer_runner import (
    PortfolioDisruptionScorerRunner,
    DisruptionScorerInput,
    DisruptionScorerOutput,
    DisruptionScore,
)
from .capability_assessor_runner import (
    PeopleCapabilityAssessorRunner,
    CapabilityAssessorInput,
    CapabilityAssessorOutput,
    SkillGap,
)
from .partner_evaluator_runner import (
    PartnerEvaluatorRunner,
    PartnerEvaluatorInput,
    PartnerEvaluatorOutput,
    PartnerAssessment,
)
from .overlap_analyzer_runner import (
    OverlapAnalyzerRunner,
    OverlapAnalyzerInput,
    OverlapAnalyzerOutput,
    OverlapArea,
)
from .stakeholder_evidence_runner import (
    StakeholderEvidenceAnalystRunner,
    StakeholderEvidenceInput,
    StakeholderEvidenceOutput,
    EvidenceNeed,
)
from .team_capability_runner import (
    TeamCapabilityAssessorRunner,
    TeamCapabilityInput,
    TeamCapabilityOutput,
    CapabilityAssessment,
)
from .industry_benchmark_runner import (
    IndustryBenchmarkAnalystRunner,
    IndustryBenchmarkInput,
    IndustryBenchmarkOutput,
    BenchmarkComparison,
)
from .pain_point_analyst_runner import (
    PainPointAnalystRunner,
    PainPointAnalystInput,
    PainPointAnalystOutput,
    PainPoint,
)
from .feasibility_assessor_runner import (
    FeasibilityAssessorRunner,
    FeasibilityAssessorInput,
    FeasibilityAssessorOutput,
    FeasibilityDimension,
)
from .friction_analyzer_runner import (
    FrictionAnalyzerRunner,
    FrictionAnalyzerInput,
    FrictionAnalyzerOutput,
    FrictionPoint,
    FrictionReduction,
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
    # Technology Impact
    "TechnologyImpactAssessorRunner",
    "TechnologyImpactInput",
    "TechnologyImpactOutput",
    "TechnologyAssessment",
    # Disruption Scorer
    "PortfolioDisruptionScorerRunner",
    "DisruptionScorerInput",
    "DisruptionScorerOutput",
    "DisruptionScore",
    # Capability Assessor
    "PeopleCapabilityAssessorRunner",
    "CapabilityAssessorInput",
    "CapabilityAssessorOutput",
    "SkillGap",
    # Partner Evaluator
    "PartnerEvaluatorRunner",
    "PartnerEvaluatorInput",
    "PartnerEvaluatorOutput",
    "PartnerAssessment",
    # Overlap Analyzer
    "OverlapAnalyzerRunner",
    "OverlapAnalyzerInput",
    "OverlapAnalyzerOutput",
    "OverlapArea",
    # Stakeholder Evidence Analyst
    "StakeholderEvidenceAnalystRunner",
    "StakeholderEvidenceInput",
    "StakeholderEvidenceOutput",
    "EvidenceNeed",
    # Team Capability Assessor
    "TeamCapabilityAssessorRunner",
    "TeamCapabilityInput",
    "TeamCapabilityOutput",
    "CapabilityAssessment",
    # Industry Benchmark Analyst
    "IndustryBenchmarkAnalystRunner",
    "IndustryBenchmarkInput",
    "IndustryBenchmarkOutput",
    "BenchmarkComparison",
    # Pain Point Analyst
    "PainPointAnalystRunner",
    "PainPointAnalystInput",
    "PainPointAnalystOutput",
    "PainPoint",
    # Feasibility Assessor
    "FeasibilityAssessorRunner",
    "FeasibilityAssessorInput",
    "FeasibilityAssessorOutput",
    "FeasibilityDimension",
    # Friction Analyzer
    "FrictionAnalyzerRunner",
    "FrictionAnalyzerInput",
    "FrictionAnalyzerOutput",
    "FrictionPoint",
    "FrictionReduction",
]
