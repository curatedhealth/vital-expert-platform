#!/usr/bin/env python3
"""
VITAL Path Intelligent Prompt Injection Engine
Dynamic prompt enhancement and context injection for optimized AI interactions

PROMPT 2.5: Intelligent Prompt Injection Engine
- Context-aware prompt enhancement
- Dynamic variable injection and substitution
- Real-time prompt optimization
- Safety and compliance validation
"""

import asyncio
import json
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import yaml
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InjectionType(Enum):
    """Types of prompt injections"""
    CONTEXT_INJECTION = "context_injection"
    VARIABLE_SUBSTITUTION = "variable_substitution"
    TEMPLATE_ENHANCEMENT = "template_enhancement"
    SAFETY_WRAPPER = "safety_wrapper"
    COMPLIANCE_LAYER = "compliance_layer"
    PERSONA_INJECTION = "persona_injection"
    KNOWLEDGE_AUGMENTATION = "knowledge_augmentation"
    CHAIN_OF_THOUGHT = "chain_of_thought"

class InjectionStrategy(Enum):
    """Strategies for prompt injection"""
    PREPEND = "prepend"
    APPEND = "append"
    REPLACE = "replace"
    MERGE = "merge"
    CONDITIONAL = "conditional"
    ADAPTIVE = "adaptive"

class SafetyLevel(Enum):
    """Safety levels for prompt validation"""
    MINIMAL = "minimal"
    STANDARD = "standard"
    HIGH = "high"
    MAXIMUM = "maximum"

class ComplianceFramework(Enum):
    """Compliance frameworks for validation"""
    HIPAA = "hipaa"
    GDPR = "gdpr"
    FDA_GUIDANCE = "fda_guidance"
    ICH_GCP = "ich_gcp"
    MEDICAL_ETHICS = "medical_ethics"
    PHARMA_CODE = "pharma_code"

@dataclass
class InjectionRule:
    """Rule for prompt injection"""
    rule_id: str
    name: str
    description: str
    injection_type: InjectionType
    strategy: InjectionStrategy
    conditions: Dict[str, Any]
    template: str
    variables: List[str]
    priority: int
    is_active: bool
    safety_level: SafetyLevel
    compliance_requirements: List[ComplianceFramework]

@dataclass
class ContextualData:
    """Contextual data for prompt enhancement"""
    user_context: Dict[str, Any]
    session_context: Dict[str, Any]
    domain_context: Dict[str, Any]
    temporal_context: Dict[str, Any]
    regulatory_context: Dict[str, Any]
    therapeutic_context: Dict[str, Any]
    previous_interactions: List[Dict[str, Any]]
    knowledge_base_context: Dict[str, Any]

@dataclass
class InjectionResult:
    """Result of prompt injection process"""
    original_prompt: str
    enhanced_prompt: str
    applied_injections: List[str]
    injection_metadata: Dict[str, Any]
    safety_validation: Dict[str, Any]
    compliance_validation: Dict[str, Any]
    performance_metrics: Dict[str, float]
    tokens_added: int
    confidence_score: float

@dataclass
class SafetyValidationResult:
    """Result of safety validation"""
    is_safe: bool
    safety_score: float
    risk_factors: List[str]
    mitigation_actions: List[str]
    blocked_content: List[str]
    warnings: List[str]
    recommendations: List[str]

class PromptInjectionEngine:
    """
    Intelligent prompt injection engine for VITAL Path

    Capabilities:
    - Context-aware prompt enhancement
    - Dynamic variable injection and substitution
    - Real-time safety and compliance validation
    - Adaptive prompt optimization
    - Regulatory and therapeutic context integration
    """

    def __init__(self, config_path: Optional[str] = None):
        self.config_path = Path(config_path) if config_path else Path("./injection_config")
        self.injection_rules: Dict[str, InjectionRule] = {}
        self.safety_validators: Dict[SafetyLevel, Callable] = {}
        self.compliance_validators: Dict[ComplianceFramework, Callable] = {}
        self.context_processors: Dict[str, Callable] = {}
        self.injection_history: List[Dict[str, Any]] = []
        self.performance_cache: Dict[str, Dict[str, float]] = {}

        # Initialize injection engine
        asyncio.create_task(self._initialize_engine())

    async def _initialize_engine(self):
        """Initialize the prompt injection engine"""
        logger.info("Initializing VITAL Path Prompt Injection Engine...")

        # Load configuration
        await self._load_configuration()

        # Initialize injection rules
        await self._initialize_injection_rules()

        # Setup safety validators
        await self._setup_safety_validators()

        # Setup compliance validators
        await self._setup_compliance_validators()

        # Initialize context processors
        await self._initialize_context_processors()

        logger.info(f"Injection engine initialized with {len(self.injection_rules)} rules")

    async def _initialize_injection_rules(self):
        """Initialize default injection rules for VITAL Path"""

        default_rules = {
            # Medical Context Enhancement
            "medical_context_enhancer": InjectionRule(
                rule_id="medical_context_enhancer",
                name="Medical Context Enhancement",
                description="Enhance prompts with medical domain context and safety considerations",
                injection_type=InjectionType.CONTEXT_INJECTION,
                strategy=InjectionStrategy.PREPEND,
                conditions={
                    "domains": ["medical", "clinical", "healthcare"],
                    "therapeutic_areas": "*",
                    "min_complexity": 0.3
                },
                template="""
**MEDICAL CONTEXT ADVISORY:**
- This query relates to {therapeutic_area} in a {domain} context
- Clinical evidence level: {evidence_level}
- Regulatory considerations: {regulatory_context}
- Safety profile awareness: {safety_considerations}
- Professional use disclaimer: This information is for healthcare professionals and should not replace clinical judgment

**IMPORTANT:** Always consider individual patient factors, current clinical guidelines, and regulatory requirements when applying this information.

""",
                variables=["therapeutic_area", "domain", "evidence_level", "regulatory_context", "safety_considerations"],
                priority=1,
                is_active=True,
                safety_level=SafetyLevel.HIGH,
                compliance_requirements=[ComplianceFramework.MEDICAL_ETHICS, ComplianceFramework.FDA_GUIDANCE]
            ),

            # Regulatory Compliance Layer
            "regulatory_compliance_wrapper": InjectionRule(
                rule_id="regulatory_compliance_wrapper",
                name="Regulatory Compliance Wrapper",
                description="Add regulatory compliance context and disclaimers",
                injection_type=InjectionType.COMPLIANCE_LAYER,
                strategy=InjectionStrategy.MERGE,
                conditions={
                    "domains": ["regulatory", "compliance"],
                    "prism_suites": ["RULES", "GUARD"],
                    "regulatory_scope": "*"
                },
                template="""
**REGULATORY COMPLIANCE CONTEXT:**
- Applicable regulations: {applicable_regulations}
- Jurisdictional scope: {jurisdiction}
- Guidance documents: {guidance_references}
- Submission context: {submission_type}
- Quality standards: {quality_framework}

**COMPLIANCE NOTE:** This guidance reflects current regulatory requirements as of {date}. Always verify with latest agency communications and seek regulatory consultation for specific submissions.

{original_content}

**REGULATORY DISCLAIMER:** This information is provided for educational and planning purposes. Formal regulatory advice should be obtained through appropriate channels (FDA meetings, EMA scientific advice, etc.).
""",
                variables=["applicable_regulations", "jurisdiction", "guidance_references", "submission_type", "quality_framework", "date", "original_content"],
                priority=2,
                is_active=True,
                safety_level=SafetyLevel.MAXIMUM,
                compliance_requirements=[ComplianceFramework.FDA_GUIDANCE, ComplianceFramework.ICH_GCP]
            ),

            # PRISM Suite Specialization
            "prism_specialization_injector": InjectionRule(
                rule_id="prism_specialization_injector",
                name="PRISM Suite Specialization",
                description="Inject PRISM suite-specific expertise and methodology",
                injection_type=InjectionType.PERSONA_INJECTION,
                strategy=InjectionStrategy.PREPEND,
                conditions={
                    "prism_suite": "*",
                    "use_prism_context": True
                },
                template="""
**{prism_suite}™ EXPERT PERSPECTIVE:**

As a {prism_suite} specialist with deep expertise in {domain_focus}, I approach this query with:

🎯 **{prism_suite} Methodology:**
{methodology_description}

🔍 **Key Focus Areas:**
{focus_areas}

📋 **Framework Application:**
{framework_application}

⚡ **Expected Deliverables:**
{expected_outputs}

Let me apply this specialized {prism_suite} expertise to your query:

""",
                variables=["prism_suite", "domain_focus", "methodology_description", "focus_areas", "framework_application", "expected_outputs"],
                priority=3,
                is_active=True,
                safety_level=SafetyLevel.STANDARD,
                compliance_requirements=[]
            ),

            # Chain of Thought Enhancement
            "chain_of_thought_enhancer": InjectionRule(
                rule_id="chain_of_thought_enhancer",
                name="Chain of Thought Enhancement",
                description="Add structured reasoning framework for complex queries",
                injection_type=InjectionType.CHAIN_OF_THOUGHT,
                strategy=InjectionStrategy.APPEND,
                conditions={
                    "complexity_score": 0.7,
                    "requires_analysis": True
                },
                template="""

**STRUCTURED ANALYSIS FRAMEWORK:**

Please approach this systematically using the following framework:

1. **Situation Analysis:**
   - Current state assessment
   - Key stakeholders and considerations
   - Regulatory and market context

2. **Problem Decomposition:**
   - Primary challenges identified
   - Secondary considerations
   - Interdependencies and relationships

3. **Evidence Evaluation:**
   - Available data and evidence quality
   - Knowledge gaps and uncertainties
   - Regulatory precedents and guidance

4. **Solution Development:**
   - Strategic options and alternatives
   - Risk-benefit analysis
   - Implementation considerations

5. **Recommendation Synthesis:**
   - Preferred approach with rationale
   - Risk mitigation strategies
   - Next steps and success metrics

Please work through each step systematically and show your reasoning process.
""",
                variables=[],
                priority=4,
                is_active=True,
                safety_level=SafetyLevel.STANDARD,
                compliance_requirements=[]
            ),

            # Safety and Ethics Wrapper
            "safety_ethics_wrapper": InjectionRule(
                rule_id="safety_ethics_wrapper",
                name="Safety and Ethics Wrapper",
                description="Add patient safety and ethical considerations",
                injection_type=InjectionType.SAFETY_WRAPPER,
                strategy=InjectionStrategy.MERGE,
                conditions={
                    "involves_patients": True,
                    "safety_critical": True
                },
                template="""
**PATIENT SAFETY & ETHICS FRAMEWORK:**

⚠️ **Safety Considerations:**
- Patient safety is the paramount concern
- All recommendations must align with "do no harm" principles
- Consider vulnerable populations and special circumstances
- Ensure appropriate risk-benefit assessment

🛡️ **Ethical Guidelines:**
- Respect for persons and autonomy
- Beneficence and non-maleficence
- Justice and fair distribution of benefits/risks
- Privacy and confidentiality protection

📋 **Quality Standards:**
- Evidence-based recommendations only
- Acknowledge uncertainties and limitations
- Promote transparent decision-making
- Support informed consent processes

{original_content}

**ETHICAL REMINDER:** Always prioritize patient welfare, maintain professional boundaries, and ensure decisions align with established medical ethics and current standards of care.
""",
                variables=["original_content"],
                priority=1,
                is_active=True,
                safety_level=SafetyLevel.MAXIMUM,
                compliance_requirements=[ComplianceFramework.MEDICAL_ETHICS, ComplianceFramework.HIPAA]
            ),

            # Knowledge Augmentation
            "knowledge_augmentation": InjectionRule(
                rule_id="knowledge_augmentation",
                name="Knowledge Base Augmentation",
                description="Inject relevant knowledge base context and recent insights",
                injection_type=InjectionType.KNOWLEDGE_AUGMENTATION,
                strategy=InjectionStrategy.CONDITIONAL,
                conditions={
                    "has_knowledge_context": True,
                    "knowledge_relevance": 0.6
                },
                template="""
**RELEVANT KNOWLEDGE CONTEXT:**

📚 **Recent Insights from Knowledge Base:**
{knowledge_insights}

🔬 **Related Research Findings:**
{research_context}

📊 **Current Market Intelligence:**
{market_context}

🎯 **Best Practices and Precedents:**
{best_practices}

💡 **Expert Recommendations:**
{expert_insights}

This context should inform the analysis and recommendations:

""",
                variables=["knowledge_insights", "research_context", "market_context", "best_practices", "expert_insights"],
                priority=5,
                is_active=True,
                safety_level=SafetyLevel.STANDARD,
                compliance_requirements=[]
            ),

            # Therapeutic Area Specialization
            "therapeutic_specialization": InjectionRule(
                rule_id="therapeutic_specialization",
                name="Therapeutic Area Specialization",
                description="Add therapeutic area-specific context and considerations",
                injection_type=InjectionType.CONTEXT_INJECTION,
                strategy=InjectionStrategy.PREPEND,
                conditions={
                    "therapeutic_areas": "*",
                    "therapeutic_depth": "specialized"
                },
                template="""
**{therapeutic_area} SPECIALIZATION CONTEXT:**

🏥 **Clinical Landscape:**
- Current standard of care: {standard_of_care}
- Unmet medical needs: {unmet_needs}
- Key opinion leader perspectives: {kol_insights}

🧬 **Scientific Considerations:**
- Pathophysiology insights: {pathophysiology}
- Biomarker landscape: {biomarkers}
- Emerging mechanisms: {emerging_science}

📋 **Regulatory Environment:**
- Approval pathways: {approval_pathways}
- Guidance documents: {therapeutic_guidance}
- Recent approvals and precedents: {recent_precedents}

🎯 **Development Considerations:**
- Patient population characteristics: {population_characteristics}
- Endpoint strategies: {endpoint_considerations}
- Competitive landscape: {competitive_context}

""",
                variables=["therapeutic_area", "standard_of_care", "unmet_needs", "kol_insights", "pathophysiology", "biomarkers", "emerging_science", "approval_pathways", "therapeutic_guidance", "recent_precedents", "population_characteristics", "endpoint_considerations", "competitive_context"],
                priority=6,
                is_active=True,
                safety_level=SafetyLevel.HIGH,
                compliance_requirements=[ComplianceFramework.FDA_GUIDANCE, ComplianceFramework.MEDICAL_ETHICS]
            )
        }

        self.injection_rules = default_rules

    async def _setup_safety_validators(self):
        """Setup safety validation functions"""

        async def minimal_safety_check(prompt: str, context: Dict[str, Any]) -> SafetyValidationResult:
            """Minimal safety validation"""
            return SafetyValidationResult(
                is_safe=True,
                safety_score=0.8,
                risk_factors=[],
                mitigation_actions=[],
                blocked_content=[],
                warnings=[],
                recommendations=[]
            )

        async def standard_safety_check(prompt: str, context: Dict[str, Any]) -> SafetyValidationResult:
            """Standard safety validation"""
            risk_factors = []
            warnings = []

            # Check for harmful content
            harmful_patterns = [
                r'\b(poison|harm|kill|suicide)\b',
                r'\b(illegal|unlawful|criminal)\b',
                r'\b(discriminat|bias|prejudice)\b'
            ]

            for pattern in harmful_patterns:
                if re.search(pattern, prompt, re.IGNORECASE):
                    risk_factors.append(f"Potential harmful content: {pattern}")

            # Medical advice warnings
            if any(term in prompt.lower() for term in ['diagnose', 'treatment', 'prescribe', 'dosage']):
                warnings.append("Content may constitute medical advice - ensure appropriate disclaimers")

            is_safe = len(risk_factors) == 0
            safety_score = 1.0 if is_safe else max(0.3, 1.0 - len(risk_factors) * 0.2)

            return SafetyValidationResult(
                is_safe=is_safe,
                safety_score=safety_score,
                risk_factors=risk_factors,
                mitigation_actions=["Add appropriate disclaimers", "Include safety warnings"],
                blocked_content=[],
                warnings=warnings,
                recommendations=["Review content for compliance", "Add professional use disclaimers"]
            )

        async def high_safety_check(prompt: str, context: Dict[str, Any]) -> SafetyValidationResult:
            """High-level safety validation"""
            result = await standard_safety_check(prompt, context)

            # Additional checks for high safety
            additional_risks = []

            # Patient safety considerations
            if context.get("involves_patients", False):
                if "experimental" in prompt.lower() and "disclaimer" not in prompt.lower():
                    additional_risks.append("Experimental content without appropriate disclaimers")

            # Regulatory compliance
            if context.get("regulatory_context") and "preliminary" not in prompt.lower():
                additional_risks.append("Regulatory content should include preliminary/non-binding disclaimers")

            result.risk_factors.extend(additional_risks)
            result.is_safe = len(result.risk_factors) == 0
            result.safety_score = max(0.2, result.safety_score - len(additional_risks) * 0.1)

            return result

        async def maximum_safety_check(prompt: str, context: Dict[str, Any]) -> SafetyValidationResult:
            """Maximum safety validation"""
            result = await high_safety_check(prompt, context)

            # Strictest validation
            strict_requirements = []

            # Require explicit disclaimers
            required_disclaimers = ["educational purposes", "professional consultation", "not medical advice"]
            missing_disclaimers = [d for d in required_disclaimers if d not in prompt.lower()]

            if missing_disclaimers:
                strict_requirements.extend([f"Missing disclaimer: {d}" for d in missing_disclaimers])

            # Require regulatory context
            if context.get("regulatory_scope") and "current as of" not in prompt.lower():
                strict_requirements.append("Missing regulatory currency disclaimer")

            result.risk_factors.extend(strict_requirements)
            result.is_safe = len(result.risk_factors) == 0
            result.safety_score = max(0.1, result.safety_score - len(strict_requirements) * 0.05)

            return result

        self.safety_validators = {
            SafetyLevel.MINIMAL: minimal_safety_check,
            SafetyLevel.STANDARD: standard_safety_check,
            SafetyLevel.HIGH: high_safety_check,
            SafetyLevel.MAXIMUM: maximum_safety_check
        }

    async def _setup_compliance_validators(self):
        """Setup compliance validation functions"""

        async def hipaa_validator(prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
            """HIPAA compliance validation"""
            issues = []

            # Check for PHI references
            phi_patterns = [
                r'\b\d{3}-\d{2}-\d{4}\b',  # SSN pattern
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
                r'\b\d{10,}\b'  # Phone numbers
            ]

            for pattern in phi_patterns:
                if re.search(pattern, prompt):
                    issues.append(f"Potential PHI detected: {pattern}")

            return {
                "framework": "HIPAA",
                "compliant": len(issues) == 0,
                "issues": issues,
                "recommendations": ["Remove or anonymize PHI", "Add data protection disclaimers"]
            }

        async def fda_guidance_validator(prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
            """FDA guidance compliance validation"""
            issues = []

            # Check for regulatory claims
            if any(term in prompt.lower() for term in ['approved', 'fda approved', 'indicated for']):
                if 'preliminary' not in prompt.lower():
                    issues.append("Regulatory claims without appropriate qualifications")

            # Check for promotional language
            promotional_terms = ['best', 'superior', 'revolutionary', 'breakthrough']
            for term in promotional_terms:
                if term in prompt.lower():
                    issues.append(f"Potentially promotional language: {term}")

            return {
                "framework": "FDA Guidance",
                "compliant": len(issues) == 0,
                "issues": issues,
                "recommendations": ["Add regulatory disclaimers", "Qualify promotional claims"]
            }

        async def medical_ethics_validator(prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
            """Medical ethics compliance validation"""
            issues = []

            # Check for ethical considerations
            if context.get("involves_patients", False):
                ethical_terms = ['autonomy', 'beneficence', 'non-maleficence', 'justice']
                mentioned_ethics = [term for term in ethical_terms if term in prompt.lower()]

                if not mentioned_ethics and 'experimental' in prompt.lower():
                    issues.append("Experimental content should reference ethical principles")

            return {
                "framework": "Medical Ethics",
                "compliant": len(issues) == 0,
                "issues": issues,
                "recommendations": ["Include ethical considerations", "Add patient welfare statements"]
            }

        self.compliance_validators = {
            ComplianceFramework.HIPAA: hipaa_validator,
            ComplianceFramework.FDA_GUIDANCE: fda_guidance_validator,
            ComplianceFramework.MEDICAL_ETHICS: medical_ethics_validator
        }

    async def _initialize_context_processors(self):
        """Initialize context processing functions"""

        async def process_therapeutic_context(context: Dict[str, Any]) -> Dict[str, str]:
            """Process therapeutic area context"""
            therapeutic_area = context.get("therapeutic_area", "general")

            therapeutic_contexts = {
                "oncology": {
                    "standard_of_care": "Varies by cancer type and stage",
                    "unmet_needs": "Resistance mechanisms, biomarker-driven therapy",
                    "pathophysiology": "Tumor heterogeneity and immune escape",
                    "biomarkers": "PD-L1, MSI, TMB, HRD",
                    "approval_pathways": "Accelerated approval, breakthrough designation"
                },
                "cardiology": {
                    "standard_of_care": "Guidelines-based preventive and therapeutic approaches",
                    "unmet_needs": "Heart failure with preserved EF, precision medicine",
                    "pathophysiology": "Atherosclerosis, heart failure mechanisms",
                    "biomarkers": "Troponin, BNP, CRP, genetic markers",
                    "approval_pathways": "Cardiovascular outcomes trials required"
                },
                "digital_therapeutics": {
                    "standard_of_care": "Emerging field with evolving standards",
                    "unmet_needs": "Evidence generation, reimbursement pathways",
                    "pathophysiology": "Behavioral modification mechanisms",
                    "biomarkers": "Digital biomarkers, engagement metrics",
                    "approval_pathways": "De Novo pathway, software as medical device"
                }
            }

            return therapeutic_contexts.get(therapeutic_area.lower(), {
                "standard_of_care": "Consult therapeutic area guidelines",
                "unmet_needs": "To be determined based on literature review",
                "pathophysiology": "Area-specific mechanisms",
                "biomarkers": "Relevant to therapeutic indication",
                "approval_pathways": "Standard regulatory pathways"
            })

        async def process_prism_context(context: Dict[str, Any]) -> Dict[str, str]:
            """Process PRISM suite context"""
            prism_suite = context.get("prism_suite", "")

            prism_contexts = {
                "RULES": {
                    "domain_focus": "regulatory excellence and compliance",
                    "methodology_description": "Systematic regulatory strategy development using evidence-based frameworks",
                    "focus_areas": "• Regulatory pathway optimization\n• Submission strategy\n• Global compliance\n• Risk assessment",
                    "framework_application": "Apply regulatory science principles with focus on approvability and commercial success",
                    "expected_outputs": "Regulatory strategies, pathway recommendations, compliance assessments"
                },
                "TRIALS": {
                    "domain_focus": "clinical development and trial optimization",
                    "methodology_description": "Evidence-based clinical development planning with statistical rigor",
                    "focus_areas": "• Protocol optimization\n• Endpoint strategy\n• Statistical planning\n• Regulatory alignment",
                    "framework_application": "Integrate clinical science with regulatory requirements for efficient development",
                    "expected_outputs": "Study designs, endpoint strategies, development timelines"
                },
                "GUARD": {
                    "domain_focus": "safety excellence and risk management",
                    "methodology_description": "Comprehensive safety assessment using pharmacovigilance best practices",
                    "focus_areas": "• Safety monitoring\n• Risk evaluation\n• Signal detection\n• Benefit-risk assessment",
                    "framework_application": "Proactive safety management with patient protection as primary focus",
                    "expected_outputs": "Safety plans, risk assessments, monitoring strategies"
                },
                "VALUE": {
                    "domain_focus": "health economics and market access",
                    "methodology_description": "Evidence-based value proposition development for stakeholder engagement",
                    "focus_areas": "• Economic modeling\n• HTA strategy\n• Payer engagement\n• Value demonstration",
                    "framework_application": "Quantitative and qualitative evidence synthesis for value communication",
                    "expected_outputs": "Economic models, value propositions, access strategies"
                }
            }

            return prism_contexts.get(prism_suite, {
                "domain_focus": "general healthcare consulting",
                "methodology_description": "Systematic evidence-based approach to healthcare challenges",
                "focus_areas": "• Problem analysis\n• Evidence synthesis\n• Strategic recommendations",
                "framework_application": "Apply best practices and evidence-based methodologies",
                "expected_outputs": "Analysis, recommendations, strategic guidance"
            })

        self.context_processors = {
            "therapeutic": process_therapeutic_context,
            "prism": process_prism_context
        }

    # Core Injection Methods

    async def inject_prompt(
        self,
        original_prompt: str,
        contextual_data: ContextualData,
        injection_config: Optional[Dict[str, Any]] = None
    ) -> InjectionResult:
        """
        Main prompt injection method

        Args:
            original_prompt: Original prompt text
            contextual_data: Comprehensive contextual information
            injection_config: Optional injection configuration

        Returns:
            InjectionResult with enhanced prompt and metadata
        """
        logger.info("Starting prompt injection process...")

        try:
            # Step 1: Analyze context and determine applicable rules
            applicable_rules = await self._determine_applicable_rules(
                original_prompt, contextual_data, injection_config
            )

            # Step 2: Process contextual data
            processed_context = await self._process_contextual_data(contextual_data)

            # Step 3: Apply injection rules in priority order
            enhanced_prompt = original_prompt
            applied_injections = []
            injection_metadata = {}

            for rule in sorted(applicable_rules, key=lambda r: r.priority):
                try:
                    enhanced_prompt, injection_meta = await self._apply_injection_rule(
                        enhanced_prompt, rule, processed_context
                    )
                    applied_injections.append(rule.rule_id)
                    injection_metadata[rule.rule_id] = injection_meta

                except Exception as e:
                    logger.warning(f"Failed to apply injection rule {rule.rule_id}: {e}")

            # Step 4: Validate safety and compliance
            safety_result = await self._validate_safety(enhanced_prompt, processed_context)
            compliance_result = await self._validate_compliance(enhanced_prompt, processed_context)

            # Step 5: Calculate performance metrics
            performance_metrics = await self._calculate_injection_metrics(
                original_prompt, enhanced_prompt, applied_injections
            )

            # Step 6: Create result
            result = InjectionResult(
                original_prompt=original_prompt,
                enhanced_prompt=enhanced_prompt,
                applied_injections=applied_injections,
                injection_metadata=injection_metadata,
                safety_validation=safety_result.__dict__,
                compliance_validation=compliance_result,
                performance_metrics=performance_metrics,
                tokens_added=len(enhanced_prompt.split()) - len(original_prompt.split()),
                confidence_score=await self._calculate_injection_confidence(
                    applied_injections, safety_result, compliance_result
                )
            )

            # Step 7: Record injection for analytics
            await self._record_injection(result, contextual_data)

            logger.info(f"Injection completed: {len(applied_injections)} rules applied")
            return result

        except Exception as e:
            logger.error(f"Error in prompt injection: {e}")
            # Return original prompt with error metadata
            return InjectionResult(
                original_prompt=original_prompt,
                enhanced_prompt=original_prompt,
                applied_injections=[],
                injection_metadata={"error": str(e)},
                safety_validation={"error": str(e)},
                compliance_validation={"error": str(e)},
                performance_metrics={},
                tokens_added=0,
                confidence_score=0.0
            )

    async def _determine_applicable_rules(
        self,
        prompt: str,
        contextual_data: ContextualData,
        config: Optional[Dict[str, Any]]
    ) -> List[InjectionRule]:
        """Determine which injection rules apply to the current context"""

        applicable_rules = []

        for rule in self.injection_rules.values():
            if not rule.is_active:
                continue

            # Check conditions
            if await self._evaluate_rule_conditions(rule, prompt, contextual_data, config):
                applicable_rules.append(rule)

        return applicable_rules

    async def _evaluate_rule_conditions(
        self,
        rule: InjectionRule,
        prompt: str,
        contextual_data: ContextualData,
        config: Optional[Dict[str, Any]]
    ) -> bool:
        """Evaluate if a rule's conditions are met"""

        conditions = rule.conditions

        # Check domain conditions
        if "domains" in conditions:
            required_domains = conditions["domains"]
            if required_domains != "*":
                user_domains = contextual_data.domain_context.get("domains", [])
                if not any(domain in user_domains for domain in required_domains):
                    return False

        # Check PRISM suite conditions
        if "prism_suites" in conditions:
            required_suites = conditions["prism_suites"]
            if required_suites != "*":
                user_suite = contextual_data.user_context.get("prism_suite", "")
                if user_suite not in required_suites:
                    return False

        # Check complexity conditions
        if "min_complexity" in conditions:
            min_complexity = conditions["min_complexity"]
            user_complexity = contextual_data.session_context.get("complexity_score", 0.0)
            if user_complexity < min_complexity:
                return False

        # Check therapeutic area conditions
        if "therapeutic_areas" in conditions:
            required_areas = conditions["therapeutic_areas"]
            if required_areas != "*":
                user_areas = contextual_data.therapeutic_context.get("therapeutic_areas", [])
                if not any(area in user_areas for area in required_areas):
                    return False

        # Check safety critical flag
        if "safety_critical" in conditions:
            required_safety = conditions["safety_critical"]
            user_safety = contextual_data.session_context.get("safety_critical", False)
            if required_safety and not user_safety:
                return False

        # Check regulatory scope
        if "regulatory_scope" in conditions:
            required_scope = conditions["regulatory_scope"]
            if required_scope != "*":
                user_scope = contextual_data.regulatory_context.get("scope", "")
                if user_scope != required_scope:
                    return False

        return True

    async def _process_contextual_data(self, contextual_data: ContextualData) -> Dict[str, Any]:
        """Process and enrich contextual data"""

        processed = {}

        # Process therapeutic context
        if self.context_processors.get("therapeutic"):
            therapeutic_context = await self.context_processors["therapeutic"](
                contextual_data.therapeutic_context
            )
            processed.update(therapeutic_context)

        # Process PRISM context
        if self.context_processors.get("prism"):
            prism_context = await self.context_processors["prism"](
                contextual_data.user_context
            )
            processed.update(prism_context)

        # Add standard context
        processed.update({
            "date": datetime.now().strftime("%Y-%m-%d"),
            "therapeutic_area": contextual_data.therapeutic_context.get("primary_area", "General"),
            "domain": contextual_data.domain_context.get("primary_domain", "Healthcare"),
            "prism_suite": contextual_data.user_context.get("prism_suite", "General"),
            "regulatory_context": contextual_data.regulatory_context.get("primary_jurisdiction", "General"),
            "evidence_level": contextual_data.session_context.get("evidence_level", "Mixed"),
            "safety_considerations": contextual_data.session_context.get("safety_profile", "Standard precautions apply")
        })

        return processed

    async def _apply_injection_rule(
        self,
        prompt: str,
        rule: InjectionRule,
        context: Dict[str, Any]
    ) -> Tuple[str, Dict[str, Any]]:
        """Apply a specific injection rule to the prompt"""

        # Substitute variables in template
        template = rule.template
        for variable in rule.variables:
            value = context.get(variable, f"[{variable}]")
            template = template.replace(f"{{{variable}}}", str(value))

        # Apply injection strategy
        if rule.strategy == InjectionStrategy.PREPEND:
            enhanced_prompt = template + prompt

        elif rule.strategy == InjectionStrategy.APPEND:
            enhanced_prompt = prompt + template

        elif rule.strategy == InjectionStrategy.REPLACE:
            enhanced_prompt = template

        elif rule.strategy == InjectionStrategy.MERGE:
            # Replace {original_content} placeholder
            enhanced_prompt = template.replace("{original_content}", prompt)

        elif rule.strategy == InjectionStrategy.CONDITIONAL:
            # Apply only if specific conditions are met
            condition_met = await self._evaluate_conditional_injection(rule, context)
            enhanced_prompt = template + prompt if condition_met else prompt

        elif rule.strategy == InjectionStrategy.ADAPTIVE:
            # Adaptive injection based on context
            enhanced_prompt = await self._apply_adaptive_injection(prompt, rule, context)

        else:
            enhanced_prompt = prompt  # Default: no change

        metadata = {
            "rule_applied": rule.rule_id,
            "strategy": rule.strategy.value,
            "template_length": len(template),
            "variables_substituted": len(rule.variables),
            "injection_type": rule.injection_type.value
        }

        return enhanced_prompt, metadata

    async def _evaluate_conditional_injection(
        self,
        rule: InjectionRule,
        context: Dict[str, Any]
    ) -> bool:
        """Evaluate conditional injection criteria"""

        # Check knowledge relevance threshold
        if "knowledge_relevance" in rule.conditions:
            threshold = rule.conditions["knowledge_relevance"]
            relevance = context.get("knowledge_relevance_score", 0.0)
            return relevance >= threshold

        # Check if knowledge context exists
        if "has_knowledge_context" in rule.conditions:
            return bool(context.get("knowledge_insights"))

        return True

    async def _apply_adaptive_injection(
        self,
        prompt: str,
        rule: InjectionRule,
        context: Dict[str, Any]
    ) -> str:
        """Apply adaptive injection based on dynamic context analysis"""

        # Analyze prompt characteristics
        prompt_length = len(prompt.split())
        complexity = context.get("complexity_score", 0.5)

        # Adapt injection based on characteristics
        if prompt_length < 50 and complexity < 0.5:
            # Short, simple prompt - minimal injection
            template = rule.template[:200] + "..."
        elif prompt_length > 200 or complexity > 0.8:
            # Long or complex prompt - full injection
            template = rule.template
        else:
            # Medium prompt - moderate injection
            template = rule.template[:500] + "..."

        return template + prompt

    async def _validate_safety(
        self,
        prompt: str,
        context: Dict[str, Any]
    ) -> SafetyValidationResult:
        """Validate prompt safety"""

        # Determine required safety level
        safety_level = SafetyLevel.STANDARD

        if context.get("safety_critical", False):
            safety_level = SafetyLevel.MAXIMUM
        elif context.get("involves_patients", False):
            safety_level = SafetyLevel.HIGH
        elif context.get("regulatory_context"):
            safety_level = SafetyLevel.HIGH

        # Apply appropriate validator
        validator = self.safety_validators.get(safety_level)
        if validator:
            return await validator(prompt, context)

        # Default validation
        return SafetyValidationResult(
            is_safe=True,
            safety_score=0.7,
            risk_factors=[],
            mitigation_actions=[],
            blocked_content=[],
            warnings=[],
            recommendations=[]
        )

    async def _validate_compliance(
        self,
        prompt: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate prompt compliance across frameworks"""

        compliance_results = {}

        # Determine required compliance frameworks
        required_frameworks = []

        if context.get("involves_patients", False):
            required_frameworks.extend([ComplianceFramework.HIPAA, ComplianceFramework.MEDICAL_ETHICS])

        if context.get("regulatory_context"):
            required_frameworks.append(ComplianceFramework.FDA_GUIDANCE)

        if context.get("clinical_trial_context", False):
            required_frameworks.append(ComplianceFramework.ICH_GCP)

        # Apply validators
        for framework in required_frameworks:
            validator = self.compliance_validators.get(framework)
            if validator:
                result = await validator(prompt, context)
                compliance_results[framework.value] = result

        return compliance_results

    async def _calculate_injection_metrics(
        self,
        original_prompt: str,
        enhanced_prompt: str,
        applied_injections: List[str]
    ) -> Dict[str, float]:
        """Calculate injection performance metrics"""

        original_length = len(original_prompt)
        enhanced_length = len(enhanced_prompt)

        metrics = {
            "length_increase_ratio": enhanced_length / original_length if original_length > 0 else 0,
            "tokens_added": len(enhanced_prompt.split()) - len(original_prompt.split()),
            "injection_count": len(applied_injections),
            "enhancement_ratio": (enhanced_length - original_length) / enhanced_length if enhanced_length > 0 else 0
        }

        return metrics

    async def _calculate_injection_confidence(
        self,
        applied_injections: List[str],
        safety_result: SafetyValidationResult,
        compliance_result: Dict[str, Any]
    ) -> float:
        """Calculate confidence score for the injection process"""

        base_confidence = 0.5

        # Injection success contribution
        if applied_injections:
            injection_confidence = min(0.4, len(applied_injections) * 0.1)
            base_confidence += injection_confidence

        # Safety validation contribution
        safety_confidence = safety_result.safety_score * 0.3
        base_confidence += safety_confidence

        # Compliance validation contribution
        if compliance_result:
            compliant_count = sum(
                1 for result in compliance_result.values()
                if result.get("compliant", False)
            )
            total_count = len(compliance_result)
            compliance_confidence = (compliant_count / total_count * 0.2) if total_count > 0 else 0
            base_confidence += compliance_confidence

        return min(base_confidence, 1.0)

    async def _record_injection(
        self,
        result: InjectionResult,
        contextual_data: ContextualData
    ):
        """Record injection for analytics and improvement"""

        record = {
            "timestamp": datetime.now().isoformat(),
            "applied_injections": result.applied_injections,
            "tokens_added": result.tokens_added,
            "confidence_score": result.confidence_score,
            "safety_score": result.safety_validation.get("safety_score", 0.0),
            "context_summary": {
                "domain": contextual_data.domain_context.get("primary_domain"),
                "prism_suite": contextual_data.user_context.get("prism_suite"),
                "therapeutic_area": contextual_data.therapeutic_context.get("primary_area"),
                "complexity": contextual_data.session_context.get("complexity_score", 0.0)
            }
        }

        self.injection_history.append(record)

        # Keep only last 1000 records
        if len(self.injection_history) > 1000:
            self.injection_history = self.injection_history[-1000:]

    # Management and Analytics Methods

    async def add_injection_rule(self, rule: InjectionRule) -> bool:
        """Add a new injection rule"""
        try:
            self.injection_rules[rule.rule_id] = rule
            logger.info(f"Added injection rule: {rule.rule_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to add injection rule: {e}")
            return False

    async def update_injection_rule(self, rule_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing injection rule"""
        if rule_id not in self.injection_rules:
            return False

        try:
            rule = self.injection_rules[rule_id]

            if "is_active" in updates:
                rule.is_active = updates["is_active"]
            if "priority" in updates:
                rule.priority = updates["priority"]
            if "template" in updates:
                rule.template = updates["template"]
            if "conditions" in updates:
                rule.conditions.update(updates["conditions"])

            logger.info(f"Updated injection rule: {rule_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update injection rule: {e}")
            return False

    async def get_injection_analytics(self) -> Dict[str, Any]:
        """Get injection analytics and performance metrics"""

        if not self.injection_history:
            return {"message": "No injection history available"}

        # Rule usage statistics
        rule_usage = {}
        for record in self.injection_history:
            for rule_id in record["applied_injections"]:
                rule_usage[rule_id] = rule_usage.get(rule_id, 0) + 1

        # Performance metrics
        total_injections = len(self.injection_history)
        avg_confidence = sum(r["confidence_score"] for r in self.injection_history) / total_injections
        avg_safety_score = sum(r["safety_score"] for r in self.injection_history) / total_injections
        avg_tokens_added = sum(r["tokens_added"] for r in self.injection_history) / total_injections

        # Context distribution
        context_dist = {}
        for record in self.injection_history:
            context = record["context_summary"]
            domain = context.get("domain", "unknown")
            context_dist[domain] = context_dist.get(domain, 0) + 1

        return {
            "total_injections": total_injections,
            "average_confidence": round(avg_confidence, 3),
            "average_safety_score": round(avg_safety_score, 3),
            "average_tokens_added": round(avg_tokens_added, 1),
            "rule_usage_statistics": rule_usage,
            "context_distribution": context_dist,
            "active_rules": len([r for r in self.injection_rules.values() if r.is_active])
        }

    async def _load_configuration(self):
        """Load injection engine configuration"""
        # Configuration loading would be implemented here
        pass

# Factory function
def create_injection_engine(config_path: Optional[str] = None) -> PromptInjectionEngine:
    """Create and return a configured PromptInjectionEngine"""
    return PromptInjectionEngine(config_path)

# Example usage
if __name__ == "__main__":
    async def test_injection_engine():
        """Test the prompt injection engine"""

        engine = create_injection_engine()

        # Wait for initialization
        await asyncio.sleep(1)

        # Test injection
        original_prompt = "What are the FDA requirements for digital therapeutics?"

        contextual_data = ContextualData(
            user_context={"prism_suite": "RULES", "user_type": "regulatory_professional"},
            session_context={"complexity_score": 0.8, "safety_critical": False},
            domain_context={"primary_domain": "regulatory_compliance", "domains": ["regulatory", "digital_health"]},
            temporal_context={"timestamp": datetime.now().isoformat()},
            regulatory_context={"primary_jurisdiction": "FDA", "scope": "device_regulation"},
            therapeutic_context={"primary_area": "digital_therapeutics", "therapeutic_areas": ["digital_health"]},
            previous_interactions=[],
            knowledge_base_context={}
        )

        result = await engine.inject_prompt(original_prompt, contextual_data)

        print(f"Original prompt length: {len(original_prompt)}")
        print(f"Enhanced prompt length: {len(result.enhanced_prompt)}")
        print(f"Applied injections: {result.applied_injections}")
        print(f"Confidence score: {result.confidence_score:.2f}")
        print(f"Safety score: {result.safety_validation.get('safety_score', 'N/A')}")

        # Test analytics
        analytics = await engine.get_injection_analytics()
        print(f"Analytics: {analytics}")

    # Run test
    asyncio.run(test_injection_engine())