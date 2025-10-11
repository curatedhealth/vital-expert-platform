"""
VITAL Path - Phase 3 Enhanced: Prompt Optimization System
=========================================================

Core Intelligence Layer - Advanced Prompt Engineering & Optimization
Continuous improvement engine for medical AI prompts with clinical validation

Key Features:
- Adaptive prompt optimization based on medical accuracy metrics
- Clinical domain-specific prompt templates with evidence-based validation
- Real-time performance monitoring and A/B testing of prompts
- Medical specialty-aware prompt customization and refinement
- PHARMA framework integration for optimal clinical outcomes
- Automated prompt versioning and rollback capabilities
"""

import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any, Union, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import statistics
import hashlib
from pathlib import Path
import uuid
import numpy as np
from collections import defaultdict, deque

# Machine learning for optimization
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import optuna
from scipy import stats

# Medical domain integration
from .medical_agents import MedicalSpecialty, BaseAgent
from .clinical_validation_framework import ValidationResult, PHARMAAnalysis
from .agent_monitoring_metrics import MetricsCollector, AgentMetric

# Natural language processing
import spacy
from transformers import pipeline, AutoTokenizer
import nltk
from textstat import flesch_reading_ease, flesch_kincaid_grade


class PromptType(Enum):
    """Types of medical prompts"""
    CLINICAL_EVIDENCE = "clinical_evidence"
    REGULATORY_GUIDANCE = "regulatory_guidance"
    MARKET_ACCESS = "market_access"
    SAFETY_MONITORING = "safety_monitoring"
    CLINICAL_OPERATIONS = "clinical_operations"
    GENERAL_MEDICAL = "general_medical"


class OptimizationStrategy(Enum):
    """Prompt optimization strategies"""
    GRADIENT_BASED = "gradient_based"
    EVOLUTIONARY = "evolutionary"
    BAYESIAN = "bayesian"
    REINFORCEMENT_LEARNING = "reinforcement_learning"
    MULTI_ARMED_BANDIT = "multi_armed_bandit"
    CLINICAL_FEEDBACK = "clinical_feedback"


class PerformanceMetric(Enum):
    """Performance metrics for prompt evaluation"""
    MEDICAL_ACCURACY = "medical_accuracy"
    CLINICAL_RELEVANCE = "clinical_relevance"
    CITATION_QUALITY = "citation_quality"
    RESPONSE_TIME = "response_time"
    USER_SATISFACTION = "user_satisfaction"
    SAFETY_COMPLIANCE = "safety_compliance"
    EVIDENCE_QUALITY = "evidence_quality"
    CLINICAL_UTILITY = "clinical_utility"


@dataclass
class PromptTemplate:
    """Medical prompt template with metadata"""
    template_id: str
    prompt_type: PromptType
    specialty: Optional[MedicalSpecialty] = None
    system_prompt: str = ""
    user_prompt_template: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    performance_metrics: Dict[PerformanceMetric, float] = field(default_factory=dict)
    clinical_validation_score: float = 0.0
    usage_count: int = 0
    success_rate: float = 0.0
    average_response_time: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    version: str = "1.0.0"
    author: str = "system"
    clinical_reviewer: Optional[str] = None
    validation_history: List[ValidationResult] = field(default_factory=list)

    # PHARMA framework compliance
    pharma_alignment: Dict[str, float] = field(default_factory=dict)

    # Medical context
    target_conditions: List[str] = field(default_factory=list)
    evidence_requirements: List[str] = field(default_factory=list)
    safety_considerations: List[str] = field(default_factory=list)
    regulatory_context: List[str] = field(default_factory=list)


@dataclass
class PromptPerformanceData:
    """Performance data for prompt optimization"""
    prompt_id: str
    execution_timestamp: datetime
    query: str
    response: str
    metrics: Dict[PerformanceMetric, float]
    clinical_context: Optional[str] = None
    user_feedback: Optional[float] = None
    expert_review_score: Optional[float] = None
    validation_result: Optional[ValidationResult] = None
    response_time_ms: float = 0.0
    tokens_used: int = 0
    cost: float = 0.0

    # Medical quality indicators
    medical_accuracy: float = 0.0
    citation_count: int = 0
    citation_quality: float = 0.0
    safety_flags: List[str] = field(default_factory=list)
    clinical_utility_score: float = 0.0


@dataclass
class OptimizationExperiment:
    """A/B testing experiment for prompt optimization"""
    experiment_id: str
    experiment_name: str
    prompt_variants: List[PromptTemplate]
    optimization_strategy: OptimizationStrategy
    target_metrics: List[PerformanceMetric]
    sample_size: int
    current_sample_count: int = 0
    start_date: datetime = field(default_factory=datetime.now)
    end_date: Optional[datetime] = None
    results: List[PromptPerformanceData] = field(default_factory=list)
    statistical_significance: Dict[str, float] = field(default_factory=dict)
    winner: Optional[str] = None
    confidence_interval: float = 0.95
    status: str = "running"  # running, completed, paused, failed


class MedicalPromptAnalyzer:
    """Analyzes medical prompts for clinical effectiveness"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Load medical NLP models
        try:
            self.nlp = spacy.load("en_core_sci_sm")
        except OSError:
            self.logger.warning("ScispaCy model not found")
            self.nlp = spacy.load("en_core_web_sm")

        # Medical terminology scoring
        self.medical_terms = self._load_medical_terminology()

        # Clinical quality indicators
        self.quality_indicators = {
            'evidence_terms': ['evidence', 'study', 'trial', 'research', 'data'],
            'safety_terms': ['adverse', 'contraindication', 'warning', 'risk', 'safety'],
            'efficacy_terms': ['efficacy', 'effectiveness', 'benefit', 'outcome', 'response'],
            'regulatory_terms': ['fda', 'ema', 'approval', 'guideline', 'compliance']
        }

    def _load_medical_terminology(self) -> Dict[str, float]:
        """Load medical terminology with importance weights"""
        # In production, this would load from medical ontologies
        return {
            'clinical': 0.9,
            'therapeutic': 0.9,
            'pharmacological': 0.8,
            'diagnostic': 0.8,
            'treatment': 0.9,
            'patient': 0.7,
            'adverse': 0.9,
            'efficacy': 0.9,
            'safety': 0.9,
            'evidence': 0.8,
            'guideline': 0.8
        }

    async def analyze_prompt_quality(self, prompt: PromptTemplate) -> Dict[str, float]:
        """Analyze the clinical quality of a medical prompt"""

        analysis_results = {}

        # 1. Medical terminology density
        analysis_results['medical_terminology_score'] = self._calculate_medical_terminology_score(prompt)

        # 2. Clinical clarity and specificity
        analysis_results['clinical_clarity_score'] = self._assess_clinical_clarity(prompt)

        # 3. Safety consideration coverage
        analysis_results['safety_coverage_score'] = self._assess_safety_coverage(prompt)

        # 4. Evidence requirement specification
        analysis_results['evidence_specification_score'] = self._assess_evidence_requirements(prompt)

        # 5. Regulatory compliance awareness
        analysis_results['regulatory_awareness_score'] = self._assess_regulatory_awareness(prompt)

        # 6. PHARMA framework alignment
        analysis_results['pharma_alignment_score'] = self._assess_pharma_alignment(prompt)

        # 7. Readability and comprehension
        analysis_results['readability_score'] = self._assess_readability(prompt)

        # 8. Completeness and structure
        analysis_results['completeness_score'] = self._assess_completeness(prompt)

        return analysis_results

    def _calculate_medical_terminology_score(self, prompt: PromptTemplate) -> float:
        """Calculate the density and appropriateness of medical terminology"""

        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}"
        doc = self.nlp(combined_text)

        # Count medical terms
        medical_term_count = 0
        total_terms = len([token for token in doc if not token.is_stop and not token.is_punct])

        for token in doc:
            if token.text.lower() in self.medical_terms:
                medical_term_count += self.medical_terms[token.text.lower()]

        # Medical entity recognition
        medical_entities = [ent for ent in doc.ents if ent.label_ in ['CHEMICAL', 'DISEASE', 'GENE_OR_GENE_PRODUCT']]
        entity_score = len(medical_entities) * 0.1

        # Calculate density score
        if total_terms == 0:
            return 0.0

        terminology_density = medical_term_count / total_terms
        normalized_score = min(1.0, terminology_density + entity_score)

        return normalized_score

    def _assess_clinical_clarity(self, prompt: PromptTemplate) -> float:
        """Assess clinical clarity and specificity"""

        clarity_factors = []

        # Check for specific clinical instructions
        clinical_instructions = [
            'provide evidence', 'cite sources', 'consider contraindications',
            'assess safety', 'evaluate efficacy', 'clinical guidelines'
        ]

        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}".lower()
        instruction_count = sum(1 for instruction in clinical_instructions if instruction in combined_text)
        clarity_factors.append(min(1.0, instruction_count / len(clinical_instructions)))

        # Check for ambiguous language
        ambiguous_terms = ['maybe', 'possibly', 'might', 'could', 'uncertain']
        ambiguous_count = sum(1 for term in ambiguous_terms if term in combined_text)
        ambiguity_penalty = min(0.5, ambiguous_count * 0.1)
        clarity_factors.append(1.0 - ambiguity_penalty)

        # Check for specific medical context
        if prompt.specialty or prompt.target_conditions:
            clarity_factors.append(0.2)  # Bonus for specificity

        return statistics.mean(clarity_factors)

    def _assess_safety_coverage(self, prompt: PromptTemplate) -> float:
        """Assess how well the prompt addresses safety considerations"""

        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}".lower()

        safety_score = 0.0
        safety_weight = 0.0

        for category, terms in self.quality_indicators.items():
            if 'safety' in category or 'adverse' in category:
                category_score = sum(1 for term in terms if term in combined_text)
                safety_score += min(1.0, category_score / len(terms)) * 0.3
                safety_weight += 0.3

        # Check for explicit safety instructions
        safety_instructions = [
            'consider adverse effects', 'check contraindications', 'assess risks',
            'monitor for side effects', 'safety profile', 'risk-benefit'
        ]

        instruction_score = sum(1 for instruction in safety_instructions if instruction in combined_text)
        safety_score += min(1.0, instruction_score / len(safety_instructions)) * 0.7
        safety_weight += 0.7

        return safety_score / safety_weight if safety_weight > 0 else 0.0

    def _assess_evidence_requirements(self, prompt: PromptTemplate) -> float:
        """Assess specification of evidence requirements"""

        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}".lower()

        evidence_terms = [
            'peer-reviewed', 'clinical trial', 'systematic review', 'meta-analysis',
            'evidence-based', 'cite sources', 'references', 'pmid', 'doi'
        ]

        evidence_count = sum(1 for term in evidence_terms if term in combined_text)
        evidence_score = min(1.0, evidence_count / len(evidence_terms))

        # Bonus for specifying evidence hierarchy
        hierarchy_terms = ['level i evidence', 'rct', 'randomized controlled', 'cochrane']
        hierarchy_count = sum(1 for term in hierarchy_terms if term in combined_text)
        hierarchy_bonus = min(0.3, hierarchy_count * 0.1)

        return min(1.0, evidence_score + hierarchy_bonus)

    def _assess_regulatory_awareness(self, prompt: PromptTemplate) -> float:
        """Assess regulatory compliance awareness"""

        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}".lower()

        regulatory_terms = ['fda', 'ema', 'ich', 'gcp', 'regulatory', 'compliance', 'guideline', 'approval']
        regulatory_count = sum(1 for term in regulatory_terms if term in combined_text)

        base_score = min(1.0, regulatory_count / len(regulatory_terms))

        # Bonus for specific regulatory contexts
        if prompt.regulatory_context:
            base_score += 0.2

        return min(1.0, base_score)

    def _assess_pharma_alignment(self, prompt: PromptTemplate) -> float:
        """Assess PHARMA framework alignment"""

        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}".lower()

        pharma_components = {
            'purpose': ['objective', 'goal', 'purpose', 'aim'],
            'hypothesis': ['hypothesis', 'theory', 'mechanism', 'rationale'],
            'audience': ['patient', 'clinician', 'stakeholder', 'population'],
            'requirements': ['requirement', 'criteria', 'standard', 'specification'],
            'metrics': ['metric', 'endpoint', 'outcome', 'measurement'],
            'actionable': ['recommendation', 'action', 'next steps', 'implementation']
        }

        alignment_scores = []
        for component, terms in pharma_components.items():
            component_score = sum(1 for term in terms if term in combined_text)
            normalized_score = min(1.0, component_score / len(terms))
            alignment_scores.append(normalized_score)

        return statistics.mean(alignment_scores)

    def _assess_readability(self, prompt: PromptTemplate) -> float:
        """Assess prompt readability and comprehension"""

        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}"

        # Use textstat for readability metrics
        flesch_score = flesch_reading_ease(combined_text)
        fk_grade = flesch_kincaid_grade(combined_text)

        # Normalize scores (medical text should be professional but clear)
        # Target: Flesch 30-60 (difficult but understandable), Grade 12-16
        flesch_normalized = 1.0 if 30 <= flesch_score <= 60 else max(0.2, 1.0 - abs(flesch_score - 45) / 45)
        grade_normalized = 1.0 if 12 <= fk_grade <= 16 else max(0.2, 1.0 - abs(fk_grade - 14) / 14)

        return (flesch_normalized + grade_normalized) / 2

    def _assess_completeness(self, prompt: PromptTemplate) -> float:
        """Assess prompt completeness and structure"""

        completeness_factors = []

        # Check for system prompt
        completeness_factors.append(1.0 if prompt.system_prompt.strip() else 0.0)

        # Check for user prompt template
        completeness_factors.append(1.0 if prompt.user_prompt_template.strip() else 0.0)

        # Check for parameters
        completeness_factors.append(1.0 if prompt.parameters else 0.5)

        # Check for medical context
        medical_context_score = 0.0
        if prompt.target_conditions:
            medical_context_score += 0.25
        if prompt.evidence_requirements:
            medical_context_score += 0.25
        if prompt.safety_considerations:
            medical_context_score += 0.25
        if prompt.specialty:
            medical_context_score += 0.25

        completeness_factors.append(medical_context_score)

        # Check for proper structure (instructions, constraints, examples)
        structure_elements = ['instruction', 'example', 'format', 'constraint', 'requirement']
        combined_text = f"{prompt.system_prompt} {prompt.user_prompt_template}".lower()
        structure_count = sum(1 for element in structure_elements if element in combined_text)
        structure_score = min(1.0, structure_count / len(structure_elements))
        completeness_factors.append(structure_score)

        return statistics.mean(completeness_factors)


class PromptOptimizer:
    """Advanced prompt optimization using multiple strategies"""

    def __init__(self, metrics_collector: MetricsCollector):
        self.logger = logging.getLogger(__name__)
        self.metrics_collector = metrics_collector
        self.analyzer = MedicalPromptAnalyzer()

        # Optimization engines
        self.optimization_engines = {
            OptimizationStrategy.BAYESIAN: self._bayesian_optimization,
            OptimizationStrategy.EVOLUTIONARY: self._evolutionary_optimization,
            OptimizationStrategy.REINFORCEMENT_LEARNING: self._rl_optimization,
            OptimizationStrategy.MULTI_ARMED_BANDIT: self._mab_optimization,
            OptimizationStrategy.CLINICAL_FEEDBACK: self._clinical_feedback_optimization
        }

        # Performance database
        self.performance_history: Dict[str, List[PromptPerformanceData]] = defaultdict(list)

        # Active experiments
        self.active_experiments: Dict[str, OptimizationExperiment] = {}

    async def optimize_prompt(self,
                            base_prompt: PromptTemplate,
                            strategy: OptimizationStrategy = OptimizationStrategy.BAYESIAN,
                            target_metrics: List[PerformanceMetric] = None,
                            optimization_budget: int = 100) -> PromptTemplate:
        """Optimize a medical prompt using specified strategy"""

        if target_metrics is None:
            target_metrics = [
                PerformanceMetric.MEDICAL_ACCURACY,
                PerformanceMetric.CLINICAL_RELEVANCE,
                PerformanceMetric.CITATION_QUALITY
            ]

        self.logger.info(f"Starting prompt optimization with {strategy.value} strategy")

        # Get optimization engine
        optimization_engine = self.optimization_engines.get(strategy)
        if not optimization_engine:
            raise ValueError(f"Unsupported optimization strategy: {strategy}")

        # Run optimization
        optimized_prompt = await optimization_engine(
            base_prompt, target_metrics, optimization_budget
        )

        # Validate optimized prompt
        validation_results = await self.analyzer.analyze_prompt_quality(optimized_prompt)
        optimized_prompt.pharma_alignment = validation_results

        self.logger.info(f"Prompt optimization completed. Quality score: {statistics.mean(validation_results.values()):.3f}")

        return optimized_prompt

    async def _bayesian_optimization(self,
                                   base_prompt: PromptTemplate,
                                   target_metrics: List[PerformanceMetric],
                                   budget: int) -> PromptTemplate:
        """Bayesian optimization for prompt parameters"""

        def objective(trial):
            # Define hyperparameter search space
            temperature = trial.suggest_float('temperature', 0.1, 1.0)
            max_tokens = trial.suggest_int('max_tokens', 100, 2000)

            # Modify system prompt components
            detail_level = trial.suggest_categorical('detail_level', ['basic', 'detailed', 'comprehensive'])
            evidence_emphasis = trial.suggest_float('evidence_emphasis', 0.1, 1.0)
            safety_emphasis = trial.suggest_float('safety_emphasis', 0.1, 1.0)

            # Create prompt variant
            variant = self._create_prompt_variant(
                base_prompt,
                {
                    'temperature': temperature,
                    'max_tokens': max_tokens,
                    'detail_level': detail_level,
                    'evidence_emphasis': evidence_emphasis,
                    'safety_emphasis': safety_emphasis
                }
            )

            # Evaluate variant (mock evaluation for now)
            score = self._evaluate_prompt_variant(variant, target_metrics)
            return score

        # Run Bayesian optimization
        study = optuna.create_study(direction='maximize')
        study.optimize(objective, n_trials=budget)

        # Create optimized prompt with best parameters
        best_params = study.best_params
        optimized_prompt = self._create_prompt_variant(base_prompt, best_params)

        return optimized_prompt

    async def _evolutionary_optimization(self,
                                       base_prompt: PromptTemplate,
                                       target_metrics: List[PerformanceMetric],
                                       budget: int) -> PromptTemplate:
        """Evolutionary algorithm for prompt optimization"""

        population_size = 20
        generations = budget // population_size
        mutation_rate = 0.1

        # Initialize population
        population = [self._mutate_prompt(base_prompt) for _ in range(population_size)]

        for generation in range(generations):
            # Evaluate population
            fitness_scores = []
            for prompt in population:
                score = self._evaluate_prompt_variant(prompt, target_metrics)
                fitness_scores.append(score)

            # Selection (tournament selection)
            new_population = []
            for _ in range(population_size):
                parent1 = self._tournament_selection(population, fitness_scores)
                parent2 = self._tournament_selection(population, fitness_scores)

                # Crossover
                child = self._crossover_prompts(parent1, parent2)

                # Mutation
                if np.random.random() < mutation_rate:
                    child = self._mutate_prompt(child)

                new_population.append(child)

            population = new_population

            self.logger.info(f"Generation {generation + 1}: Best fitness = {max(fitness_scores):.3f}")

        # Return best prompt from final population
        final_scores = [self._evaluate_prompt_variant(p, target_metrics) for p in population]
        best_index = np.argmax(final_scores)

        return population[best_index]

    async def _rl_optimization(self,
                             base_prompt: PromptTemplate,
                             target_metrics: List[PerformanceMetric],
                             budget: int) -> PromptTemplate:
        """Reinforcement learning-based optimization"""

        # Implement Q-learning or policy gradient for prompt optimization
        # This is a simplified version - full RL would require more complex state/action spaces

        state_space = {
            'current_performance': 0.0,
            'prompt_complexity': 0.0,
            'clinical_coverage': 0.0
        }

        action_space = [
            'increase_detail',
            'decrease_detail',
            'emphasize_safety',
            'emphasize_efficacy',
            'add_examples',
            'simplify_language'
        ]

        # Q-table initialization
        q_table = {action: np.random.normal(0, 0.1) for action in action_space}
        learning_rate = 0.1
        epsilon = 0.1

        current_prompt = base_prompt

        for step in range(budget):
            # Choose action (epsilon-greedy)
            if np.random.random() < epsilon:
                action = np.random.choice(action_space)
            else:
                action = max(q_table.keys(), key=lambda a: q_table[a])

            # Apply action to create new prompt
            new_prompt = self._apply_action(current_prompt, action)

            # Evaluate new prompt
            reward = self._evaluate_prompt_variant(new_prompt, target_metrics)

            # Update Q-table
            q_table[action] += learning_rate * (reward - q_table[action])

            # Update current prompt if improvement
            current_score = self._evaluate_prompt_variant(current_prompt, target_metrics)
            if reward > current_score:
                current_prompt = new_prompt

        return current_prompt

    async def _mab_optimization(self,
                              base_prompt: PromptTemplate,
                              target_metrics: List[PerformanceMetric],
                              budget: int) -> PromptTemplate:
        """Multi-armed bandit optimization for prompt variants"""

        # Create initial set of prompt variants
        arms = [
            self._create_prompt_variant(base_prompt, {'style': 'clinical'}),
            self._create_prompt_variant(base_prompt, {'style': 'academic'}),
            self._create_prompt_variant(base_prompt, {'style': 'practical'}),
            self._create_prompt_variant(base_prompt, {'style': 'comprehensive'})
        ]

        # Initialize bandit statistics
        arm_counts = [0] * len(arms)
        arm_rewards = [0.0] * len(arms)

        for trial in range(budget):
            # UCB (Upper Confidence Bound) selection
            if trial < len(arms):
                # Play each arm once initially
                chosen_arm = trial
            else:
                ucb_values = []
                for i in range(len(arms)):
                    if arm_counts[i] == 0:
                        ucb_values.append(float('inf'))
                    else:
                        avg_reward = arm_rewards[i] / arm_counts[i]
                        confidence = np.sqrt(2 * np.log(trial) / arm_counts[i])
                        ucb_values.append(avg_reward + confidence)

                chosen_arm = np.argmax(ucb_values)

            # Evaluate chosen arm
            reward = self._evaluate_prompt_variant(arms[chosen_arm], target_metrics)

            # Update statistics
            arm_counts[chosen_arm] += 1
            arm_rewards[chosen_arm] += reward

            self.logger.debug(f"Trial {trial + 1}: Arm {chosen_arm}, Reward {reward:.3f}")

        # Return best performing arm
        avg_rewards = [arm_rewards[i] / arm_counts[i] for i in range(len(arms))]
        best_arm = np.argmax(avg_rewards)

        return arms[best_arm]

    async def _clinical_feedback_optimization(self,
                                           base_prompt: PromptTemplate,
                                           target_metrics: List[PerformanceMetric],
                                           budget: int) -> PromptTemplate:
        """Optimization based on clinical expert feedback"""

        # This would integrate with expert review system in production
        current_prompt = base_prompt

        feedback_cycles = min(5, budget // 20)  # Multiple feedback rounds

        for cycle in range(feedback_cycles):
            # Generate prompt variants for expert review
            variants = [
                self._create_clinical_variant(current_prompt, focus='safety'),
                self._create_clinical_variant(current_prompt, focus='efficacy'),
                self._create_clinical_variant(current_prompt, focus='evidence'),
                self._create_clinical_variant(current_prompt, focus='guidelines')
            ]

            # Simulate expert feedback (in production, this would be real expert input)
            expert_scores = []
            for variant in variants:
                # Mock expert evaluation
                clinical_quality = await self.analyzer.analyze_prompt_quality(variant)
                expert_score = statistics.mean(clinical_quality.values())
                expert_scores.append(expert_score)

            # Select best variant
            best_variant_index = np.argmax(expert_scores)
            current_prompt = variants[best_variant_index]

            self.logger.info(f"Feedback cycle {cycle + 1}: Best expert score = {max(expert_scores):.3f}")

        return current_prompt

    def _create_prompt_variant(self, base_prompt: PromptTemplate, parameters: Dict[str, Any]) -> PromptTemplate:
        """Create a prompt variant with modified parameters"""

        variant = PromptTemplate(
            template_id=f"{base_prompt.template_id}_variant_{uuid.uuid4().hex[:8]}",
            prompt_type=base_prompt.prompt_type,
            specialty=base_prompt.specialty,
            system_prompt=base_prompt.system_prompt,
            user_prompt_template=base_prompt.user_prompt_template,
            parameters={**base_prompt.parameters, **parameters},
            target_conditions=base_prompt.target_conditions.copy(),
            evidence_requirements=base_prompt.evidence_requirements.copy(),
            safety_considerations=base_prompt.safety_considerations.copy(),
            regulatory_context=base_prompt.regulatory_context.copy()
        )

        # Modify prompts based on parameters
        if 'detail_level' in parameters:
            variant = self._adjust_detail_level(variant, parameters['detail_level'])

        if 'evidence_emphasis' in parameters:
            variant = self._adjust_evidence_emphasis(variant, parameters['evidence_emphasis'])

        if 'safety_emphasis' in parameters:
            variant = self._adjust_safety_emphasis(variant, parameters['safety_emphasis'])

        return variant

    def _adjust_detail_level(self, prompt: PromptTemplate, level: str) -> PromptTemplate:
        """Adjust the detail level of prompt instructions"""

        detail_modifiers = {
            'basic': {
                'instruction_prefix': 'Briefly',
                'example_count': 1,
                'explanation_depth': 'concise'
            },
            'detailed': {
                'instruction_prefix': 'Provide detailed',
                'example_count': 2,
                'explanation_depth': 'thorough'
            },
            'comprehensive': {
                'instruction_prefix': 'Provide comprehensive',
                'example_count': 3,
                'explanation_depth': 'exhaustive'
            }
        }

        modifier = detail_modifiers.get(level, detail_modifiers['detailed'])

        # Modify system prompt
        if 'provide' in prompt.system_prompt.lower():
            prompt.system_prompt = prompt.system_prompt.replace(
                'Provide', modifier['instruction_prefix']
            )

        prompt.parameters['detail_level'] = level
        return prompt

    def _adjust_evidence_emphasis(self, prompt: PromptTemplate, emphasis: float) -> PromptTemplate:
        """Adjust emphasis on evidence requirements"""

        evidence_instructions = [
            "Ensure all medical claims are supported by peer-reviewed evidence.",
            "Provide specific citations for all medical statements.",
            "Prioritize Level I evidence (systematic reviews, meta-analyses).",
            "Include confidence intervals and statistical significance where appropriate."
        ]

        # Add evidence instructions based on emphasis level
        if emphasis > 0.7:
            evidence_text = " ".join(evidence_instructions)
            if evidence_text not in prompt.system_prompt:
                prompt.system_prompt += f"\n\nEvidence Requirements: {evidence_text}"
        elif emphasis > 0.4:
            evidence_text = " ".join(evidence_instructions[:2])
            if evidence_text not in prompt.system_prompt:
                prompt.system_prompt += f"\n\nEvidence Requirements: {evidence_text}"

        prompt.parameters['evidence_emphasis'] = emphasis
        return prompt

    def _adjust_safety_emphasis(self, prompt: PromptTemplate, emphasis: float) -> PromptTemplate:
        """Adjust emphasis on safety considerations"""

        safety_instructions = [
            "Always consider potential adverse effects and contraindications.",
            "Highlight safety warnings and precautions.",
            "Include risk-benefit analysis when appropriate.",
            "Mention monitoring requirements for safety."
        ]

        # Add safety instructions based on emphasis level
        if emphasis > 0.7:
            safety_text = " ".join(safety_instructions)
            if safety_text not in prompt.system_prompt:
                prompt.system_prompt += f"\n\nSafety Considerations: {safety_text}"
        elif emphasis > 0.4:
            safety_text = " ".join(safety_instructions[:2])
            if safety_text not in prompt.system_prompt:
                prompt.system_prompt += f"\n\nSafety Considerations: {safety_text}"

        prompt.parameters['safety_emphasis'] = emphasis
        return prompt

    def _evaluate_prompt_variant(self, prompt: PromptTemplate, target_metrics: List[PerformanceMetric]) -> float:
        """Evaluate a prompt variant based on target metrics"""

        # Mock evaluation - in production, this would test the prompt with real queries
        scores = []

        for metric in target_metrics:
            if metric == PerformanceMetric.MEDICAL_ACCURACY:
                # Mock medical accuracy score
                scores.append(np.random.normal(0.85, 0.1))
            elif metric == PerformanceMetric.CLINICAL_RELEVANCE:
                # Mock clinical relevance score
                scores.append(np.random.normal(0.80, 0.1))
            elif metric == PerformanceMetric.CITATION_QUALITY:
                # Mock citation quality score
                scores.append(np.random.normal(0.90, 0.05))
            elif metric == PerformanceMetric.RESPONSE_TIME:
                # Mock response time score (inverted - lower is better)
                time_score = 1.0 - min(1.0, np.random.normal(1.5, 0.5) / 5.0)
                scores.append(max(0.0, time_score))
            else:
                # Default score
                scores.append(np.random.normal(0.75, 0.1))

        # Clip scores to [0, 1] range
        scores = [max(0.0, min(1.0, score)) for score in scores]

        return statistics.mean(scores)

    def _mutate_prompt(self, prompt: PromptTemplate) -> PromptTemplate:
        """Create a mutated version of a prompt"""

        mutation_types = [
            'adjust_tone',
            'modify_structure',
            'change_emphasis',
            'add_constraint',
            'remove_constraint'
        ]

        mutation_type = np.random.choice(mutation_types)
        mutated_prompt = PromptTemplate(
            template_id=f"{prompt.template_id}_mut_{uuid.uuid4().hex[:6]}",
            prompt_type=prompt.prompt_type,
            specialty=prompt.specialty,
            system_prompt=prompt.system_prompt,
            user_prompt_template=prompt.user_prompt_template,
            parameters=prompt.parameters.copy()
        )

        if mutation_type == 'adjust_tone':
            tones = ['professional', 'clinical', 'academic', 'practical']
            new_tone = np.random.choice(tones)
            mutated_prompt.parameters['tone'] = new_tone

        elif mutation_type == 'change_emphasis':
            emphasis_aspects = ['safety', 'efficacy', 'evidence', 'guidelines']
            aspect = np.random.choice(emphasis_aspects)
            emphasis_level = np.random.uniform(0.3, 1.0)
            mutated_prompt.parameters[f'{aspect}_emphasis'] = emphasis_level

        return mutated_prompt

    def _tournament_selection(self, population: List[PromptTemplate], fitness_scores: List[float]) -> PromptTemplate:
        """Tournament selection for evolutionary algorithm"""

        tournament_size = 3
        tournament_indices = np.random.choice(len(population), tournament_size, replace=False)
        tournament_scores = [fitness_scores[i] for i in tournament_indices]

        winner_index = tournament_indices[np.argmax(tournament_scores)]
        return population[winner_index]

    def _crossover_prompts(self, parent1: PromptTemplate, parent2: PromptTemplate) -> PromptTemplate:
        """Crossover operation for evolutionary algorithm"""

        child = PromptTemplate(
            template_id=f"cross_{uuid.uuid4().hex[:8]}",
            prompt_type=parent1.prompt_type,
            specialty=parent1.specialty,
            system_prompt=parent1.system_prompt,  # Take from parent1
            user_prompt_template=parent2.user_prompt_template,  # Take from parent2
            parameters={}
        )

        # Combine parameters
        for key in set(parent1.parameters.keys()) | set(parent2.parameters.keys()):
            if key in parent1.parameters and key in parent2.parameters:
                # Average numerical parameters
                if isinstance(parent1.parameters[key], (int, float)):
                    child.parameters[key] = (parent1.parameters[key] + parent2.parameters[key]) / 2
                else:
                    # Randomly choose non-numerical parameters
                    child.parameters[key] = np.random.choice([parent1.parameters[key], parent2.parameters[key]])
            else:
                # Take from whichever parent has the parameter
                child.parameters[key] = parent1.parameters.get(key, parent2.parameters[key])

        return child

    def _apply_action(self, prompt: PromptTemplate, action: str) -> PromptTemplate:
        """Apply reinforcement learning action to prompt"""

        new_prompt = PromptTemplate(
            template_id=f"{prompt.template_id}_rl_{action}",
            prompt_type=prompt.prompt_type,
            specialty=prompt.specialty,
            system_prompt=prompt.system_prompt,
            user_prompt_template=prompt.user_prompt_template,
            parameters=prompt.parameters.copy()
        )

        if action == 'increase_detail':
            new_prompt = self._adjust_detail_level(new_prompt, 'comprehensive')
        elif action == 'decrease_detail':
            new_prompt = self._adjust_detail_level(new_prompt, 'basic')
        elif action == 'emphasize_safety':
            new_prompt = self._adjust_safety_emphasis(new_prompt, 0.9)
        elif action == 'emphasize_efficacy':
            new_prompt.parameters['efficacy_emphasis'] = 0.9
        elif action == 'add_examples':
            new_prompt.parameters['include_examples'] = True
        elif action == 'simplify_language':
            new_prompt.parameters['language_complexity'] = 'simple'

        return new_prompt

    def _create_clinical_variant(self, base_prompt: PromptTemplate, focus: str) -> PromptTemplate:
        """Create a clinically-focused prompt variant"""

        variant = PromptTemplate(
            template_id=f"{base_prompt.template_id}_clinical_{focus}",
            prompt_type=base_prompt.prompt_type,
            specialty=base_prompt.specialty,
            system_prompt=base_prompt.system_prompt,
            user_prompt_template=base_prompt.user_prompt_template,
            parameters=base_prompt.parameters.copy()
        )

        clinical_focuses = {
            'safety': {
                'emphasis': 'Prioritize patient safety and adverse event reporting.',
                'requirements': ['contraindications', 'warnings', 'monitoring']
            },
            'efficacy': {
                'emphasis': 'Focus on therapeutic efficacy and clinical outcomes.',
                'requirements': ['endpoints', 'response_rates', 'statistical_significance']
            },
            'evidence': {
                'emphasis': 'Emphasize evidence quality and citation accuracy.',
                'requirements': ['peer_review', 'evidence_hierarchy', 'citation_format']
            },
            'guidelines': {
                'emphasis': 'Ensure compliance with clinical practice guidelines.',
                'requirements': ['guideline_adherence', 'standard_of_care', 'recommendations']
            }
        }

        if focus in clinical_focuses:
            focus_config = clinical_focuses[focus]
            variant.system_prompt += f"\n\nClinical Focus: {focus_config['emphasis']}"
            variant.parameters['clinical_focus'] = focus
            variant.parameters['focus_requirements'] = focus_config['requirements']

        return variant

    async def run_ab_test(self,
                         prompt_variants: List[PromptTemplate],
                         test_name: str,
                         sample_size: int = 100,
                         target_metrics: List[PerformanceMetric] = None) -> OptimizationExperiment:
        """Run A/B test for prompt optimization"""

        if target_metrics is None:
            target_metrics = [PerformanceMetric.MEDICAL_ACCURACY, PerformanceMetric.CLINICAL_RELEVANCE]

        experiment = OptimizationExperiment(
            experiment_id=f"ab_test_{uuid.uuid4().hex[:8]}",
            experiment_name=test_name,
            prompt_variants=prompt_variants,
            optimization_strategy=OptimizationStrategy.MULTI_ARMED_BANDIT,
            target_metrics=target_metrics,
            sample_size=sample_size
        )

        self.active_experiments[experiment.experiment_id] = experiment

        # Run A/B test using multi-armed bandit approach
        # This ensures we allocate more traffic to better-performing variants
        arm_counts = [0] * len(prompt_variants)
        arm_rewards = [[] for _ in range(len(prompt_variants))]

        for sample in range(sample_size):
            # Choose variant (epsilon-greedy with decreasing epsilon)
            epsilon = max(0.1, 1.0 - sample / sample_size)

            if np.random.random() < epsilon or sample < len(prompt_variants):
                # Exploration: choose random variant or ensure each is tried once
                chosen_variant = sample % len(prompt_variants) if sample < len(prompt_variants) else np.random.randint(len(prompt_variants))
            else:
                # Exploitation: choose best performing variant
                avg_rewards = [np.mean(rewards) if rewards else 0.0 for rewards in arm_rewards]
                chosen_variant = np.argmax(avg_rewards)

            # Evaluate chosen variant
            performance_data = self._simulate_prompt_performance(
                prompt_variants[chosen_variant],
                target_metrics
            )

            # Update statistics
            arm_counts[chosen_variant] += 1
            arm_rewards[chosen_variant].append(performance_data.medical_accuracy)
            experiment.results.append(performance_data)
            experiment.current_sample_count += 1

        # Calculate statistical significance
        experiment.statistical_significance = self._calculate_statistical_significance(arm_rewards)

        # Determine winner
        avg_rewards = [np.mean(rewards) if rewards else 0.0 for rewards in arm_rewards]
        winner_index = np.argmax(avg_rewards)
        experiment.winner = prompt_variants[winner_index].template_id
        experiment.status = "completed"
        experiment.end_date = datetime.now()

        self.logger.info(f"A/B test completed: {test_name}")
        self.logger.info(f"Winner: {experiment.winner} with average performance: {max(avg_rewards):.3f}")

        return experiment

    def _simulate_prompt_performance(self,
                                   prompt: PromptTemplate,
                                   target_metrics: List[PerformanceMetric]) -> PromptPerformanceData:
        """Simulate prompt performance for testing"""

        # Mock performance data
        performance = PromptPerformanceData(
            prompt_id=prompt.template_id,
            execution_timestamp=datetime.now(),
            query="Sample medical query",
            response="Sample medical response",
            metrics={},
            medical_accuracy=np.random.normal(0.85, 0.1),
            citation_count=np.random.poisson(3),
            citation_quality=np.random.normal(0.90, 0.05),
            clinical_utility_score=np.random.normal(0.80, 0.1),
            response_time_ms=np.random.normal(1500, 300)
        )

        # Add metric values
        for metric in target_metrics:
            if metric == PerformanceMetric.MEDICAL_ACCURACY:
                performance.metrics[metric] = performance.medical_accuracy
            elif metric == PerformanceMetric.CLINICAL_RELEVANCE:
                performance.metrics[metric] = performance.clinical_utility_score
            elif metric == PerformanceMetric.CITATION_QUALITY:
                performance.metrics[metric] = performance.citation_quality
            elif metric == PerformanceMetric.RESPONSE_TIME:
                performance.metrics[metric] = 1.0 - min(1.0, performance.response_time_ms / 5000)
            else:
                performance.metrics[metric] = np.random.normal(0.75, 0.1)

        # Clip values to valid ranges
        performance.medical_accuracy = max(0.0, min(1.0, performance.medical_accuracy))
        performance.citation_quality = max(0.0, min(1.0, performance.citation_quality))
        performance.clinical_utility_score = max(0.0, min(1.0, performance.clinical_utility_score))

        return performance

    def _calculate_statistical_significance(self, arm_rewards: List[List[float]]) -> Dict[str, float]:
        """Calculate statistical significance between variants"""

        significance_results = {}

        if len(arm_rewards) >= 2:
            # Perform pairwise t-tests
            for i in range(len(arm_rewards)):
                for j in range(i + 1, len(arm_rewards)):
                    if arm_rewards[i] and arm_rewards[j]:
                        t_stat, p_value = stats.ttest_ind(arm_rewards[i], arm_rewards[j])
                        significance_results[f'variant_{i}_vs_{j}'] = p_value

        return significance_results


async def main():
    """Example usage of the Prompt Optimization System"""

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    logger = logging.getLogger(__name__)
    logger.info("Starting Prompt Optimization System Demo")

    # Create base prompt template
    base_prompt = PromptTemplate(
        template_id="clinical_evidence_base_v1",
        prompt_type=PromptType.CLINICAL_EVIDENCE,
        specialty=MedicalSpecialty.ONCOLOGY,
        system_prompt="""You are a medical expert AI assistant specializing in clinical evidence synthesis.
        Provide evidence-based responses with proper citations and consider safety implications.""",
        user_prompt_template="""Based on the latest clinical evidence, please provide information about {query}.
        Include relevant studies, efficacy data, and safety considerations.""",
        target_conditions=["cancer", "oncology", "chemotherapy"],
        evidence_requirements=["peer_reviewed", "clinical_trials", "systematic_reviews"],
        safety_considerations=["adverse_events", "contraindications", "drug_interactions"]
    )

    # Initialize optimizer (mock metrics collector for demo)
    class MockMetricsCollector:
        pass

    optimizer = PromptOptimizer(MockMetricsCollector())

    # Analyze base prompt quality
    analyzer = MedicalPromptAnalyzer()
    quality_analysis = await analyzer.analyze_prompt_quality(base_prompt)

    logger.info("Base Prompt Quality Analysis:")
    for metric, score in quality_analysis.items():
        logger.info(f"  {metric}: {score:.3f}")

    # Optimize prompt using Bayesian optimization
    optimized_prompt = await optimizer.optimize_prompt(
        base_prompt,
        strategy=OptimizationStrategy.BAYESIAN,
        target_metrics=[
            PerformanceMetric.MEDICAL_ACCURACY,
            PerformanceMetric.CLINICAL_RELEVANCE,
            PerformanceMetric.CITATION_QUALITY
        ],
        optimization_budget=50
    )

    logger.info(f"Optimization completed!")
    logger.info(f"Optimized prompt ID: {optimized_prompt.template_id}")
    logger.info(f"Optimized parameters: {optimized_prompt.parameters}")

    # Run A/B test
    variant_1 = optimizer._create_prompt_variant(base_prompt, {'style': 'clinical', 'detail_level': 'detailed'})
    variant_2 = optimizer._create_prompt_variant(base_prompt, {'style': 'academic', 'detail_level': 'comprehensive'})

    ab_test_result = await optimizer.run_ab_test(
        prompt_variants=[variant_1, variant_2],
        test_name="Clinical vs Academic Style Test",
        sample_size=100
    )

    logger.info(f"A/B Test Results:")
    logger.info(f"  Winner: {ab_test_result.winner}")
    logger.info(f"  Samples: {ab_test_result.current_sample_count}")
    logger.info(f"  Statistical Significance: {ab_test_result.statistical_significance}")

    logger.info("Prompt Optimization System Demo Complete")


if __name__ == "__main__":
    asyncio.run(main())