"""
VALIDATE Category - Verification Runners

This category contains atomic cognitive operations for verification
using rule engines, source validation, and semantic coherence.

Runners:
    - ComplianceCheckRunner: Check against rules (rule engine)
    - FactCheckRunner: Verify claims (source verification)
    - CitationCheckRunner: Verify citations (reference validation)
    - ConsistencyCheckRunner: Check consistency (semantic coherence)

Core Logic: Verification Protocol / Constraint Checking

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

__all__ = [
    # Runners
    "ComplianceCheckRunner",
    "FactCheckRunner",
    "CitationCheckRunner",
    "ConsistencyCheckRunner",
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
]
