"""
Value Investigator API Routes
REST API endpoints for the AI-powered value analysis companion

Endpoints:
- POST /v1/value-investigator/query - Ask the Value Investigator a question
- POST /v1/value-investigator/analyze-jtbd/{id} - Analyze value for a JTBD
- POST /v1/value-investigator/analyze-role/{id} - Analyze value for a role
- GET /v1/value-investigator/suggestions - Get suggested questions
- GET /v1/value-investigator/health - Health check
"""

import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from langgraph_workflows.value_investigator import investigate_value

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/value-investigator", tags=["Value Investigator"])


# ============== Request/Response Models ==============

class InvestigatorQueryRequest(BaseModel):
    """Request for Value Investigator query"""
    query: str = Field(..., description="Natural language question about value", min_length=3)
    tenant_id: Optional[str] = Field(None, description="Tenant context for filtering")
    context_type: Optional[str] = Field(None, description="Context type: jtbd, role, function, category, driver")
    context_id: Optional[str] = Field(None, description="ID of the context entity")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What are the top value drivers for Medical Affairs and how can we improve ROI?",
                "tenant_id": None,
                "context_type": None,
                "context_id": None
            }
        }


class RecommendationItem(BaseModel):
    """Individual recommendation from analysis"""
    text: str
    priority: str
    category: str


class CitationItem(BaseModel):
    """Data citation supporting the analysis"""
    source: str
    type: str
    timestamp: Optional[str] = None


class InvestigatorResponse(BaseModel):
    """Response from Value Investigator"""
    success: bool
    response: str
    analysis_type: Optional[str] = None
    recommendations: List[RecommendationItem] = []
    citations: List[CitationItem] = []
    confidence: float = 0.0
    model_used: str = ""
    reasoning_steps: List[str] = []
    timestamp: str


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
async def query_investigator(request: InvestigatorQueryRequest):
    """
    Ask the Value Investigator a question

    The Value Investigator uses Claude 3.5 Sonnet (with GPT-4o fallback) to analyze
    value framework data and provide intelligent insights.

    Supported query types:
    - Dashboard overview questions
    - Category deep dives (Smarter, Faster, Better, etc.)
    - Driver analysis (Cost Reduction, Compliance, etc.)
    - ROI and savings analysis
    - Gap analysis and optimization
    - JTBD-specific value questions
    - Role-specific value questions
    """
    try:
        result = await investigate_value(
            query=request.query,
            tenant_id=request.tenant_id,
            context_type=request.context_type,
            context_id=request.context_id
        )

        return InvestigatorResponse(
            success=result.get("success", False),
            response=result.get("response", ""),
            analysis_type=result.get("analysis_type"),
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
        logger.error(f"Error in Value Investigator query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-jtbd/{jtbd_id}", response_model=InvestigatorResponse)
async def analyze_jtbd_value(
    jtbd_id: str,
    tenant_id: Optional[str] = None
):
    """
    Analyze value for a specific JTBD

    Provides detailed value analysis including:
    - Value category breakdown
    - Driver impact assessment
    - ROI estimation
    - Optimization recommendations
    """
    try:
        result = await investigate_value(
            query=f"Provide a comprehensive value analysis for this JTBD including ROI drivers, optimization opportunities, and strategic recommendations.",
            tenant_id=tenant_id,
            context_type="jtbd",
            context_id=jtbd_id
        )

        return InvestigatorResponse(
            success=result.get("success", False),
            response=result.get("response", ""),
            analysis_type=result.get("analysis_type"),
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
        logger.error(f"Error analyzing JTBD value: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-role/{role_id}", response_model=InvestigatorResponse)
async def analyze_role_value(
    role_id: str,
    tenant_id: Optional[str] = None
):
    """
    Analyze aggregated value for a role

    Provides role-level analysis including:
    - Total value score across all JTBDs
    - Primary value categories
    - Time and cost savings potential
    - Cross-JTBD optimization opportunities
    """
    try:
        result = await investigate_value(
            query=f"Analyze the total value contribution of this role including all associated JTBDs, savings potential, and strategic value optimization opportunities.",
            tenant_id=tenant_id,
            context_type="role",
            context_id=role_id
        )

        return InvestigatorResponse(
            success=result.get("success", False),
            response=result.get("response", ""),
            analysis_type=result.get("analysis_type"),
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
        logger.error(f"Error analyzing role value: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggestions", response_model=SuggestionsResponse)
async def get_suggested_questions():
    """
    Get suggested questions for the Value Investigator

    Returns a curated list of high-value questions across different analysis types.
    """
    suggestions = [
        # Dashboard / Overview
        SuggestionItem(
            question="What's our overall value coverage and where are the gaps?",
            category="overview",
            description="Get a comprehensive dashboard summary"
        ),
        SuggestionItem(
            question="Show me the top 5 value drivers and their impact",
            category="overview",
            description="Identify highest-impact value drivers"
        ),

        # Category Deep Dives
        SuggestionItem(
            question="How can we make our Medical Affairs workflows FASTER?",
            category="category",
            description="Analyze speed and efficiency opportunities"
        ),
        SuggestionItem(
            question="What's driving our SMARTER value category? How can we improve?",
            category="category",
            description="Analyze decision intelligence drivers"
        ),
        SuggestionItem(
            question="Where are we delivering SAFER outcomes and what's the compliance impact?",
            category="category",
            description="Analyze safety and compliance value"
        ),

        # Driver Analysis
        SuggestionItem(
            question="What's our cost reduction potential across all JTBDs?",
            category="driver",
            description="Analyze cost savings opportunities"
        ),
        SuggestionItem(
            question="How are we improving HCP experience and what more can we do?",
            category="driver",
            description="Analyze healthcare provider engagement value"
        ),
        SuggestionItem(
            question="What's the patient impact of our current JTBD portfolio?",
            category="driver",
            description="Analyze patient outcome drivers"
        ),

        # ROI Analysis
        SuggestionItem(
            question="Calculate the total ROI potential for this year",
            category="roi",
            description="Get comprehensive ROI analysis"
        ),
        SuggestionItem(
            question="Which JTBDs have the highest ROI and why?",
            category="roi",
            description="Identify top ROI contributors"
        ),

        # Gap Analysis
        SuggestionItem(
            question="Where are our value coverage gaps and what should we prioritize?",
            category="gap",
            description="Identify underserved value areas"
        ),
        SuggestionItem(
            question="What optimization opportunities are we missing?",
            category="gap",
            description="Find hidden value opportunities"
        )
    ]

    return SuggestionsResponse(suggestions=suggestions)


@router.get("/health")
async def investigator_health_check():
    """
    Health check for Value Investigator service

    Verifies:
    - LangGraph workflow is initialized
    - Reasoning models are configured
    - Data retrieval functions work
    """
    try:
        from langgraph_workflows.value_investigator import get_value_investigator

        # Check graph is available
        graph = get_value_investigator()

        return {
            "status": "healthy",
            "service": "value_investigator",
            "workflow": "initialized",
            "reasoning_models": {
                "tier_1_primary": "claude-opus-4-5-20251101",
                "tier_2_secondary": "o1",
                "tier_3_tertiary": "gemini-2.5-pro",
                "tier_4_opensource": [
                    "deepseek-ai/DeepSeek-R1",
                    "Qwen/Qwen2.5-72B-Instruct",
                    "CuratedHealth/meditron70b-qlora-1gpu",
                    "meta-llama/Llama-3.3-70B-Instruct"
                ],
                "tier_5_fallback": "gpt-4o"
            },
            "model_capabilities": {
                "claude-opus-4.5": "Extended thinking, deep reasoning, complex analysis (95% confidence)",
                "o1": "Chain-of-thought, mathematical reasoning, step-by-step logic (92% confidence)",
                "gemini-2.5-pro": "Multimodal reasoning, long context, analytical depth (88% confidence)",
                "deepseek-r1": "Open-source reasoning specialist, chain-of-thought (87% confidence)",
                "qwen2.5-72b": "Open-source 72B, excellent reasoning (85% confidence)",
                "meditron-70b": "Medical/pharma specialist, 70B parameters (84% confidence)",
                "llama3.3-70b": "General purpose open-source, 70B (83% confidence)",
                "gpt-4o": "General purpose, reliable final fallback (82% confidence)"
            },
            "huggingface_medical_models": {
                "medgemma-27b": "google/medgemma-27b-text-it (Healthcare specialist - PRIORITY)",
                "gemma2-27b": "google/gemma-2-27b-it (Strong medical reasoning)",
                "biogemma-2b": "google/biogemma-2b-it (Biomedical/PubMed)",
                "meditron-70b": "CuratedHealth/meditron70b-qlora-1gpu (Pharma specialist)",
                "meditron-7b-chat": "CuratedHealth/meditron7b-lora-chat (Clinical chat)",
                "qwen3-medical": "CuratedHealth/Qwen3-8B-SFT-20250917123923 (Medical research)"
            },
            "huggingface_general_models": {
                "deepseek-r1": "deepseek-ai/DeepSeek-R1 (Chain-of-thought)",
                "qwen2.5-72b": "Qwen/Qwen2.5-72B-Instruct (Strong reasoning)",
                "llama3.3-70b": "meta-llama/Llama-3.3-70B-Instruct (General purpose)",
                "mistral-large": "mistralai/Mistral-Large-Instruct-2411 (Multilingual)"
            },
            "capabilities": [
                "dashboard_analysis",
                "category_deep_dive",
                "driver_analysis",
                "jtbd_value_analysis",
                "role_value_analysis",
                "gap_analysis",
                "roi_deep_dive",
                "general_value_inquiry"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Value Investigator health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "value_investigator",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
