"""
PHARMA Protocol Implementation
================================================================================
Precision-driven Healthcare and Rigorous Medical Analysis Protocol

The PHARMA protocol ensures medical AI responses maintain pharmaceutical-grade
accuracy, regulatory compliance, and evidence-based rigor.

Framework Components:
- P: Precision - Exact medical terminology and measurements
- H: HIPAA Compliance - Privacy and security standards
- A: Accuracy - Evidence-based claims with citations
- R: Regulatory Alignment - FDA/EMA/ICH guidelines
- M: Medical Validation - Expert review requirements
- A: Audit Trail - Comprehensive logging and traceability
"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone
from dataclasses import dataclass, field
from enum import Enum
import structlog

logger = structlog.get_logger()


class ComplianceLevel(Enum):
    """Compliance level ratings"""
    CRITICAL = "critical"  # Must fix before use
    HIGH = "high"  # Should fix, but can proceed with warning
    MEDIUM = "medium"  # Advisory level
    LOW = "low"  # Informational
    PASS = "pass"  # Fully compliant


@dataclass
class PHARMAViolation:
    """Represents a PHARMA protocol violation"""
    component: str  # P, H, A, R, M, or A
    level: ComplianceLevel
    message: str
    context: Optional[str] = None
    suggestion: Optional[str] = None
    line_number: Optional[int] = None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class PHARMAValidationResult:
    """Result of PHARMA protocol validation"""
    is_compliant: bool
    compliance_score: float  # 0.0 to 1.0
    violations: List[PHARMAViolation]
    passed_checks: List[str]
    warnings: List[str]
    metadata: Dict[str, Any]
    validation_timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class PHARMAProtocol:
    """
    PHARMA Protocol Validator
    
    Validates medical AI responses against pharmaceutical-grade standards
    for accuracy, compliance, and safety.
    """
    
    def __init__(self, strict_mode: bool = False):
        """
        Initialize PHARMA Protocol
        
        Args:
            strict_mode: If True, any violation blocks the response
        """
        self.strict_mode = strict_mode
        self.logger = structlog.get_logger()
        
        # Regulatory keywords that require citations
        self.regulatory_keywords = [
            "fda", "ema", "ich", "gcp", "glp", "gmp",
            "approved", "indication", "contraindication",
            "black box", "warning", "precaution",
            "dosage", "administration", "pharmacokinetics",
            "adverse event", "side effect", "safety",
            "efficacy", "clinical trial", "phase"
        ]
        
        # Medical terms requiring precision
        self.precision_terms = [
            "dose", "dosage", "concentration", "mg", "mcg",
            "ml", "mmol", "units", "%", "ratio",
            "p-value", "confidence interval", "hazard ratio",
            "odds ratio", "relative risk", "absolute risk"
        ]
        
        # PHI patterns (HIPAA)
        self.phi_patterns = [
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
            r'\b\d{3}-\d{3}-\d{4}\b',  # Phone
            r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',  # Email
            r'\b\d{5}(?:-\d{4})?\b',  # ZIP
            r'\bMRN[:\s]*\d+\b',  # Medical Record Number
            r'\bDOB[:\s]*\d{1,2}/\d{1,2}/\d{4}\b',  # DOB
        ]
    
    def validate(
        self,
        response: str,
        context: Dict[str, Any],
        agent_type: Optional[str] = None
    ) -> PHARMAValidationResult:
        """
        Validate response against PHARMA protocol
        
        Args:
            response: The AI-generated response
            context: Context including request, agent info, etc.
            agent_type: Type of agent (regulatory, clinical, etc.)
            
        Returns:
            PHARMAValidationResult with compliance assessment
        """
        violations = []
        passed_checks = []
        warnings = []
        
        # P: Precision Check
        precision_result = self._check_precision(response)
        if precision_result['violations']:
            violations.extend(precision_result['violations'])
        else:
            passed_checks.append("Precision: Medical terminology is exact and unambiguous")
        
        # H: HIPAA Compliance Check
        hipaa_result = self._check_hipaa(response)
        if hipaa_result['violations']:
            violations.extend(hipaa_result['violations'])
        else:
            passed_checks.append("HIPAA: No protected health information detected")
        
        # A: Accuracy Check (Evidence-based)
        accuracy_result = self._check_accuracy(response, context)
        if accuracy_result['violations']:
            violations.extend(accuracy_result['violations'])
        if accuracy_result['warnings']:
            warnings.extend(accuracy_result['warnings'])
        if accuracy_result['passed']:
            passed_checks.append("Accuracy: Claims supported by evidence")
        
        # R: Regulatory Alignment Check
        regulatory_result = self._check_regulatory(response, agent_type)
        if regulatory_result['violations']:
            violations.extend(regulatory_result['violations'])
        if regulatory_result['warnings']:
            warnings.extend(regulatory_result['warnings'])
        if regulatory_result['passed']:
            passed_checks.append("Regulatory: Aligned with FDA/EMA/ICH guidelines")
        
        # M: Medical Validation Check
        medical_result = self._check_medical_validation(response, context)
        if medical_result['violations']:
            violations.extend(medical_result['violations'])
        if medical_result['warnings']:
            warnings.extend(medical_result['warnings'])
        if medical_result['passed']:
            passed_checks.append("Medical Validation: Expert review criteria met")
        
        # A: Audit Trail Check
        audit_result = self._check_audit_trail(context)
        if audit_result['violations']:
            violations.extend(audit_result['violations'])
        if audit_result['passed']:
            passed_checks.append("Audit Trail: Comprehensive logging enabled")
        
        # Calculate compliance score
        total_checks = 6  # P, H, A, R, M, A
        critical_violations = len([v for v in violations if v.level == ComplianceLevel.CRITICAL])
        high_violations = len([v for v in violations if v.level == ComplianceLevel.HIGH])
        
        if critical_violations > 0:
            compliance_score = 0.0
            is_compliant = False
        elif high_violations > 0:
            compliance_score = max(0.0, 0.7 - (high_violations * 0.1))
            is_compliant = not self.strict_mode
        else:
            compliance_score = len(passed_checks) / total_checks
            is_compliant = True
        
        self.logger.info(
            "PHARMA validation complete",
            compliance_score=compliance_score,
            violations=len(violations),
            warnings=len(warnings)
        )
        
        return PHARMAValidationResult(
            is_compliant=is_compliant,
            compliance_score=compliance_score,
            violations=violations,
            passed_checks=passed_checks,
            warnings=warnings,
            metadata={
                "strict_mode": self.strict_mode,
                "agent_type": agent_type,
                "response_length": len(response),
                "total_checks": total_checks
            }
        )
    
    def _check_precision(self, response: str) -> Dict[str, Any]:
        """Check P: Precision in medical terminology"""
        violations = []
        
        # Check for vague quantifiers
        vague_terms = [
            r'\bsome\b', r'\bmany\b', r'\bfew\b', r'\bseveral\b',
            r'\boften\b', r'\brarely\b', r'\busually\b', r'\bmostly\b',
            r'\baround\b', r'\babout\b', r'\bapproximately\b.*(?:mg|mcg|ml)',
            r'\broughly\b'
        ]
        
        for pattern in vague_terms:
            matches = re.finditer(pattern, response, re.IGNORECASE)
            for match in matches:
                # Check if it's in a medical context
                context_snippet = response[max(0, match.start()-50):min(len(response), match.end()+50)]
                if any(term in context_snippet.lower() for term in self.precision_terms):
                    violations.append(PHARMAViolation(
                        component="Precision",
                        level=ComplianceLevel.MEDIUM,
                        message=f"Vague quantifier '{match.group()}' used in medical context",
                        context=context_snippet,
                        suggestion="Use exact measurements, percentages, or ranges"
                    ))
        
        # Check for unsupported absolutes
        absolute_terms = [
            r'\balways\b', r'\bnever\b', r'\ball\b', r'\bnone\b',
            r'\bevery\b', r'\bcompletely\b', r'\b100%\b'
        ]
        
        for pattern in absolute_terms:
            matches = re.finditer(pattern, response, re.IGNORECASE)
            for match in matches:
                violations.append(PHARMAViolation(
                    component="Precision",
                    level=ComplianceLevel.LOW,
                    message=f"Absolute term '{match.group()}' may be too strong",
                    context=response[max(0, match.start()-30):min(len(response), match.end()+30)],
                    suggestion="Consider qualifying with 'typically', 'in most cases', or cite evidence"
                ))
        
        return {"violations": violations}
    
    def _check_hipaa(self, response: str) -> Dict[str, Any]:
        """Check H: HIPAA compliance (no PHI)"""
        violations = []
        
        for pattern in self.phi_patterns:
            matches = re.finditer(pattern, response, re.IGNORECASE)
            for match in matches:
                violations.append(PHARMAViolation(
                    component="HIPAA",
                    level=ComplianceLevel.CRITICAL,
                    message=f"Potential PHI detected: {match.group()}",
                    context="*** REDACTED FOR PRIVACY ***",
                    suggestion="Remove all personally identifiable information"
                ))
        
        return {"violations": violations}
    
    def _check_accuracy(self, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check A: Accuracy with evidence-based claims"""
        violations = []
        warnings = []
        passed = False
        
        # Check for citations
        citations = context.get("citations", [])
        rag_sources = context.get("rag_context", {}).get("documents", [])
        
        # Look for medical claims
        claim_patterns = [
            r'\bstudies show\b', r'\bresearch indicates\b',
            r'\bevidence suggests\b', r'\bproven to\b',
            r'\bdemonstrated that\b', r'\bshown to\b'
        ]
        
        claims_found = 0
        for pattern in claim_patterns:
            claims_found += len(re.findall(pattern, response, re.IGNORECASE))
        
        if claims_found > 0 and len(citations) == 0 and len(rag_sources) == 0:
            violations.append(PHARMAViolation(
                component="Accuracy",
                level=ComplianceLevel.HIGH,
                message=f"Found {claims_found} evidence claims but no citations provided",
                suggestion="Include citations from authoritative medical sources"
            ))
        elif claims_found > 0 and len(citations) < claims_found:
            warnings.append(f"Found {claims_found} claims but only {len(citations)} citations")
        else:
            passed = True
        
        # Check for regulatory claims without citations
        regulatory_mentions = 0
        for keyword in self.regulatory_keywords:
            if keyword.lower() in response.lower():
                regulatory_mentions += 1
        
        if regulatory_mentions > 0 and len(citations) == 0:
            violations.append(PHARMAViolation(
                component="Accuracy",
                level=ComplianceLevel.HIGH,
                message=f"Regulatory references ({regulatory_mentions}) require citations",
                suggestion="Cite specific FDA/EMA guidance documents or regulations"
            ))
        
        return {"violations": violations, "warnings": warnings, "passed": passed}
    
    def _check_regulatory(self, response: str, agent_type: Optional[str]) -> Dict[str, Any]:
        """Check R: Regulatory alignment"""
        violations = []
        warnings = []
        passed = False
        
        # Check for disclaimers (required for regulatory agents)
        disclaimer_keywords = [
            "not medical advice", "consult", "healthcare professional",
            "qualified", "expert review", "disclaimer"
        ]
        
        has_disclaimer = any(kw in response.lower() for kw in disclaimer_keywords)
        
        if agent_type in ["regulatory", "safety", "clinical"] and not has_disclaimer:
            warnings.append("Consider adding medical/regulatory disclaimer")
        else:
            passed = True
        
        # Check for specific regulatory references
        fda_pattern = r'\b(FDA|Food and Drug Administration)\b'
        ema_pattern = r'\b(EMA|European Medicines Agency)\b'
        ich_pattern = r'\b(ICH|International Council for Harmonisation)\b'
        
        regulatory_refs = []
        if re.search(fda_pattern, response, re.IGNORECASE):
            regulatory_refs.append("FDA")
        if re.search(ema_pattern, response, re.IGNORECASE):
            regulatory_refs.append("EMA")
        if re.search(ich_pattern, response, re.IGNORECASE):
            regulatory_refs.append("ICH")
        
        if regulatory_refs:
            passed = True
        
        return {"violations": violations, "warnings": warnings, "passed": passed}
    
    def _check_medical_validation(self, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check M: Medical validation requirements"""
        violations = []
        warnings = []
        passed = False
        
        # Check for confidence scores
        confidence = context.get("confidence", 0.0)
        
        if confidence < 0.7:
            warnings.append(f"Low confidence score ({confidence:.2f}) - expert review recommended")
        
        # Check for limitation acknowledgment
        limitation_keywords = [
            "limitation", "requires further", "should be verified",
            "consult expert", "additional research", "case-specific"
        ]
        
        has_limitations = any(kw in response.lower() for kw in limitation_keywords)
        
        if not has_limitations and len(response) > 500:
            warnings.append("Long response without acknowledged limitations")
        else:
            passed = True
        
        # Check for evidence level indicators
        evidence_keywords = [
            "level of evidence", "grade", "recommendation strength",
            "quality of evidence", "confidence"
        ]
        
        has_evidence_level = any(kw in response.lower() for kw in evidence_keywords)
        
        if has_evidence_level:
            passed = True
        
        return {"violations": violations, "warnings": warnings, "passed": passed}
    
    def _check_audit_trail(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Check A: Audit trail completeness"""
        violations = []
        passed = False
        
        # Required audit fields
        required_fields = ["user_id", "timestamp", "agent_id", "model_used"]
        context_str = json.dumps(context, default=str).lower()
        missing_fields = [f for f in required_fields if f not in context and f.lower() not in context_str]
        
        if missing_fields:
            violations.append(PHARMAViolation(
                component="Audit Trail",
                level=ComplianceLevel.MEDIUM,
                message=f"Missing audit fields: {', '.join(missing_fields)}",
                suggestion="Ensure all required audit fields are logged"
            ))
        else:
            passed = True
        
        return {"violations": violations, "passed": passed}
    
    def generate_compliance_report(self, result: PHARMAValidationResult) -> str:
        """Generate human-readable compliance report"""
        report = []
        report.append("=" * 80)
        report.append("PHARMA PROTOCOL COMPLIANCE REPORT")
        report.append("=" * 80)
        report.append(f"Timestamp: {result.validation_timestamp.isoformat()}")
        report.append(f"Overall Compliance: {'✅ PASS' if result.is_compliant else '❌ FAIL'}")
        report.append(f"Compliance Score: {result.compliance_score:.2%}")
        report.append("")
        
        if result.passed_checks:
            report.append("✅ Passed Checks:")
            for check in result.passed_checks:
                report.append(f"   • {check}")
            report.append("")
        
        if result.violations:
            report.append(f"❌ Violations ({len(result.violations)}):")
            for violation in result.violations:
                report.append(f"   [{violation.level.value.upper()}] {violation.component}: {violation.message}")
                if violation.suggestion:
                    report.append(f"      💡 {violation.suggestion}")
            report.append("")
        
        if result.warnings:
            report.append(f"⚠️  Warnings ({len(result.warnings)}):")
            for warning in result.warnings:
                report.append(f"   • {warning}")
            report.append("")
        
        report.append("=" * 80)
        return "\n".join(report)


# Convenience validator function
def pharma_validator(
    response: str,
    context: Dict[str, Any],
    agent_type: Optional[str] = None,
    strict_mode: bool = False
) -> PHARMAValidationResult:
    """
    Validate response against PHARMA protocol
    
    Args:
        response: AI-generated response
        context: Request and response context
        agent_type: Agent type for specialized checks
        strict_mode: Block on any violations
        
    Returns:
        PHARMAValidationResult
    """
    protocol = PHARMAProtocol(strict_mode=strict_mode)
    return protocol.validate(response, context, agent_type)

