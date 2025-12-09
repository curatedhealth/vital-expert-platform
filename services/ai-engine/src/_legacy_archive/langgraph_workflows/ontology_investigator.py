"""
Ontology Investigator - AI Companion for Enterprise Ontology Analysis

An intelligent assistant that analyzes organizational structure (L0-L7 layers)
to identify AI adoption opportunities and optimize agent coverage.

PURPOSE:
- Help clients discover gaps in AI coverage across their organization
- Identify high-value roles for AI agent deployment
- Analyze persona adoption patterns by archetype
- Map JTBDs to potential AI opportunities
- Provide strategic recommendations for AI transformation

8-LAYER ONTOLOGY ANALYSIS:
┌─────────────────────────────────────────────────────────────────────────────┐
│ L7: AI AGENTS LAYER              [972 agents, 2,245 agent-role mappings]    │
│ L6: JTBD-ROLE MAPPINGS           [3,451 mappings]                           │
│ L5: JOBS-TO-BE-DONE (JTBD)       [526 JTBDs]                               │
│ L4: PERSONAS LAYER               [1,798 personas, 4 archetypes per role]   │
│ L3: ROLES LAYER                  [949 roles]                               │
│ L2: DEPARTMENTS LAYER            [149 departments]                         │
│ L1: FUNCTIONS LAYER              [27 functions]                            │
│ L0: TENANTS LAYER                [12 tenants]                              │
└─────────────────────────────────────────────────────────────────────────────┘

REASONING MODELS (5-Tier Fallback):
- Tier 1: Claude Opus 4.5 (95% confidence) - Primary
- Tier 2: OpenAI o1 (92% confidence) - Secondary
- Tier 3: Gemini 2.5 Pro (88% confidence) - Tertiary
- Tier 4: HuggingFace Models (context-aware selection)
- Tier 5: GPT-4o (82% confidence) - Fallback

ANALYSIS TYPES:
1. Gap Analysis - Find roles/functions without AI coverage
2. Adoption Analysis - Track AI adoption by persona archetype
3. Opportunity Scoring - Rank roles by AI transformation potential
4. Coverage Heatmap - Visualize agent distribution across org
5. JTBD-AI Mapping - Match jobs to AI capabilities
6. Persona Insights - Understand archetype distribution
7. Strategic Recommendations - Prioritized AI deployment plan
"""

import asyncio
import os
from typing import Dict, Any, Optional, List, TypedDict
from datetime import datetime
from enum import Enum
import structlog

# LangGraph imports
from langgraph.graph import StateGraph, END

# LangChain imports
try:
    from langchain_anthropic import ChatAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from langchain_openai import ChatOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from langchain_community.llms import HuggingFaceEndpoint
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    try:
        from langchain_huggingface import HuggingFaceEndpoint
        HUGGINGFACE_AVAILABLE = True
    except ImportError:
        HUGGINGFACE_AVAILABLE = False

# Internal imports
from api.dependencies import get_optional_supabase
from core.config import get_settings


def get_supabase_client():
    """Get initialized Supabase client from dependencies.

    Uses get_optional_supabase() to get the client that was initialized
    during app startup via set_supabase_client().
    """
    client = get_optional_supabase()
    if client is None:
        raise RuntimeError("Supabase client not initialized. App may not have started properly.")
    return client

logger = structlog.get_logger()
settings = get_settings()


# =============================================================================
# STATE DEFINITION
# =============================================================================

class OntologyAnalysisType(str, Enum):
    """Types of ontology analysis"""
    GAP_ANALYSIS = "gap_analysis"
    ADOPTION_ANALYSIS = "adoption_analysis"
    OPPORTUNITY_SCORING = "opportunity_scoring"
    COVERAGE_HEATMAP = "coverage_heatmap"
    JTBD_MAPPING = "jtbd_mapping"
    PERSONA_INSIGHTS = "persona_insights"
    STRATEGIC_RECOMMENDATIONS = "strategic_recommendations"
    GENERAL_INQUIRY = "general_inquiry"


class OntologyInvestigatorState(TypedDict):
    """State for Ontology Investigator workflow"""
    # Input
    query: str
    tenant_id: Optional[str]
    function_id: Optional[str]
    department_id: Optional[str]
    role_id: Optional[str]

    # Classification
    analysis_type: Optional[str]
    detected_layers: List[str]  # L0-L7

    # Retrieved Data
    ontology_data: Dict[str, Any]
    aggregated_stats: Dict[str, Any]
    gap_analysis: Dict[str, Any]
    opportunities: List[Dict[str, Any]]

    # Analysis Results
    analysis_result: str
    recommendations: List[Dict[str, Any]]
    citations: List[Dict[str, Any]]

    # Metadata
    confidence: float
    model_used: str
    reasoning_steps: List[Dict[str, Any]]
    errors: List[str]
    timestamp: str


# =============================================================================
# HUGGINGFACE MODELS FOR ENTERPRISE/BUSINESS ANALYSIS
# =============================================================================

HUGGINGFACE_MODELS = {
    # Business/Strategy Models (Priority for enterprise analysis)
    "deepseek-r1": {
        "repo_id": "deepseek-ai/DeepSeek-R1",
        "confidence": 0.87,
        "domain": "reasoning",
        "description": "Chain-of-thought reasoning specialist"
    },
    "qwen2.5-72b": {
        "repo_id": "Qwen/Qwen2.5-72B-Instruct",
        "confidence": 0.85,
        "domain": "general",
        "description": "Strong reasoning and analysis"
    },
    "llama3.3-70b": {
        "repo_id": "meta-llama/Llama-3.3-70B-Instruct",
        "confidence": 0.83,
        "domain": "general",
        "description": "General purpose open-source"
    },
    "mistral-large": {
        "repo_id": "mistralai/Mistral-Large-Instruct-2411",
        "confidence": 0.84,
        "domain": "general",
        "description": "Multilingual enterprise analysis"
    },
    # Medical/Pharma Models (For healthcare org analysis)
    "medgemma-27b": {
        "repo_id": "google/medgemma-27b-text-it",
        "confidence": 0.91,
        "domain": "medical",
        "description": "Healthcare organizational insights"
    },
    "gemma2-27b": {
        "repo_id": "google/gemma-2-27b-it",
        "confidence": 0.89,
        "domain": "medical",
        "description": "Strong medical reasoning"
    },
    "meditron-70b": {
        "repo_id": "CuratedHealth/meditron70b-qlora-1gpu",
        "confidence": 0.88,
        "domain": "medical",
        "description": "Pharma specialist"
    }
}

# Keywords for pharma/healthcare organization analysis
PHARMA_KEYWORDS = [
    "medical affairs", "clinical", "regulatory", "pharmacovigilance", "safety",
    "drug", "pharma", "fda", "ema", "compliance", "gxp", "hcp", "msl",
    "clinical trial", "therapeutic", "oncology", "immunology", "neurology",
    "manufacturing", "quality", "r&d", "research", "development"
]


def select_best_huggingface_model(query: str, analysis_type: str) -> List[tuple]:
    """
    Select the best HuggingFace model based on query context.

    For enterprise ontology analysis:
    - Pharma/healthcare queries → MedGemma, Meditron
    - Business/strategy queries → DeepSeek-R1, Qwen

    Returns list of (model_name, repo_id, confidence) in priority order.
    """
    query_lower = query.lower()
    is_pharma_context = any(kw in query_lower for kw in PHARMA_KEYWORDS)

    if is_pharma_context:
        # Prioritize medical/pharma models for healthcare org analysis
        return [
            ("medgemma-27b", HUGGINGFACE_MODELS["medgemma-27b"]["repo_id"], 0.91),
            ("gemma2-27b", HUGGINGFACE_MODELS["gemma2-27b"]["repo_id"], 0.89),
            ("meditron-70b", HUGGINGFACE_MODELS["meditron-70b"]["repo_id"], 0.88),
            ("deepseek-r1", HUGGINGFACE_MODELS["deepseek-r1"]["repo_id"], 0.87),
            ("qwen2.5-72b", HUGGINGFACE_MODELS["qwen2.5-72b"]["repo_id"], 0.85),
        ]
    else:
        # Business/general enterprise analysis
        return [
            ("deepseek-r1", HUGGINGFACE_MODELS["deepseek-r1"]["repo_id"], 0.87),
            ("qwen2.5-72b", HUGGINGFACE_MODELS["qwen2.5-72b"]["repo_id"], 0.85),
            ("mistral-large", HUGGINGFACE_MODELS["mistral-large"]["repo_id"], 0.84),
            ("llama3.3-70b", HUGGINGFACE_MODELS["llama3.3-70b"]["repo_id"], 0.83),
        ]


# =============================================================================
# DATABASE QUERIES
# =============================================================================


def _sync_query(supabase, table_name: str, select_cols: str, filters: Optional[Dict] = None, limit: Optional[int] = None):
    """Execute a synchronous Supabase query (runs in thread pool when called with asyncio.to_thread)"""
    query = supabase.table(table_name).select(select_cols)
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
    if limit:
        query = query.limit(limit)
    return query.execute()


async def get_ontology_stats(
    tenant_id: Optional[str] = None,
    function_id: Optional[str] = None,
    department_id: Optional[str] = None,
    role_id: Optional[str] = None,
    industry: Optional[str] = None
) -> Dict[str, Any]:
    """Get comprehensive ontology statistics with optional filtering

    Args:
        tenant_id: Legacy - use industry instead (kept for backwards compatibility)
        function_id: Filter by function (e.g., Medical Affairs)
        department_id: Filter by department
        role_id: Filter by specific role
        industry: Filter by industry (Pharmaceuticals, Digital Health, or 'all')
    """
    try:
        supabase = get_supabase_client()

        # Convert industry slug to filter value
        # Industry filtering using 15 standard Healthcare/Life Sciences categories
        industry_filter = None
        if industry and industry not in ("all", "All Industries"):
            # Map slug to actual industry value (supports both slug and display name)
            industry_map = {
                # Slugs (lowercase with hyphens)
                "pharmaceuticals": "Pharmaceuticals",
                "biotechnology": "Biotechnology",
                "medical-devices": "Medical Devices",
                "digital-health": "Digital Health",
                "diagnostics": "Diagnostics",
                "healthcare-providers": "Healthcare Providers",
                "payers": "Payers",
                "cro": "Contract Research Organizations",
                "cdmo": "Contract Development & Manufacturing",
                "health-it": "Health Information Technology",
                "research-institutions": "Research Institutions",
                "regulatory-bodies": "Regulatory Bodies",
                "pharmacy-services": "Pharmacy Services",
                "medical-education": "Medical Education",
                "healthcare-consulting": "Healthcare Consulting",
                # Display names (pass-through)
                "Pharmaceuticals": "Pharmaceuticals",
                "Biotechnology": "Biotechnology",
                "Medical Devices": "Medical Devices",
                "Digital Health": "Digital Health",
                "Diagnostics": "Diagnostics",
                "Healthcare Providers": "Healthcare Providers",
                "Payers": "Payers",
                "Contract Research Organizations": "Contract Research Organizations",
                "Contract Development & Manufacturing": "Contract Development & Manufacturing",
                "Health Information Technology": "Health Information Technology",
                "Research Institutions": "Research Institutions",
                "Regulatory Bodies": "Regulatory Bodies",
                "Pharmacy Services": "Pharmacy Services",
                "Medical Education": "Medical Education",
                "Healthcare Consulting": "Healthcare Consulting"
            }
            industry_filter = industry_map.get(industry, industry)

        # Build role filters
        dept_filters = {"function_id": function_id} if function_id else None
        role_filters = {}
        if function_id:
            role_filters["function_id"] = function_id
        if department_id:
            role_filters["department_id"] = department_id

        # Run queries in thread pool to avoid blocking the event loop
        # Supabase Python client is synchronous, so we use asyncio.to_thread
        # Fetch ALL functions first, then filter by industry in Python
        functions = await asyncio.to_thread(
            _sync_query, supabase, "org_functions", "id, name, slug, tenant_id, industry",
            None  # No database filter - filter in Python
        )

        # Apply industry filter in Python
        if industry_filter:
            functions_data = [f for f in functions.data if f.get("industry") == industry_filter]
            logger.info(f"Filtering by industry={industry_filter}, found {len(functions_data)} functions")
        else:
            functions_data = functions.data

        # Get function IDs for cascading filter (from industry-filtered functions)
        function_ids = {f["id"] for f in functions_data}

        # Get all departments, then filter by industry's functions if needed
        all_departments = await asyncio.to_thread(
            _sync_query, supabase, "org_departments", "id, name, function_id",
            dept_filters if dept_filters else None
        )

        # Filter departments to only those in industry's functions
        if industry_filter and not function_id:
            departments_data = [d for d in all_departments.data if d.get("function_id") in function_ids]
        else:
            departments_data = all_departments.data

        # Build department lookup early
        dept_lookup = {d["id"]: {"name": d["name"], "function_id": d.get("function_id")} for d in departments_data}

        # Get all roles, then filter by industry's functions if needed
        all_roles = await asyncio.to_thread(
            _sync_query, supabase, "org_roles", "id, name, slug, department_id, function_id, seniority_level",
            role_filters if role_filters else None
        )

        # Filter roles to only those in industry's functions
        if industry_filter and not function_id:
            roles_data = [r for r in all_roles.data if r.get("function_id") in function_ids]
        else:
            roles_data = all_roles.data

        personas = await asyncio.to_thread(_sync_query, supabase, "personas", "id, persona_type, source_role_id, function_area")
        jtbds = await asyncio.to_thread(_sync_query, supabase, "jtbd", "id, name, job_type")
        agents = await asyncio.to_thread(_sync_query, supabase, "agents", "id, name, status", {"status": "active"})

        # Get junction table counts
        jtbd_roles = await asyncio.to_thread(_sync_query, supabase, "jtbd_roles", "id")
        agent_roles = await asyncio.to_thread(_sync_query, supabase, "agent_roles", "id")

        # Build function lookup for enriching data (use industry-filtered data)
        function_lookup = {f["id"]: f["name"] for f in functions_data}

        # Filter functions if function_id is specified
        filtered_functions = functions_data
        if function_id:
            filtered_functions = [f for f in functions_data if f["id"] == function_id]

        # Enrich roles with function/department names (up to 100 for display)
        enriched_roles = []
        for role in roles_data[:100]:  # Limit display data to 100
            func_id = role.get("function_id")
            dept_id = role.get("department_id")
            dept_info = dept_lookup.get(dept_id, {})
            enriched_roles.append({
                **role,
                "function_name": function_lookup.get(func_id) or function_lookup.get(dept_info.get("function_id")),
                "department_name": dept_info.get("name")
            })

        # Apply additional filters if needed
        filtered_departments = departments_data
        # Use actual count from filtered data
        actual_role_count = len(roles_data)
        filtered_roles = enriched_roles

        # Filter personas based on filtered role IDs
        if industry_filter or function_id or department_id or role_id:
            # Get set of role IDs from the filtered roles
            filtered_role_ids = {role["id"] for role in roles_data}
            # Filter personas to only those linked to the filtered roles
            filtered_personas = [
                p for p in personas.data
                if p.get("source_role_id") in filtered_role_ids
            ]
            actual_persona_count = len(filtered_personas)
        else:
            actual_persona_count = len(personas.data)

        # Log what filters were applied
        if function_id or department_id or role_id:
            logger.info(f"Ontology stats filtered by: function_id={function_id}, department_id={department_id}, role_id={role_id}")

        return {
            "layers": {
                "L0_tenants": {"count": 3, "description": "Industry verticals"},
                "L1_functions": {"count": len(filtered_functions), "data": filtered_functions},
                "L2_departments": {"count": len(filtered_departments)},
                "L3_roles": {"count": actual_role_count, "data": filtered_roles},
                "L4_personas": {"count": actual_persona_count},
                "L5_jtbds": {"count": len(jtbds.data)},
                "L6_jtbd_roles": {"count": len(jtbd_roles.data)},
                "L7_agents": {"count": len(agents.data)}
            },
            "mappings": {
                "agent_roles": len(agent_roles.data) if agent_roles.data else 0,
                "jtbd_roles": len(jtbd_roles.data) if jtbd_roles.data else 0
            },
            "functions": functions_data,  # Return industry-filtered functions for filtering dropdown
            "filters_applied": {
                "industry": industry,
                "function_id": function_id,
                "department_id": department_id,
                "role_id": role_id
            },
            "raw_data": {
                "functions": filtered_functions,
                "departments": filtered_departments,
                "roles": filtered_roles,
                "personas_sample": personas.data[:50],
                "agents": agents.data[:50]
            }
        }
    except Exception as e:
        logger.error(f"Error fetching ontology stats: {e}")
        return {"error": str(e)}


# =============================================================================
# CASCADING FILTER DATA FUNCTIONS
# =============================================================================

async def get_all_tenants() -> Dict[str, Any]:
    """Get all tenants for filter dropdown (legacy - redirects to industries)"""
    # Redirect to industries for backwards compatibility
    industries = await get_all_industries()
    return {
        "tenants": industries["industries"],
        "count": industries["count"]
    }


async def get_all_industries() -> Dict[str, Any]:
    """Get all industries for filter dropdown

    Returns the 15 standard Healthcare/Life Sciences industry categories
    based on NAICS and GICS classification codes.

    Industry Categories:
    1. Pharmaceuticals (NAICS: 3254, GICS: 35201010)
    2. Biotechnology (NAICS: 541714, GICS: 35201020)
    3. Medical Devices (NAICS: 3391, GICS: 35101010)
    4. Digital Health (NAICS: 5112, GICS: 35102010)
    5. Diagnostics (NAICS: 3345, GICS: 35201010)
    6. Healthcare Providers (NAICS: 622, GICS: 35101020)
    7. Payers (NAICS: 524114, GICS: 35301010)
    8. Contract Research Organizations (NAICS: 541711, GICS: 20201020)
    9. Contract Development & Manufacturing (NAICS: 32541, GICS: 35201010)
    10. Health Information Technology (NAICS: 5182, GICS: 45102010)
    11. Research Institutions (NAICS: 541720, GICS: 20201020)
    12. Regulatory Bodies (NAICS: 921, GICS: N/A)
    13. Pharmacy Services (NAICS: 446110, GICS: 30101010)
    14. Medical Education (NAICS: 6113, GICS: 25301020)
    15. Healthcare Consulting (NAICS: 541611, GICS: 20201050)
    """
    # Get counts from database for each industry
    supabase = get_supabase_client()

    # Query to count functions per industry
    try:
        result = await asyncio.to_thread(
            lambda: supabase.table("org_functions")
                .select("industry")
                .execute()
        )

        industry_counts = {}
        if result.data:
            for row in result.data:
                ind = row.get("industry", "Other")
                industry_counts[ind] = industry_counts.get(ind, 0) + 1

        total_count = sum(industry_counts.values())
    except Exception as e:
        logger.warning(f"Could not fetch industry counts: {e}")
        industry_counts = {}
        total_count = 27  # Default fallback

    # Standard 15 Healthcare/Life Sciences industry categories
    industries = [
        {
            "id": "all",
            "name": "All Industries",
            "slug": "all",
            "naics_code": None,
            "gics_code": None,
            "count": total_count,
            "subcategories": []
        },
        {
            "id": "pharmaceuticals",
            "name": "Pharmaceuticals",
            "slug": "pharmaceuticals",
            "naics_code": "3254",
            "gics_code": "35201010",
            "count": industry_counts.get("Pharmaceuticals", 0),
            "subcategories": [
                "Big Pharma",
                "Specialty Pharma",
                "Generic/Biosimilars",
                "Emerging Pharma"
            ],
            "example_agents": [
                "Drug Safety Specialist",
                "Regulatory Affairs Manager",
                "Clinical Trial Designer"
            ]
        },
        {
            "id": "biotechnology",
            "name": "Biotechnology",
            "slug": "biotechnology",
            "naics_code": "541714",
            "gics_code": "35201020",
            "count": industry_counts.get("Biotechnology", 0),
            "subcategories": [
                "Therapeutic Biotech",
                "Platform Technology",
                "Agricultural Biotech"
            ],
            "example_agents": [
                "Genomics Researcher",
                "Bioprocess Engineer",
                "Cell Therapy Specialist"
            ]
        },
        {
            "id": "medical-devices",
            "name": "Medical Devices",
            "slug": "medical-devices",
            "naics_code": "3391",
            "gics_code": "35101010",
            "count": industry_counts.get("Medical Devices", 0),
            "subcategories": [
                "Class I (Low Risk)",
                "Class II (Moderate)",
                "Class III (High Risk)",
                "IVD Devices"
            ],
            "example_agents": [
                "Device Regulatory Specialist",
                "Quality Systems Manager",
                "Biocompatibility Expert"
            ]
        },
        {
            "id": "digital-health",
            "name": "Digital Health",
            "slug": "digital-health",
            "naics_code": "5112",
            "gics_code": "35102010",
            "count": industry_counts.get("Digital Health", 0),
            "subcategories": [
                "Digital Therapeutics (DTx)",
                "Telehealth/Telemedicine",
                "Health Apps & Wearables",
                "Remote Patient Monitoring"
            ],
            "example_agents": [
                "DTx Product Manager",
                "Health App Developer",
                "UX/UI Designer for Health"
            ]
        },
        {
            "id": "diagnostics",
            "name": "Diagnostics",
            "slug": "diagnostics",
            "naics_code": "3345",
            "gics_code": "35201010",
            "count": industry_counts.get("Diagnostics", 0),
            "subcategories": [
                "In Vitro Diagnostics",
                "Companion Diagnostics",
                "Point-of-Care Testing"
            ],
            "example_agents": [
                "Assay Development Lead",
                "Clinical Lab Scientist",
                "Biomarker Researcher"
            ]
        },
        {
            "id": "healthcare-providers",
            "name": "Healthcare Providers",
            "slug": "healthcare-providers",
            "naics_code": "622",
            "gics_code": "35101020",
            "count": industry_counts.get("Healthcare Providers", 0),
            "subcategories": [
                "Hospital Systems",
                "Physician Practices",
                "Specialty Clinics",
                "Long-Term Care"
            ],
            "example_agents": [
                "Care Coordinator",
                "Hospital Administrator",
                "Clinical Informaticist"
            ]
        },
        {
            "id": "payers",
            "name": "Payers",
            "slug": "payers",
            "naics_code": "524114",
            "gics_code": "35301010",
            "count": industry_counts.get("Payers", 0),
            "subcategories": [
                "Commercial Insurers",
                "Government (Medicare/Medicaid)",
                "PBMs",
                "Managed Care"
            ],
            "example_agents": [
                "Market Access Manager",
                "Health Economics Analyst",
                "Reimbursement Specialist"
            ]
        },
        {
            "id": "cro",
            "name": "Contract Research Organizations",
            "slug": "cro",
            "naics_code": "541711",
            "gics_code": "20201020",
            "count": industry_counts.get("Contract Research Organizations", 0),
            "subcategories": [
                "Full-Service CRO",
                "Functional Service Provider",
                "Specialty CRO"
            ],
            "example_agents": [
                "Clinical Operations Manager",
                "Biostatistician",
                "Site Monitor (CRA)"
            ]
        },
        {
            "id": "cdmo",
            "name": "Contract Development & Manufacturing",
            "slug": "cdmo",
            "naics_code": "32541",
            "gics_code": "35201010",
            "count": industry_counts.get("Contract Development & Manufacturing", 0),
            "subcategories": [
                "Drug Substance Manufacturing",
                "Drug Product Manufacturing",
                "Packaging & Labeling"
            ],
            "example_agents": [
                "Process Development Lead",
                "QC/QA Manager",
                "Supply Chain Director"
            ]
        },
        {
            "id": "health-it",
            "name": "Health Information Technology",
            "slug": "health-it",
            "naics_code": "5182",
            "gics_code": "45102010",
            "count": industry_counts.get("Health Information Technology", 0),
            "subcategories": [
                "EHR/EMR Systems",
                "Healthcare Analytics",
                "Interoperability Solutions",
                "Healthcare AI/ML"
            ],
            "example_agents": [
                "EHR Implementation Lead",
                "Healthcare Data Scientist",
                "Interoperability Specialist"
            ]
        },
        {
            "id": "research-institutions",
            "name": "Research Institutions",
            "slug": "research-institutions",
            "naics_code": "541720",
            "gics_code": "20201020",
            "count": industry_counts.get("Research Institutions", 0),
            "subcategories": [
                "Academic Medical Centers",
                "Research Universities",
                "National Labs"
            ],
            "example_agents": [
                "Principal Investigator",
                "Research Coordinator",
                "Grant Writer"
            ]
        },
        {
            "id": "regulatory-bodies",
            "name": "Regulatory Bodies",
            "slug": "regulatory-bodies",
            "naics_code": "921",
            "gics_code": None,
            "count": industry_counts.get("Regulatory Bodies", 0),
            "subcategories": [
                "FDA (US)",
                "EMA (EU)",
                "PMDA (Japan)",
                "Health Canada"
            ],
            "example_agents": [
                "Regulatory Reviewer",
                "Policy Analyst",
                "Compliance Officer"
            ]
        },
        {
            "id": "pharmacy-services",
            "name": "Pharmacy Services",
            "slug": "pharmacy-services",
            "naics_code": "446110",
            "gics_code": "30101010",
            "count": industry_counts.get("Pharmacy Services", 0),
            "subcategories": [
                "Retail Pharmacy",
                "Specialty Pharmacy",
                "Mail-Order Pharmacy",
                "Compounding Pharmacy"
            ],
            "example_agents": [
                "Clinical Pharmacist",
                "Pharmacy Technician",
                "Medication Therapy Manager"
            ]
        },
        {
            "id": "medical-education",
            "name": "Medical Education",
            "slug": "medical-education",
            "naics_code": "6113",
            "gics_code": "25301020",
            "count": industry_counts.get("Medical Education", 0),
            "subcategories": [
                "CME/CE Programs",
                "Medical Schools",
                "Nursing Programs",
                "Allied Health Education"
            ],
            "example_agents": [
                "Medical Writer",
                "CME Program Director",
                "Curriculum Developer"
            ]
        },
        {
            "id": "healthcare-consulting",
            "name": "Healthcare Consulting",
            "slug": "healthcare-consulting",
            "naics_code": "541611",
            "gics_code": "20201050",
            "count": industry_counts.get("Healthcare Consulting", 0),
            "subcategories": [
                "Strategy Consulting",
                "Operations Consulting",
                "IT/Digital Consulting",
                "Regulatory Consulting"
            ],
            "example_agents": [
                "Strategy Consultant",
                "Implementation Manager",
                "Change Management Lead"
            ]
        }
    ]

    return {
        "industries": industries,
        "count": len(industries)
    }


async def get_departments_by_function(function_id: str) -> Dict[str, Any]:
    """Get departments filtered by function for cascading dropdown"""
    try:
        supabase = get_supabase_client()

        # Fetch departments with function filter
        departments = await asyncio.to_thread(
            _sync_query, supabase, "org_departments",
            "id, name, slug, function_id",
            {"function_id": function_id}
        )

        # Get role counts per department
        roles = await asyncio.to_thread(_sync_query, supabase, "org_roles", "id, department_id")
        role_counts = {}
        for r in roles.data:
            dept_id = r.get("department_id")
            if dept_id:
                role_counts[dept_id] = role_counts.get(dept_id, 0) + 1

        return {
            "departments": [
                {
                    "id": d.get("id"),
                    "name": d.get("name") or "Unknown",
                    "slug": d.get("slug"),
                    "function_id": d.get("function_id"),
                    "role_count": role_counts.get(d.get("id"), 0)
                }
                for d in departments.data
            ],
            "count": len(departments.data)
        }
    except Exception as e:
        logger.error(f"Error fetching departments: {e}")
        return {"departments": [], "count": 0, "error": str(e)}


async def get_roles_by_department(department_id: str) -> Dict[str, Any]:
    """Get roles filtered by department for cascading dropdown"""
    try:
        supabase = get_supabase_client()

        # Fetch roles with department filter
        roles = await asyncio.to_thread(
            _sync_query, supabase, "org_roles",
            "id, name, slug, department_id, seniority_level",
            {"department_id": department_id}
        )

        # Get agent counts per role
        agent_roles = await asyncio.to_thread(_sync_query, supabase, "agent_roles", "role_id")
        agent_counts = {}
        for ar in agent_roles.data:
            role_id = ar.get("role_id")
            if role_id:
                agent_counts[role_id] = agent_counts.get(role_id, 0) + 1

        return {
            "roles": [
                {
                    "id": r.get("id"),
                    "name": r.get("name") or "Unknown",
                    "slug": r.get("slug"),
                    "seniority": r.get("seniority_level"),
                    "agent_count": agent_counts.get(r.get("id"), 0)
                }
                for r in roles.data
            ],
            "count": len(roles.data)
        }
    except Exception as e:
        logger.error(f"Error fetching roles: {e}")
        return {"roles": [], "count": 0, "error": str(e)}


async def get_jtbds_filtered(
    function_id: Optional[str] = None,
    role_id: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """Get JTBDs with optional function/role filters"""
    try:
        supabase = get_supabase_client()

        if role_id:
            # Get JTBDs mapped to specific role
            jtbd_roles = await asyncio.to_thread(
                _sync_query, supabase, "jtbd_roles",
                "jtbd_id", {"role_id": role_id}, limit
            )
            jtbd_ids = [jr.get("jtbd_id") for jr in jtbd_roles.data if jr.get("jtbd_id")]

            if jtbd_ids:
                # Fetch JTBD details
                all_jtbds = await asyncio.to_thread(_sync_query, supabase, "jtbd", "id, name, job_statement, job_type")
                jtbds = [j for j in all_jtbds.data if j.get("id") in jtbd_ids]
            else:
                jtbds = []
        elif function_id:
            # Get JTBDs related to function via jtbd_functions or generic fetch
            try:
                jtbd_functions = await asyncio.to_thread(
                    _sync_query, supabase, "jtbd_functions",
                    "jtbd_id", {"function_id": function_id}, limit
                )
                jtbd_ids = [jf.get("jtbd_id") for jf in jtbd_functions.data if jf.get("jtbd_id")]

                if jtbd_ids:
                    all_jtbds = await asyncio.to_thread(_sync_query, supabase, "jtbd", "id, name, job_statement, job_type")
                    jtbds = [j for j in all_jtbds.data if j.get("id") in jtbd_ids]
                else:
                    # Fallback to general JTBDs
                    result = await asyncio.to_thread(_sync_query, supabase, "jtbd", "id, name, job_statement, job_type", None, limit)
                    jtbds = result.data
            except Exception:
                # jtbd_functions table may not exist, fall back
                result = await asyncio.to_thread(_sync_query, supabase, "jtbd", "id, name, job_statement, job_type", None, limit)
                jtbds = result.data
        else:
            # Get all JTBDs up to limit
            result = await asyncio.to_thread(_sync_query, supabase, "jtbd", "id, name, job_statement, job_type", None, limit)
            jtbds = result.data

        return {
            "jtbds": [
                {
                    "id": j.get("id"),
                    "name": j.get("name") or (j.get("job_statement", "")[:60] + "..." if len(j.get("job_statement", "")) > 60 else j.get("job_statement")) or "Unknown",
                    "job_type": j.get("job_type")
                }
                for j in jtbds[:limit]
            ],
            "count": len(jtbds)
        }
    except Exception as e:
        logger.error(f"Error fetching JTBDs: {e}")
        return {"jtbds": [], "count": 0, "error": str(e)}


# =============================================================================
# GAP AND OPPORTUNITY ANALYSIS
# =============================================================================

async def get_gap_analysis(function_id: Optional[str] = None) -> Dict[str, Any]:
    """Analyze gaps in AI coverage across the ontology"""
    try:
        supabase = get_supabase_client()

        # Get all base data - use asyncio.to_thread for sync Supabase client
        all_roles = await asyncio.to_thread(_sync_query, supabase, "org_roles", "id, name, slug, function_id, department_id, seniority_level")
        functions = await asyncio.to_thread(_sync_query, supabase, "org_functions", "id, name")
        departments = await asyncio.to_thread(_sync_query, supabase, "org_departments", "id, name, function_id")
        agent_roles = await asyncio.to_thread(_sync_query, supabase, "agent_roles", "role_id")

        # Build lookups
        function_lookup = {f["id"]: f["name"] for f in functions.data}
        dept_lookup = {d["id"]: {"name": d["name"], "function_id": d.get("function_id")} for d in departments.data}

        # Enrich roles with function/department names
        enriched_roles = []
        for role in all_roles.data:
            func_id = role.get("function_id")
            dept_id = role.get("department_id")
            dept_info = dept_lookup.get(dept_id, {})
            func_name = function_lookup.get(func_id) or function_lookup.get(dept_info.get("function_id")) or "Unknown"
            enriched_roles.append({
                **role,
                "function_name": func_name,
                "department_name": dept_info.get("name")
            })

        # Find roles without agents
        roles_with_agents = set(ar["role_id"] for ar in agent_roles.data if ar.get("role_id"))
        roles_without_agents = [r for r in enriched_roles if r["id"] not in roles_with_agents]

        # Group by function
        gaps_by_function = {}
        for role in roles_without_agents:
            func_name = role.get("function_name", "Unknown")
            if func_name not in gaps_by_function:
                gaps_by_function[func_name] = []
            gaps_by_function[func_name].append({
                "role_name": role["name"],
                "seniority": role.get("seniority_level"),
                "department": role.get("department_name")
            })

        # Priority based on seniority (director+ = high priority)
        high_priority_seniority = ["director", "vp", "executive", "c_level", "svp", "evp"]
        high_priority_gaps = [
            r for r in roles_without_agents
            if r.get("seniority_level", "").lower() in high_priority_seniority
        ]

        # Format top gaps for response
        top_gaps = [{
            "role_name": r["name"],
            "function": r.get("function_name", "Unknown"),
            "priority": "high" if r.get("seniority_level", "").lower() in high_priority_seniority else "medium"
        } for r in roles_without_agents[:20]]

        return {
            "total_roles": len(all_roles.data),
            "roles_with_agents": len(roles_with_agents),
            "roles_without_agents": len(roles_without_agents),
            "coverage_percentage": round(len(roles_with_agents) / len(all_roles.data) * 100, 1) if all_roles.data else 0,
            "high_priority_gaps": len(high_priority_gaps),
            "gaps_by_function": {k: len(v) for k, v in gaps_by_function.items()},  # Return counts
            "top_gaps": top_gaps
        }
    except Exception as e:
        logger.error(f"Error in gap analysis: {e}")
        return {"error": str(e)}


async def get_persona_distribution() -> Dict[str, Any]:
    """Analyze persona distribution by archetype"""
    try:
        supabase = get_supabase_client()

        # Use asyncio.to_thread for sync Supabase client
        personas = await asyncio.to_thread(_sync_query, supabase, "personas", "id, persona_type, source_role_id, function_area")

        # Count by archetype
        archetype_counts = {"AUTOMATOR": 0, "ORCHESTRATOR": 0, "LEARNER": 0, "SKEPTIC": 0, "OTHER": 0}
        for p in personas.data:
            ptype = p.get("persona_type", "").upper()
            if ptype in archetype_counts:
                archetype_counts[ptype] += 1
            elif ptype:
                archetype_counts["OTHER"] += 1

        # Remove OTHER if count is 0
        if archetype_counts["OTHER"] == 0:
            del archetype_counts["OTHER"]

        # Count by function
        by_function = {}
        for p in personas.data:
            func = p.get("function_area") or "Unknown"
            if not func or func == "":
                func = "Unknown"
            if func not in by_function:
                by_function[func] = {"total": 0, "archetypes": {"AUTOMATOR": 0, "ORCHESTRATOR": 0, "LEARNER": 0, "SKEPTIC": 0}}
            by_function[func]["total"] += 1
            ptype = p.get("persona_type", "").upper()
            if ptype in by_function[func]["archetypes"]:
                by_function[func]["archetypes"][ptype] += 1

        return {
            "total_personas": len(personas.data),
            "by_archetype": archetype_counts,
            "by_function": by_function,
            "archetype_definitions": {
                "AUTOMATOR": "High AI maturity, seeks automation and efficiency tools",
                "ORCHESTRATOR": "Strategic coordinator, manages complex AI-assisted processes",
                "LEARNER": "Curious but cautious, wants guidance and step-by-step help",
                "SKEPTIC": "Prefers proven methods, needs trust-building before AI adoption"
            }
        }
    except Exception as e:
        logger.error(f"Error in persona analysis: {e}")
        return {"error": str(e)}


async def get_opportunity_scores(function_id: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
    """Score roles by AI transformation opportunity"""
    try:
        supabase = get_supabase_client()

        # Get roles with correct columns - use asyncio.to_thread for sync Supabase client
        role_cols = "id, name, slug, function_id, department_id, seniority_level, travel_percentage_min, travel_percentage_max"
        role_filters = {"function_id": function_id} if function_id else None
        # Query up to 'limit' roles to support larger datasets (1149+ roles exist)
        roles = await asyncio.to_thread(_sync_query, supabase, "org_roles", role_cols, role_filters, limit)

        # Get functions and departments for enrichment
        functions = await asyncio.to_thread(_sync_query, supabase, "org_functions", "id, name")
        departments = await asyncio.to_thread(_sync_query, supabase, "org_departments", "id, name, function_id")

        # Build lookups
        function_lookup = {f["id"]: f["name"] for f in functions.data}
        dept_lookup = {d["id"]: {"name": d["name"], "function_id": d.get("function_id")} for d in departments.data}

        # Get agent coverage
        agent_roles = await asyncio.to_thread(_sync_query, supabase, "agent_roles", "role_id, agent_id")
        roles_with_agents = set(ar["role_id"] for ar in agent_roles.data if ar.get("role_id"))

        # High-priority seniority levels
        high_seniority = ["director", "vp", "executive", "c_level", "svp", "evp"]

        # Score each role
        opportunities = []
        for role in roles.data:
            # Enrich with function/department names
            func_id = role.get("function_id")
            dept_id = role.get("department_id")
            dept_info = dept_lookup.get(dept_id, {})
            func_name = function_lookup.get(func_id) or function_lookup.get(dept_info.get("function_id"))
            dept_name = dept_info.get("name")

            score = 50  # Base score

            # Increase score for roles without agents (opportunity!)
            if role["id"] not in roles_with_agents:
                score += 30

            # High-value factors using available columns
            seniority = role.get("seniority_level", "").lower()
            is_senior = seniority in high_seniority

            # Use travel_percentage_max for field role detection
            travel_max = role.get("travel_percentage_max") or 0
            is_field_role = travel_max > 50

            if is_field_role:
                score += 10  # Field force enablement
            if is_senior:
                score += 15  # Strategic AI adoption for senior roles

            opportunities.append({
                "role_id": role["id"],
                "role_name": role["name"],
                "function": func_name,
                "department": dept_name,
                "opportunity_score": min(score, 100),
                "has_agent": role["id"] in roles_with_agents,
                "factors": {
                    "no_agent": role["id"] not in roles_with_agents,
                    "field_role": is_field_role,
                    "senior": is_senior,
                    "seniority_level": seniority
                }
            })

        # Sort by score descending
        opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)

        return opportunities[:limit]  # Return top N opportunities (default 200)
    except Exception as e:
        logger.error(f"Error calculating opportunities: {e}")
        return []


# =============================================================================
# LLM ANALYSIS WITH 5-TIER FALLBACK
# =============================================================================

async def analyze_with_reasoning(
    query: str,
    context: Dict[str, Any],
    analysis_type: str
) -> Dict[str, Any]:
    """
    Analyze ontology data using 5-tier reasoning model fallback.

    Tier 1: Claude Opus 4.5 (95% confidence)
    Tier 2: OpenAI o1 (92% confidence)
    Tier 3: Gemini 2.5 Pro (88% confidence)
    Tier 4: HuggingFace (context-aware)
    Tier 5: GPT-4o (82% confidence)
    """

    system_prompt = """You are the VITAL Ontology Investigator, an expert AI analyst specializing in
pharmaceutical and healthcare organizational structure analysis.

Your role is to:
1. Analyze the 8-layer enterprise ontology (L0-L7)
2. Identify gaps in AI agent coverage
3. Discover opportunities for AI transformation
4. Provide strategic recommendations for AI deployment
5. Help clients understand their organizational AI maturity

When responding:
- Be specific and data-driven
- Reference specific functions, departments, and roles
- Quantify gaps and opportunities with percentages
- Provide actionable recommendations with priorities
- Consider the 4 persona archetypes (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)

Always structure your response with:
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points)
3. Opportunities (prioritized list)
4. Recommendations (actionable next steps)
"""

    user_prompt = f"""Query: {query}

Analysis Type: {analysis_type}

Ontology Data:
{_format_context(context)}

Please analyze this organizational ontology data and provide insights based on the query."""

    # Tier 1: Claude Opus 4.5
    if ANTHROPIC_AVAILABLE:
        try:
            claude = ChatAnthropic(
                model="claude-opus-4-5-20251101",
                api_key=os.getenv("ANTHROPIC_API_KEY", settings.anthropic_api_key if hasattr(settings, 'anthropic_api_key') else None),
                temperature=0.3,
                max_tokens=4000
            )
            response = await claude.ainvoke([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ])
            logger.info("Ontology analysis completed with Claude Opus 4.5 (Tier 1)")
            return {
                "analysis": response.content,
                "model_used": "claude-opus-4-5-20251101",
                "confidence": 0.95,
                "tier": 1
            }
        except Exception as e:
            logger.warning(f"Claude Opus 4.5 failed: {e}, trying Tier 2")

    # Tier 2: OpenAI o1
    if OPENAI_AVAILABLE:
        try:
            o1 = ChatOpenAI(
                model="o1",
                api_key=os.getenv("OPENAI_API_KEY", settings.openai_api_key),
                temperature=1,  # o1 requires temperature=1
                max_completion_tokens=4000
            )
            # o1 doesn't support system messages, combine them
            combined_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await o1.ainvoke([{"role": "user", "content": combined_prompt}])
            logger.info("Ontology analysis completed with OpenAI o1 (Tier 2)")
            return {
                "analysis": response.content,
                "model_used": "o1",
                "confidence": 0.92,
                "tier": 2
            }
        except Exception as e:
            logger.warning(f"OpenAI o1 failed: {e}, trying Tier 3")

    # Tier 3: Gemini 2.5 Pro
    if GEMINI_AVAILABLE:
        try:
            gemini = ChatGoogleGenerativeAI(
                model="gemini-2.5-pro-preview-05-06",
                google_api_key=os.getenv("GEMINI_API_KEY", settings.gemini_api_key if hasattr(settings, 'gemini_api_key') else None),
                temperature=0.3,
                max_output_tokens=4000
            )
            combined_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = await gemini.ainvoke([{"role": "user", "content": combined_prompt}])
            logger.info("Ontology analysis completed with Gemini 2.5 Pro (Tier 3)")
            return {
                "analysis": response.content,
                "model_used": "gemini-2.5-pro",
                "confidence": 0.88,
                "tier": 3
            }
        except Exception as e:
            logger.warning(f"Gemini 2.5 Pro failed: {e}, trying Tier 4")

    # Tier 4: HuggingFace (context-aware selection)
    if HUGGINGFACE_AVAILABLE:
        models_to_try = select_best_huggingface_model(query, analysis_type)

        for model_name, repo_id, confidence in models_to_try:
            try:
                hf_llm = HuggingFaceEndpoint(
                    repo_id=repo_id,
                    huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_KEY"),
                    temperature=0.4,
                    max_new_tokens=3000
                )
                combined_prompt = f"{system_prompt}\n\n{user_prompt}"
                response = await asyncio.to_thread(hf_llm.invoke, combined_prompt)
                logger.info(f"Ontology analysis completed with {model_name} (Tier 4)")
                return {
                    "analysis": response,
                    "model_used": model_name,
                    "confidence": confidence,
                    "tier": 4
                }
            except Exception as e:
                logger.warning(f"HuggingFace {model_name} failed: {e}")
                continue

    # Tier 5: GPT-4o (Fallback)
    if OPENAI_AVAILABLE:
        try:
            gpt4o = ChatOpenAI(
                model="gpt-4o",
                api_key=os.getenv("OPENAI_API_KEY", settings.openai_api_key),
                temperature=0.3,
                max_tokens=4000
            )
            response = await gpt4o.ainvoke([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ])
            logger.info("Ontology analysis completed with GPT-4o (Tier 5 fallback)")
            return {
                "analysis": response.content,
                "model_used": "gpt-4o",
                "confidence": 0.82,
                "tier": 5
            }
        except Exception as e:
            logger.error(f"GPT-4o fallback failed: {e}")

    # All tiers failed
    return {
        "analysis": "Unable to complete analysis - all reasoning models unavailable.",
        "model_used": "none",
        "confidence": 0.0,
        "tier": 0,
        "error": "All reasoning models failed"
    }


def _format_context(context: Dict[str, Any]) -> str:
    """Format context data for LLM consumption"""
    parts = []

    if "layers" in context:
        parts.append("## Ontology Layer Counts:")
        for layer, data in context["layers"].items():
            count = data.get("count", 0) if isinstance(data, dict) else data
            parts.append(f"- {layer}: {count}")

    if "gap_analysis" in context:
        gap = context["gap_analysis"]
        parts.append(f"\n## Gap Analysis:")
        parts.append(f"- Total roles: {gap.get('total_roles', 0)}")
        parts.append(f"- Roles with agents: {gap.get('roles_with_agents', 0)}")
        parts.append(f"- Coverage: {gap.get('coverage_percentage', 0)}%")
        parts.append(f"- High priority gaps: {gap.get('high_priority_gaps', 0)}")

        if "gaps_by_function" in gap:
            parts.append("\n### Gaps by Function:")
            for func, role_count in list(gap["gaps_by_function"].items())[:5]:
                # role_count is already an int (the count), not a list
                parts.append(f"- {func}: {role_count} uncovered roles")

    if "persona_distribution" in context:
        dist = context["persona_distribution"]
        parts.append(f"\n## Persona Distribution:")
        parts.append(f"- Total personas: {dist.get('total_personas', 0)}")
        if "by_archetype" in dist:
            for arch, count in dist["by_archetype"].items():
                parts.append(f"- {arch}: {count}")

    if "opportunities" in context:
        parts.append(f"\n## Top AI Opportunities:")
        for opp in context["opportunities"][:10]:
            parts.append(f"- {opp['role_name']} ({opp['function']}): Score {opp['opportunity_score']}")

    return "\n".join(parts)


# =============================================================================
# WORKFLOW NODES
# =============================================================================

async def classify_query_node(state: OntologyInvestigatorState) -> OntologyInvestigatorState:
    """Classify the query to determine analysis type"""
    query = state["query"].lower()

    # Classify based on keywords
    if any(kw in query for kw in ["gap", "missing", "uncovered", "without agent"]):
        analysis_type = OntologyAnalysisType.GAP_ANALYSIS
    elif any(kw in query for kw in ["adoption", "maturity", "archetype", "automator", "skeptic"]):
        analysis_type = OntologyAnalysisType.ADOPTION_ANALYSIS
    elif any(kw in query for kw in ["opportunity", "potential", "score", "prioritize"]):
        analysis_type = OntologyAnalysisType.OPPORTUNITY_SCORING
    elif any(kw in query for kw in ["coverage", "heatmap", "distribution", "spread"]):
        analysis_type = OntologyAnalysisType.COVERAGE_HEATMAP
    elif any(kw in query for kw in ["jtbd", "job", "task", "workflow"]):
        analysis_type = OntologyAnalysisType.JTBD_MAPPING
    elif any(kw in query for kw in ["persona", "user type", "archetype"]):
        analysis_type = OntologyAnalysisType.PERSONA_INSIGHTS
    elif any(kw in query for kw in ["recommend", "strategy", "plan", "roadmap"]):
        analysis_type = OntologyAnalysisType.STRATEGIC_RECOMMENDATIONS
    else:
        analysis_type = OntologyAnalysisType.GENERAL_INQUIRY

    # Detect which layers are relevant
    detected_layers = []
    layer_keywords = {
        "L0": ["tenant", "organization", "company"],
        "L1": ["function", "medical affairs", "commercial", "r&d", "regulatory"],
        "L2": ["department", "unit", "team"],
        "L3": ["role", "position", "title", "msl", "director"],
        "L4": ["persona", "archetype", "user type"],
        "L5": ["jtbd", "job", "task", "workflow"],
        "L6": ["mapping", "relationship"],
        "L7": ["agent", "ai", "assistant", "bot"]
    }

    for layer, keywords in layer_keywords.items():
        if any(kw in query for kw in keywords):
            detected_layers.append(layer)

    if not detected_layers:
        detected_layers = ["L1", "L3", "L7"]  # Default to functions, roles, agents

    state["analysis_type"] = analysis_type.value
    state["detected_layers"] = detected_layers
    state["reasoning_steps"] = state.get("reasoning_steps", []) + [{
        "step": "classify",
        "result": f"Analysis type: {analysis_type.value}, Layers: {detected_layers}"
    }]

    return state


async def retrieve_ontology_data_node(state: OntologyInvestigatorState) -> OntologyInvestigatorState:
    """Retrieve relevant ontology data based on classification"""
    analysis_type = state["analysis_type"]
    tenant_id = state.get("tenant_id")
    function_id = state.get("function_id")

    ontology_data = {}

    try:
        # Always get basic stats
        stats = await get_ontology_stats(tenant_id)
        ontology_data["stats"] = stats

        # Get specific data based on analysis type
        if analysis_type in [OntologyAnalysisType.GAP_ANALYSIS.value,
                           OntologyAnalysisType.OPPORTUNITY_SCORING.value,
                           OntologyAnalysisType.STRATEGIC_RECOMMENDATIONS.value]:
            ontology_data["gap_analysis"] = await get_gap_analysis(function_id)
            ontology_data["opportunities"] = await get_opportunity_scores(function_id)

        if analysis_type in [OntologyAnalysisType.ADOPTION_ANALYSIS.value,
                           OntologyAnalysisType.PERSONA_INSIGHTS.value]:
            ontology_data["persona_distribution"] = await get_persona_distribution()

        if analysis_type == OntologyAnalysisType.COVERAGE_HEATMAP.value:
            ontology_data["gap_analysis"] = await get_gap_analysis(function_id)

        state["ontology_data"] = ontology_data
        state["reasoning_steps"] = state.get("reasoning_steps", []) + [{
            "step": "retrieve",
            "result": f"Retrieved data for {analysis_type}: {list(ontology_data.keys())}"
        }]

    except Exception as e:
        logger.error(f"Error retrieving ontology data: {e}")
        state["errors"] = state.get("errors", []) + [str(e)]

    return state


async def analyze_ontology_node(state: OntologyInvestigatorState) -> OntologyInvestigatorState:
    """Analyze ontology data using reasoning models"""
    query = state["query"]
    analysis_type = state["analysis_type"]
    ontology_data = state.get("ontology_data", {})

    # Prepare context for analysis
    context = {
        "layers": ontology_data.get("stats", {}).get("layers", {}),
        "gap_analysis": ontology_data.get("gap_analysis", {}),
        "persona_distribution": ontology_data.get("persona_distribution", {}),
        "opportunities": ontology_data.get("opportunities", [])
    }

    # Run analysis with 5-tier fallback
    result = await analyze_with_reasoning(query, context, analysis_type)

    state["analysis_result"] = result["analysis"]
    state["model_used"] = result["model_used"]
    state["confidence"] = result["confidence"]
    state["reasoning_steps"] = state.get("reasoning_steps", []) + [{
        "step": "analyze",
        "model": result["model_used"],
        "tier": result.get("tier", 0),
        "confidence": result["confidence"]
    }]

    return state


async def generate_recommendations_node(state: OntologyInvestigatorState) -> OntologyInvestigatorState:
    """Generate actionable recommendations based on analysis"""
    ontology_data = state.get("ontology_data", {})
    gap_analysis = ontology_data.get("gap_analysis", {})
    opportunities = ontology_data.get("opportunities", [])

    recommendations = []

    # Gap-based recommendations
    if gap_analysis:
        coverage = gap_analysis.get("coverage_percentage", 0)
        if coverage < 50:
            recommendations.append({
                "priority": "high",
                "category": "coverage",
                "text": f"Critical: Only {coverage}% agent coverage. Prioritize deploying agents for high-priority roles.",
                "impact": "high"
            })

        high_priority_gaps = gap_analysis.get("high_priority_gaps", 0)
        if high_priority_gaps > 0:
            recommendations.append({
                "priority": "high",
                "category": "compliance",
                "text": f"{high_priority_gaps} GxP-critical or HCP-facing roles lack AI support. Address for compliance efficiency.",
                "impact": "high"
            })

    # Opportunity-based recommendations
    if opportunities:
        top_opps = [o for o in opportunities[:5] if o.get("opportunity_score", 0) > 70]
        if top_opps:
            recommendations.append({
                "priority": "medium",
                "category": "opportunity",
                "text": f"Top 5 high-value opportunities identified with scores >70: {', '.join(o['role_name'] for o in top_opps)}",
                "impact": "medium"
            })

    # Persona-based recommendations
    persona_dist = ontology_data.get("persona_distribution", {})
    if persona_dist:
        archetypes = persona_dist.get("by_archetype", {})
        automators = archetypes.get("AUTOMATOR", 0)
        skeptics = archetypes.get("SKEPTIC", 0)

        if skeptics > automators:
            recommendations.append({
                "priority": "medium",
                "category": "adoption",
                "text": f"More SKEPTIC personas ({skeptics}) than AUTOMATORs ({automators}). Focus on trust-building and demonstrated ROI.",
                "impact": "medium"
            })

    state["recommendations"] = recommendations
    state["reasoning_steps"] = state.get("reasoning_steps", []) + [{
        "step": "recommend",
        "result": f"Generated {len(recommendations)} recommendations"
    }]

    return state


async def add_citations_node(state: OntologyInvestigatorState) -> OntologyInvestigatorState:
    """Add data citations to support the analysis"""
    ontology_data = state.get("ontology_data", {})

    citations = []

    # Add stats citations
    if "stats" in ontology_data:
        layers = ontology_data["stats"].get("layers", {})
        citations.append({
            "source": "VITAL Enterprise Ontology",
            "type": "database",
            "data": f"L1: {layers.get('L1_functions', {}).get('count', 0)} functions, L3: {layers.get('L3_roles', {}).get('count', 0)} roles, L7: {layers.get('L7_agents', {}).get('count', 0)} agents"
        })

    # Add gap analysis citation
    if "gap_analysis" in ontology_data:
        gap = ontology_data["gap_analysis"]
        citations.append({
            "source": "Gap Analysis",
            "type": "analysis",
            "data": f"Coverage: {gap.get('coverage_percentage', 0)}%, Gaps: {gap.get('roles_without_agents', 0)} roles"
        })

    state["citations"] = citations
    state["timestamp"] = datetime.utcnow().isoformat()

    return state


# =============================================================================
# WORKFLOW GRAPH
# =============================================================================

def create_ontology_investigator_graph():
    """Create the LangGraph workflow for Ontology Investigator"""

    workflow = StateGraph(OntologyInvestigatorState)

    # Add nodes
    workflow.add_node("classify", classify_query_node)
    workflow.add_node("retrieve", retrieve_ontology_data_node)
    workflow.add_node("analyze", analyze_ontology_node)
    workflow.add_node("recommend", generate_recommendations_node)
    workflow.add_node("cite", add_citations_node)

    # Define edges (linear flow)
    workflow.set_entry_point("classify")
    workflow.add_edge("classify", "retrieve")
    workflow.add_edge("retrieve", "analyze")
    workflow.add_edge("analyze", "recommend")
    workflow.add_edge("recommend", "cite")
    workflow.add_edge("cite", END)

    return workflow.compile()


# =============================================================================
# PUBLIC API
# =============================================================================

_ontology_investigator = None


def get_ontology_investigator():
    """Get or create the Ontology Investigator workflow"""
    global _ontology_investigator
    if _ontology_investigator is None:
        _ontology_investigator = create_ontology_investigator_graph()
    return _ontology_investigator


async def investigate_ontology(
    query: str,
    tenant_id: Optional[str] = None,
    function_id: Optional[str] = None,
    department_id: Optional[str] = None,
    role_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main entry point for Ontology Investigation.

    Args:
        query: Natural language question about the ontology
        tenant_id: Optional tenant filter
        function_id: Optional function filter
        department_id: Optional department filter
        role_id: Optional role filter

    Returns:
        Analysis results with recommendations and citations
    """
    logger.info(f"Ontology investigation started: {query[:100]}")

    # Create initial state
    initial_state: OntologyInvestigatorState = {
        "query": query,
        "tenant_id": tenant_id,
        "function_id": function_id,
        "department_id": department_id,
        "role_id": role_id,
        "analysis_type": None,
        "detected_layers": [],
        "ontology_data": {},
        "aggregated_stats": {},
        "gap_analysis": {},
        "opportunities": [],
        "analysis_result": "",
        "recommendations": [],
        "citations": [],
        "confidence": 0.0,
        "model_used": "",
        "reasoning_steps": [],
        "errors": [],
        "timestamp": datetime.utcnow().isoformat()
    }

    # Run workflow
    try:
        graph = get_ontology_investigator()
        result = await graph.ainvoke(initial_state)

        return {
            "success": True,
            "response": result["analysis_result"],
            "analysis_type": result["analysis_type"],
            "recommendations": result["recommendations"],
            "citations": result["citations"],
            "confidence": result["confidence"],
            "model_used": result["model_used"],
            "reasoning_steps": result["reasoning_steps"],
            "detected_layers": result["detected_layers"],
            "timestamp": result["timestamp"]
        }
    except Exception as e:
        logger.error(f"Ontology investigation failed: {e}")
        return {
            "success": False,
            "response": f"Investigation failed: {str(e)}",
            "analysis_type": None,
            "recommendations": [],
            "citations": [],
            "confidence": 0.0,
            "model_used": "",
            "reasoning_steps": [],
            "errors": [str(e)],
            "timestamp": datetime.utcnow().isoformat()
        }
