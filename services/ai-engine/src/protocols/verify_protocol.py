"""
VERIFY Protocol Implementation
================================================================================
Validation, Evidence, Review, Identification, Fact-checking, Yield Protocol

The VERIFY protocol prevents AI hallucinations and ensures pharmaceutical-grade
quality assurance through systematic validation and evidence grounding.

Framework Components:
- V: Validate - Check factual accuracy against sources
- E: Evidence - Explicit citations required for all claims  
- R: Review - Ensure compliance & legal requirements
- I: Identify - Gaps and uncertainties must be flagged
- F: Fact-check - Cross-reference multiple authoritative sources
- Y: Yield - Defer to human expertise when uncertain
"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple, Set
from datetime import datetime, timezone
from dataclasses import dataclass, field
from enum import Enum
import structlog

logger = structlog.get_logger()


class ConfidenceLevel(Enum):
    """Confidence levels for claims"""
    HIGH = "high"  # >90% confident, backed by multiple sources
    MEDIUM = "medium"  # 70-90% confident, some supporting evidence
    LOW = "low"  # <70% confident, minimal evidence
    UNCERTAIN = "uncertain"  # Cannot verify, needs expert review


class EvidenceQuality(Enum):
    """Quality of evidence sources"""
    LEVEL_1 = "level_1"  # Systematic reviews, meta-analyses
    LEVEL_2 = "level_2"  # RCTs, high-quality observational studies
    LEVEL_3 = "level_3"  # Case-control studies, case series
    LEVEL_4 = "level_4"  # Expert opinion, anecdotal
    UNGRADED = "ungraded"  # Source not evaluated


@dataclass
class VERIFYViolation:
    """Represents a VERIFY protocol violation"""
    component: str  # V, E, R, I, F, or Y
    severity: str  # critical, high, medium, low
    message: str
    claim: Optional[str] = None
    confidence: Optional[ConfidenceLevel] = None
    suggestion: str = ""
    requires_verification: bool = False
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Claim:
    """Represents a factual claim requiring verification"""
    text: str
    confidence: ConfidenceLevel
    evidence: List[str] = field(default_factory=list)
    sources: List[str] = field(default_factory=list)
    evidence_quality: EvidenceQuality = EvidenceQuality.UNGRADED
    verified: bool = False
    verification_notes: str = ""


@dataclass
class VERIFYValidationResult:
    """Result of VERIFY protocol validation"""
    is_verified: bool
    confidence_score: float  # 0.0 to 1.0
    violations: List[VERIFYViolation]
    validated_claims: List[Claim]
    unverified_claims: List[Claim]
    gaps_identified: List[str]
    warnings: List[str]
    requires_human_review: bool
    metadata: Dict[str, Any]
    validation_timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class VERIFYProtocol:
    """
    VERIFY Protocol Validator
    
    Prevents hallucinations and ensures evidence-based pharmaceutical content
    through systematic validation and quality assurance.
    """
    
    def __init__(self, strict_mode: bool = True):
        """
        Initialize VERIFY Protocol
        
        Args:
            strict_mode: If True, block on unverified claims
        """
        self.strict_mode = strict_mode
        self.logger = structlog.get_logger()
        
        # Claim indicators requiring verification
        self.claim_indicators = [
            # Definitive statements
            r'\b(is|are|was|were|will be|has been)\s+(?:proven|demonstrated|shown|established|confirmed)\b',
            r'\b(studies|research|trials|evidence|data)\s+(?:show|shows|demonstrate|demonstrates|prove|proves)\b',
            r'\b(?:conclusively|definitively|unequivocally|certainly)\b',
            
            # Statistical claims
            r'\b\d+%\s+(?:of|increase|decrease|reduction|improvement)\b',
            r'\bp\s*[<>=]\s*0\.\d+\b',
            r'\b(?:significantly|statistically significant)\b',
            r'\b(?:hazard ratio|odds ratio|relative risk|confidence interval)\b',
            
            # Regulatory/approval claims
            r'\b(?:approved|indicated|authorized|cleared)\s+(?:by|for)\b',
            r'\b(?:fda|ema|ich|pmda)\s+(?:approved|cleared|authorized)\b',
            r'\b(?:label|labeling|indication|contraindication)\b',
            
            # Drug/treatment claims
            r'\b(?:treats|cures|prevents|reduces|improves|eliminates)\s+\w+\b',
            r'\b(?:effective|efficacious|safe|well-tolerated)\s+for\b',
            r'\b(?:first-line|second-line|standard of care)\b',
            
            # Quantitative claims
            r'\b\d+\s*(?:mg|mcg|ml|g|units?)\b',
            r'\b(?:half-life|clearance|bioavailability|cmax|tmax)\b',
        ]
        
        # Authoritative source patterns
        self.authoritative_sources = [
            r'(?:FDA|EMA|ICH|PMDA|WHO)',
            r'(?:New England Journal|NEJM|Lancet|JAMA|BMJ)',
            r'(?:Cochrane|PubMed|ClinicalTrials\.gov)',
            r'(?:doi:|DOI:|pmid:|PMID:)',
            r'(?:guidance|guideline|regulation|21 CFR)',
        ]
        
        # Uncertainty markers (good practice)
        self.uncertainty_markers = [
            r'\b(?:may|might|could|possibly|potentially|likely)\b',
            r'\b(?:suggests|indicates|appears|seems)\b',
            r'\b(?:uncertain|unclear|limited evidence|requires further)\b',
            r'\b(?:case-by-case|patient-specific|individual)\b',
        ]
        
        # Red flags for hallucination
        self.hallucination_flags = [
            r'\bas an AI\b',
            r'\bI (?:think|believe|assume|guess)\b',
            r'\bprobably|basically|essentially\b',
            r'\bin general|typically|usually\b',  # Without qualification
            r'\beveryone knows|it is known|common knowledge\b',
        ]
    
    def validate(
        self,
        response: str,
        context: Dict[str, Any],
        require_sources: bool = True
    ) -> VERIFYValidationResult:
        """
        Validate response against VERIFY protocol
        
        Args:
            response: AI-generated response
            context: Context including sources, citations, RAG results
            require_sources: Whether to require sources for all claims
            
        Returns:
            VERIFYValidationResult with verification assessment
        """
        violations = []
        warnings = []
        validated_claims = []
        unverified_claims = []
        gaps_identified = []
        requires_human_review = False
        
        # V: Validate sources
        validation_result = self._validate_sources(response, context)
        violations.extend(validation_result['violations'])
        if validation_result['warnings']:
            warnings.extend(validation_result['warnings'])
        
        # E: Evidence (explicit citations)
        evidence_result = self._check_evidence(response, context)
        violations.extend(evidence_result['violations'])
        validated_claims.extend(evidence_result['validated_claims'])
        unverified_claims.extend(evidence_result['unverified_claims'])
        if evidence_result['requires_review']:
            requires_human_review = True
        
        # R: Review (compliance & legal)
        review_result = self._review_compliance(response, context)
        violations.extend(review_result['violations'])
        warnings.extend(review_result['warnings'])
        
        # I: Identify gaps
        identify_result = self._identify_gaps(response, context)
        gaps_identified.extend(identify_result['gaps'])
        if identify_result['critical_gaps']:
            violations.extend(identify_result['violations'])
            requires_human_review = True
        
        # F: Fact-check
        factcheck_result = self._factcheck_claims(response, context, validated_claims)
        violations.extend(factcheck_result['violations'])
        warnings.extend(factcheck_result['warnings'])
        
        # Y: Yield to human expertise
        yield_result = self._check_yield_conditions(response, context)
        if yield_result['should_yield']:
            requires_human_review = True
            warnings.extend(yield_result['reasons'])
        
        # Calculate confidence score
        total_claims = len(validated_claims) + len(unverified_claims)
        if total_claims > 0:
            confidence_score = len(validated_claims) / total_claims
        else:
            confidence_score = 0.8  # Default for responses without explicit claims
        
        # Adjust for violations
        critical_violations = len([v for v in violations if v.severity == "critical"])
        high_violations = len([v for v in violations if v.severity == "high"])
        
        if critical_violations > 0:
            confidence_score = min(confidence_score, 0.3)
            is_verified = False
        elif high_violations > 0:
            confidence_score = min(confidence_score, 0.6)
            is_verified = not self.strict_mode
        else:
            is_verified = confidence_score >= 0.7
        
        self.logger.info(
            "VERIFY validation complete",
            confidence_score=confidence_score,
            validated_claims=len(validated_claims),
            unverified_claims=len(unverified_claims),
            requires_review=requires_human_review
        )
        
        return VERIFYValidationResult(
            is_verified=is_verified,
            confidence_score=confidence_score,
            violations=violations,
            validated_claims=validated_claims,
            unverified_claims=unverified_claims,
            gaps_identified=gaps_identified,
            warnings=warnings,
            requires_human_review=requires_human_review,
            metadata={
                "strict_mode": self.strict_mode,
                "total_claims": total_claims,
                "sources_count": len(context.get("citations", [])),
                "rag_docs": len(context.get("rag_context", {}).get("documents", []))
            }
        )
    
    def _validate_sources(self, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """V: Validate - Check factual accuracy against sources"""
        violations = []
        warnings = []
        
        citations = context.get("citations", [])
        rag_sources = context.get("rag_context", {}).get("documents", [])
        
        # Check for authoritative source mentions
        has_authoritative = False
        for pattern in self.authoritative_sources:
            if re.search(pattern, response, re.IGNORECASE):
                has_authoritative = True
                break
        
        # If making regulatory claims without authoritative sources
        regulatory_terms = ['fda', 'ema', 'ich', 'approved', 'indication', 'contraindication']
        has_regulatory = any(term in response.lower() for term in regulatory_terms)
        
        if has_regulatory and not has_authoritative and len(citations) == 0:
            violations.append(VERIFYViolation(
                component="Validate",
                severity="high",
                message="Regulatory claims made without authoritative sources",
                suggestion="Cite specific FDA/EMA guidance or approval documents"
            ))
        
        # Check for hallucination red flags
        for pattern in self.hallucination_flags:
            if re.search(pattern, response, re.IGNORECASE):
                warnings.append(f"Potential hallucination marker detected: {pattern}")
        
        return {"violations": violations, "warnings": warnings}
    
    def _check_evidence(self, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """E: Evidence - Explicit citations required"""
        violations = []
        validated_claims = []
        unverified_claims = []
        requires_review = False
        
        citations = context.get("citations", [])
        rag_docs = context.get("rag_context", {}).get("documents", [])
        
        # Extract claims from response
        claims = self._extract_claims(response)
        
        for claim_text in claims:
            # Check if claim has evidence
            has_citation = any(
                citation.get("text", "").lower() in claim_text.lower() or
                claim_text.lower() in citation.get("text", "").lower()
                for citation in citations
            )
            
            has_rag_support = any(
                doc.get("content", "").lower() in claim_text.lower() or
                claim_text.lower() in doc.get("content", "").lower()
                for doc in rag_docs
            )
            
            # Determine confidence
            if has_citation and has_rag_support:
                confidence = ConfidenceLevel.HIGH
                verified = True
            elif has_citation or has_rag_support:
                confidence = ConfidenceLevel.MEDIUM
                verified = True
            else:
                confidence = ConfidenceLevel.LOW
                verified = False
                requires_review = True
            
            claim = Claim(
                text=claim_text,
                confidence=confidence,
                evidence=citations if has_citation else [],
                sources=[doc.get("source", "") for doc in rag_docs] if has_rag_support else [],
                verified=verified
            )
            
            if verified:
                validated_claims.append(claim)
            else:
                unverified_claims.append(claim)
                violations.append(VERIFYViolation(
                    component="Evidence",
                    severity="high" if self.strict_mode else "medium",
                    message="Claim lacks explicit evidence or citation",
                    claim=claim_text[:100],
                    confidence=confidence,
                    suggestion="Provide authoritative source or mark as uncertain",
                    requires_verification=True
                ))
        
        return {
            "violations": violations,
            "validated_claims": validated_claims,
            "unverified_claims": unverified_claims,
            "requires_review": requires_review
        }
    
    def _review_compliance(self, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """R: Review - Ensure compliance & legal requirements"""
        violations = []
        warnings = []
        
        # Check for required disclaimers
        disclaimer_present = any(marker in response.lower() for marker in [
            "not medical advice",
            "consult",
            "healthcare professional",
            "disclaimer",
            "for informational purposes"
        ])
        
        # Check if response makes treatment recommendations
        treatment_terms = ['recommend', 'should take', 'prescribe', 'administer', 'dose']
        makes_recommendations = any(term in response.lower() for term in treatment_terms)
        
        if makes_recommendations and not disclaimer_present:
            violations.append(VERIFYViolation(
                component="Review",
                severity="high",
                message="Treatment recommendations without appropriate disclaimer",
                suggestion="Add disclaimer about consulting healthcare professionals"
            ))
        
        # Check for off-label use without disclaimer
        if 'off-label' in response.lower() or 'unapproved' in response.lower():
            if 'consult' not in response.lower():
                warnings.append("Off-label use mentioned - ensure appropriate context")
        
        # Check for comparative claims (regulatory sensitive)
        comparative_terms = ['better than', 'superior to', 'more effective than', 'safer than']
        if any(term in response.lower() for term in comparative_terms):
            has_evidence = len(context.get("citations", [])) > 0
            if not has_evidence:
                violations.append(VERIFYViolation(
                    component="Review",
                    severity="critical",
                    message="Comparative effectiveness claim without supporting evidence",
                    suggestion="Provide head-to-head trial data or remove comparative claim"
                ))
        
        return {"violations": violations, "warnings": warnings}
    
    def _identify_gaps(self, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """I: Identify - Gaps and uncertainties must be flagged"""
        gaps = []
        violations = []
        critical_gaps = False
        
        # Check if response acknowledges uncertainties
        has_uncertainty = any(
            re.search(pattern, response, re.IGNORECASE)
            for pattern in self.uncertainty_markers
        )
        
        # Check for limitations section
        has_limitations = any(word in response.lower() for word in [
            'limitation', 'caution', 'note that', 'however', 'but'
        ])
        
        # If definitive claims without uncertainty markers
        has_definitive = bool(re.search(r'\b(is|are|will|must|always|never)\b', response, re.IGNORECASE))
        
        if has_definitive and not has_uncertainty and len(response) > 300:
            gaps.append("Response lacks uncertainty qualification for definitive statements")
        
        # Check for missing information
        if 'requires further' in response.lower() or 'additional research' in response.lower():
            gaps.append("Response identifies need for additional research/information")
        
        # Check for confidence levels
        confidence = context.get("confidence", None)
        if confidence is not None and confidence < 0.7:
            gaps.append(f"Low confidence score ({confidence:.2f}) indicates verification gaps")
            critical_gaps = True
        
        # Check for "uncertain" statements
        uncertain_pattern = r'\b(uncertain|unclear|unknown|not clear|cannot determine)\b'
        if re.search(uncertain_pattern, response, re.IGNORECASE):
            gaps.append("Explicit uncertainty identified in response")
            violations.append(VERIFYViolation(
                component="Identify",
                severity="medium",
                message="Response contains uncertain information requiring verification",
                suggestion="Flag for expert review or provide alternative verified information"
            ))
        
        return {
            "gaps": gaps,
            "violations": violations,
            "critical_gaps": critical_gaps
        }
    
    def _factcheck_claims(
        self,
        response: str,
        context: Dict[str, Any],
        validated_claims: List[Claim]
    ) -> Dict[str, Any]:
        """F: Fact-check - Cross-reference multiple sources"""
        violations = []
        warnings = []
        
        citations = context.get("citations", [])
        
        # Check for single-source dependency
        unique_sources = set()
        for citation in citations:
            source = citation.get("source", "")
            if source:
                unique_sources.add(source)
        
        if len(citations) > 3 and len(unique_sources) == 1:
            warnings.append("All citations from single source - consider cross-referencing")
        
        # Check for recent/outdated information
        current_year = datetime.now().year
        for citation in citations:
            year = citation.get("year", current_year)
            if isinstance(year, int) and year < current_year - 5:
                warnings.append(f"Citation from {year} may be outdated - verify current guidelines")
        
        # Check for conflicting statements
        contradictory_pairs = [
            ('safe', 'unsafe'),
            ('effective', 'ineffective'),
            ('approved', 'not approved'),
            ('recommended', 'not recommended'),
        ]
        
        for word1, word2 in contradictory_pairs:
            if word1 in response.lower() and word2 in response.lower():
                violations.append(VERIFYViolation(
                    component="Fact-check",
                    severity="high",
                    message=f"Potentially conflicting statements: '{word1}' and '{word2}'",
                    suggestion="Clarify context or resolve contradiction"
                ))
        
        return {"violations": violations, "warnings": warnings}
    
    def _check_yield_conditions(self, response: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Y: Yield - Defer to human expertise when appropriate"""
        should_yield = False
        reasons = []
        
        # Complex medical decision-making
        decision_terms = [
            'treatment decision', 'clinical judgment', 'case-by-case',
            'patient-specific', 'individualized', 'personalized'
        ]
        if any(term in response.lower() for term in decision_terms):
            should_yield = True
            reasons.append("Response involves complex clinical decision-making")
        
        # Low confidence
        confidence = context.get("confidence", 1.0)
        if confidence < 0.6:
            should_yield = True
            reasons.append(f"Low confidence score ({confidence:.2f}) requires expert review")
        
        # Explicit uncertainty
        if 'uncertain' in response.lower() or 'requires verification' in response.lower():
            should_yield = True
            reasons.append("Response explicitly states uncertainty")
        
        # Safety-critical information
        safety_terms = ['adverse event', 'side effect', 'toxicity', 'contraindication', 'warning']
        if any(term in response.lower() for term in safety_terms):
            if len(context.get("citations", [])) < 2:
                should_yield = True
                reasons.append("Safety-critical information requires expert verification")
        
        # Novel or cutting-edge topics
        novel_terms = ['novel', 'emerging', 'breakthrough', 'investigational', 'experimental']
        if any(term in response.lower() for term in novel_terms):
            should_yield = True
            reasons.append("Novel/emerging topic requires current expert knowledge")
        
        return {"should_yield": should_yield, "reasons": reasons}
    
    def _extract_claims(self, response: str) -> List[str]:
        """Extract factual claims from response"""
        claims = []
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', response)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 20:  # Skip very short sentences
                continue
            
            # Check if sentence contains claim indicators
            for pattern in self.claim_indicators:
                if re.search(pattern, sentence, re.IGNORECASE):
                    claims.append(sentence)
                    break
        
        return claims
    
    def generate_verification_report(self, result: VERIFYValidationResult) -> str:
        """Generate human-readable verification report"""
        report = []
        report.append("=" * 80)
        report.append("VERIFY PROTOCOL VALIDATION REPORT")
        report.append("=" * 80)
        report.append(f"Timestamp: {result.validation_timestamp.isoformat()}")
        report.append(f"Verification Status: {'✅ VERIFIED' if result.is_verified else '❌ UNVERIFIED'}")
        report.append(f"Confidence Score: {result.confidence_score:.2%}")
        report.append(f"Requires Human Review: {'⚠️  YES' if result.requires_human_review else '✅ NO'}")
        report.append("")
        
        # Claims summary
        total_claims = len(result.validated_claims) + len(result.unverified_claims)
        report.append(f"📊 Claims Analysis:")
        report.append(f"   Total Claims: {total_claims}")
        report.append(f"   ✅ Validated: {len(result.validated_claims)}")
        report.append(f"   ❌ Unverified: {len(result.unverified_claims)}")
        report.append("")
        
        # Validated claims
        if result.validated_claims:
            report.append(f"✅ Validated Claims ({len(result.validated_claims)}):")
            for i, claim in enumerate(result.validated_claims[:5], 1):  # Show first 5
                report.append(f"   {i}. [{claim.confidence.value.upper()}] {claim.text[:80]}...")
                if claim.sources:
                    report.append(f"      Sources: {', '.join(claim.sources[:2])}")
            if len(result.validated_claims) > 5:
                report.append(f"   ... and {len(result.validated_claims) - 5} more")
            report.append("")
        
        # Unverified claims
        if result.unverified_claims:
            report.append(f"❌ Unverified Claims ({len(result.unverified_claims)}) - REQUIRE REVIEW:")
            for i, claim in enumerate(result.unverified_claims[:5], 1):
                report.append(f"   {i}. [{claim.confidence.value.upper()}] {claim.text[:80]}...")
                report.append(f"      ⚠️  Needs: Expert verification or authoritative source")
            if len(result.unverified_claims) > 5:
                report.append(f"   ... and {len(result.unverified_claims) - 5} more")
            report.append("")
        
        # Gaps identified
        if result.gaps_identified:
            report.append(f"🔍 Gaps Identified ({len(result.gaps_identified)}):")
            for gap in result.gaps_identified:
                report.append(f"   • {gap}")
            report.append("")
        
        # Violations
        if result.violations:
            report.append(f"❌ Violations ({len(result.violations)}):")
            for violation in result.violations:
                report.append(f"   [{violation.severity.upper()}] {violation.component}: {violation.message}")
                if violation.suggestion:
                    report.append(f"      💡 {violation.suggestion}")
            report.append("")
        
        # Warnings
        if result.warnings:
            report.append(f"⚠️  Warnings ({len(result.warnings)}):")
            for warning in result.warnings:
                report.append(f"   • {warning}")
            report.append("")
        
        # Recommendations
        report.append("📋 Recommendations:")
        if result.requires_human_review:
            report.append("   ⚠️  EXPERT REVIEW REQUIRED before use")
        if len(result.unverified_claims) > 0:
            report.append("   • Verify unverified claims with authoritative sources")
        if result.confidence_score < 0.8:
            report.append("   • Consider additional evidence gathering")
        if not result.violations and result.confidence_score >= 0.8:
            report.append("   ✅ Content meets VERIFY protocol standards")
        
        report.append("=" * 80)
        return "\n".join(report)


# Convenience validator function
def verify_validator(
    response: str,
    context: Dict[str, Any],
    strict_mode: bool = True,
    require_sources: bool = True
) -> VERIFYValidationResult:
    """
    Validate response against VERIFY protocol
    
    Args:
        response: AI-generated response
        context: Request and response context
        strict_mode: Block on unverified claims
        require_sources: Require sources for all claims
        
    Returns:
        VERIFYValidationResult
    """
    protocol = VERIFYProtocol(strict_mode=strict_mode)
    return protocol.validate(response, context, require_sources=require_sources)

