# PRODUCTION_TAG: DEVELOPMENT
# LAST_VERIFIED: 2025-12-17
# MODES_SUPPORTED: [All]
# DEPENDENCIES: [ontology.resolver]
"""
Ontology Resolver API Routes

Cross-layer context resolution for the 8-layer ontology model.

Endpoints:
- POST /v1/ontology/resolve - Full context resolution
- POST /v1/ontology/resolve/quick - Quick context (L0, L4 only)
- POST /v1/ontology/resolve/jtbd - JTBD-focused context
- POST /v1/ontology/resolve/agents - Agent selection context
- POST /v1/ontology/resolve/execution - Execution configuration
"""

import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/ontology", tags=["Ontology Resolver"])


# ============== Request/Response Models ==============

class ResolveContextRequest(BaseModel):
    """Full context resolution request"""
    query: str = Field(..., min_length=1, max_length=5000)
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    role_id: Optional[str] = None
    function_id: Optional[str] = None
    therapeutic_area_id: Optional[str] = None
    mode: Optional[str] = None  # mode_1, mode_2, mode_3, mode_4
    include_layers: Optional[List[str]] = None  # l0, l1, l2, etc.
    skip_layers: Optional[List[str]] = None
    include_history: bool = True


class QuickContextRequest(BaseModel):
    """Quick context request (minimal resolution)"""
    query: str = Field(..., min_length=1, max_length=5000)


class JTBDContextRequest(BaseModel):
    """JTBD-focused context request"""
    query: str = Field(..., min_length=1, max_length=5000)
    function_id: Optional[str] = None
    role_id: Optional[str] = None


class AgentSelectionRequest(BaseModel):
    """Agent selection request"""
    query: str = Field(..., min_length=1, max_length=5000)
    role_id: Optional[str] = None
    max_agents: int = Field(default=3, ge=1, le=10)


class ExecutionConfigRequest(BaseModel):
    """Execution configuration request"""
    query: str = Field(..., min_length=1, max_length=5000)
    mode: Optional[str] = None
    user_id: Optional[str] = None


class LayerContext(BaseModel):
    """Generic layer context"""
    layer: str
    data: dict
    confidence: float


class ResolvedContextResponse(BaseModel):
    """Full resolved context response"""
    query: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None

    # Layer contexts (optional based on resolution)
    domain: Optional[dict] = None
    organization: Optional[dict] = None
    process: Optional[dict] = None
    jtbd: Optional[dict] = None
    agents: Optional[dict] = None
    execution: Optional[dict] = None
    analytics: Optional[dict] = None
    value: Optional[dict] = None

    # Aggregated recommendations
    recommended_mode: str
    recommended_runner_family: Optional[str] = None
    recommended_agent_ids: List[str] = []

    # Metadata
    overall_confidence: float
    resolution_time_ms: float
    layers_resolved: List[str]
    errors: List[str] = []
    resolved_at: str


class QuickContextResponse(BaseModel):
    """Quick context response"""
    therapeutic_area: Optional[str] = None
    primary_agent_id: Optional[str] = None
    recommended_agents: List[str] = []
    confidence: float
    resolution_time_ms: float


class JTBDContextResponse(BaseModel):
    """JTBD-focused context response"""
    relevant_jtbds: List[dict]
    top_opportunity_score: float
    recommended_runner_family: Optional[str] = None
    vpanes_scores: List[dict] = []
    confidence: float


class AgentSelectionResponse(BaseModel):
    """Agent selection response"""
    recommended_agents: List[dict]
    primary_agent_id: Optional[str] = None
    supporting_agent_ids: List[str] = []
    synergy_score: float
    estimated_cost: float
    confidence: float


class ExecutionConfigResponse(BaseModel):
    """Execution configuration response"""
    mode: str
    runner_family: Optional[str] = None
    timeout_seconds: int
    max_iterations: int
    max_tokens: int
    max_cost: float
    enable_streaming: bool
    enable_checkpointing: bool
    quality_threshold: float
    estimated_duration_seconds: float
    confidence: float


# ============== Helper Functions ==============

def get_tenant_id() -> str:
    """Get tenant ID - in production, extract from auth token."""
    return "550e8400-e29b-41d4-a716-446655440000"


def determine_mode(query: str, jtbd_opportunity_score: float = 0) -> str:
    """Determine execution mode based on query and context."""
    query_lower = query.lower()

    # Mode 1: Quick, simple queries
    mode_1_indicators = ["what is", "who is", "define", "quick", "simple", "brief"]
    if any(ind in query_lower for ind in mode_1_indicators) and len(query) < 100:
        return "mode_1"

    # Mode 3: Deep research queries
    mode_3_indicators = ["research", "comprehensive", "detailed analysis", "investigate thoroughly", "deep dive"]
    if any(ind in query_lower for ind in mode_3_indicators):
        return "mode_3"

    # Mode 4: Autonomous/complex queries
    mode_4_indicators = ["autonomous", "complex project", "multi-step", "create a plan", "develop strategy"]
    if any(ind in query_lower for ind in mode_4_indicators):
        return "mode_4"

    # High opportunity score suggests more complex processing
    if jtbd_opportunity_score > 15:
        return "mode_3"

    # Default: Mode 2 (standard)
    return "mode_2"


def recommend_runner_family(query: str) -> str:
    """Recommend runner family based on query."""
    query_lower = query.lower()

    patterns = {
        "investigate": ["investigate", "research", "analyze", "find", "search", "look into"],
        "synthesize": ["synthesize", "combine", "merge", "consolidate", "summarize"],
        "validate": ["validate", "verify", "check", "confirm", "audit", "review"],
        "create": ["create", "generate", "write", "draft", "compose", "build"],
        "design": ["design", "architect", "plan layout", "structure"],
        "evaluate": ["evaluate", "assess", "score", "rate", "compare"],
        "plan": ["plan", "strategy", "roadmap", "outline", "schedule"],
        "execute": ["execute", "implement", "run", "perform", "do"],
        "discover": ["discover", "explore", "uncover", "identify"],
        "decide": ["decide", "choose", "select", "determine"],
        "predict": ["predict", "forecast", "project", "estimate future"],
        "solve": ["solve", "fix", "resolve", "troubleshoot"],
        "understand": ["understand", "explain", "clarify", "interpret"],
    }

    scores = {family: 0 for family in patterns}
    for family, keywords in patterns.items():
        for keyword in keywords:
            if keyword in query_lower:
                scores[family] += 1

    max_family = max(scores, key=scores.get)
    return max_family if scores[max_family] > 0 else "investigate"


def get_execution_config(mode: str) -> dict:
    """Get execution configuration for a mode."""
    configs = {
        "mode_1": {
            "timeout_seconds": 30,
            "max_iterations": 1,
            "max_tokens": 4000,
            "max_cost": 0.10,
            "enable_streaming": True,
            "enable_checkpointing": False,
            "quality_threshold": 0.6
        },
        "mode_2": {
            "timeout_seconds": 120,
            "max_iterations": 5,
            "max_tokens": 16000,
            "max_cost": 0.50,
            "enable_streaming": True,
            "enable_checkpointing": True,
            "quality_threshold": 0.7
        },
        "mode_3": {
            "timeout_seconds": 600,
            "max_iterations": 20,
            "max_tokens": 100000,
            "max_cost": 5.0,
            "enable_streaming": True,
            "enable_checkpointing": True,
            "quality_threshold": 0.85
        },
        "mode_4": {
            "timeout_seconds": 3600,
            "max_iterations": 50,
            "max_tokens": 500000,
            "max_cost": 25.0,
            "enable_streaming": True,
            "enable_checkpointing": True,
            "quality_threshold": 0.9
        }
    }
    return configs.get(mode, configs["mode_2"])


# ============== API Endpoints ==============

@router.post("/resolve", response_model=ResolvedContextResponse)
async def resolve_full_context(request: ResolveContextRequest):
    """
    Resolve full ontology context across all 8 layers.

    This is the primary endpoint for getting comprehensive context
    for query processing. It traverses:
    - L0 Domain (therapeutic areas, evidence types)
    - L1 Organization (functions, departments, roles)
    - L2 Process (workflow templates)
    - L3 JTBD (jobs, pain points, outcomes)
    - L4 Agents (recommendations, synergy)
    - L5 Execution (configuration, history)
    - L6 Analytics (user patterns)
    - L7 Value (VPANES, ROI)
    """
    start_time = datetime.utcnow()
    errors = []
    layers_resolved = []

    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Determine which layers to resolve
        all_layers = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7"]
        layers_to_resolve = request.include_layers or all_layers
        if request.skip_layers:
            layers_to_resolve = [l for l in layers_to_resolve if l not in request.skip_layers]

        context = {
            "domain": None,
            "organization": None,
            "process": None,
            "jtbd": None,
            "agents": None,
            "execution": None,
            "analytics": None,
            "value": None
        }

        # L0: Domain Context
        if "l0" in layers_to_resolve:
            try:
                # Simplified domain resolution
                context["domain"] = {
                    "therapeutic_area_id": request.therapeutic_area_id,
                    "evidence_types": ["clinical_trial", "real_world_evidence", "literature"],
                    "rag_namespaces": []
                }
                layers_resolved.append("l0_domain")
            except Exception as e:
                errors.append(f"L0 Domain: {str(e)}")

        # L1: Organization Context
        if "l1" in layers_to_resolve and request.role_id:
            try:
                role_result = supabase.table("org_roles")\
                    .select("*, org_departments(*, org_business_functions(*))")\
                    .eq("id", request.role_id)\
                    .eq("tenant_id", tenant_id)\
                    .maybe_single()\
                    .execute()

                if role_result.data:
                    context["organization"] = {
                        "role": role_result.data,
                        "department": role_result.data.get("org_departments"),
                        "function": role_result.data.get("org_departments", {}).get("org_business_functions")
                    }
                    layers_resolved.append("l1_organization")
            except Exception as e:
                errors.append(f"L1 Organization: {str(e)}")

        # L3: JTBD Context
        jtbd_opportunity_score = 0
        if "l3" in layers_to_resolve:
            try:
                jtbd_result = supabase.table("jtbds")\
                    .select("*")\
                    .eq("tenant_id", tenant_id)\
                    .eq("is_active", True)\
                    .limit(5)\
                    .execute()

                jtbds = jtbd_result.data or []
                if jtbds:
                    # Simple text matching for relevance
                    query_lower = request.query.lower()
                    scored = []
                    for jtbd in jtbds:
                        score = 0
                        if any(w in query_lower for w in jtbd.get("name", "").lower().split()):
                            score += 5
                        if any(w in query_lower for w in jtbd.get("job_statement", "").lower().split()):
                            score += 3
                        scored.append((score + jtbd.get("opportunity_score", 0), jtbd))

                    scored.sort(key=lambda x: x[0], reverse=True)
                    top_jtbds = [j for _, j in scored[:5]]

                    if top_jtbds:
                        jtbd_opportunity_score = top_jtbds[0].get("opportunity_score", 0)

                    context["jtbd"] = {
                        "relevant_jtbds": top_jtbds,
                        "top_opportunity_jtbd_id": top_jtbds[0].get("id") if top_jtbds else None,
                        "max_opportunity_score": jtbd_opportunity_score,
                        "recommended_runner_family": top_jtbds[0].get("runner_family") if top_jtbds else None
                    }
                    layers_resolved.append("l3_jtbd")
            except Exception as e:
                errors.append(f"L3 JTBD: {str(e)}")

        # L4: Agent Context
        recommended_agent_ids = []
        if "l4" in layers_to_resolve:
            try:
                agent_result = supabase.table("agents")\
                    .select("*")\
                    .eq("tenant_id", tenant_id)\
                    .eq("is_active", True)\
                    .limit(10)\
                    .execute()

                agents = agent_result.data or []
                if agents:
                    # Simple capability matching
                    query_lower = request.query.lower()
                    scored = []
                    for agent in agents:
                        score = 0
                        if any(w in query_lower for w in agent.get("name", "").lower().split()):
                            score += 5
                        caps = agent.get("capabilities") or []
                        if any(w in query_lower for w in caps):
                            score += 3
                        if score > 0:
                            scored.append((score, agent))

                    scored.sort(key=lambda x: x[0], reverse=True)
                    top_agents = [a for _, a in scored[:3]]

                    recommended_agent_ids = [a.get("id") for a in top_agents]

                    context["agents"] = {
                        "recommended_agents": top_agents,
                        "primary_agent_id": top_agents[0].get("id") if top_agents else None,
                        "supporting_agent_ids": [a.get("id") for a in top_agents[1:]] if len(top_agents) > 1 else [],
                        "estimated_cost": sum(a.get("cost_per_query", 0) for a in top_agents)
                    }
                    layers_resolved.append("l4_agents")
            except Exception as e:
                errors.append(f"L4 Agents: {str(e)}")

        # L5: Execution Context
        recommended_mode = request.mode or determine_mode(request.query, jtbd_opportunity_score)
        runner_family = recommend_runner_family(request.query)

        if "l5" in layers_to_resolve:
            try:
                exec_config = get_execution_config(recommended_mode)
                context["execution"] = {
                    "config": exec_config,
                    "mode": recommended_mode,
                    "runner_family": runner_family
                }
                layers_resolved.append("l5_execution")
            except Exception as e:
                errors.append(f"L5 Execution: {str(e)}")

        # Calculate resolution time and confidence
        end_time = datetime.utcnow()
        resolution_time_ms = (end_time - start_time).total_seconds() * 1000

        # Calculate confidence based on layers resolved
        layer_weights = {
            "l0_domain": 0.10, "l1_organization": 0.10, "l2_process": 0.15,
            "l3_jtbd": 0.20, "l4_agents": 0.20, "l5_execution": 0.10,
            "l6_analytics": 0.05, "l7_value": 0.10
        }
        confidence = sum(layer_weights.get(l, 0.1) for l in layers_resolved)

        return ResolvedContextResponse(
            query=request.query,
            user_id=request.user_id,
            session_id=request.session_id,
            domain=context["domain"],
            organization=context["organization"],
            process=context["process"],
            jtbd=context["jtbd"],
            agents=context["agents"],
            execution=context["execution"],
            analytics=context["analytics"],
            value=context["value"],
            recommended_mode=recommended_mode,
            recommended_runner_family=runner_family if "l5" in layers_to_resolve else None,
            recommended_agent_ids=recommended_agent_ids,
            overall_confidence=confidence,
            resolution_time_ms=resolution_time_ms,
            layers_resolved=layers_resolved,
            errors=errors,
            resolved_at=end_time.isoformat()
        )

    except Exception as e:
        logger.error(f"Error resolving context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve/quick", response_model=QuickContextResponse)
async def resolve_quick_context(request: QuickContextRequest):
    """
    Get minimal context for fast responses.

    Only resolves L0 Domain and L4 Agents for speed.
    Ideal for Mode 1 (instant) queries.
    """
    start_time = datetime.utcnow()

    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Quick agent matching
        agent_result = supabase.table("agents")\
            .select("id, code, name, capabilities")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .limit(10)\
            .execute()

        agents = agent_result.data or []
        query_lower = request.query.lower()

        scored = []
        for agent in agents:
            score = 0
            if any(w in query_lower for w in agent.get("name", "").lower().split()):
                score += 5
            if score > 0:
                scored.append((score, agent))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_agents = [a for _, a in scored[:3]]

        end_time = datetime.utcnow()
        resolution_time_ms = (end_time - start_time).total_seconds() * 1000

        return QuickContextResponse(
            therapeutic_area=None,
            primary_agent_id=top_agents[0].get("id") if top_agents else None,
            recommended_agents=[a.get("id") for a in top_agents],
            confidence=0.5 if top_agents else 0.2,
            resolution_time_ms=resolution_time_ms
        )

    except Exception as e:
        logger.error(f"Error resolving quick context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve/jtbd", response_model=JTBDContextResponse)
async def resolve_jtbd_context(request: JTBDContextRequest):
    """
    Get JTBD-focused context for opportunity analysis.

    Resolves L1, L3, L7 layers for business value assessment.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Get JTBDs
        jtbd_result = supabase.table("jtbds")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .order("opportunity_score", desc=True)\
            .limit(10)\
            .execute()

        jtbds = jtbd_result.data or []

        # Filter by function/role if provided
        if request.function_id:
            jtbds = [j for j in jtbds if request.function_id in (j.get("function_ids") or [])]
        if request.role_id:
            jtbds = [j for j in jtbds if request.role_id in (j.get("role_ids") or [])]

        # Score by query relevance
        query_lower = request.query.lower()
        scored = []
        for jtbd in jtbds:
            score = jtbd.get("opportunity_score", 0)
            if any(w in query_lower for w in jtbd.get("name", "").lower().split()):
                score += 10
            if any(w in query_lower for w in jtbd.get("job_statement", "").lower().split()):
                score += 5
            scored.append((score, jtbd))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_jtbds = [j for _, j in scored[:5]]

        # Get VPANES scores for top JTBDs
        vpanes_scores = []
        for jtbd in top_jtbds[:3]:
            vpanes_result = supabase.table("vpanes_scores")\
                .select("*")\
                .eq("tenant_id", tenant_id)\
                .eq("jtbd_id", jtbd.get("id"))\
                .maybe_single()\
                .execute()
            if vpanes_result.data:
                vpanes_scores.append(vpanes_result.data)

        return JTBDContextResponse(
            relevant_jtbds=top_jtbds,
            top_opportunity_score=top_jtbds[0].get("opportunity_score", 0) if top_jtbds else 0,
            recommended_runner_family=top_jtbds[0].get("runner_family") if top_jtbds else None,
            vpanes_scores=vpanes_scores,
            confidence=0.8 if top_jtbds else 0.3
        )

    except Exception as e:
        logger.error(f"Error resolving JTBD context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve/agents", response_model=AgentSelectionResponse)
async def resolve_agent_selection(request: AgentSelectionRequest):
    """
    Get agent selection context.

    Recommends optimal agent team based on query and role.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Get all active agents
        agent_result = supabase.table("agents")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .limit(50)\
            .execute()

        agents = agent_result.data or []
        query_lower = request.query.lower()

        # Score agents
        scored = []
        for agent in agents:
            score = 0
            # Name match
            if any(w in query_lower for w in agent.get("name", "").lower().split()):
                score += 10
            # Capability match
            caps = agent.get("capabilities") or []
            if any(c.lower() in query_lower for c in caps):
                score += 5
            # Knowledge domain match
            domains = agent.get("knowledge_domains") or []
            if any(d.lower() in query_lower for d in domains):
                score += 3

            if score > 0:
                scored.append((score, agent))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_agents = [a for _, a in scored[:request.max_agents]]

        estimated_cost = sum(a.get("cost_per_query", 0) for a in top_agents)

        return AgentSelectionResponse(
            recommended_agents=top_agents,
            primary_agent_id=top_agents[0].get("id") if top_agents else None,
            supporting_agent_ids=[a.get("id") for a in top_agents[1:]] if len(top_agents) > 1 else [],
            synergy_score=0.7 if len(top_agents) > 1 else 0.5,
            estimated_cost=estimated_cost,
            confidence=0.8 if top_agents else 0.3
        )

    except Exception as e:
        logger.error(f"Error resolving agent selection: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve/execution", response_model=ExecutionConfigResponse)
async def resolve_execution_config(request: ExecutionConfigRequest):
    """
    Get execution configuration for a query.

    Determines mode, runner family, and execution parameters.
    """
    try:
        # Determine mode if not provided
        mode = request.mode or determine_mode(request.query)
        runner_family = recommend_runner_family(request.query)
        config = get_execution_config(mode)

        # Estimate duration based on mode
        duration_estimates = {
            "mode_1": 10,
            "mode_2": 60,
            "mode_3": 300,
            "mode_4": 1800
        }

        return ExecutionConfigResponse(
            mode=mode,
            runner_family=runner_family,
            timeout_seconds=config["timeout_seconds"],
            max_iterations=config["max_iterations"],
            max_tokens=config["max_tokens"],
            max_cost=config["max_cost"],
            enable_streaming=config["enable_streaming"],
            enable_checkpointing=config["enable_checkpointing"],
            quality_threshold=config["quality_threshold"],
            estimated_duration_seconds=duration_estimates.get(mode, 60),
            confidence=0.8
        )

    except Exception as e:
        logger.error(f"Error resolving execution config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def resolver_health_check():
    """
    Health check for Ontology Resolver service.
    """
    try:
        supabase = get_supabase_client()
        tenant_id = get_tenant_id()

        # Quick check on key tables
        jtbd_count = supabase.table("jtbds")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .execute()

        agent_count = supabase.table("agents")\
            .select("id", count="exact")\
            .eq("tenant_id", tenant_id)\
            .eq("is_active", True)\
            .execute()

        return {
            "status": "healthy",
            "service": "ontology_resolver",
            "layers_available": ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7"],
            "counts": {
                "jtbds": jtbd_count.count or 0,
                "agents": agent_count.count or 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Resolver health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "ontology_resolver",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
