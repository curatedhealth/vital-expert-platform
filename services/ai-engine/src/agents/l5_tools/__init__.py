"""
VITAL Path AI Services - L5 Tool Registry

Central registry for all 64+ L5 Tools across 17 domains.
L5 tools provide direct API access with no LLM cost.
Reusable across all services (Ask Expert, Panel, etc.)

Usage:
    from agents.l5_tools import create_l5_tool, get_tool_config
    
    # Create any tool by key
    tool = create_l5_tool("pubmed")
    result = await tool.execute({"query": "cancer treatment"})
    
    # Get tool configuration
    config = get_tool_config("openfda")

Naming Convention:
- Module: l5_{domain}.py
- Class: {Domain}L5Tool
- Factory: create_{domain}_tool(tool_key)

Domains (17):
- Literature (6): pubmed, cochrane, embase, semantic_scholar, google_scholar, openalex
- Academic (5): arxiv, biorxiv, medrxiv, crossref, unpaywall
- Regulatory (7): openfda, dailymed, clinicaltrials, drugbank, ema, orange_book, faers
- Medical (6): umls, snomed, meddra, who_atc, rxnorm, loinc
- Bioinformatics (6): ncbi, ensembl, uniprot, blast, biopython, string
- NLP (4): scispacy, huggingface, openai_embeddings, presidio
- Statistics (4): scipy, statsmodels, r_stats, calculator
- RWE (4): omop, hades, ohdsi, sentinel
- HEOR (4): nice, icer, cms_medicare, iqvia_heor
- EHR (4): fhir, hl7, cds_hooks, smart
- Digital Health (4): healthkit, fitbit, terra, withings
- Imaging (3): dicom, ohif, orthanc
- Privacy (3): presidio_pii, anonymizer, synthetic_data
- Data Quality (3): great_expectations, data_profiler, validator
- AI Frameworks (3): langchain, huggingface_transformers, pytorch_medical
- Clinical Systems (3): epic_fhir, cerner_fhir, meditech
- General (4): web_search, rag, calculator, file_processor
"""

from typing import Dict, Type, Optional, Any, List

# Base imports
from .l5_base import (
    L5BaseTool,
    ToolConfig,
    L5Result,
    ToolTier,
    AdapterType,
    AuthType,
)

# Domain imports - Literature
from .l5_literature import (
    LiteratureL5Tool,
    LITERATURE_TOOL_CONFIGS,
    LITERATURE_TOOL_KEYS,
    create_literature_tool,
)

# Domain imports - Academic
from .l5_academic import (
    AcademicL5Tool,
    AcademicSource,
    ACADEMIC_SOURCE_CONFIG,
    create_academic_tool,
)
# Compatibility aliases
ACADEMIC_TOOL_CONFIGS = ACADEMIC_SOURCE_CONFIG
ACADEMIC_TOOL_KEYS = [s.value for s in AcademicSource]

# Domain imports - Regulatory
from .l5_regulatory import (
    RegulatoryL5Tool,
    REGULATORY_TOOL_CONFIGS,
    REGULATORY_TOOL_KEYS,
    create_regulatory_tool,
)

# Domain imports - Medical
from .l5_medical import (
    MedicalL5Tool,
    MedicalSource,
    MEDICAL_SOURCE_CONFIG,
    create_medical_tool,
)
# Compatibility aliases
MEDICAL_TOOL_CONFIGS = MEDICAL_SOURCE_CONFIG
MEDICAL_TOOL_KEYS = [s.value for s in MedicalSource]

# Domain imports - Bioinformatics
from .l5_bioinformatics import (
    BioinfoL5Tool,
    BIOINFO_TOOL_CONFIGS,
    BIOINFO_TOOL_KEYS,
    create_bioinfo_tool,
)

# Domain imports - NLP
from .l5_nlp import (
    NLPL5Tool,
    NLP_TOOL_CONFIGS,
    NLP_TOOL_KEYS,
    create_nlp_tool,
)

# Domain imports - Statistics
from .l5_statistics import (
    StatisticsL5Tool,
    STATISTICS_TOOL_CONFIGS,
    STATISTICS_TOOL_KEYS,
    create_statistics_tool,
)

# Domain imports - RWE
from .l5_rwe import (
    RWEL5Tool,
    RWE_TOOL_CONFIGS,
    RWE_TOOL_KEYS,
    create_rwe_tool,
)

# Domain imports - HEOR
from .l5_heor import (
    HEORL5Tool,
    HEOR_TOOL_CONFIGS,
    HEOR_TOOL_KEYS,
    create_heor_tool,
)

# Domain imports - EHR
from .l5_ehr import (
    EHRL5Tool,
    EHR_TOOL_CONFIGS,
    EHR_TOOL_KEYS,
    create_ehr_tool,
)

# Domain imports - Digital Health
from .l5_digital_health import (
    DigitalHealthL5Tool,
    DIGITAL_HEALTH_TOOL_CONFIGS,
    DIGITAL_HEALTH_TOOL_KEYS,
    create_digital_health_tool,
)

# Domain imports - Imaging
from .l5_imaging import (
    ImagingL5Tool,
    IMAGING_TOOL_CONFIGS,
    IMAGING_TOOL_KEYS,
    create_imaging_tool,
)

# Domain imports - Privacy
from .l5_privacy import (
    PrivacyL5Tool,
    PRIVACY_TOOL_CONFIGS,
    PRIVACY_TOOL_KEYS,
    create_privacy_tool,
)

# Domain imports - Data Quality
from .l5_data_quality import (
    DataQualityL5Tool,
    DATA_QUALITY_TOOL_CONFIGS,
    DATA_QUALITY_TOOL_KEYS,
    create_data_quality_tool,
)

# Domain imports - AI Frameworks
from .l5_ai_frameworks import (
    AIFrameworksL5Tool,
    AI_FRAMEWORKS_TOOL_CONFIGS,
    AI_FRAMEWORKS_TOOL_KEYS,
    create_ai_frameworks_tool,
)

# Domain imports - Clinical Systems
from .l5_clinical_systems import (
    ClinicalSystemsL5Tool,
    CLINICAL_SYSTEMS_TOOL_CONFIGS,
    CLINICAL_SYSTEMS_TOOL_KEYS,
    create_clinical_systems_tool,
)

# Domain imports - General
from .l5_general import (
    GeneralL5Tool,
    GeneralSource,
    GENERAL_SOURCE_CONFIG,
    create_general_tool,
)
# Compatibility aliases
GENERAL_TOOL_CONFIGS = GENERAL_SOURCE_CONFIG
GENERAL_TOOL_KEYS = [s.value for s in GeneralSource]


# ============================================================================
# GLOBAL REGISTRY
# ============================================================================

TOOL_DOMAIN_MAP: Dict[str, Type[L5BaseTool]] = {}
TOOL_FACTORY_MAP: Dict[str, callable] = {}
ALL_TOOL_CONFIGS: Dict[str, ToolConfig] = {}


def _register_domain(
    configs: Dict[str, ToolConfig],
    tool_class: Type[L5BaseTool],
    factory: callable
):
    """Register all tools from a domain."""
    for key, config in configs.items():
        TOOL_DOMAIN_MAP[key] = tool_class
        TOOL_FACTORY_MAP[key] = factory
        ALL_TOOL_CONFIGS[key] = config


# Register all domains
_register_domain(LITERATURE_TOOL_CONFIGS, LiteratureL5Tool, create_literature_tool)
_register_domain(ACADEMIC_TOOL_CONFIGS, AcademicL5Tool, create_academic_tool)
_register_domain(REGULATORY_TOOL_CONFIGS, RegulatoryL5Tool, create_regulatory_tool)
_register_domain(MEDICAL_TOOL_CONFIGS, MedicalL5Tool, create_medical_tool)
_register_domain(BIOINFO_TOOL_CONFIGS, BioinfoL5Tool, create_bioinfo_tool)
_register_domain(NLP_TOOL_CONFIGS, NLPL5Tool, create_nlp_tool)
_register_domain(STATISTICS_TOOL_CONFIGS, StatisticsL5Tool, create_statistics_tool)
_register_domain(RWE_TOOL_CONFIGS, RWEL5Tool, create_rwe_tool)
_register_domain(HEOR_TOOL_CONFIGS, HEORL5Tool, create_heor_tool)
_register_domain(EHR_TOOL_CONFIGS, EHRL5Tool, create_ehr_tool)
_register_domain(DIGITAL_HEALTH_TOOL_CONFIGS, DigitalHealthL5Tool, create_digital_health_tool)
_register_domain(IMAGING_TOOL_CONFIGS, ImagingL5Tool, create_imaging_tool)
_register_domain(PRIVACY_TOOL_CONFIGS, PrivacyL5Tool, create_privacy_tool)
_register_domain(DATA_QUALITY_TOOL_CONFIGS, DataQualityL5Tool, create_data_quality_tool)
_register_domain(AI_FRAMEWORKS_TOOL_CONFIGS, AIFrameworksL5Tool, create_ai_frameworks_tool)
_register_domain(CLINICAL_SYSTEMS_TOOL_CONFIGS, ClinicalSystemsL5Tool, create_clinical_systems_tool)
_register_domain(GENERAL_TOOL_CONFIGS, GeneralL5Tool, create_general_tool)


# ============================================================================
# FACTORY FUNCTIONS
# ============================================================================

def create_l5_tool(tool_key: str) -> L5BaseTool:
    """Factory function to create any L5 tool by key."""
    if tool_key not in TOOL_FACTORY_MAP:
        raise ValueError(f"Unknown tool: {tool_key}. Available: {list(ALL_TOOL_CONFIGS.keys())}")
    
    factory = TOOL_FACTORY_MAP[tool_key]
    return factory(tool_key)


def get_tool_config(tool_key: str) -> ToolConfig:
    """Get configuration for a tool."""
    if tool_key not in ALL_TOOL_CONFIGS:
        raise ValueError(f"Unknown tool: {tool_key}")
    return ALL_TOOL_CONFIGS[tool_key]


def list_tools_by_category(category: str) -> Dict[str, ToolConfig]:
    """List all tools in a category."""
    return {k: v for k, v in ALL_TOOL_CONFIGS.items() if v.category == category}


def list_tools_by_tier(tier: int) -> Dict[str, ToolConfig]:
    """List all tools with given tier."""
    return {k: v for k, v in ALL_TOOL_CONFIGS.items() if v.tier == tier}


def list_all_tools() -> Dict[str, ToolConfig]:
    """List all tools."""
    return ALL_TOOL_CONFIGS.copy()


def get_tool_count() -> Dict[str, int]:
    """Get tool count by domain."""
    return {
        "literature": len(LITERATURE_TOOL_KEYS),
        "academic": len(ACADEMIC_TOOL_KEYS),
        "regulatory": len(REGULATORY_TOOL_KEYS),
        "medical": len(MEDICAL_TOOL_KEYS),
        "bioinformatics": len(BIOINFO_TOOL_KEYS),
        "nlp": len(NLP_TOOL_KEYS),
        "statistics": len(STATISTICS_TOOL_KEYS),
        "rwe": len(RWE_TOOL_KEYS),
        "heor": len(HEOR_TOOL_KEYS),
        "ehr": len(EHR_TOOL_KEYS),
        "digital_health": len(DIGITAL_HEALTH_TOOL_KEYS),
        "imaging": len(IMAGING_TOOL_KEYS),
        "privacy": len(PRIVACY_TOOL_KEYS),
        "data_quality": len(DATA_QUALITY_TOOL_KEYS),
        "ai_frameworks": len(AI_FRAMEWORKS_TOOL_KEYS),
        "clinical_systems": len(CLINICAL_SYSTEMS_TOOL_KEYS),
        "general": len(GENERAL_TOOL_KEYS),
        "total": len(ALL_TOOL_CONFIGS),
    }


# ============================================================================
# EXPORTS
# ============================================================================

__all__ = [
    # Factory functions
    "create_l5_tool",
    "get_tool_config",
    "list_tools_by_category",
    "list_tools_by_tier",
    "list_all_tools",
    "get_tool_count",
    
    # Base classes
    "L5BaseTool",
    "ToolConfig",
    "L5Result",
    "ToolTier",
    "AdapterType",
    "AuthType",
    
    # Domain classes
    "LiteratureL5Tool",
    "AcademicL5Tool",
    "RegulatoryL5Tool",
    "MedicalL5Tool",
    "BioinfoL5Tool",
    "NLPL5Tool",
    "StatisticsL5Tool",
    "RWEL5Tool",
    "HEORL5Tool",
    "EHRL5Tool",
    "DigitalHealthL5Tool",
    "ImagingL5Tool",
    "PrivacyL5Tool",
    "DataQualityL5Tool",
    "AIFrameworksL5Tool",
    "ClinicalSystemsL5Tool",
    "GeneralL5Tool",
    
    # Domain factories
    "create_literature_tool",
    "create_academic_tool",
    "create_regulatory_tool",
    "create_medical_tool",
    "create_bioinfo_tool",
    "create_nlp_tool",
    "create_statistics_tool",
    "create_rwe_tool",
    "create_heor_tool",
    "create_ehr_tool",
    "create_digital_health_tool",
    "create_imaging_tool",
    "create_privacy_tool",
    "create_data_quality_tool",
    "create_ai_frameworks_tool",
    "create_clinical_systems_tool",
    "create_general_tool",
    
    # Configs
    "ALL_TOOL_CONFIGS",
    "LITERATURE_TOOL_CONFIGS",
    "ACADEMIC_TOOL_CONFIGS",
    "REGULATORY_TOOL_CONFIGS",
    "MEDICAL_TOOL_CONFIGS",
    "BIOINFO_TOOL_CONFIGS",
    "NLP_TOOL_CONFIGS",
    "STATISTICS_TOOL_CONFIGS",
    "RWE_TOOL_CONFIGS",
    "HEOR_TOOL_CONFIGS",
    "EHR_TOOL_CONFIGS",
    "DIGITAL_HEALTH_TOOL_CONFIGS",
    "IMAGING_TOOL_CONFIGS",
    "PRIVACY_TOOL_CONFIGS",
    "DATA_QUALITY_TOOL_CONFIGS",
    "AI_FRAMEWORKS_TOOL_CONFIGS",
    "CLINICAL_SYSTEMS_TOOL_CONFIGS",
    "GENERAL_TOOL_CONFIGS",
]
