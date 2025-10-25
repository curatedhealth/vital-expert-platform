# ===================================================================
# Advanced Prompt Management Service - Phase 2 Enhanced
# Medical compliance, clinical validation, and intelligent prompt routing
# ===================================================================

import asyncio
import json
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set, Tuple
from enum import Enum
import uuid
from dataclasses import dataclass, asdict, field
import re
import asyncpg
import redis.asyncio as redis
from sqlalchemy import text
import opentelemetry.trace as trace
from opentelemetry import metrics
from transformers import pipeline, AutoTokenizer, AutoModel
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
prompt_requests = meter.create_counter(
    "prompt_requests_total",
    description="Total prompt management requests"
)

compliance_checks = meter.create_counter(
    "compliance_checks_total",
    description="Total compliance checks performed"
)

prompt_optimization_time = meter.create_histogram(
    "prompt_optimization_duration_seconds",
    description="Time spent on prompt optimization"
)

class PromptCategory(Enum):
    """Prompt categories for medical domain"""
    CLINICAL_ASSESSMENT = "clinical_assessment"
    DIAGNOSTIC_REASONING = "diagnostic_reasoning"
    TREATMENT_PLANNING = "treatment_planning"
    MEDICATION_MANAGEMENT = "medication_management"
    PATIENT_EDUCATION = "patient_education"
    CLINICAL_DOCUMENTATION = "clinical_documentation"
    RESEARCH_QUERY = "research_query"
    REGULATORY_COMPLIANCE = "regulatory_compliance"
    CLINICAL_DECISION_SUPPORT = "clinical_decision_support"
    PHARMACOVIGILANCE = "pharmacovigilance"

class ComplianceLevel(Enum):
    """Medical compliance levels"""
    HIPAA_COMPLIANT = "hipaa_compliant"
    FDA_COMPLIANT = "fda_compliant"
    CLINICAL_GUIDELINES = "clinical_guidelines"
    EVIDENCE_BASED = "evidence_based"
    PEER_REVIEWED = "peer_reviewed"
    REGULATORY_APPROVED = "regulatory_approved"

class PromptSafety(Enum):
    """Prompt safety levels"""
    SAFE = "safe"
    CAUTIONARY = "cautionary"
    RESTRICTED = "restricted"
    PROHIBITED = "prohibited"

class OptimizationStrategy(Enum):
    """Prompt optimization strategies"""
    CLINICAL_PRECISION = "clinical_precision"
    EVIDENCE_INTEGRATION = "evidence_integration"
    SAFETY_ENHANCEMENT = "safety_enhancement"
    REGULATORY_ALIGNMENT = "regulatory_alignment"
    PERSONALIZATION = "personalization"
    EFFICIENCY_OPTIMIZATION = "efficiency_optimization"

@dataclass
class MedicalContext:
    """Medical context for prompt processing"""
    patient_age_range: Optional[str] = None
    gender: Optional[str] = None
    medical_conditions: List[str] = field(default_factory=list)
    medications: List[str] = field(default_factory=list)
    allergies: List[str] = field(default_factory=list)
    clinical_setting: Optional[str] = None  # hospital, clinic, home_care, etc.
    urgency_level: Optional[str] = None     # routine, urgent, emergency
    practitioner_type: Optional[str] = None # physician, nurse, pharmacist, etc.

@dataclass
class ComplianceCheck:
    """Compliance check result"""
    check_id: str
    compliance_type: ComplianceLevel
    is_compliant: bool
    confidence_score: float
    violations: List[str]
    recommendations: List[str]
    evidence_sources: List[str]
    timestamp: datetime = datetime.utcnow()

@dataclass
class PromptTemplate:
    """Medical prompt template"""
    template_id: str
    name: str
    category: PromptCategory
    template_text: str
    variables: List[str]
    medical_context_required: bool
    compliance_levels: List[ComplianceLevel]
    safety_level: PromptSafety
    clinical_domains: List[str]
    evidence_level: str
    last_updated: datetime
    usage_count: int = 0
    effectiveness_score: float = 0.0
    validation_status: str = "pending"

@dataclass
class PromptOptimization:
    """Prompt optimization result"""
    original_prompt: str
    optimized_prompt: str
    optimization_strategy: OptimizationStrategy
    improvement_metrics: Dict[str, float]
    clinical_enhancements: List[str]
    safety_improvements: List[str]
    compliance_improvements: List[str]
    confidence_score: float
    processing_time: float

@dataclass
class PromptRequest:
    """Prompt processing request"""
    request_id: str
    user_id: str
    organization_id: str
    prompt_text: str
    category: Optional[PromptCategory] = None
    medical_context: Optional[MedicalContext] = None
    compliance_requirements: List[ComplianceLevel] = field(default_factory=list)
    optimization_requested: bool = False
    safety_check_required: bool = True
    timestamp: datetime = datetime.utcnow()

@dataclass
class PromptResponse:
    """Prompt processing response"""
    request_id: str
    processed_prompt: str
    category: PromptCategory
    safety_level: PromptSafety
    compliance_status: Dict[ComplianceLevel, ComplianceCheck]
    optimization_result: Optional[PromptOptimization] = None
    clinical_warnings: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    confidence_score: float = 0.0
    processing_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

class MedicalNLPProcessor:
    """Medical NLP processing for prompt analysis"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.nlp = None
        self.medical_tokenizer = None
        self.medical_model = None
        self.clinical_classifier = None

    async def initialize(self):
        """Initialize medical NLP models"""
        try:
            # Load spaCy model with medical extensions
            model_name = self.config.get('spacy_model', 'en_core_sci_sm')
            self.nlp = spacy.load(model_name)

            # Load medical BERT model
            model_path = self.config.get('medical_bert_model', 'emilyalsentzer/Bio_ClinicalBERT')
            self.medical_tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.medical_model = AutoModel.from_pretrained(model_path)

            # Load clinical text classifier
            classifier_model = self.config.get('classifier_model', 'distilbert-base-uncased')
            self.clinical_classifier = pipeline(
                "text-classification",
                model=classifier_model,
                tokenizer=classifier_model
            )

            logger.info("Medical NLP models initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize medical NLP models: {e}")
            # Fallback to basic processing
            try:
                self.nlp = spacy.load('en_core_web_sm')
            except:
                logger.warning("No spaCy model available, using basic processing")

    async def extract_medical_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract medical entities from text"""
        if not self.nlp:
            return {}

        doc = self.nlp(text)
        entities = {
            'conditions': [],
            'medications': [],
            'procedures': [],
            'anatomy': [],
            'symptoms': [],
            'lab_tests': []
        }

        # Extract named entities
        for ent in doc.ents:
            entity_type = ent.label_.lower()
            entity_text = ent.text.strip()

            if entity_type in ['disease', 'condition', 'disorder']:
                entities['conditions'].append(entity_text)
            elif entity_type in ['drug', 'medication', 'chemical']:
                entities['medications'].append(entity_text)
            elif entity_type in ['procedure', 'treatment']:
                entities['procedures'].append(entity_text)
            elif entity_type in ['anatomy', 'body_part']:
                entities['anatomy'].append(entity_text)
            elif entity_type in ['symptom', 'sign']:
                entities['symptoms'].append(entity_text)
            elif entity_type in ['test', 'lab', 'diagnostic']:
                entities['lab_tests'].append(entity_text)

        # Remove duplicates
        for key in entities:
            entities[key] = list(set(entities[key]))

        return entities

    async def classify_prompt_category(self, text: str) -> Tuple[PromptCategory, float]:
        """Classify prompt into medical category"""
        # Define category keywords
        category_keywords = {
            PromptCategory.CLINICAL_ASSESSMENT: [
                'assess', 'evaluate', 'examine', 'clinical', 'history', 'physical exam'
            ],
            PromptCategory.DIAGNOSTIC_REASONING: [
                'diagnose', 'differential', 'rule out', 'diagnostic', 'workup'
            ],
            PromptCategory.TREATMENT_PLANNING: [
                'treatment', 'therapy', 'manage', 'plan', 'intervention'
            ],
            PromptCategory.MEDICATION_MANAGEMENT: [
                'medication', 'drug', 'prescription', 'dosage', 'pharmacology'
            ],
            PromptCategory.PATIENT_EDUCATION: [
                'explain', 'educate', 'patient', 'information', 'counseling'
            ],
            PromptCategory.CLINICAL_DOCUMENTATION: [
                'document', 'record', 'note', 'chart', 'icd', 'coding'
            ],
            PromptCategory.RESEARCH_QUERY: [
                'research', 'study', 'evidence', 'literature', 'pubmed'
            ],
            PromptCategory.REGULATORY_COMPLIANCE: [
                'compliance', 'regulatory', 'fda', 'hipaa', 'guideline'
            ],
            PromptCategory.CLINICAL_DECISION_SUPPORT: [
                'decision', 'recommend', 'suggest', 'algorithm', 'protocol'
            ],
            PromptCategory.PHARMACOVIGILANCE: [
                'adverse', 'side effect', 'reaction', 'safety', 'monitoring'
            ]
        }

        text_lower = text.lower()
        category_scores = {}

        # Calculate scores for each category
        for category, keywords in category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score / len(keywords)

        if not category_scores:
            return PromptCategory.CLINICAL_ASSESSMENT, 0.5

        # Return category with highest score
        best_category = max(category_scores, key=category_scores.get)
        confidence = category_scores[best_category]

        return best_category, confidence

    async def assess_clinical_safety(self, text: str,
                                   medical_context: Optional[MedicalContext] = None) -> Tuple[PromptSafety, List[str]]:
        """Assess clinical safety of prompt"""
        warnings = []
        safety_level = PromptSafety.SAFE

        # Check for high-risk keywords
        high_risk_patterns = [
            r'\b(?:suicide|self[-\s]harm|kill)\b',
            r'\b(?:overdose|lethal|fatal)\b',
            r'\b(?:emergency|urgent|critical|life[-\s]threatening)\b',
            r'\b(?:contraindicated|dangerous|toxic)\b'
        ]

        text_lower = text.lower()

        for pattern in high_risk_patterns:
            if re.search(pattern, text_lower):
                safety_level = PromptSafety.CAUTIONARY
                warnings.append(f"High-risk content detected: {pattern}")

        # Check for medication safety
        if medical_context and medical_context.medications:
            for med in medical_context.medications:
                if 'warfarin' in med.lower() and 'bleeding' in text_lower:
                    safety_level = PromptSafety.CAUTIONARY
                    warnings.append("Bleeding risk with warfarin detected")

        # Check for age-specific safety
        if medical_context and medical_context.patient_age_range:
            if 'pediatric' in medical_context.patient_age_range and 'aspirin' in text_lower:
                safety_level = PromptSafety.RESTRICTED
                warnings.append("Aspirin contraindicated in pediatric patients (Reye's syndrome risk)")

        # Check for pregnancy safety
        if medical_context and medical_context.gender == 'female':
            pregnancy_risk_drugs = ['warfarin', 'ace inhibitor', 'angiotensin']
            for drug in pregnancy_risk_drugs:
                if drug in text_lower:
                    warnings.append(f"Consider pregnancy status when prescribing {drug}")

        return safety_level, warnings

class ComplianceValidator:
    """Medical compliance validation service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.compliance_rules = self._load_compliance_rules()

    def _load_compliance_rules(self) -> Dict[ComplianceLevel, Dict[str, Any]]:
        """Load medical compliance rules"""
        return {
            ComplianceLevel.HIPAA_COMPLIANT: {
                'prohibited_patterns': [
                    r'\b\d{3}-\d{2}-\d{4}\b',  # SSN pattern
                    r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',  # Credit card pattern
                    r'\b[A-Z]{1,2}\d{5,8}\b'  # Medical record pattern
                ],
                'required_elements': [],
                'warnings': [
                    'Ensure no protected health information (PHI) is included',
                    'Use de-identified patient data only'
                ]
            },
            ComplianceLevel.FDA_COMPLIANT: {
                'prohibited_patterns': [
                    r'\bcures?\b',
                    r'\bguaranteed?\b',
                    r'\bmiracle\b'
                ],
                'required_elements': [
                    'evidence-based',
                    'clinical trial data'
                ],
                'warnings': [
                    'Avoid unsubstantiated medical claims',
                    'Include appropriate disclaimers'
                ]
            },
            ComplianceLevel.CLINICAL_GUIDELINES: {
                'prohibited_patterns': [],
                'required_elements': [
                    'guideline-based',
                    'standard of care'
                ],
                'warnings': [
                    'Ensure alignment with current clinical guidelines',
                    'Reference authoritative medical sources'
                ]
            },
            ComplianceLevel.EVIDENCE_BASED: {
                'prohibited_patterns': [
                    r'\banecdotal\b',
                    r'\bhearsay\b',
                    r'\bI think\b'
                ],
                'required_elements': [
                    'peer-reviewed',
                    'clinical evidence'
                ],
                'warnings': [
                    'Base recommendations on peer-reviewed evidence',
                    'Cite appropriate medical literature'
                ]
            }
        }

    async def validate_compliance(self, text: str,
                                compliance_levels: List[ComplianceLevel]) -> Dict[ComplianceLevel, ComplianceCheck]:
        """Validate text against compliance requirements"""
        results = {}

        for level in compliance_levels:
            check_id = str(uuid.uuid4())
            rules = self.compliance_rules.get(level, {})

            violations = []
            recommendations = []
            is_compliant = True

            # Check prohibited patterns
            for pattern in rules.get('prohibited_patterns', []):
                if re.search(pattern, text, re.IGNORECASE):
                    violations.append(f"Prohibited pattern found: {pattern}")
                    is_compliant = False

            # Check required elements
            required_elements = rules.get('required_elements', [])
            for element in required_elements:
                if element.lower() not in text.lower():
                    violations.append(f"Required element missing: {element}")
                    is_compliant = False

            # Add warnings as recommendations
            recommendations.extend(rules.get('warnings', []))

            # Calculate confidence score
            confidence = 0.9 if is_compliant else 0.3
            if violations:
                confidence = max(0.1, confidence - len(violations) * 0.2)

            check = ComplianceCheck(
                check_id=check_id,
                compliance_type=level,
                is_compliant=is_compliant,
                confidence_score=confidence,
                violations=violations,
                recommendations=recommendations,
                evidence_sources=['internal_rules', 'compliance_database']
            )

            results[level] = check

        return results

class PromptOptimizer:
    """Advanced prompt optimization engine"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.optimization_strategies = {
            OptimizationStrategy.CLINICAL_PRECISION: self._optimize_clinical_precision,
            OptimizationStrategy.EVIDENCE_INTEGRATION: self._optimize_evidence_integration,
            OptimizationStrategy.SAFETY_ENHANCEMENT: self._optimize_safety,
            OptimizationStrategy.REGULATORY_ALIGNMENT: self._optimize_regulatory,
            OptimizationStrategy.PERSONALIZATION: self._optimize_personalization,
            OptimizationStrategy.EFFICIENCY_OPTIMIZATION: self._optimize_efficiency
        }

    async def optimize_prompt(self, prompt: str, strategy: OptimizationStrategy,
                            medical_context: Optional[MedicalContext] = None) -> PromptOptimization:
        """Optimize prompt using specified strategy"""
        start_time = datetime.utcnow()

        optimizer_func = self.optimization_strategies.get(strategy)
        if not optimizer_func:
            raise ValueError(f"Unknown optimization strategy: {strategy}")

        result = await optimizer_func(prompt, medical_context)

        processing_time = (datetime.utcnow() - start_time).total_seconds()
        prompt_optimization_time.record(processing_time)

        return PromptOptimization(
            original_prompt=prompt,
            optimized_prompt=result['optimized_prompt'],
            optimization_strategy=strategy,
            improvement_metrics=result.get('metrics', {}),
            clinical_enhancements=result.get('clinical_enhancements', []),
            safety_improvements=result.get('safety_improvements', []),
            compliance_improvements=result.get('compliance_improvements', []),
            confidence_score=result.get('confidence', 0.8),
            processing_time=processing_time
        )

    async def _optimize_clinical_precision(self, prompt: str,
                                         context: Optional[MedicalContext]) -> Dict[str, Any]:
        """Optimize for clinical precision and accuracy"""
        optimized = prompt

        # Add clinical context specificity
        if context:
            if context.patient_age_range:
                optimized = f"For {context.patient_age_range} patient: {optimized}"

            if context.clinical_setting:
                optimized = f"In {context.clinical_setting} setting: {optimized}"

        # Add precision qualifiers
        precision_replacements = {
            'probably': 'likely (>70% probability)',
            'possibly': 'possibly (30-70% probability)',
            'unlikely': 'unlikely (<30% probability)',
            'always': 'in most cases',
            'never': 'rarely'
        }

        for vague, precise in precision_replacements.items():
            optimized = re.sub(r'\b' + vague + r'\b', precise, optimized, flags=re.IGNORECASE)

        return {
            'optimized_prompt': optimized,
            'clinical_enhancements': ['Added clinical context', 'Improved precision qualifiers'],
            'metrics': {'precision_improvement': 0.15},
            'confidence': 0.85
        }

    async def _optimize_evidence_integration(self, prompt: str,
                                           context: Optional[MedicalContext]) -> Dict[str, Any]:
        """Optimize for evidence-based medicine integration"""
        optimized = prompt

        # Add evidence request
        if 'evidence' not in prompt.lower():
            optimized += ' Please provide evidence-based recommendations with supporting literature.'

        # Add grade recommendations
        if 'recommend' in prompt.lower() or 'suggest' in prompt.lower():
            optimized += ' Include GRADE level of evidence for recommendations.'

        return {
            'optimized_prompt': optimized,
            'clinical_enhancements': ['Added evidence requirement', 'Included GRADE criteria'],
            'metrics': {'evidence_integration': 0.2},
            'confidence': 0.8
        }

    async def _optimize_safety(self, prompt: str,
                             context: Optional[MedicalContext]) -> Dict[str, Any]:
        """Optimize for clinical safety"""
        optimized = prompt

        safety_additions = []

        # Add safety considerations
        if any(word in prompt.lower() for word in ['medication', 'drug', 'prescription']):
            safety_addition = ' Consider contraindications, drug interactions, and patient allergies.'
            optimized += safety_addition
            safety_additions.append('Added medication safety considerations')

        # Add monitoring requirements
        if 'treatment' in prompt.lower() or 'therapy' in prompt.lower():
            monitoring_addition = ' Include appropriate monitoring parameters and follow-up requirements.'
            optimized += monitoring_addition
            safety_additions.append('Added monitoring requirements')

        return {
            'optimized_prompt': optimized,
            'safety_improvements': safety_additions,
            'metrics': {'safety_enhancement': 0.25},
            'confidence': 0.9
        }

    async def _optimize_regulatory(self, prompt: str,
                                 context: Optional[MedicalContext]) -> Dict[str, Any]:
        """Optimize for regulatory compliance"""
        optimized = prompt

        # Add regulatory disclaimers
        if 'diagnose' in prompt.lower():
            optimized += ' Ensure compliance with diagnostic standards and regulatory requirements.'

        return {
            'optimized_prompt': optimized,
            'compliance_improvements': ['Added regulatory compliance note'],
            'metrics': {'regulatory_alignment': 0.15},
            'confidence': 0.75
        }

    async def _optimize_personalization(self, prompt: str,
                                      context: Optional[MedicalContext]) -> Dict[str, Any]:
        """Optimize for patient personalization"""
        optimized = prompt

        if context:
            personalizations = []

            # Add demographic considerations
            if context.patient_age_range and context.gender:
                addition = f' Consider {context.patient_age_range} {context.gender} patient-specific factors.'
                optimized += addition
                personalizations.append('Added demographic considerations')

            # Add comorbidity considerations
            if context.medical_conditions:
                conditions_str = ', '.join(context.medical_conditions[:3])
                addition = f' Account for existing conditions: {conditions_str}.'
                optimized += addition
                personalizations.append('Added comorbidity considerations')

        return {
            'optimized_prompt': optimized,
            'clinical_enhancements': personalizations,
            'metrics': {'personalization': 0.3},
            'confidence': 0.8
        }

    async def _optimize_efficiency(self, prompt: str,
                                 context: Optional[MedicalContext]) -> Dict[str, Any]:
        """Optimize for efficiency and clarity"""
        optimized = prompt

        # Simplify complex sentences
        sentences = prompt.split('.')
        simplified_sentences = []

        for sentence in sentences:
            if len(sentence.strip()) > 100:  # Long sentence
                # Basic simplification (in practice, would use more sophisticated NLP)
                simplified = sentence.replace(' and also ', ' and ').replace(' as well as ', ', ')
                simplified_sentences.append(simplified)
            else:
                simplified_sentences.append(sentence)

        optimized = '.'.join(simplified_sentences)

        return {
            'optimized_prompt': optimized,
            'metrics': {'efficiency_improvement': 0.1},
            'confidence': 0.7
        }

class AdvancedPromptManagementService:
    """Main advanced prompt management service"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.nlp_processor = MedicalNLPProcessor(config.get('nlp_config', {}))
        self.compliance_validator = ComplianceValidator(config.get('compliance_config', {}))
        self.prompt_optimizer = PromptOptimizer(config.get('optimization_config', {}))
        self.redis_client = None
        self.postgres_pool = None
        self.template_cache = {}

    async def initialize(self):
        """Initialize prompt management service"""
        # Initialize NLP processor
        await self.nlp_processor.initialize()

        # Initialize Redis
        redis_config = self.config.get('redis_config', {})
        self.redis_client = redis.Redis(
            host=redis_config.get('host', 'localhost'),
            port=redis_config.get('port', 6379),
            decode_responses=True
        )

        # Initialize PostgreSQL
        postgres_url = self.config.get('postgres_url')
        if postgres_url:
            self.postgres_pool = await asyncpg.create_pool(postgres_url)

        # Load prompt templates
        await self._load_prompt_templates()

        logger.info("Advanced Prompt Management Service initialized")

    async def process_prompt(self, request: PromptRequest) -> PromptResponse:
        """Process prompt with comprehensive analysis and optimization"""
        with tracer.start_as_current_span("prompt_processing") as span:
            start_time = datetime.utcnow()
            prompt_requests.add(1)

            span.set_attribute("request_id", request.request_id)
            span.set_attribute("user_id", request.user_id)

            try:
                # 1. Classify prompt category
                if not request.category:
                    category, category_confidence = await self.nlp_processor.classify_prompt_category(
                        request.prompt_text
                    )
                else:
                    category = request.category
                    category_confidence = 1.0

                # 2. Extract medical entities
                medical_entities = await self.nlp_processor.extract_medical_entities(
                    request.prompt_text
                )

                # 3. Assess clinical safety
                safety_level, clinical_warnings = await self.nlp_processor.assess_clinical_safety(
                    request.prompt_text, request.medical_context
                )

                # 4. Validate compliance
                compliance_status = {}
                if request.compliance_requirements:
                    compliance_status = await self.compliance_validator.validate_compliance(
                        request.prompt_text, request.compliance_requirements
                    )

                    # Update metrics
                    for level, check in compliance_status.items():
                        compliance_checks.add(1, {
                            "compliance_type": level.value,
                            "result": "passed" if check.is_compliant else "failed"
                        })

                # 5. Optimize prompt if requested
                optimization_result = None
                processed_prompt = request.prompt_text

                if request.optimization_requested:
                    # Choose optimization strategy based on category
                    strategy = self._select_optimization_strategy(category)
                    optimization_result = await self.prompt_optimizer.optimize_prompt(
                        request.prompt_text, strategy, request.medical_context
                    )
                    processed_prompt = optimization_result.optimized_prompt

                # 6. Generate recommendations
                recommendations = self._generate_recommendations(
                    category, medical_entities, compliance_status, clinical_warnings
                )

                # 7. Calculate overall confidence score
                confidence_factors = [
                    category_confidence,
                    0.9 if safety_level == PromptSafety.SAFE else 0.5,
                    np.mean([check.confidence_score for check in compliance_status.values()]) if compliance_status else 0.8,
                    optimization_result.confidence_score if optimization_result else 0.8
                ]
                confidence_score = np.mean(confidence_factors)

                processing_time = (datetime.utcnow() - start_time).total_seconds()

                response = PromptResponse(
                    request_id=request.request_id,
                    processed_prompt=processed_prompt,
                    category=category,
                    safety_level=safety_level,
                    compliance_status=compliance_status,
                    optimization_result=optimization_result,
                    clinical_warnings=clinical_warnings,
                    recommendations=recommendations,
                    confidence_score=confidence_score,
                    processing_time=processing_time,
                    metadata={
                        'medical_entities': medical_entities,
                        'category_confidence': category_confidence,
                        'optimization_strategy': optimization_result.optimization_strategy.value if optimization_result else None
                    }
                )

                # Cache response
                await self._cache_response(request.request_id, response)

                # Log processing analytics
                await self._log_processing_analytics(request, response)

                return response

            except Exception as e:
                logger.error(f"Prompt processing failed for {request.request_id}: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))

                return PromptResponse(
                    request_id=request.request_id,
                    processed_prompt=request.prompt_text,
                    category=PromptCategory.CLINICAL_ASSESSMENT,
                    safety_level=PromptSafety.CAUTIONARY,
                    compliance_status={},
                    clinical_warnings=[f"Processing error: {str(e)}"],
                    recommendations=["Please review prompt manually"],
                    confidence_score=0.0,
                    processing_time=(datetime.utcnow() - start_time).total_seconds()
                )

    def _select_optimization_strategy(self, category: PromptCategory) -> OptimizationStrategy:
        """Select optimization strategy based on prompt category"""
        strategy_mapping = {
            PromptCategory.CLINICAL_ASSESSMENT: OptimizationStrategy.CLINICAL_PRECISION,
            PromptCategory.DIAGNOSTIC_REASONING: OptimizationStrategy.EVIDENCE_INTEGRATION,
            PromptCategory.TREATMENT_PLANNING: OptimizationStrategy.SAFETY_ENHANCEMENT,
            PromptCategory.MEDICATION_MANAGEMENT: OptimizationStrategy.SAFETY_ENHANCEMENT,
            PromptCategory.PATIENT_EDUCATION: OptimizationStrategy.PERSONALIZATION,
            PromptCategory.CLINICAL_DOCUMENTATION: OptimizationStrategy.EFFICIENCY_OPTIMIZATION,
            PromptCategory.RESEARCH_QUERY: OptimizationStrategy.EVIDENCE_INTEGRATION,
            PromptCategory.REGULATORY_COMPLIANCE: OptimizationStrategy.REGULATORY_ALIGNMENT,
            PromptCategory.CLINICAL_DECISION_SUPPORT: OptimizationStrategy.CLINICAL_PRECISION,
            PromptCategory.PHARMACOVIGILANCE: OptimizationStrategy.SAFETY_ENHANCEMENT
        }

        return strategy_mapping.get(category, OptimizationStrategy.CLINICAL_PRECISION)

    def _generate_recommendations(self, category: PromptCategory,
                                medical_entities: Dict[str, List[str]],
                                compliance_status: Dict[ComplianceLevel, ComplianceCheck],
                                clinical_warnings: List[str]) -> List[str]:
        """Generate contextual recommendations"""
        recommendations = []

        # Category-specific recommendations
        if category == PromptCategory.MEDICATION_MANAGEMENT:
            recommendations.append("Consider drug interactions, contraindications, and patient allergies")
            recommendations.append("Include monitoring parameters and follow-up requirements")

        if category == PromptCategory.DIAGNOSTIC_REASONING:
            recommendations.append("Include differential diagnosis considerations")
            recommendations.append("Specify diagnostic criteria and evidence levels")

        # Entity-based recommendations
        if medical_entities.get('medications'):
            recommendations.append("Verify medication dosing and administration guidelines")

        if medical_entities.get('conditions'):
            recommendations.append("Reference current clinical guidelines for identified conditions")

        # Compliance-based recommendations
        for level, check in compliance_status.items():
            recommendations.extend(check.recommendations)

        # Safety-based recommendations
        if clinical_warnings:
            recommendations.append("Address identified clinical safety concerns")

        return list(set(recommendations))  # Remove duplicates

    async def _load_prompt_templates(self):
        """Load prompt templates from database"""
        if not self.postgres_pool:
            return

        try:
            async with self.postgres_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT template_id, name, category, template_text, variables,
                           medical_context_required, compliance_levels, safety_level,
                           clinical_domains, evidence_level, last_updated, usage_count,
                           effectiveness_score, validation_status
                    FROM prompt_templates
                    WHERE validation_status = 'approved'
                """)

                for row in rows:
                    template = PromptTemplate(
                        template_id=row['template_id'],
                        name=row['name'],
                        category=PromptCategory(row['category']),
                        template_text=row['template_text'],
                        variables=row['variables'] or [],
                        medical_context_required=row['medical_context_required'],
                        compliance_levels=[ComplianceLevel(level) for level in row['compliance_levels'] or []],
                        safety_level=PromptSafety(row['safety_level']),
                        clinical_domains=row['clinical_domains'] or [],
                        evidence_level=row['evidence_level'],
                        last_updated=row['last_updated'],
                        usage_count=row['usage_count'],
                        effectiveness_score=row['effectiveness_score'],
                        validation_status=row['validation_status']
                    )
                    self.template_cache[template.template_id] = template

                logger.info(f"Loaded {len(self.template_cache)} prompt templates")

        except Exception as e:
            logger.error(f"Failed to load prompt templates: {e}")

    async def _cache_response(self, request_id: str, response: PromptResponse):
        """Cache prompt response"""
        if self.redis_client:
            try:
                await self.redis_client.setex(
                    f"prompt_response:{request_id}",
                    3600,  # 1 hour TTL
                    json.dumps(asdict(response), default=str)
                )
            except Exception as e:
                logger.error(f"Failed to cache response: {e}")

    async def _log_processing_analytics(self, request: PromptRequest, response: PromptResponse):
        """Log prompt processing analytics"""
        if self.postgres_pool:
            try:
                async with self.postgres_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO prompt_analytics
                        (request_id, user_id, organization_id, category, safety_level,
                         processing_time, confidence_score, optimization_used, timestamp)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """, request.request_id, request.user_id, request.organization_id,
                    response.category.value, response.safety_level.value,
                    response.processing_time, response.confidence_score,
                    response.optimization_result is not None, datetime.utcnow())
            except Exception as e:
                logger.error(f"Failed to log analytics: {e}")

    async def get_prompt_template(self, template_id: str) -> Optional[PromptTemplate]:
        """Get prompt template by ID"""
        return self.template_cache.get(template_id)

    async def search_templates(self, category: Optional[PromptCategory] = None,
                             clinical_domains: Optional[List[str]] = None) -> List[PromptTemplate]:
        """Search prompt templates"""
        results = []

        for template in self.template_cache.values():
            # Filter by category
            if category and template.category != category:
                continue

            # Filter by clinical domains
            if clinical_domains:
                if not any(domain in template.clinical_domains for domain in clinical_domains):
                    continue

            results.append(template)

        # Sort by effectiveness score
        results.sort(key=lambda t: t.effectiveness_score, reverse=True)

        return results

    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Advanced Prompt Management Service")

        if self.redis_client:
            await self.redis_client.close()

        if self.postgres_pool:
            await self.postgres_pool.close()

        logger.info("Advanced Prompt Management Service shutdown complete")

# Factory function
async def create_prompt_management_service(config: Dict[str, Any]) -> AdvancedPromptManagementService:
    """Create and initialize Advanced Prompt Management Service"""
    service = AdvancedPromptManagementService(config)
    await service.initialize()
    return service