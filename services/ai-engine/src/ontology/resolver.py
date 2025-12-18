"""
Ontology Resolver

Central coordinator for the 8-layer enterprise ontology model.
Resolves cross-layer context for queries, coordinating:

O0 Domain → O1 Organization → O2 Process → O3 JTBD →
O4 Agents → O5 Execution → O6 Analytics → O7 Value

(See VITAL_PLATFORM_TAXONOMY.md for naming conventions)
"""

from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime
from supabase import AsyncClient

from .base import OntologyContext
from .o0_domain.service import L0DomainService
from .o0_domain.models import DomainContext
from .o1_organization.service import L1OrganizationService
from .o1_organization.models import OrganizationContext
from .o2_process.service import L2ProcessService
from .o2_process.models import ProcessContext
from .o3_jtbd.service import L3JTBDService
from .o3_jtbd.models import JTBDContext
from .o4_agents.service import L4AgentService
from .o4_agents.models import AgentContext
from .o5_execution.service import L5ExecutionService
from .o5_execution.models import ExecutionContext, MissionMode
from .o6_analytics.service import L6AnalyticsService
from .o6_analytics.models import AnalyticsContext
from .o7_value.service import L7ValueService
from .o7_value.models import ValueContext


@dataclass
class ResolvedOntologyContext:
    """
    Fully resolved context across all 8 ontology layers.

    This is the primary output of the OntologyResolver, containing
    all relevant context for processing a user query.
    """
    # Input
    query: str = ""
    user_id: Optional[str] = None
    session_id: Optional[str] = None

    # Layer contexts
    domain: Optional[DomainContext] = None
    organization: Optional[OrganizationContext] = None
    process: Optional[ProcessContext] = None
    jtbd: Optional[JTBDContext] = None
    agents: Optional[AgentContext] = None
    execution: Optional[ExecutionContext] = None
    analytics: Optional[AnalyticsContext] = None
    value: Optional[ValueContext] = None

    # Aggregated recommendations
    recommended_mode: MissionMode = MissionMode.MODE_2
    recommended_runner_family: Optional[str] = None
    recommended_agent_ids: List[str] = field(default_factory=list)

    # Confidence and metadata
    overall_confidence: float = 0.0
    resolution_time_ms: float = 0.0
    layers_resolved: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)

    # Timestamp
    resolved_at: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "query": self.query,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "domain": self.domain.model_dump() if self.domain else None,
            "organization": self.organization.model_dump() if self.organization else None,
            "process": self.process.model_dump() if self.process else None,
            "jtbd": self.jtbd.model_dump() if self.jtbd else None,
            "agents": self.agents.model_dump() if self.agents else None,
            "execution": self.execution.model_dump() if self.execution else None,
            "analytics": self.analytics.model_dump() if self.analytics else None,
            "value": self.value.model_dump() if self.value else None,
            "recommended_mode": self.recommended_mode.value,
            "recommended_runner_family": self.recommended_runner_family,
            "recommended_agent_ids": self.recommended_agent_ids,
            "overall_confidence": self.overall_confidence,
            "resolution_time_ms": self.resolution_time_ms,
            "layers_resolved": self.layers_resolved,
            "errors": self.errors,
            "resolved_at": self.resolved_at.isoformat()
        }

    @property
    def has_errors(self) -> bool:
        return len(self.errors) > 0

    @property
    def summary(self) -> str:
        """Generate a brief summary of the resolved context."""
        parts = []

        if self.domain and self.domain.therapeutic_area:
            parts.append(f"Domain: {self.domain.therapeutic_area.name}")

        if self.organization and self.organization.function:
            parts.append(f"Function: {self.organization.function.name}")

        if self.jtbd and self.jtbd.relevant_jtbds:
            top_jtbd = self.jtbd.relevant_jtbds[0]
            parts.append(f"JTBD: {top_jtbd.get('name', 'Unknown')}")

        if self.recommended_runner_family:
            parts.append(f"Runner: {self.recommended_runner_family}")

        if self.recommended_agent_ids:
            parts.append(f"Agents: {len(self.recommended_agent_ids)}")

        return " | ".join(parts) if parts else "No context resolved"


class OntologyResolver:
    """
    Central coordinator for the 8-layer enterprise ontology model.

    The resolver orchestrates context resolution across all layers,
    enabling intelligent query processing based on:
    - Domain knowledge (therapeutic areas, evidence types)
    - Organizational context (functions, departments, roles)
    - Process workflows (templates, stages, tasks)
    - Jobs-to-be-Done (with ODI opportunity scoring)
    - Agent capabilities and orchestration
    - Execution configuration and history
    - Analytics and user patterns
    - Business value metrics
    """

    def __init__(
        self,
        supabase: AsyncClient,
        tenant_id: str
    ):
        self.supabase = supabase
        self.tenant_id = tenant_id

        # Initialize layer services
        self.l0_domain = L0DomainService(supabase, tenant_id)
        self.l1_organization = L1OrganizationService(supabase, tenant_id)
        self.l2_process = L2ProcessService(supabase, tenant_id)
        self.l3_jtbd = L3JTBDService(supabase, tenant_id)
        self.l4_agents = L4AgentService(supabase, tenant_id)
        self.l5_execution = L5ExecutionService(supabase, tenant_id)
        self.l6_analytics = L6AnalyticsService(supabase, tenant_id)
        self.l7_value = L7ValueService(supabase, tenant_id)

    async def resolve(
        self,
        query: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        role_id: Optional[str] = None,
        function_id: Optional[str] = None,
        mode: Optional[MissionMode] = None,
        include_layers: Optional[List[str]] = None,
        skip_layers: Optional[List[str]] = None
    ) -> ResolvedOntologyContext:
        """
        Resolve full ontology context for a query.

        Args:
            query: User query
            user_id: Optional user ID for personalization
            session_id: Optional session ID for tracking
            role_id: Optional role ID for organizational context
            function_id: Optional function ID filter
            mode: Optional execution mode hint
            include_layers: Only resolve these layers (if specified)
            skip_layers: Skip these layers

        Returns:
            ResolvedOntologyContext with all layer contexts
        """
        start_time = datetime.utcnow()
        context = ResolvedOntologyContext(
            query=query,
            user_id=user_id,
            session_id=session_id
        )

        # Determine which layers to resolve
        all_layers = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7"]
        layers_to_resolve = include_layers or all_layers
        if skip_layers:
            layers_to_resolve = [l for l in layers_to_resolve if l not in skip_layers]

        # L0: Domain Context
        if "l0" in layers_to_resolve:
            try:
                context.domain = await self.l0_domain.resolve_domain(query)
                context.layers_resolved.append("l0_domain")
            except Exception as e:
                context.errors.append(f"L0 Domain: {str(e)}")

        # L1: Organization Context
        if "l1" in layers_to_resolve:
            try:
                context.organization = await self.l1_organization.resolve_organization(
                    user_role_id=role_id,
                    user_id=user_id
                )
                context.layers_resolved.append("l1_organization")

                # Extract function_id from org context if not provided
                if not function_id and context.organization and context.organization.function:
                    function_id = context.organization.function.id
            except Exception as e:
                context.errors.append(f"L1 Organization: {str(e)}")

        # L2: Process Context
        if "l2" in layers_to_resolve:
            try:
                context.process = await self.l2_process.resolve_process(
                    query=query,
                    function_id=function_id,
                    role_id=role_id
                )
                context.layers_resolved.append("l2_process")
            except Exception as e:
                context.errors.append(f"L2 Process: {str(e)}")

        # L3: JTBD Context
        if "l3" in layers_to_resolve:
            try:
                context.jtbd = await self.l3_jtbd.resolve_jtbd_context(
                    query=query,
                    role_id=role_id,
                    function_id=function_id
                )
                context.layers_resolved.append("l3_jtbd")
            except Exception as e:
                context.errors.append(f"L3 JTBD: {str(e)}")

        # L4: Agent Context
        if "l4" in layers_to_resolve:
            try:
                # Get JTBD ID for agent matching
                jtbd_id = None
                if context.jtbd and context.jtbd.top_opportunity_jtbd_id:
                    jtbd_id = context.jtbd.top_opportunity_jtbd_id

                if jtbd_id:
                    context.agents = await self.l4_agents.recommend_agent_team(
                        jtbd_id=jtbd_id,
                        query=query,
                        max_agents=3
                    )
                else:
                    # Fallback: find by capability
                    agents = await self.l4_agents.find_agents_by_capability(query, limit=3)
                    context.agents = AgentContext(
                        recommended_agents=agents,
                        primary_agent_id=agents[0].id if agents else None
                    )

                context.layers_resolved.append("l4_agents")

                # Extract recommended agents
                if context.agents and context.agents.recommended_agents:
                    context.recommended_agent_ids = [a.id for a in context.agents.recommended_agents]
            except Exception as e:
                context.errors.append(f"L4 Agents: {str(e)}")

        # L5: Execution Context
        if "l5" in layers_to_resolve:
            try:
                # Get runner family hint from JTBD or Process
                runner_hint = None
                if context.jtbd and context.jtbd.recommended_runner_family:
                    runner_hint = context.jtbd.recommended_runner_family
                elif context.process and context.process.recommended_runner_family:
                    runner_hint = context.process.recommended_runner_family

                # Determine mode
                resolved_mode = mode or self._determine_mode(query, context)

                context.execution = await self.l5_execution.resolve_execution(
                    query=query,
                    mode=resolved_mode,
                    user_id=user_id,
                    jtbd_runner_hint=runner_hint
                )
                context.layers_resolved.append("l5_execution")

                # Update recommendations
                context.recommended_mode = resolved_mode
                if context.execution.runner_family:
                    context.recommended_runner_family = context.execution.runner_family.value
            except Exception as e:
                context.errors.append(f"L5 Execution: {str(e)}")

        # L6: Analytics Context
        if "l6" in layers_to_resolve and user_id:
            try:
                context.analytics = await self.l6_analytics.resolve_analytics(
                    user_id=user_id,
                    query=query
                )
                context.layers_resolved.append("l6_analytics")
            except Exception as e:
                context.errors.append(f"L6 Analytics: {str(e)}")

        # L7: Value Context
        if "l7" in layers_to_resolve:
            try:
                # Get JTBD IDs for value context
                jtbd_ids = []
                if context.jtbd and context.jtbd.relevant_jtbds:
                    jtbd_ids = [j.get("id") for j in context.jtbd.relevant_jtbds if j.get("id")]

                context.value = await self.l7_value.resolve_value(jtbd_ids=jtbd_ids[:5])
                context.layers_resolved.append("l7_value")
            except Exception as e:
                context.errors.append(f"L7 Value: {str(e)}")

        # Calculate overall confidence
        context.overall_confidence = self._calculate_confidence(context)

        # Calculate resolution time
        end_time = datetime.utcnow()
        context.resolution_time_ms = (end_time - start_time).total_seconds() * 1000

        return context

    def _determine_mode(
        self,
        query: str,
        context: ResolvedOntologyContext
    ) -> MissionMode:
        """Determine the appropriate execution mode based on query and context."""
        query_lower = query.lower()

        # Mode 1: Quick, simple queries
        mode_1_indicators = ["what is", "who is", "define", "quick", "simple", "brief"]
        if any(ind in query_lower for ind in mode_1_indicators) and len(query) < 100:
            return MissionMode.MODE_1

        # Mode 3: Deep research queries
        mode_3_indicators = ["research", "comprehensive", "detailed analysis", "investigate thoroughly", "deep dive"]
        if any(ind in query_lower for ind in mode_3_indicators):
            return MissionMode.MODE_3

        # Mode 4: Autonomous/complex queries
        mode_4_indicators = ["autonomous", "complex project", "multi-step", "create a plan", "develop strategy"]
        if any(ind in query_lower for ind in mode_4_indicators):
            return MissionMode.MODE_4

        # Check JTBD complexity
        if context.jtbd and context.jtbd.relevant_jtbds:
            top_jtbd = context.jtbd.relevant_jtbds[0]
            opportunity_score = top_jtbd.get("opportunity_score", 0)
            if opportunity_score > 15:  # High opportunity = more complex
                return MissionMode.MODE_3

        # Default: Mode 2 (standard)
        return MissionMode.MODE_2

    def _calculate_confidence(self, context: ResolvedOntologyContext) -> float:
        """Calculate overall confidence from layer confidences."""
        confidences = []
        weights = {
            "domain": 0.10,
            "organization": 0.10,
            "process": 0.15,
            "jtbd": 0.20,
            "agents": 0.20,
            "execution": 0.10,
            "analytics": 0.05,
            "value": 0.10
        }

        if context.domain:
            confidences.append(context.domain.confidence_score * weights["domain"])
        if context.organization:
            confidences.append(context.organization.confidence_score * weights["organization"])
        if context.process:
            confidences.append(context.process.confidence_score * weights["process"])
        if context.jtbd:
            confidences.append(context.jtbd.confidence_score * weights["jtbd"])
        if context.agents:
            confidences.append(context.agents.confidence_score * weights["agents"])
        if context.execution:
            confidences.append(context.execution.confidence_score * weights["execution"])
        if context.analytics:
            confidences.append(context.analytics.confidence_score * weights["analytics"])
        if context.value:
            confidences.append(context.value.confidence_score * weights["value"])

        # Normalize by actual weights used
        total_weight = sum(
            weights[k] for k, v in {
                "domain": context.domain,
                "organization": context.organization,
                "process": context.process,
                "jtbd": context.jtbd,
                "agents": context.agents,
                "execution": context.execution,
                "analytics": context.analytics,
                "value": context.value
            }.items() if v is not None
        )

        if total_weight > 0:
            return sum(confidences) / total_weight
        return 0.0

    async def resolve_for_mode(
        self,
        query: str,
        mode: MissionMode,
        user_id: Optional[str] = None,
        role_id: Optional[str] = None
    ) -> ResolvedOntologyContext:
        """
        Resolve context optimized for a specific execution mode.

        Different modes need different layers:
        - Mode 1 (Instant): L0, L4, L5 only (minimal context)
        - Mode 2 (Standard): L0-L5 (full operational context)
        - Mode 3 (Deep Research): All layers
        - Mode 4 (Autonomous): All layers with value focus
        """
        if mode == MissionMode.MODE_1:
            include_layers = ["l0", "l4", "l5"]
        elif mode == MissionMode.MODE_2:
            include_layers = ["l0", "l1", "l2", "l3", "l4", "l5"]
        else:  # MODE_3, MODE_4
            include_layers = None  # All layers

        return await self.resolve(
            query=query,
            user_id=user_id,
            role_id=role_id,
            mode=mode,
            include_layers=include_layers
        )

    async def get_quick_context(
        self,
        query: str
    ) -> Dict[str, Any]:
        """
        Get minimal context for fast responses.
        Only resolves L0 Domain and L4 Agents.
        """
        context = await self.resolve(
            query=query,
            include_layers=["l0", "l4"]
        )

        return {
            "therapeutic_area": context.domain.therapeutic_area.code if context.domain and context.domain.therapeutic_area else None,
            "primary_agent_id": context.agents.primary_agent_id if context.agents else None,
            "recommended_agents": context.recommended_agent_ids,
            "confidence": context.overall_confidence
        }

    async def get_jtbd_context(
        self,
        query: str,
        function_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get JTBD-focused context for opportunity analysis.
        Resolves L1, L3, L7 layers.
        """
        context = await self.resolve(
            query=query,
            function_id=function_id,
            include_layers=["l1", "l3", "l7"]
        )

        result = {
            "relevant_jtbds": [],
            "top_opportunity_score": 0,
            "recommended_runner_family": None,
            "vpanes_scores": [],
            "confidence": context.overall_confidence
        }

        if context.jtbd:
            result["relevant_jtbds"] = context.jtbd.relevant_jtbds
            result["top_opportunity_score"] = context.jtbd.max_opportunity_score
            result["recommended_runner_family"] = context.jtbd.recommended_runner_family

        if context.value:
            result["vpanes_scores"] = [s.model_dump() for s in context.value.vpanes_scores]

        return result
