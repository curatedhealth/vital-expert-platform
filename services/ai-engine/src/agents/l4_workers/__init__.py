"""
VITAL Path AI Services - L4 Worker Registry

Central registry for all 103 L4 Context Workers across 21 domains.
L4 workers use Claude Haiku for cost-effective evidence preparation.
Reusable across all services (Ask Expert, Panel, etc.)

Usage:
    from agents.l4_workers import create_l4_worker, get_worker_config
    
    # Create any worker by key
    worker = create_l4_worker("data_extractor")
    result = await worker.execute("extract_entities", {"text": "..."})
    
    # Get worker configuration
    config = get_worker_config("quality_assessor")

Naming Convention:
- Module: l4_{domain}.py
- Class: {Domain}L4Worker
- Factory: create_{domain}_worker(worker_key)

Domains (21):
- Data Processing (5): data_extractor, document_processor, citation_manager, quality_assessor, nlp_processor
- Analysis (5): statistical_analyzer, bias_detector, trend_analyzer, cost_analyzer, outcome_evaluator
- Risk (3): risk_flagger, safety_monitor, compliance_checker
- Strategic (5): market_researcher, competitive_analyst, value_demonstrator, scenario_modeler, recommendation_engine
- Evidence (5): literature_searcher, evidence_synthesizer, meta_analyst, systematic_reviewer, quality_rater
- Regulatory (5): fda_compliance_checker, drug_label_analyzer, clinical_trial_validator, adverse_event_processor, terminology_mapper
- Clinical (5): protocol_analyzer, eligibility_screener, endpoint_evaluator, biomarker_processor, clinical_calculator
- HEOR (5): cost_effectiveness_modeler, budget_impact_analyst, qaly_calculator, market_access_strategist, value_dossier_builder
- Bioinformatics (5): sequence_analyzer, variant_annotator, pathway_analyst, genomics_processor, protein_structure_analyst
- Digital Health (5): wearable_data_processor, digital_biomarker_analyst, mhealth_app_evaluator, patient_engagement_analyst, remote_monitoring_processor
- RWE (5): omop_converter, cohort_builder, claims_analyst, registry_processor, outcomes_researcher
- Medical Affairs (5): msl_content_generator, kol_mapper, medical_information_responder, publication_planner, congress_analyzer
- Commercial (5): market_analyzer, sales_forecaster, pricing_strategist, launch_planner, territory_optimizer
- Decision Making (5): decision_tree_builder, multi_criteria_analyzer, risk_benefit_assessor, scenario_evaluator, consensus_builder
- Financial (5): roi_calculator, npv_analyzer, portfolio_valuator, cost_modeler, investment_appraiser
- Design (5): trial_designer, protocol_builder, study_optimizer, endpoint_selector, sample_size_calculator
- Communication (5): scientific_writer, presentation_builder, plain_language_summarizer, translation_validator, audience_adapter
- Design Thinking (5): user_researcher, journey_mapper, ideation_facilitator, prototype_evaluator, service_blueprint_builder
- Innovation (5): trend_scanner, technology_assessor, innovation_portfolio_manager, disruption_analyzer, venture_scout
- Agile (5): sprint_planner, backlog_manager, velocity_tracker, retrospective_facilitator, dependency_mapper
- Operational Excellence (5): process_optimizer, lean_analyst, quality_controller, capacity_planner, continuous_improvement_lead
"""

from typing import Dict, Type, Optional, Any

# Base imports
from .l4_base import (
    L4BaseWorker,
    WorkerConfig,
    WorkerCategory,
    L4WorkerResult,
)

# Domain imports - Data Processing
from .l4_data import (
    DataL4Worker,
    DATA_WORKER_CONFIGS,
    DATA_WORKER_KEYS,
    create_data_worker,
)

# Domain imports - Analysis
from .l4_analysis import (
    AnalysisL4Worker,
    ANALYSIS_WORKER_CONFIGS,
    ANALYSIS_WORKER_KEYS,
    create_analysis_worker,
)

# Domain imports - Risk
from .l4_risk import (
    RiskL4Worker,
    RISK_WORKER_CONFIGS,
    RISK_WORKER_KEYS,
    create_risk_worker,
)

# Domain imports - Strategic
from .l4_strategic import (
    StrategicL4Worker,
    STRATEGIC_WORKER_CONFIGS,
    STRATEGIC_WORKER_KEYS,
    create_strategic_worker,
)

# Domain imports - Evidence
from .l4_evidence import (
    EvidenceL4Worker,
    EVIDENCE_WORKER_CONFIGS,
    EVIDENCE_WORKER_KEYS,
    create_evidence_worker,
)

# Domain imports - Regulatory
from .l4_regulatory import (
    RegulatoryL4Worker,
    REGULATORY_WORKER_CONFIGS,
    REGULATORY_WORKER_KEYS,
    create_regulatory_worker,
)

# Domain imports - Clinical
from .l4_clinical import (
    ClinicalL4Worker,
    CLINICAL_WORKER_CONFIGS,
    CLINICAL_WORKER_KEYS,
    create_clinical_worker,
)

# Domain imports - HEOR
from .l4_heor import (
    HEORL4Worker,
    HEOR_WORKER_CONFIGS,
    HEOR_WORKER_KEYS,
    create_heor_worker,
)

# Domain imports - Bioinformatics
from .l4_bioinformatics import (
    BioinfoL4Worker,
    BIOINFO_WORKER_CONFIGS,
    BIOINFO_WORKER_KEYS,
    create_bioinfo_worker,
)

# Domain imports - Digital Health
from .l4_digital_health import (
    DigitalHealthL4Worker,
    DIGITAL_HEALTH_WORKER_CONFIGS,
    DIGITAL_HEALTH_WORKER_KEYS,
    create_digital_health_worker,
)

# Domain imports - RWE
from .l4_rwe import (
    RWEL4Worker,
    RWE_WORKER_CONFIGS,
    RWE_WORKER_KEYS,
    create_rwe_worker,
)

# Domain imports - Medical Affairs
from .l4_medical_affairs import (
    MedicalAffairsL4Worker,
    MEDICAL_AFFAIRS_WORKER_CONFIGS,
    MEDICAL_AFFAIRS_WORKER_KEYS,
    create_medical_affairs_worker,
)

# Domain imports - Commercial
from .l4_commercial import (
    CommercialL4Worker,
    COMMERCIAL_WORKER_CONFIGS,
    COMMERCIAL_WORKER_KEYS,
    create_commercial_worker,
)

# Domain imports - Decision Making
from .l4_decision import (
    DecisionL4Worker,
    DECISION_WORKER_CONFIGS,
    DECISION_WORKER_KEYS,
    create_decision_worker,
)

# Domain imports - Financial
from .l4_financial import (
    FinancialL4Worker,
    FINANCIAL_WORKER_CONFIGS,
    FINANCIAL_WORKER_KEYS,
    create_financial_worker,
)

# Domain imports - Design (Trial/Protocol Design)
from .l4_design import (
    DesignL4Worker,
    DESIGN_WORKER_CONFIGS,
    DESIGN_WORKER_KEYS,
    create_design_worker,
)

# Domain imports - Communication
from .l4_communication import (
    CommunicationL4Worker,
    COMMUNICATION_WORKER_CONFIGS,
    COMMUNICATION_WORKER_KEYS,
    create_communication_worker,
)

# Domain imports - Design Thinking
from .l4_design_thinking import (
    DesignThinkingL4Worker,
    DESIGN_THINKING_WORKER_CONFIGS,
    DESIGN_THINKING_WORKER_KEYS,
    create_design_thinking_worker,
)

# Domain imports - Innovation
from .l4_innovation import (
    InnovationL4Worker,
    INNOVATION_WORKER_CONFIGS,
    INNOVATION_WORKER_KEYS,
    create_innovation_worker,
)

# Domain imports - Agile
from .l4_agile import (
    AgileL4Worker,
    AGILE_WORKER_CONFIGS,
    AGILE_WORKER_KEYS,
    create_agile_worker,
)

# Domain imports - Operational Excellence
from .l4_operational import (
    OperationalL4Worker,
    OPERATIONAL_WORKER_CONFIGS,
    OPERATIONAL_WORKER_KEYS,
    create_operational_worker,
)
from .l4_data_processor import L4DataProcessor

# Mission-engine lightweight workers (L4-DE/PM/GD/CS)
from .worker_factory import (
    WorkerFactory,
    L4DataExtractor,
    L4PatternMatcher,
    L4GapDetector,
    L4ComparitiveSynthesizer,
)


# ============================================================================
# GLOBAL REGISTRY
# ============================================================================

WORKER_DOMAIN_MAP: Dict[str, Type[L4BaseWorker]] = {}
WORKER_FACTORY_MAP: Dict[str, callable] = {}
ALL_WORKER_CONFIGS: Dict[str, WorkerConfig] = {}


def _register_domain(
    configs: Dict[str, WorkerConfig],
    worker_class: Type[L4BaseWorker],
    factory: callable
):
    """Register all workers from a domain."""
    for key, config in configs.items():
        WORKER_DOMAIN_MAP[key] = worker_class
        WORKER_FACTORY_MAP[key] = factory
        ALL_WORKER_CONFIGS[key] = config


# Register all domains
_register_domain(DATA_WORKER_CONFIGS, DataL4Worker, create_data_worker)
_register_domain(ANALYSIS_WORKER_CONFIGS, AnalysisL4Worker, create_analysis_worker)
_register_domain(RISK_WORKER_CONFIGS, RiskL4Worker, create_risk_worker)
_register_domain(STRATEGIC_WORKER_CONFIGS, StrategicL4Worker, create_strategic_worker)
_register_domain(EVIDENCE_WORKER_CONFIGS, EvidenceL4Worker, create_evidence_worker)
_register_domain(REGULATORY_WORKER_CONFIGS, RegulatoryL4Worker, create_regulatory_worker)
_register_domain(CLINICAL_WORKER_CONFIGS, ClinicalL4Worker, create_clinical_worker)
_register_domain(HEOR_WORKER_CONFIGS, HEORL4Worker, create_heor_worker)
_register_domain(BIOINFO_WORKER_CONFIGS, BioinfoL4Worker, create_bioinfo_worker)
_register_domain(DIGITAL_HEALTH_WORKER_CONFIGS, DigitalHealthL4Worker, create_digital_health_worker)
_register_domain(RWE_WORKER_CONFIGS, RWEL4Worker, create_rwe_worker)
_register_domain(MEDICAL_AFFAIRS_WORKER_CONFIGS, MedicalAffairsL4Worker, create_medical_affairs_worker)
_register_domain(COMMERCIAL_WORKER_CONFIGS, CommercialL4Worker, create_commercial_worker)
_register_domain(DECISION_WORKER_CONFIGS, DecisionL4Worker, create_decision_worker)
_register_domain(FINANCIAL_WORKER_CONFIGS, FinancialL4Worker, create_financial_worker)
_register_domain(DESIGN_WORKER_CONFIGS, DesignL4Worker, create_design_worker)
_register_domain(COMMUNICATION_WORKER_CONFIGS, CommunicationL4Worker, create_communication_worker)
_register_domain(DESIGN_THINKING_WORKER_CONFIGS, DesignThinkingL4Worker, create_design_thinking_worker)
_register_domain(INNOVATION_WORKER_CONFIGS, InnovationL4Worker, create_innovation_worker)
_register_domain(AGILE_WORKER_CONFIGS, AgileL4Worker, create_agile_worker)
_register_domain(OPERATIONAL_WORKER_CONFIGS, OperationalL4Worker, create_operational_worker)


# ============================================================================
# FACTORY FUNCTIONS
# ============================================================================

def create_l4_worker(worker_key: str, l5_tools: Dict = None) -> L4BaseWorker:
    """Factory function to create any L4 worker by key."""
    if worker_key not in WORKER_FACTORY_MAP:
        raise ValueError(f"Unknown worker: {worker_key}. Available: {list(ALL_WORKER_CONFIGS.keys())}")
    
    factory = WORKER_FACTORY_MAP[worker_key]
    return factory(worker_key, l5_tools)


def get_worker_config(worker_key: str) -> WorkerConfig:
    """Get configuration for a worker."""
    if worker_key not in ALL_WORKER_CONFIGS:
        raise ValueError(f"Unknown worker: {worker_key}")
    return ALL_WORKER_CONFIGS[worker_key]


def list_workers_by_category(category: WorkerCategory) -> Dict[str, WorkerConfig]:
    """List all workers in a category."""
    return {k: v for k, v in ALL_WORKER_CONFIGS.items() if v.category == category}


def list_all_workers() -> Dict[str, WorkerConfig]:
    """List all workers."""
    return ALL_WORKER_CONFIGS.copy()


def get_worker_count() -> Dict[str, int]:
    """Get worker count by domain."""
    return {
        "data_processing": len(DATA_WORKER_KEYS),
        "analysis": len(ANALYSIS_WORKER_KEYS),
        "risk": len(RISK_WORKER_KEYS),
        "strategic": len(STRATEGIC_WORKER_KEYS),
        "evidence": len(EVIDENCE_WORKER_KEYS),
        "regulatory": len(REGULATORY_WORKER_KEYS),
        "clinical": len(CLINICAL_WORKER_KEYS),
        "heor": len(HEOR_WORKER_KEYS),
        "bioinformatics": len(BIOINFO_WORKER_KEYS),
        "digital_health": len(DIGITAL_HEALTH_WORKER_KEYS),
        "rwe": len(RWE_WORKER_KEYS),
        "medical_affairs": len(MEDICAL_AFFAIRS_WORKER_KEYS),
        "commercial": len(COMMERCIAL_WORKER_KEYS),
        "decision_making": len(DECISION_WORKER_KEYS),
        "financial": len(FINANCIAL_WORKER_KEYS),
        "design": len(DESIGN_WORKER_KEYS),
        "communication": len(COMMUNICATION_WORKER_KEYS),
        "design_thinking": len(DESIGN_THINKING_WORKER_KEYS),
        "innovation": len(INNOVATION_WORKER_KEYS),
        "agile": len(AGILE_WORKER_KEYS),
        "operational_excellence": len(OPERATIONAL_WORKER_KEYS),
        "total": len(ALL_WORKER_CONFIGS),
    }


def get_workers_for_task_type(task_type: str) -> Dict[str, WorkerConfig]:
    """Find workers that support a specific task type."""
    return {
        k: v for k, v in ALL_WORKER_CONFIGS.items() 
        if task_type in v.task_types
    }


def get_workers_with_l5_tool(tool_key: str) -> Dict[str, WorkerConfig]:
    """Find workers that can use a specific L5 tool."""
    return {
        k: v for k, v in ALL_WORKER_CONFIGS.items() 
        if tool_key in v.allowed_l5_tools
    }


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    # Factory functions
    "create_l4_worker",
    "get_worker_config",
    "list_workers_by_category",
    "list_all_workers",
    "get_worker_count",
    "get_workers_for_task_type",
    "get_workers_with_l5_tool",
    
    # Base classes
    "L4BaseWorker",
    "WorkerConfig",
    "WorkerCategory",
    "L4WorkerResult",
    
    # Domain classes
    "DataL4Worker",
    "AnalysisL4Worker",
    "RiskL4Worker",
    "StrategicL4Worker",
    "EvidenceL4Worker",
    "RegulatoryL4Worker",
    "ClinicalL4Worker",
    "HEORL4Worker",
    "BioinfoL4Worker",
    "DigitalHealthL4Worker",
    "RWEL4Worker",
    "MedicalAffairsL4Worker",
    "CommercialL4Worker",
    "DecisionL4Worker",
    "FinancialL4Worker",
    "DesignL4Worker",
    "CommunicationL4Worker",
    "DesignThinkingL4Worker",
    "InnovationL4Worker",
    "AgileL4Worker",
    "OperationalL4Worker",
    "L4DataProcessor",
    "L4DataExtractor",
    "L4PatternMatcher",
    "L4GapDetector",
    "L4ComparitiveSynthesizer",
    "WorkerFactory",
    
    # Domain factories
    "create_data_worker",
    "create_analysis_worker",
    "create_risk_worker",
    "create_strategic_worker",
    "create_evidence_worker",
    "create_regulatory_worker",
    "create_clinical_worker",
    "create_heor_worker",
    "create_bioinfo_worker",
    "create_digital_health_worker",
    "create_rwe_worker",
    "create_medical_affairs_worker",
    "create_commercial_worker",
    "create_decision_worker",
    "create_financial_worker",
    "create_design_worker",
    "create_communication_worker",
    "create_design_thinking_worker",
    "create_innovation_worker",
    "create_agile_worker",
    "create_operational_worker",
    
    # Configs
    "ALL_WORKER_CONFIGS",
    "DATA_WORKER_CONFIGS",
    "ANALYSIS_WORKER_CONFIGS",
    "RISK_WORKER_CONFIGS",
    "STRATEGIC_WORKER_CONFIGS",
    "EVIDENCE_WORKER_CONFIGS",
    "REGULATORY_WORKER_CONFIGS",
    "CLINICAL_WORKER_CONFIGS",
    "HEOR_WORKER_CONFIGS",
    "BIOINFO_WORKER_CONFIGS",
    "DIGITAL_HEALTH_WORKER_CONFIGS",
    "RWE_WORKER_CONFIGS",
    "MEDICAL_AFFAIRS_WORKER_CONFIGS",
    "COMMERCIAL_WORKER_CONFIGS",
    "DECISION_WORKER_CONFIGS",
    "FINANCIAL_WORKER_CONFIGS",
    "DESIGN_WORKER_CONFIGS",
    "COMMUNICATION_WORKER_CONFIGS",
    "DESIGN_THINKING_WORKER_CONFIGS",
    "INNOVATION_WORKER_CONFIGS",
    "AGILE_WORKER_CONFIGS",
    "OPERATIONAL_WORKER_CONFIGS",
]
