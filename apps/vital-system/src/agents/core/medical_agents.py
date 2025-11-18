# ===================================================================
# VITAL Path Phase 3 Enhanced - Core Medical AI Agents
# Specialized medical intelligence agents with PHARMA framework
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set, Tuple
from enum import Enum
import uuid
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod
import openai
import spacy
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine
import opentelemetry.trace as trace
from opentelemetry import metrics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Metrics
agent_requests = meter.create_counter(
    "medical_agent_requests_total",
    description="Total medical agent requests"
)

medical_accuracy = meter.create_histogram(
    "medical_accuracy_score",
    description="Medical accuracy scores"
)

response_time = meter.create_histogram(
    "agent_response_time_seconds",
    description="Agent response times"
)

class MedicalSpecialty(Enum):
    """Medical specialties for agent expertise"""
    ONCOLOGY = "oncology"
    CARDIOLOGY = "cardiology"
    NEUROLOGY = "neurology"
    RARE_DISEASES = "rare_diseases"
    REGULATORY = "regulatory"
    MARKET_ACCESS = "market_access"
    CLINICAL_OPERATIONS = "clinical_operations"
    SAFETY_MONITORING = "safety_monitoring"

class ConfidenceLevel(Enum):
    """Confidence levels for medical claims"""
    VERY_LOW = 0.2
    LOW = 0.4
    MODERATE = 0.6
    HIGH = 0.8
    VERY_HIGH = 0.95

class EvidenceType(Enum):
    """Types of medical evidence"""
    SYSTEMATIC_REVIEW = "systematic_review"
    RCT = "randomized_controlled_trial"
    COHORT_STUDY = "cohort_study"
    CASE_CONTROL = "case_control"
    CASE_SERIES = "case_series"
    EXPERT_OPINION = "expert_opinion"
    REGULATORY_GUIDANCE = "regulatory_guidance"
    CLINICAL_GUIDELINE = "clinical_guideline"

@dataclass
class MedicalEntity:
    """Extracted medical entity with context"""
    text: str
    entity_type: str  # drug, condition, procedure, gene, etc.
    confidence: float
    position: Tuple[int, int]
    ontology_codes: Dict[str, str] = None  # ICD-10, SNOMED, etc.

    def __post_init__(self):
        if self.ontology_codes is None:
            self.ontology_codes = {}

@dataclass
class Citation:
    """Medical citation with verification"""
    pmid: Optional[str]
    doi: Optional[str]
    title: str
    authors: List[str]
    journal: str
    publication_date: datetime
    citation_text: str
    relevance_score: float
    evidence_type: EvidenceType
    is_verified: bool = False

@dataclass
class MedicalQuery:
    """Structured medical query with context"""
    query_id: str
    text: str
    user_id: str
    organization_id: str
    query_type: str
    medical_context: Dict[str, Any] = None
    entities: List[MedicalEntity] = None
    timestamp: datetime = datetime.utcnow()

    def __post_init__(self):
        if self.medical_context is None:
            self.medical_context = {}
        if self.entities is None:
            self.entities = []

@dataclass
class AgentResponse:
    """Response from a medical agent"""
    agent_id: str
    query_id: str
    response_text: str
    confidence_score: float
    citations: List[Citation]
    medical_entities: List[MedicalEntity]
    processing_time: float
    warnings: List[str] = None
    limitations: List[str] = None
    timestamp: datetime = datetime.utcnow()

    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []
        if self.limitations is None:
            self.limitations = []

class BaseAgent(ABC):
    """Abstract base class for medical AI agents"""

    def __init__(self,
                 agent_id: str,
                 specialty: MedicalSpecialty,
                 confidence_threshold: float = 0.8):
        self.agent_id = agent_id
        self.specialty = specialty
        self.confidence_threshold = confidence_threshold
        self.knowledge_domains = []
        self.response_count = 0
        self.accuracy_score = 0.0

    @abstractmethod
    async def process_query(self, query: MedicalQuery) -> AgentResponse:
        """Process a medical query and return structured response"""
        pass

    @abstractmethod
    async def validate_response(self, response: AgentResponse) -> bool:
        """Validate agent response for medical accuracy"""
        pass

    async def extract_medical_entities(self, text: str) -> List[MedicalEntity]:
        """Extract medical entities from text"""
        # Simplified NER - would use spaCy medical models in production
        entities = []

        # Common medical entity patterns
        drug_patterns = ['mg', 'mcg', 'tablet', 'capsule', 'injection']
        condition_patterns = ['syndrome', 'disease', 'disorder', 'cancer', 'tumor']

        words = text.lower().split()
        for i, word in enumerate(words):
            if any(pattern in word for pattern in drug_patterns):
                entities.append(MedicalEntity(
                    text=word,
                    entity_type='drug',
                    confidence=0.7,
                    position=(i, i+1)
                ))
            elif any(pattern in word for pattern in condition_patterns):
                entities.append(MedicalEntity(
                    text=word,
                    entity_type='condition',
                    confidence=0.8,
                    position=(i, i+1)
                ))

        return entities

class ClinicalEvidenceAgent(BaseAgent):
    """Agent specialized in clinical evidence synthesis"""

    def __init__(self):
        super().__init__(
            agent_id="clinical_evidence_agent",
            specialty=MedicalSpecialty.ONCOLOGY,
            confidence_threshold=0.85
        )
        self.knowledge_domains = [
            'pubmed', 'clinicaltrials_gov', 'cochrane_reviews',
            'medical_guidelines', 'systematic_reviews'
        ]
        self.specializations = {
            'oncology_trials': 0.95,
            'cardiovascular_outcomes': 0.90,
            'neurology_assessments': 0.85,
            'rare_disease_evidence': 0.88
        }

    async def process_query(self, query: MedicalQuery) -> AgentResponse:
        """Process clinical evidence query"""
        with tracer.start_as_current_span("clinical_evidence_processing") as span:
            agent_requests.add(1)
            start_time = datetime.utcnow()

            span.set_attribute("query_id", query.query_id)
            span.set_attribute("specialty", self.specialty.value)

            try:
                # 1. Extract medical entities
                entities = await self.extract_medical_entities(query.text)

                # 2. Search for relevant clinical evidence
                evidence = await self._search_clinical_evidence(query, entities)

                # 3. Synthesize evidence
                synthesis = await self._synthesize_evidence(evidence, query)

                # 4. Generate citations
                citations = await self._generate_citations(evidence)

                # 5. Calculate confidence
                confidence = await self._calculate_confidence(synthesis, citations)

                processing_time = (datetime.utcnow() - start_time).total_seconds()
                response_time.record(processing_time)

                response = AgentResponse(
                    agent_id=self.agent_id,
                    query_id=query.query_id,
                    response_text=synthesis,
                    confidence_score=confidence,
                    citations=citations,
                    medical_entities=entities,
                    processing_time=processing_time,
                    warnings=self._generate_safety_warnings(entities),
                    limitations=["Evidence limited to English language publications"]
                )

                # Validate response
                is_valid = await self.validate_response(response)
                if not is_valid:
                    response.confidence_score *= 0.7  # Reduce confidence for failed validation

                medical_accuracy.record(response.confidence_score)
                return response

            except Exception as e:
                logger.error(f"Clinical evidence processing failed: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))
                raise

    async def _search_clinical_evidence(self, query: MedicalQuery, entities: List[MedicalEntity]) -> List[Dict]:
        """Search for relevant clinical evidence"""
        # Simulate evidence search
        evidence = [
            {
                "title": "Clinical Trial Results for Treatment X",
                "abstract": "This randomized controlled trial demonstrates efficacy...",
                "pmid": "12345678",
                "evidence_type": EvidenceType.RCT,
                "relevance_score": 0.92,
                "sample_size": 500,
                "primary_endpoint": "Overall survival"
            },
            {
                "title": "Systematic Review of Treatment Outcomes",
                "abstract": "Meta-analysis of 15 studies shows significant benefit...",
                "pmid": "87654321",
                "evidence_type": EvidenceType.SYSTEMATIC_REVIEW,
                "relevance_score": 0.88,
                "studies_included": 15,
                "heterogeneity": "Low"
            }
        ]
        return evidence

    async def _synthesize_evidence(self, evidence: List[Dict], query: MedicalQuery) -> str:
        """Synthesize clinical evidence into coherent response"""
        if not evidence:
            return "Insufficient clinical evidence available for this query."

        # Evidence hierarchy weighting
        evidence_weights = {
            EvidenceType.SYSTEMATIC_REVIEW: 1.0,
            EvidenceType.RCT: 0.9,
            EvidenceType.COHORT_STUDY: 0.7,
            EvidenceType.CASE_CONTROL: 0.6,
            EvidenceType.CASE_SERIES: 0.4,
            EvidenceType.EXPERT_OPINION: 0.3
        }

        # Sort evidence by relevance and quality
        sorted_evidence = sorted(
            evidence,
            key=lambda x: x.get('relevance_score', 0) * evidence_weights.get(x.get('evidence_type', EvidenceType.EXPERT_OPINION), 0.3),
            reverse=True
        )

        synthesis = f"Based on analysis of {len(evidence)} clinical studies:\n\n"

        for i, study in enumerate(sorted_evidence[:3], 1):  # Top 3 studies
            synthesis += f"{i}. {study.get('title', 'Unknown Title')}\n"
            synthesis += f"   Evidence Type: {study.get('evidence_type', 'Unknown').value}\n"
            synthesis += f"   Key Finding: {study.get('abstract', 'No abstract available')[:200]}...\n\n"

        synthesis += "Clinical Recommendation: Based on the available evidence, "

        # Generate recommendation based on evidence quality
        high_quality_evidence = [e for e in evidence if e.get('relevance_score', 0) > 0.8]
        if len(high_quality_evidence) >= 2:
            synthesis += "there is strong clinical evidence supporting the intervention."
        else:
            synthesis += "further research may be needed to establish definitive clinical recommendations."

        return synthesis

    async def _generate_citations(self, evidence: List[Dict]) -> List[Citation]:
        """Generate properly formatted citations"""
        citations = []

        for study in evidence:
            citation = Citation(
                pmid=study.get('pmid'),
                doi=study.get('doi'),
                title=study.get('title', 'Unknown Title'),
                authors=study.get('authors', ['Author Unknown']),
                journal=study.get('journal', 'Journal Unknown'),
                publication_date=datetime.now() - timedelta(days=365),  # Placeholder
                citation_text=f"{study.get('title', 'Unknown')} - {study.get('journal', 'Unknown Journal')}",
                relevance_score=study.get('relevance_score', 0.5),
                evidence_type=study.get('evidence_type', EvidenceType.EXPERT_OPINION),
                is_verified=True  # Would implement actual verification
            )
            citations.append(citation)

        return citations

    async def _calculate_confidence(self, synthesis: str, citations: List[Citation]) -> float:
        """Calculate confidence score based on evidence quality"""
        if not citations:
            return 0.2

        # Base confidence on citation quality
        citation_scores = [c.relevance_score for c in citations]
        avg_citation_score = sum(citation_scores) / len(citation_scores)

        # Evidence type weighting
        evidence_type_bonus = 0.0
        for citation in citations:
            if citation.evidence_type == EvidenceType.SYSTEMATIC_REVIEW:
                evidence_type_bonus += 0.1
            elif citation.evidence_type == EvidenceType.RCT:
                evidence_type_bonus += 0.08

        # Number of citations bonus
        citation_count_bonus = min(0.1, len(citations) * 0.02)

        confidence = min(0.95, avg_citation_score + evidence_type_bonus + citation_count_bonus)
        return confidence

    async def _generate_safety_warnings(self, entities: List[MedicalEntity]) -> List[str]:
        """Generate safety warnings based on extracted entities"""
        warnings = []

        for entity in entities:
            if entity.entity_type == 'drug':
                warnings.append(f"Verify drug interactions and contraindications for {entity.text}")
            elif entity.entity_type == 'condition':
                warnings.append(f"Consider differential diagnosis for {entity.text}")

        return warnings

    async def validate_response(self, response: AgentResponse) -> bool:
        """Validate clinical evidence response"""
        validation_checks = [
            len(response.citations) >= 2,  # Minimum citation requirement
            response.confidence_score >= self.confidence_threshold,
            len(response.response_text) > 100,  # Minimum response length
            "clinical" in response.response_text.lower()  # Clinical context check
        ]

        return all(validation_checks)

class RegulatoryGuidanceAgent(BaseAgent):
    """Agent specialized in regulatory guidance and compliance"""

    def __init__(self):
        super().__init__(
            agent_id="regulatory_guidance_agent",
            specialty=MedicalSpecialty.REGULATORY,
            confidence_threshold=0.9
        )
        self.knowledge_domains = [
            'fda_guidance', '21_cfr', 'eu_mdr', 'ich_guidelines',
            'fda_database', 'ema_database'
        ]
        self.specializations = {
            '510k_pathway': 0.95,
            'pma_requirements': 0.92,
            'clinical_trial_protocols': 0.90,
            'post_market_surveillance': 0.88
        }

    async def process_query(self, query: MedicalQuery) -> AgentResponse:
        """Process regulatory guidance query"""
        with tracer.start_as_current_span("regulatory_guidance_processing"):
            agent_requests.add(1)
            start_time = datetime.utcnow()

            try:
                # Extract regulatory-relevant entities
                entities = await self._extract_regulatory_entities(query.text)

                # Search regulatory databases
                regulatory_guidance = await self._search_regulatory_guidance(query, entities)

                # Generate regulatory recommendations
                recommendations = await self._generate_regulatory_recommendations(regulatory_guidance, query)

                # Generate regulatory citations
                citations = await self._generate_regulatory_citations(regulatory_guidance)

                processing_time = (datetime.utcnow() - start_time).total_seconds()

                response = AgentResponse(
                    agent_id=self.agent_id,
                    query_id=query.query_id,
                    response_text=recommendations,
                    confidence_score=0.90,  # High confidence for regulatory guidance
                    citations=citations,
                    medical_entities=entities,
                    processing_time=processing_time,
                    warnings=["Regulatory requirements may vary by jurisdiction"],
                    limitations=["Limited to FDA and EMA guidance documents"]
                )

                return response

            except Exception as e:
                logger.error(f"Regulatory guidance processing failed: {e}")
                raise

    async def _extract_regulatory_entities(self, text: str) -> List[MedicalEntity]:
        """Extract regulatory-specific entities"""
        regulatory_terms = {
            '510k': 'regulatory_pathway',
            'pma': 'regulatory_pathway',
            'ide': 'regulatory_pathway',
            'ind': 'regulatory_pathway',
            'fda': 'regulatory_agency',
            'ema': 'regulatory_agency',
            'class ii': 'device_classification',
            'class iii': 'device_classification'
        }

        entities = []
        text_lower = text.lower()

        for term, entity_type in regulatory_terms.items():
            if term in text_lower:
                entities.append(MedicalEntity(
                    text=term.upper(),
                    entity_type=entity_type,
                    confidence=0.95,
                    position=(0, 0)  # Simplified
                ))

        return entities

    async def _search_regulatory_guidance(self, query: MedicalQuery, entities: List[MedicalEntity]) -> List[Dict]:
        """Search regulatory guidance documents"""
        # Simulate regulatory database search
        guidance = [
            {
                "title": "FDA Guidance on Device Classification",
                "document_id": "FDA-2023-D-001",
                "agency": "FDA",
                "date_published": "2023-01-15",
                "relevance_score": 0.92,
                "document_type": "guidance",
                "summary": "Comprehensive guidance on medical device classification..."
            }
        ]
        return guidance

    async def _generate_regulatory_recommendations(self, guidance: List[Dict], query: MedicalQuery) -> str:
        """Generate regulatory recommendations"""
        if not guidance:
            return "No specific regulatory guidance found for this query."

        recommendations = "Regulatory Guidance Summary:\n\n"

        for doc in guidance:
            recommendations += f"• {doc.get('title', 'Unknown Document')}\n"
            recommendations += f"  Agency: {doc.get('agency', 'Unknown')}\n"
            recommendations += f"  Published: {doc.get('date_published', 'Unknown')}\n"
            recommendations += f"  Summary: {doc.get('summary', 'No summary available')}\n\n"

        recommendations += "Recommended Actions:\n"
        recommendations += "1. Review applicable guidance documents\n"
        recommendations += "2. Consult with regulatory affairs specialist\n"
        recommendations += "3. Consider pre-submission meeting with regulatory agency\n"

        return recommendations

    async def _generate_regulatory_citations(self, guidance: List[Dict]) -> List[Citation]:
        """Generate regulatory citations"""
        citations = []

        for doc in guidance:
            citation = Citation(
                pmid=None,  # Regulatory docs don't have PMIDs
                doi=None,
                title=doc.get('title', 'Unknown'),
                authors=['FDA' if doc.get('agency') == 'FDA' else doc.get('agency', 'Unknown Agency')],
                journal=f"{doc.get('agency', 'Unknown')} Guidance Document",
                publication_date=datetime.strptime(doc.get('date_published', '2023-01-01'), '%Y-%m-%d'),
                citation_text=f"{doc.get('title')} - {doc.get('agency')} Guidance",
                relevance_score=doc.get('relevance_score', 0.8),
                evidence_type=EvidenceType.REGULATORY_GUIDANCE,
                is_verified=True
            )
            citations.append(citation)

        return citations

    async def validate_response(self, response: AgentResponse) -> bool:
        """Validate regulatory guidance response"""
        validation_checks = [
            len(response.citations) >= 1,
            "regulatory" in response.response_text.lower() or "guidance" in response.response_text.lower(),
            response.confidence_score >= self.confidence_threshold
        ]

        return all(validation_checks)

class MarketAccessAgent(BaseAgent):
    """Agent specialized in market access and reimbursement"""

    def __init__(self):
        super().__init__(
            agent_id="market_access_agent",
            specialty=MedicalSpecialty.MARKET_ACCESS,
            confidence_threshold=0.85
        )
        self.knowledge_domains = [
            'cms_policies', 'commercial_payer_guidelines', 'hta_assessments',
            'cpt_codes', 'icd10_codes', 'coverage_policies'
        ]

    async def process_query(self, query: MedicalQuery) -> AgentResponse:
        """Process market access query"""
        with tracer.start_as_current_span("market_access_processing"):
            agent_requests.add(1)
            start_time = datetime.utcnow()

            # Implementation similar to other agents but focused on:
            # - Reimbursement analysis
            # - Payer strategy recommendations
            # - Economic outcomes data
            # - Coverage determination support

            response_text = "Market access analysis focusing on reimbursement pathways and payer engagement strategies."

            processing_time = (datetime.utcnow() - start_time).total_seconds()

            return AgentResponse(
                agent_id=self.agent_id,
                query_id=query.query_id,
                response_text=response_text,
                confidence_score=0.85,
                citations=[],
                medical_entities=[],
                processing_time=processing_time
            )

    async def validate_response(self, response: AgentResponse) -> bool:
        """Validate market access response"""
        return True  # Simplified validation

class SafetyMonitoringAgent(BaseAgent):
    """Agent specialized in safety monitoring and pharmacovigilance"""

    def __init__(self):
        super().__init__(
            agent_id="safety_monitoring_agent",
            specialty=MedicalSpecialty.SAFETY_MONITORING,
            confidence_threshold=0.95  # Very high threshold for safety
        )

    async def process_query(self, query: MedicalQuery) -> AgentResponse:
        """Process safety monitoring query"""
        # Implementation would focus on:
        # - Adverse event detection
        # - Signal detection algorithms
        # - Risk-benefit analysis
        # - Safety database queries

        response_text = "Safety analysis with focus on adverse event monitoring and risk assessment."

        return AgentResponse(
            agent_id=self.agent_id,
            query_id=query.query_id,
            response_text=response_text,
            confidence_score=0.95,
            citations=[],
            medical_entities=[],
            processing_time=1.0
        )

    async def validate_response(self, response: AgentResponse) -> bool:
        """Validate safety monitoring response"""
        # Safety responses require highest validation standards
        return response.confidence_score >= 0.95

class ClinicalOperationsAgent(BaseAgent):
    """Agent specialized in clinical trial operations"""

    def __init__(self):
        super().__init__(
            agent_id="clinical_operations_agent",
            specialty=MedicalSpecialty.CLINICAL_OPERATIONS,
            confidence_threshold=0.80
        )

    async def process_query(self, query: MedicalQuery) -> AgentResponse:
        """Process clinical operations query"""
        # Implementation would focus on:
        # - Protocol design
        # - Site selection
        # - Patient recruitment
        # - Data monitoring

        response_text = "Clinical operations guidance for trial design and execution."

        return AgentResponse(
            agent_id=self.agent_id,
            query_id=query.query_id,
            response_text=response_text,
            confidence_score=0.80,
            citations=[],
            medical_entities=[],
            processing_time=1.5
        )

    async def validate_response(self, response: AgentResponse) -> bool:
        """Validate clinical operations response"""
        return True  # Simplified validation

# Factory function to create agents
def create_medical_agents() -> Dict[str, BaseAgent]:
    """Create and return all medical agents"""
    return {
        'clinical_evidence': ClinicalEvidenceAgent(),
        'regulatory_guidance': RegulatoryGuidanceAgent(),
        'market_access': MarketAccessAgent(),
        'safety_monitoring': SafetyMonitoringAgent(),
        'clinical_operations': ClinicalOperationsAgent()
    }