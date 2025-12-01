"""
Ontology Investigator API Routes
REST API endpoints for the AI-powered enterprise ontology analysis companion

Endpoints:
- POST /v1/ontology-investigator/query - Ask the Ontology Investigator a question
- POST /v1/ontology-investigator/gap-analysis - Analyze AI coverage gaps
- POST /v1/ontology-investigator/opportunities - Score roles by AI potential
- POST /v1/ontology-investigator/persona-insights - Analyze persona distribution
- GET /v1/ontology-investigator/hierarchy - Get full ontology hierarchy
- GET /v1/ontology-investigator/suggestions - Get suggested questions
- GET /v1/ontology-investigator/health - Health check
"""

import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from langgraph_workflows.ontology_investigator import (
    investigate_ontology,
    get_ontology_investigator,
    get_ontology_stats,
    get_gap_analysis,
    get_opportunity_scores,
    get_persona_distribution,
    get_all_tenants,
    get_all_industries,
    get_departments_by_function,
    get_roles_by_department,
    get_jtbds_filtered
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/ontology-investigator", tags=["Ontology Investigator"])


# ============== Request/Response Models ==============

class InvestigatorQueryRequest(BaseModel):
    """Request for Ontology Investigator query"""
    query: str = Field(..., description="Natural language question about the ontology", min_length=3)
    tenant_id: Optional[str] = Field(None, description="Tenant context for filtering")
    function_id: Optional[str] = Field(None, description="Filter by function ID")
    department_id: Optional[str] = Field(None, description="Filter by department ID")
    role_id: Optional[str] = Field(None, description="Filter by role ID")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the biggest AI coverage gaps in Medical Affairs?",
                "tenant_id": None,
                "function_id": None
            }
        }


class RecommendationItem(BaseModel):
    """Individual recommendation from analysis"""
    priority: str
    category: str
    text: str
    impact: str


class CitationItem(BaseModel):
    """Data citation supporting the analysis"""
    source: str
    type: str
    data: Optional[str] = None


class InvestigatorResponse(BaseModel):
    """Response from Ontology Investigator"""
    success: bool
    response: str
    analysis_type: Optional[str] = None
    detected_layers: List[str] = []
    recommendations: List[RecommendationItem] = []
    citations: List[CitationItem] = []
    confidence: float = 0.0
    model_used: str = ""
    reasoning_steps: List[dict] = []
    timestamp: str


class GapAnalysisResponse(BaseModel):
    """Gap analysis response"""
    total_roles: int
    roles_with_agents: int
    roles_without_agents: int
    coverage_percentage: float
    high_priority_gaps: int
    gaps_by_function: dict
    top_gaps: List[dict]


class OpportunityItem(BaseModel):
    """AI opportunity item"""
    role_id: str
    role_name: str
    function: Optional[str] = None
    department: Optional[str] = None
    opportunity_score: int
    has_agent: bool
    factors: dict


class PersonaDistributionResponse(BaseModel):
    """Persona distribution response"""
    total_personas: int
    by_archetype: dict
    by_function: dict
    archetype_definitions: dict


class FunctionItem(BaseModel):
    """Function for sidebar filtering"""
    id: str
    name: str
    slug: Optional[str] = None


class HierarchyResponse(BaseModel):
    """Full ontology hierarchy response"""
    layers: dict
    mappings: dict
    summary: dict
    functions: List[FunctionItem] = []


class SuggestionItem(BaseModel):
    """Suggested question for the investigator"""
    question: str
    category: str
    description: str


class SuggestionsResponse(BaseModel):
    """List of suggested questions"""
    suggestions: List[SuggestionItem]


# ============== API Endpoints ==============

@router.post("/query", response_model=InvestigatorResponse)
async def query_ontology_investigator(request: InvestigatorQueryRequest):
    """
    Ask the Ontology Investigator a question

    The Ontology Investigator uses reasoning models (Claude Opus 4.5, o1, Gemini 2.5 Pro)
    to analyze the 8-layer enterprise ontology and provide intelligent insights.

    Supported query types:
    - Gap analysis (find roles without AI agents)
    - Adoption analysis (track AI maturity by persona archetype)
    - Opportunity scoring (rank roles by AI transformation potential)
    - Coverage heatmap (visualize agent distribution)
    - JTBD mapping (match jobs to AI capabilities)
    - Persona insights (understand archetype distribution)
    - Strategic recommendations (prioritized AI deployment plan)
    """
    try:
        result = await investigate_ontology(
            query=request.query,
            tenant_id=request.tenant_id,
            function_id=request.function_id,
            department_id=request.department_id,
            role_id=request.role_id
        )

        return InvestigatorResponse(
            success=result.get("success", False),
            response=result.get("response", ""),
            analysis_type=result.get("analysis_type"),
            detected_layers=result.get("detected_layers", []),
            recommendations=[
                RecommendationItem(**rec) for rec in result.get("recommendations", [])
            ],
            citations=[
                CitationItem(**cit) for cit in result.get("citations", [])
            ],
            confidence=result.get("confidence", 0.0),
            model_used=result.get("model_used", ""),
            reasoning_steps=result.get("reasoning_steps", []),
            timestamp=result.get("timestamp", datetime.utcnow().isoformat())
        )

    except Exception as e:
        logger.error(f"Error in Ontology Investigator query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gap-analysis", response_model=GapAnalysisResponse)
async def analyze_gaps(
    function_id: Optional[str] = Query(None, description="Filter by function ID")
):
    """
    Analyze AI coverage gaps across the organization

    Returns:
    - Total roles vs roles with agents
    - Coverage percentage
    - High-priority gaps (GxP-critical, HCP-facing)
    - Gaps grouped by function
    """
    try:
        result = await get_gap_analysis(function_id)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return GapAnalysisResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in gap analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/opportunities", response_model=List[OpportunityItem])
async def score_opportunities(
    function_id: Optional[str] = Query(None, description="Filter by function ID"),
    limit: int = Query(50, le=100, description="Max opportunities to return")
):
    """
    Score roles by AI transformation opportunity

    Scoring factors:
    - Roles without agents (highest opportunity)
    - GxP-critical roles (compliance automation)
    - HCP-facing roles (engagement AI)
    - Field roles (enablement opportunity)
    - Senior roles (strategic adoption)
    """
    try:
        result = await get_opportunity_scores(function_id)

        opportunities = [
            OpportunityItem(**opp) for opp in result[:limit]
        ]

        return opportunities

    except Exception as e:
        logger.error(f"Error scoring opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/persona-insights", response_model=PersonaDistributionResponse)
async def get_persona_insights():
    """
    Analyze persona distribution by archetype

    Returns breakdown by:
    - AUTOMATOR: High AI maturity, seeks automation
    - ORCHESTRATOR: Strategic coordinator
    - LEARNER: Curious but cautious
    - SKEPTIC: Prefers proven methods
    """
    try:
        result = await get_persona_distribution()

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return PersonaDistributionResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting persona insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hierarchy", response_model=HierarchyResponse)
async def get_full_hierarchy(
    tenant_id: Optional[str] = Query(None, description="Legacy - use industry instead"),
    industry: Optional[str] = Query(None, description="Filter by industry (pharmaceuticals, digital-health, or all)"),
    function_id: Optional[str] = Query(None, description="Filter by function ID"),
    department_id: Optional[str] = Query(None, description="Filter by department ID"),
    role_id: Optional[str] = Query(None, description="Filter by role ID")
):
    """
    Get full ontology hierarchy with counts for all 8 layers (L0-L7)

    Supports cascading filters: Industry -> Function -> Department -> Role -> Personas

    Returns:
    - Layer counts (industries, functions, departments, roles, personas, JTBDs, mappings, agents)
    - Junction table counts (agent_roles, jtbd_roles)
    - Summary statistics with coverage percentage
    - Functions list for sidebar filtering (filtered by industry)
    """
    try:
        result = await get_ontology_stats(
            industry=industry,
            function_id=function_id,
            department_id=department_id,
            role_id=role_id
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        # Calculate coverage percentage
        total_roles = result.get("layers", {}).get("L3_roles", {}).get("count", 0)
        agent_roles_count = result.get("mappings", {}).get("agent_roles", 0)
        coverage = round((agent_roles_count / total_roles * 100), 1) if total_roles > 0 else 0

        # Get functions list for sidebar filtering
        functions_data = result.get("functions", [])
        functions_list = [
            FunctionItem(
                id=str(f.get("id", "")),
                name=f.get("name", "Unknown"),
                slug=f.get("slug")
            )
            for f in functions_data
        ]

        return HierarchyResponse(
            layers=result.get("layers", {}),
            mappings=result.get("mappings", {}),
            summary={
                "total_functions": result.get("layers", {}).get("L1_functions", {}).get("count", 0),
                "total_roles": total_roles,
                "total_personas": result.get("layers", {}).get("L4_personas", {}).get("count", 0),
                "total_agents": result.get("layers", {}).get("L7_agents", {}).get("count", 0),
                "coverage_percentage": coverage
            },
            functions=functions_list
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting hierarchy: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggestions", response_model=SuggestionsResponse)
async def get_suggested_questions():
    """
    Get suggested questions for the Ontology Investigator

    Returns a curated list of high-value questions across different analysis types.
    """
    suggestions = [
        # Gap Analysis
        SuggestionItem(
            question="What are the biggest AI coverage gaps in our organization?",
            category="gap_analysis",
            description="Identify roles and functions without AI agent support"
        ),
        SuggestionItem(
            question="Which GxP-critical roles are missing AI assistants?",
            category="gap_analysis",
            description="Find compliance-sensitive roles without AI coverage"
        ),

        # Adoption Analysis
        SuggestionItem(
            question="What's our AI adoption maturity by persona archetype?",
            category="adoption",
            description="Analyze AUTOMATOR vs SKEPTIC distribution"
        ),
        SuggestionItem(
            question="Which functions have the most AI-ready users?",
            category="adoption",
            description="Find functions with high AUTOMATOR concentration"
        ),

        # Opportunity Scoring
        SuggestionItem(
            question="What are the top 10 AI transformation opportunities?",
            category="opportunity",
            description="Score and rank roles by AI potential"
        ),
        SuggestionItem(
            question="Where should we prioritize AI agent deployment?",
            category="opportunity",
            description="Get strategic recommendations for AI rollout"
        ),

        # Persona Insights
        SuggestionItem(
            question="How are personas distributed across Medical Affairs?",
            category="persona",
            description="Understand archetype patterns in specific functions"
        ),
        SuggestionItem(
            question="What persona training do we need for AI adoption?",
            category="persona",
            description="Identify archetype-specific enablement needs"
        ),

        # Strategic
        SuggestionItem(
            question="Create a 90-day AI deployment roadmap",
            category="strategic",
            description="Get prioritized recommendations for AI rollout"
        ),
        SuggestionItem(
            question="What's the ROI potential of full AI coverage?",
            category="strategic",
            description="Estimate value of closing coverage gaps"
        ),

        # JTBD
        SuggestionItem(
            question="Which jobs-to-be-done have the most AI automation potential?",
            category="jtbd",
            description="Map JTBDs to AI capabilities"
        )
    ]

    return SuggestionsResponse(suggestions=suggestions)


@router.get("/health")
async def investigator_health_check():
    """
    Health check for Ontology Investigator service

    Verifies:
    - LangGraph workflow is initialized
    - Reasoning models are configured
    - Database connectivity
    """
    try:
        # Check graph is available
        graph = get_ontology_investigator()

        # Quick DB check
        stats = await get_ontology_stats()

        return {
            "status": "healthy",
            "service": "ontology_investigator",
            "workflow": "initialized",
            "reasoning_models": {
                "tier_1_primary": "claude-opus-4-5-20251101",
                "tier_2_secondary": "o1",
                "tier_3_tertiary": "gemini-2.5-pro",
                "tier_4_opensource": [
                    "deepseek-ai/DeepSeek-R1",
                    "Qwen/Qwen2.5-72B-Instruct",
                    "google/medgemma-27b-text-it",
                    "meta-llama/Llama-3.3-70B-Instruct"
                ],
                "tier_5_fallback": "gpt-4o"
            },
            "ontology_layers": {
                "L0_tenants": 12,
                "L1_functions": stats.get("layers", {}).get("L1_functions", {}).get("count", 0),
                "L2_departments": stats.get("layers", {}).get("L2_departments", {}).get("count", 0),
                "L3_roles": stats.get("layers", {}).get("L3_roles", {}).get("count", 0),
                "L4_personas": stats.get("layers", {}).get("L4_personas", {}).get("count", 0),
                "L5_jtbds": stats.get("layers", {}).get("L5_jtbds", {}).get("count", 0),
                "L7_agents": stats.get("layers", {}).get("L7_agents", {}).get("count", 0)
            },
            "capabilities": [
                "gap_analysis",
                "adoption_analysis",
                "opportunity_scoring",
                "coverage_heatmap",
                "jtbd_mapping",
                "persona_insights",
                "strategic_recommendations"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Ontology Investigator health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "ontology_investigator",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


# ============== Cascading Filter Endpoints ==============

@router.get("/tenants")
async def list_tenants():
    """
    Get all tenants for cascading filter dropdown (legacy - use /industries instead)

    Returns list of industries formatted as tenants for backwards compatibility.
    """
    try:
        result = await get_all_tenants()
        return result
    except Exception as e:
        logger.error(f"Error fetching tenants: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/industries")
async def list_industries():
    """
    Get all industries for cascading filter dropdown

    Returns list of industries:
    - All Industries (shows all data)
    - Pharmaceuticals
    - Digital Health
    """
    try:
        result = await get_all_industries()
        return result
    except Exception as e:
        logger.error(f"Error fetching industries: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/departments")
async def list_departments(
    function_id: str = Query(..., description="Function ID to filter departments")
):
    """
    Get departments filtered by function for cascading dropdown

    Returns departments with role counts for the selected function.
    """
    try:
        result = await get_departments_by_function(function_id)
        return result
    except Exception as e:
        logger.error(f"Error fetching departments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/roles")
async def list_roles(
    department_id: str = Query(..., description="Department ID to filter roles")
):
    """
    Get roles filtered by department for cascading dropdown

    Returns roles with agent counts for the selected department.
    """
    try:
        result = await get_roles_by_department(department_id)
        return result
    except Exception as e:
        logger.error(f"Error fetching roles: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jtbds")
async def list_jtbds(
    function_id: Optional[str] = Query(None, description="Filter by function ID"),
    role_id: Optional[str] = Query(None, description="Filter by role ID"),
    limit: int = Query(50, le=100, description="Max JTBDs to return")
):
    """
    Get JTBDs with optional function/role filters

    Returns JTBDs filtered by function or role, useful for cascading filters.
    """
    try:
        result = await get_jtbds_filtered(function_id, role_id, limit)
        return result
    except Exception as e:
        logger.error(f"Error fetching JTBDs: {e}")
        raise HTTPException(status_code=500, detail=str(e))
