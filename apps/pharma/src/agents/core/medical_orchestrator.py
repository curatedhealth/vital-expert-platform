# ===================================================================
# VITAL Path Phase 3 Enhanced - Medical Agent Orchestrator
# Intelligent coordination of specialized medical AI agents
# ===================================================================

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Set, Tuple
from enum import Enum
import uuid
import networkx as nx
from dataclasses import dataclass, asdict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import opentelemetry.trace as trace
from opentelemetry import metrics
import spacy
import re

from .medical_agents import (
    BaseAgent, MedicalQuery, AgentResponse, MedicalEntity, Citation,
    create_medical_agents, MedicalSpecialty, ConfidenceLevel, EvidenceType
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Orchestration metrics
orchestration_requests = meter.create_counter(
    "orchestration_requests_total",
    description="Total orchestration requests"
)

agent_coordination_time = meter.create_histogram(
    "agent_coordination_time_seconds",
    description="Time spent coordinating agents"
)

synthesis_quality_score = meter.create_histogram(
    "synthesis_quality_score",
    description="Quality scores for synthesized responses"
)

class QueryClassification(Enum):
    """Medical query classification types"""
    CLINICAL_EVIDENCE = "clinical_evidence"
    REGULATORY_GUIDANCE = "regulatory_guidance"
    MARKET_ACCESS = "market_access"
    SAFETY_MONITORING = "safety_monitoring"
    CLINICAL_OPERATIONS = "clinical_operations"
    MIXED_QUERY = "mixed_query"

class OrchestrationStrategy(Enum):
    """Strategies for agent orchestration"""
    SEQUENTIAL = "sequential"      # One agent at a time
    PARALLEL = "parallel"          # All relevant agents simultaneously
    HIERARCHICAL = "hierarchical"  # Primary agent, then supporting agents
    CONSENSUS = "consensus"        # Multiple agents, synthesize consensus
    ADAPTIVE = "adaptive"          # Strategy chosen dynamically

@dataclass
class QueryClassificationResult:
    """Result of query classification"""
    primary_classification: QueryClassification
    confidence: float
    secondary_classifications: List[Tuple[QueryClassification, float]]
    medical_entities: List[MedicalEntity]
    complexity_score: float
    recommended_agents: List[str]
    orchestration_strategy: OrchestrationStrategy

@dataclass
class ExecutionPlan:
    """Plan for executing agents"""
    query_id: str
    agents_to_execute: List[str]
    execution_order: List[List[str]]  # Groups of agents to execute in parallel
    dependencies: Dict[str, List[str]]  # Agent dependencies
    timeout_seconds: int
    strategy: OrchestrationStrategy
    expected_confidence: float

@dataclass
class SynthesizedResponse:
    """Final synthesized response from multiple agents"""
    query_id: str
    primary_response: str
    confidence_score: float
    evidence_summary: str
    citations: List[Citation]
    agent_contributions: Dict[str, float]  # Weight of each agent's contribution
    consensus_level: float
    warnings: List[str]
    limitations: List[str]
    quality_metrics: Dict[str, float]
    processing_time: float
    timestamp: datetime = datetime.utcnow()

class MedicalQueryClassifier:
    """Classifies medical queries to route to appropriate agents"""

    def __init__(self):
        self.medical_intents = {
            QueryClassification.CLINICAL_EVIDENCE: {
                'keywords': ['efficacy', 'safety', 'outcomes', 'trial', 'results', 'study', 'clinical', 'treatment', 'therapy'],
                'weight': 1.0
            },
            QueryClassification.REGULATORY_GUIDANCE: {
                'keywords': ['FDA', 'approval', 'submission', '510k', 'PMA', 'regulatory', 'compliance', 'guideline'],
                'weight': 1.0
            },
            QueryClassification.MARKET_ACCESS: {
                'keywords': ['reimbursement', 'payer', 'coding', 'coverage', 'cost', 'economics', 'value'],
                'weight': 1.0
            },
            QueryClassification.SAFETY_MONITORING: {
                'keywords': ['adverse', 'AE', 'SAE', 'risk', 'contraindication', 'toxicity', 'pharmacovigilance'],
                'weight': 1.2  # Higher weight for safety
            },
            QueryClassification.CLINICAL_OPERATIONS: {
                'keywords': ['protocol', 'recruitment', 'enrollment', 'sites', 'operations', 'monitoring'],
                'weight': 0.9
            }
        }
        self.confidence_threshold = 0.7
        self.vectorizer = TfidfVectorizer(stop_words='english')

    async def classify_query(self, query: MedicalQuery) -> QueryClassificationResult:
        """Classify query and determine routing strategy"""
        with tracer.start_as_current_span("query_classification") as span:
            span.set_attribute("query_id", query.query_id)

            # Extract medical entities
            entities = await self._extract_medical_entities(query.text)

            # Calculate classification scores
            classification_scores = self._calculate_classification_scores(query.text)

            # Determine primary classification
            primary_classification = max(classification_scores.items(), key=lambda x: x[1])
            primary_type, primary_confidence = primary_classification

            # Get secondary classifications
            secondary_classifications = [
                (classification, score) for classification, score in classification_scores.items()
                if classification != primary_type and score > 0.3
            ]
            secondary_classifications.sort(key=lambda x: x[1], reverse=True)

            # Calculate complexity score
            complexity_score = self._calculate_complexity_score(query.text, entities)

            # Recommend agents
            recommended_agents = self._recommend_agents(classification_scores, complexity_score)

            # Determine orchestration strategy
            orchestration_strategy = self._determine_orchestration_strategy(
                classification_scores, complexity_score, len(recommended_agents)
            )

            span.set_attribute("primary_classification", primary_type.value)
            span.set_attribute("confidence", primary_confidence)
            span.set_attribute("recommended_agents", len(recommended_agents))

            return QueryClassificationResult(
                primary_classification=primary_type,
                confidence=primary_confidence,
                secondary_classifications=secondary_classifications,
                medical_entities=entities,
                complexity_score=complexity_score,
                recommended_agents=recommended_agents,
                orchestration_strategy=orchestration_strategy
            )

    def _calculate_classification_scores(self, query_text: str) -> Dict[QueryClassification, float]:
        """Calculate classification scores based on keyword matching and semantic analysis"""
        query_lower = query_text.lower()
        scores = {}

        for classification, config in self.medical_intents.items():
            # Keyword matching score
            keyword_matches = sum(1 for keyword in config['keywords'] if keyword in query_lower)
            keyword_score = (keyword_matches / len(config['keywords'])) * config['weight']

            # Semantic similarity (simplified)
            semantic_score = self._calculate_semantic_similarity(query_text, config['keywords'])

            # Combined score
            combined_score = (keyword_score * 0.7) + (semantic_score * 0.3)
            scores[classification] = min(1.0, combined_score)

        return scores

    def _calculate_semantic_similarity(self, query_text: str, keywords: List[str]) -> float:
        """Calculate semantic similarity between query and keywords"""
        try:
            # Create documents for comparison
            documents = [query_text] + keywords

            # Simple TF-IDF similarity (would use more advanced embeddings in production)
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            similarity_matrix = cosine_similarity(tfidf_matrix)

            # Average similarity between query and keywords
            query_similarities = similarity_matrix[0, 1:]  # First row, excluding self
            return np.mean(query_similarities) if len(query_similarities) > 0 else 0.0

        except Exception as e:
            logger.warning(f"Semantic similarity calculation failed: {e}")
            return 0.0

    async def _extract_medical_entities(self, query_text: str) -> List[MedicalEntity]:
        """Extract medical entities using advanced NER"""
        entities = []

        # Medical entity patterns (simplified - would use advanced NER in production)
        patterns = {
            'drug': r'\b\w+(mab|cin|ine|ide|ole|pril|sartan|statin)\b',
            'condition': r'\b\w*(cancer|tumor|syndrome|disease|disorder|itis|osis|pathy)\b',
            'procedure': r'\b\w*(surgery|biopsy|scan|test|therapy|treatment)\b',
            'gene': r'\b[A-Z]{2,}[0-9]+\b',
            'biomarker': r'\b\w*(-positive|-negative|receptor|marker)\b'
        }

        for entity_type, pattern in patterns.items():
            matches = re.finditer(pattern, query_text, re.IGNORECASE)
            for match in matches:
                entities.append(MedicalEntity(
                    text=match.group(),
                    entity_type=entity_type,
                    confidence=0.8,
                    position=(match.start(), match.end())
                ))

        return entities

    def _calculate_complexity_score(self, query_text: str, entities: List[MedicalEntity]) -> float:
        """Calculate query complexity score"""
        # Factors contributing to complexity
        word_count = len(query_text.split())
        entity_count = len(entities)
        unique_entity_types = len(set(e.entity_type for e in entities))

        # Technical terms indicator
        technical_terms = ['pharmacokinetics', 'bioavailability', 'metabolism', 'mechanism', 'pathway']
        technical_count = sum(1 for term in technical_terms if term in query_text.lower())

        # Complexity calculation
        complexity = (
            min(1.0, word_count / 100) * 0.3 +          # Word count factor
            min(1.0, entity_count / 10) * 0.4 +         # Entity count factor
            min(1.0, unique_entity_types / 5) * 0.2 +   # Entity diversity factor
            min(1.0, technical_count / 3) * 0.1         # Technical complexity factor
        )

        return complexity

    def _recommend_agents(self, classification_scores: Dict[QueryClassification, float],
                         complexity_score: float) -> List[str]:
        """Recommend agents based on classification and complexity"""
        agent_mapping = {
            QueryClassification.CLINICAL_EVIDENCE: 'clinical_evidence',
            QueryClassification.REGULATORY_GUIDANCE: 'regulatory_guidance',
            QueryClassification.MARKET_ACCESS: 'market_access',
            QueryClassification.SAFETY_MONITORING: 'safety_monitoring',
            QueryClassification.CLINICAL_OPERATIONS: 'clinical_operations'
        }

        recommended = []

        # Primary agent (highest scoring classification)
        primary_classification = max(classification_scores.items(), key=lambda x: x[1])
        primary_agent = agent_mapping.get(primary_classification[0])
        if primary_agent and primary_classification[1] > 0.5:
            recommended.append(primary_agent)

        # Secondary agents (if scores are significant)
        for classification, score in classification_scores.items():
            if score > 0.4 and classification != primary_classification[0]:
                agent = agent_mapping.get(classification)
                if agent and agent not in recommended:
                    recommended.append(agent)

        # For high complexity queries, add safety monitoring
        if complexity_score > 0.7 and 'safety_monitoring' not in recommended:
            recommended.append('safety_monitoring')

        return recommended

    def _determine_orchestration_strategy(self, classification_scores: Dict[QueryClassification, float],
                                        complexity_score: float, agent_count: int) -> OrchestrationStrategy:
        """Determine the best orchestration strategy"""
        max_score = max(classification_scores.values())

        # Single clear classification -> Sequential
        if max_score > 0.8 and agent_count == 1:
            return OrchestrationStrategy.SEQUENTIAL

        # Multiple relevant agents -> Parallel for speed
        if agent_count > 2:
            return OrchestrationStrategy.PARALLEL

        # High complexity -> Hierarchical for better coordination
        if complexity_score > 0.8:
            return OrchestrationStrategy.HIERARCHICAL

        # Safety-related queries -> Consensus for validation
        if QueryClassification.SAFETY_MONITORING in classification_scores and \
           classification_scores[QueryClassification.SAFETY_MONITORING] > 0.6:
            return OrchestrationStrategy.CONSENSUS

        # Default to adaptive
        return OrchestrationStrategy.ADAPTIVE

class MedicalAgentOrchestrator:
    """Orchestrates multiple medical AI agents with intelligent coordination"""

    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.agents = create_medical_agents()
        self.classifier = MedicalQueryClassifier()
        self.execution_graph = nx.DiGraph()
        self.response_cache = {}

        # Performance tracking
        self.query_count = 0
        self.success_rate = 0.0
        self.avg_response_time = 0.0

    async def orchestrate_query(self, query: MedicalQuery) -> SynthesizedResponse:
        """Main orchestration method - coordinates multiple agents intelligently"""
        with tracer.start_as_current_span("medical_orchestration") as span:
            orchestration_requests.add(1)
            start_time = datetime.utcnow()

            span.set_attribute("query_id", query.query_id)
            span.set_attribute("query_length", len(query.text))

            try:
                # 1. Classify query and determine strategy
                classification = await self.classifier.classify_query(query)

                span.set_attribute("primary_classification", classification.primary_classification.value)
                span.set_attribute("orchestration_strategy", classification.orchestration_strategy.value)

                # 2. Create execution plan
                execution_plan = await self._create_execution_plan(query, classification)

                # 3. Execute agents according to strategy
                agent_responses = await self._execute_agents(query, execution_plan)

                # 4. Synthesize responses
                synthesized_response = await self._synthesize_responses(
                    query, agent_responses, classification
                )

                # 5. Apply quality validation
                validated_response = await self._validate_response_quality(synthesized_response)

                # 6. Update performance metrics
                processing_time = (datetime.utcnow() - start_time).total_seconds()
                agent_coordination_time.record(processing_time)
                synthesis_quality_score.record(validated_response.quality_metrics.get('overall_score', 0.0))

                self._update_performance_metrics(validated_response, processing_time)

                span.set_attribute("synthesis_confidence", validated_response.confidence_score)
                span.set_attribute("processing_time", processing_time)

                return validated_response

            except Exception as e:
                logger.error(f"Orchestration failed for query {query.query_id}: {e}")
                span.set_attribute("error", True)
                span.set_attribute("error_message", str(e))

                # Return safe fallback response
                return await self._generate_fallback_response(query, str(e))

    async def _create_execution_plan(self, query: MedicalQuery,
                                   classification: QueryClassificationResult) -> ExecutionPlan:
        """Create optimized execution plan for agents"""
        agents_to_execute = classification.recommended_agents

        # Determine execution order based on strategy
        if classification.orchestration_strategy == OrchestrationStrategy.SEQUENTIAL:
            execution_order = [[agent] for agent in agents_to_execute]

        elif classification.orchestration_strategy == OrchestrationStrategy.PARALLEL:
            execution_order = [agents_to_execute]  # All agents in one group

        elif classification.orchestration_strategy == OrchestrationStrategy.HIERARCHICAL:
            # Primary agent first, then supporting agents
            primary_agent = agents_to_execute[0] if agents_to_execute else []
            supporting_agents = agents_to_execute[1:] if len(agents_to_execute) > 1 else []
            execution_order = [[primary_agent], supporting_agents] if supporting_agents else [[primary_agent]]

        elif classification.orchestration_strategy == OrchestrationStrategy.CONSENSUS:
            # All agents in parallel for consensus building
            execution_order = [agents_to_execute]

        else:  # ADAPTIVE
            # Choose strategy dynamically based on query characteristics
            if classification.complexity_score > 0.8:
                execution_order = [[agents_to_execute[0]], agents_to_execute[1:]]
            else:
                execution_order = [agents_to_execute]

        # Set timeout based on complexity and number of agents
        base_timeout = 30  # seconds
        timeout_seconds = base_timeout + (len(agents_to_execute) * 10) + int(classification.complexity_score * 20)

        return ExecutionPlan(
            query_id=query.query_id,
            agents_to_execute=agents_to_execute,
            execution_order=execution_order,
            dependencies={},  # Simplified - no complex dependencies
            timeout_seconds=timeout_seconds,
            strategy=classification.orchestration_strategy,
            expected_confidence=classification.confidence
        )

    async def _execute_agents(self, query: MedicalQuery, plan: ExecutionPlan) -> Dict[str, AgentResponse]:
        """Execute agents according to the execution plan"""
        agent_responses = {}

        for execution_group in plan.execution_order:
            # Execute agents in current group (in parallel within group)
            group_tasks = []

            for agent_name in execution_group:
                if agent_name in self.agents:
                    agent = self.agents[agent_name]
                    task = asyncio.create_task(
                        self._execute_single_agent(agent, query, plan.timeout_seconds)
                    )
                    group_tasks.append((agent_name, task))

            # Wait for group completion
            for agent_name, task in group_tasks:
                try:
                    response = await task
                    agent_responses[agent_name] = response
                except Exception as e:
                    logger.error(f"Agent {agent_name} execution failed: {e}")
                    # Continue with other agents

        return agent_responses

    async def _execute_single_agent(self, agent: BaseAgent, query: MedicalQuery,
                                   timeout_seconds: int) -> AgentResponse:
        """Execute a single agent with timeout and error handling"""
        try:
            # Apply timeout
            response = await asyncio.wait_for(
                agent.process_query(query),
                timeout=timeout_seconds
            )
            return response

        except asyncio.TimeoutError:
            logger.warning(f"Agent {agent.agent_id} timed out")
            raise
        except Exception as e:
            logger.error(f"Agent {agent.agent_id} execution failed: {e}")
            raise

    async def _synthesize_responses(self, query: MedicalQuery,
                                  agent_responses: Dict[str, AgentResponse],
                                  classification: QueryClassificationResult) -> SynthesizedResponse:
        """Synthesize multiple agent responses into coherent final response"""
        if not agent_responses:
            return await self._generate_fallback_response(query, "No agent responses available")

        # Calculate agent contribution weights
        agent_weights = self._calculate_agent_weights(agent_responses, classification)

        # Synthesize primary response text
        primary_response = await self._synthesize_response_text(agent_responses, agent_weights)

        # Combine citations
        all_citations = []
        for response in agent_responses.values():
            all_citations.extend(response.citations)

        # Remove duplicate citations and rank by relevance
        unique_citations = self._deduplicate_and_rank_citations(all_citations)

        # Generate evidence summary
        evidence_summary = self._generate_evidence_summary(agent_responses, unique_citations)

        # Calculate consensus level
        consensus_level = self._calculate_consensus_level(agent_responses)

        # Aggregate warnings and limitations
        all_warnings = []
        all_limitations = []
        for response in agent_responses.values():
            all_warnings.extend(response.warnings)
            all_limitations.extend(response.limitations)

        # Calculate overall confidence
        overall_confidence = self._calculate_overall_confidence(agent_responses, agent_weights, consensus_level)

        # Generate quality metrics
        quality_metrics = self._calculate_quality_metrics(agent_responses, unique_citations, overall_confidence)

        return SynthesizedResponse(
            query_id=query.query_id,
            primary_response=primary_response,
            confidence_score=overall_confidence,
            evidence_summary=evidence_summary,
            citations=unique_citations[:10],  # Top 10 citations
            agent_contributions=agent_weights,
            consensus_level=consensus_level,
            warnings=list(set(all_warnings)),  # Remove duplicates
            limitations=list(set(all_limitations)),
            quality_metrics=quality_metrics,
            processing_time=sum(r.processing_time for r in agent_responses.values())
        )

    def _calculate_agent_weights(self, agent_responses: Dict[str, AgentResponse],
                               classification: QueryClassificationResult) -> Dict[str, float]:
        """Calculate contribution weights for each agent"""
        weights = {}
        total_weight = 0

        for agent_name, response in agent_responses.items():
            # Base weight on confidence score
            confidence_weight = response.confidence_score

            # Adjust based on classification relevance
            classification_bonus = 0.0
            if agent_name == 'clinical_evidence' and classification.primary_classification == QueryClassification.CLINICAL_EVIDENCE:
                classification_bonus = 0.2
            elif agent_name == 'regulatory_guidance' and classification.primary_classification == QueryClassification.REGULATORY_GUIDANCE:
                classification_bonus = 0.2
            # Add similar bonuses for other agents

            # Citation quality bonus
            citation_bonus = min(0.1, len(response.citations) * 0.02)

            # Final weight
            agent_weight = confidence_weight + classification_bonus + citation_bonus
            weights[agent_name] = agent_weight
            total_weight += agent_weight

        # Normalize weights
        if total_weight > 0:
            for agent_name in weights:
                weights[agent_name] = weights[agent_name] / total_weight

        return weights

    async def _synthesize_response_text(self, agent_responses: Dict[str, AgentResponse],
                                      agent_weights: Dict[str, float]) -> str:
        """Synthesize response text from multiple agents"""
        if not agent_responses:
            return "Unable to generate response - no agent responses available."

        synthesized_text = "## Medical Intelligence Summary\n\n"

        # Sort agents by weight (most important first)
        sorted_agents = sorted(agent_weights.items(), key=lambda x: x[1], reverse=True)

        for agent_name, weight in sorted_agents:
            if agent_name in agent_responses:
                response = agent_responses[agent_name]

                # Add agent section
                agent_display_name = agent_name.replace('_', ' ').title()
                synthesized_text += f"### {agent_display_name} (Confidence: {response.confidence_score:.2f})\n\n"
                synthesized_text += f"{response.response_text}\n\n"

        # Add synthesis conclusion
        synthesized_text += "### Integrated Recommendation\n\n"
        synthesized_text += "Based on comprehensive analysis from specialized medical intelligence agents, "

        # Generate conclusion based on highest confidence response
        highest_confidence_agent = max(agent_responses.items(), key=lambda x: x[1].confidence_score)
        highest_confidence_response = highest_confidence_agent[1]

        if highest_confidence_response.confidence_score > 0.8:
            synthesized_text += "there is strong evidence to support the clinical recommendations provided above."
        elif highest_confidence_response.confidence_score > 0.6:
            synthesized_text += "there is moderate evidence supporting the recommendations, with some areas requiring additional validation."
        else:
            synthesized_text += "further research and expert consultation may be needed to establish definitive recommendations."

        return synthesized_text

    def _deduplicate_and_rank_citations(self, citations: List[Citation]) -> List[Citation]:
        """Remove duplicate citations and rank by relevance"""
        # Remove duplicates based on PMID or DOI
        unique_citations = {}

        for citation in citations:
            key = citation.pmid or citation.doi or citation.title
            if key not in unique_citations or citation.relevance_score > unique_citations[key].relevance_score:
                unique_citations[key] = citation

        # Sort by relevance score
        ranked_citations = sorted(unique_citations.values(), key=lambda x: x.relevance_score, reverse=True)

        return ranked_citations

    def _generate_evidence_summary(self, agent_responses: Dict[str, AgentResponse],
                                 citations: List[Citation]) -> str:
        """Generate summary of evidence quality and sources"""
        evidence_types = {}
        for citation in citations:
            evidence_type = citation.evidence_type.value
            evidence_types[evidence_type] = evidence_types.get(evidence_type, 0) + 1

        summary = f"Evidence base includes {len(citations)} sources: "

        evidence_descriptions = []
        for evidence_type, count in evidence_types.items():
            evidence_descriptions.append(f"{count} {evidence_type.replace('_', ' ')}")

        summary += ", ".join(evidence_descriptions)

        # Add quality assessment
        high_quality_citations = [c for c in citations if c.relevance_score > 0.8]
        if len(high_quality_citations) > 0:
            summary += f". {len(high_quality_citations)} high-quality sources identified."

        return summary

    def _calculate_consensus_level(self, agent_responses: Dict[str, AgentResponse]) -> float:
        """Calculate consensus level among agent responses"""
        if len(agent_responses) < 2:
            return 1.0  # Perfect consensus with single agent

        confidence_scores = [response.confidence_score for response in agent_responses.values()]

        # Calculate consensus based on confidence score variance
        mean_confidence = np.mean(confidence_scores)
        confidence_variance = np.var(confidence_scores)

        # Higher variance = lower consensus
        consensus_level = max(0.0, 1.0 - (confidence_variance * 2))

        return consensus_level

    def _calculate_overall_confidence(self, agent_responses: Dict[str, AgentResponse],
                                    agent_weights: Dict[str, float], consensus_level: float) -> float:
        """Calculate overall confidence score"""
        if not agent_responses:
            return 0.0

        # Weighted average of agent confidences
        weighted_confidence = sum(
            response.confidence_score * agent_weights.get(agent_name, 0)
            for agent_name, response in agent_responses.items()
        )

        # Apply consensus penalty/bonus
        consensus_factor = 0.8 + (consensus_level * 0.2)  # Range: 0.8 to 1.0

        overall_confidence = weighted_confidence * consensus_factor

        return min(0.95, overall_confidence)  # Cap at 95%

    def _calculate_quality_metrics(self, agent_responses: Dict[str, AgentResponse],
                                 citations: List[Citation], overall_confidence: float) -> Dict[str, float]:
        """Calculate comprehensive quality metrics"""
        metrics = {}

        # Citation quality
        if citations:
            avg_citation_relevance = sum(c.relevance_score for c in citations) / len(citations)
            metrics['citation_quality'] = avg_citation_relevance
            metrics['citation_count'] = len(citations)
        else:
            metrics['citation_quality'] = 0.0
            metrics['citation_count'] = 0

        # Response completeness
        total_response_length = sum(len(r.response_text) for r in agent_responses.values())
        metrics['response_completeness'] = min(1.0, total_response_length / 1000)  # Normalize to 1000 chars

        # Agent diversity
        metrics['agent_diversity'] = len(agent_responses) / 5  # Max 5 agents

        # Overall quality score
        metrics['overall_score'] = (
            overall_confidence * 0.4 +
            metrics['citation_quality'] * 0.3 +
            metrics['response_completeness'] * 0.2 +
            metrics['agent_diversity'] * 0.1
        )

        return metrics

    async def _validate_response_quality(self, response: SynthesizedResponse) -> SynthesizedResponse:
        """Apply quality validation and safety checks"""
        # Quality thresholds
        min_confidence = 0.5
        min_citations = 1

        # Apply quality filters
        quality_warnings = []

        if response.confidence_score < min_confidence:
            quality_warnings.append(f"Low confidence score: {response.confidence_score:.2f}")

        if len(response.citations) < min_citations:
            quality_warnings.append(f"Insufficient citations: {len(response.citations)}")

        # Safety checks
        safety_keywords = ['contraindicated', 'toxic', 'adverse', 'warning', 'caution']
        if any(keyword in response.primary_response.lower() for keyword in safety_keywords):
            quality_warnings.append("Response contains safety-related information - verify with medical expert")

        # Add quality warnings to response
        response.warnings.extend(quality_warnings)

        return response

    async def _generate_fallback_response(self, query: MedicalQuery, error_message: str) -> SynthesizedResponse:
        """Generate safe fallback response when orchestration fails"""
        return SynthesizedResponse(
            query_id=query.query_id,
            primary_response="I apologize, but I'm unable to provide a complete medical analysis at this time. Please consult with a healthcare professional for medical advice.",
            confidence_score=0.1,
            evidence_summary="No evidence sources available",
            citations=[],
            agent_contributions={},
            consensus_level=0.0,
            warnings=[f"System error: {error_message}", "Fallback response generated"],
            limitations=["Response generated due to system error", "Medical professional consultation recommended"],
            quality_metrics={'overall_score': 0.1},
            processing_time=0.1
        )

    def _update_performance_metrics(self, response: SynthesizedResponse, processing_time: float):
        """Update orchestrator performance metrics"""
        self.query_count += 1

        # Update success rate
        is_successful = response.confidence_score > 0.5 and len(response.citations) > 0
        current_successes = (self.success_rate * (self.query_count - 1)) + (1 if is_successful else 0)
        self.success_rate = current_successes / self.query_count

        # Update average response time
        total_time = (self.avg_response_time * (self.query_count - 1)) + processing_time
        self.avg_response_time = total_time / self.query_count

    async def get_orchestrator_status(self) -> Dict[str, Any]:
        """Get orchestrator performance status"""
        return {
            "total_queries": self.query_count,
            "success_rate": self.success_rate,
            "avg_response_time": self.avg_response_time,
            "active_agents": len(self.agents),
            "agent_status": {
                agent_name: {
                    "responses": agent.response_count,
                    "accuracy": agent.accuracy_score
                }
                for agent_name, agent in self.agents.items()
            }
        }

# Factory function
async def create_medical_orchestrator(config: Dict[str, Any] = None) -> MedicalAgentOrchestrator:
    """Create and initialize medical agent orchestrator"""
    orchestrator = MedicalAgentOrchestrator(config)
    return orchestrator