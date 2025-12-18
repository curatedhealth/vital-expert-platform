"""
VALIDATE Category - Verification Runners

This category contains atomic cognitive operations for verification
using rule engines, source validation, semantic coherence, and
expert credibility assessment.

Runners (7 total):
    - ComplianceCheckRunner: Check against rules (rule engine)
    - FactCheckRunner: Verify claims (source verification)
    - CitationCheckRunner: Verify citations (reference validation)
    - ConsistencyCheckRunner: Check consistency (semantic coherence)
    - PlanValidatorRunner: Validate strategic plans (plan verification)
    - ExpertPositionValidatorRunner: Validate positioning (expert credibility)
    - FeasibilityCheckerRunner: Screen feasibility dimensions (feasibility screening)

Core Logic: Verification Protocol / Constraint Checking / Expert Validation

Verification Protocol:
    1. Parse content and validation targets
    2. Apply verification rules/sources
    3. Identify violations/issues
    4. Calculate compliance/accuracy scores
    5. Provide remediation guidance

Each runner is designed for:
    - 60-150 second execution time
    - Single verification operation
    - Stateless operation (no memory between invocations)
    - Composable for comprehensive validation
"""

from .compliance_check_runner import (
    ComplianceCheckRunner,
    ComplianceCheckInput,
    ComplianceCheckOutput,
    ComplianceRule,
    RuleViolation,
)
from .fact_check_runner import (
    FactCheckRunner,
    FactCheckInput,
    FactCheckOutput,
    VerifiedClaim,
)
from .citation_check_runner import (
    CitationCheckRunner,
    CitationCheckInput,
    CitationCheckOutput,
    CitationIssue,
)
from .consistency_check_runner import (
    ConsistencyCheckRunner,
    ConsistencyCheckInput,
    ConsistencyCheckOutput,
    InconsistencyIssue,
)
from .plan_validator_runner import (
    PlanValidatorRunner,
    PlanValidatorInput,
    PlanValidatorOutput,
    ValidationIssue,
    ValidationCheck,
)
from .expert_position_validator_runner import (
    ExpertPositionValidatorRunner,
    ExpertPositionValidatorInput,
    ExpertPositionValidatorOutput,
    ExpertValidation,
    ClaimValidation,
)
from .feasibility_checker_runner import (
    FeasibilityCheckerRunner,
    FeasibilityCheckerInput,
    FeasibilityCheckerOutput,
    FeasibilityCheck,
)
from .faithfulness_scorer_runner import (
    FaithfulnessScorer,
    FaithfulnessResult,
    Claim,
    ClaimVerdict,
)

__all__ = [
    # Runners
    "ComplianceCheckRunner",
    "FactCheckRunner",
    "CitationCheckRunner",
    "ConsistencyCheckRunner",
    "PlanValidatorRunner",
    "ExpertPositionValidatorRunner",
    # Compliance schemas
    "ComplianceCheckInput",
    "ComplianceCheckOutput",
    "ComplianceRule",
    "RuleViolation",
    # Fact check schemas
    "FactCheckInput",
    "FactCheckOutput",
    "VerifiedClaim",
    # Citation check schemas
    "CitationCheckInput",
    "CitationCheckOutput",
    "CitationIssue",
    # Consistency check schemas
    "ConsistencyCheckInput",
    "ConsistencyCheckOutput",
    "InconsistencyIssue",
    # Plan validator schemas
    "PlanValidatorInput",
    "PlanValidatorOutput",
    "ValidationIssue",
    "ValidationCheck",
    # Expert position validator schemas
    "ExpertPositionValidatorInput",
    "ExpertPositionValidatorOutput",
    "ExpertValidation",
    "ClaimValidation",
    # Feasibility Checker schemas
    "FeasibilityCheckerRunner",
    "FeasibilityCheckerInput",
    "FeasibilityCheckerOutput",
    "FeasibilityCheck",
    # Faithfulness Scorer (RAGAS-style)
    "FaithfulnessScorer",
    "FaithfulnessResult",
    "Claim",
    "ClaimVerdict",
]
