# Unified AI Companion - Enterprise Ontology Integration Analysis

> **Version**: 1.1.0
> **Created**: December 17, 2025
> **Updated**: December 17, 2025
> **Status**: Analysis Complete

## Related Documents

| Document | Description |
|----------|-------------|
| [UNIFIED_AI_COMPANION_SERVICE.md](./UNIFIED_AI_COMPANION_SERVICE.md) | Main architecture and API design |
| [UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md](./UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md) | Backend code structure and patterns |
| [ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md](./ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md) | Full backend restructuring proposal |
| [BACKEND_SERVICE_REORGANIZATION.md](./BACKEND_SERVICE_REORGANIZATION.md) | Service migration guide (85 files) |

---

## Executive Summary

This document consolidates the analysis of:
1. **12 existing AI wizards/companions** discovered across the platform
2. **8-layer Enterprise Ontology** (L0-L7) that powers the VITAL platform

The Unified AI Companion Service must deeply integrate with the ontology to provide intelligent, context-aware assistance across all platform services.

---

## Part 1: Enterprise Ontology Structure (8 Layers)

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ENTERPRISE ONTOLOGY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  L7 ┌─────────────────────────────────────────────────────────────────┐│
│     │ VALUE TRANSFORMATION                                            ││
│     │ • Value Drivers (VPANES scoring)                                ││
│     │ • Opportunity Identification (ODI scoring)                      ││
│     │ • ROI Tracking & Realization                                    ││
│     └─────────────────────────────────────────────────────────────────┘│
│                                    ▲                                   │
│  L5 ┌─────────────────────────────┼───────────────────────────────────┐│
│     │ EXECUTION                   │                                   ││
│     │ • Execution Contexts        │                                   ││
│     │ • Session Management        │                                   ││
│     │ • Conversation Tracking     │                                   ││
│     └─────────────────────────────┼───────────────────────────────────┘│
│                                    ▲                                   │
│  L4 ┌─────────────────────────────┼───────────────────────────────────┐│
│     │ AGENT COORDINATION          │ (services/ai-engine/agents)       ││
│     │ • Agent Registry            │                                   ││
│     │ • Agent Capabilities        │                                   ││
│     │ • Multi-Agent Orchestration │                                   ││
│     └─────────────────────────────┼───────────────────────────────────┘│
│                                    ▲                                   │
│  L3 ┌─────────────────────────────┼───────────────────────────────────┐│
│     │ TASK & ACTIVITY             │ (platform/jtbds)                  ││
│     │ • JTBDs (Jobs To Be Done)   │                                   ││
│     │ • ODI Scoring (Importance × Satisfaction Gap)                   ││
│     │ • Task Categories           │                                   ││
│     └─────────────────────────────┼───────────────────────────────────┘│
│                                    ▲                                   │
│  L2 ┌─────────────────────────────┼───────────────────────────────────┐│
│     │ PROCESS & WORKFLOW          │ (platform/workflows)              ││
│     │ • Workflow Templates        │                                   ││
│     │ • Process Definitions       │                                   ││
│     │ • Stage Transitions         │                                   ││
│     └─────────────────────────────┼───────────────────────────────────┘│
│                                    ▲                                   │
│  L1 ┌─────────────────────────────┼───────────────────────────────────┐│
│     │ ORGANIZATIONAL STRUCTURE    │                                   ││
│     │ • Functions (Medical Affairs, Commercial, R&D, Market Access)   ││
│     │ • Departments (Field Medical, HEOR, Medical Info)               ││
│     │ • Roles (MSL, Medical Director, HEOR Analyst)                   ││
│     │ • Teams & Geography                                             ││
│     └─────────────────────────────┼───────────────────────────────────┘│
│                                    ▲                                   │
│  L0 ┌─────────────────────────────┼───────────────────────────────────┐│
│     │ DOMAIN KNOWLEDGE (RAG Integration)                              ││
│     │ • Therapeutic Areas (Oncology, Immunology, Neurology...)        ││
│     │ • Diseases/Indications (ICD-10, Orphanet, MeSH)                 ││
│     │ • Products (tenant-specific, lifecycle stage)                   ││
│     │ • Evidence Types (RCT, Meta-analysis, RWE, Claims)              ││
│     │ • Stakeholder Types (KOL, HCP, Payer, Regulator)                ││
│     │ • Regulatory Jurisdictions (FDA, EMA, PMDA, MHRA)               ││
│     └─────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Tables Per Layer

| Layer | Key Tables | Purpose |
|-------|------------|---------|
| **L0** | `l0_therapeutic_areas`, `l0_diseases`, `l0_products`, `l0_evidence_types`, `l0_stakeholder_types`, `l0_regulatory_jurisdictions` | Domain knowledge references (RAG pointers) |
| **L1** | `org_business_functions`, `org_departments`, `org_roles`, `org_teams`, `org_geographies` | Organizational hierarchy |
| **L2** | `workflow_templates`, `workflow_stages`, `workflow_tasks` | Process definitions |
| **L3** | `ref_jtbds`, `jtbd_roles`, `jtbd_functions` | Jobs to be done |
| **L4** | `agents`, `agent_capabilities`, `agent_skill_assignments` | Agent registry |
| **L5** | `execution_contexts`, `conversations`, `messages` | Runtime execution |
| **L7** | `value_drivers`, `jtbd_value_drivers`, `opportunity_scores`, `value_realization_tracking` | Value & ROI |

---

## Part 2: Existing AI Wizards/Companions (12 Found)

### Discovery Summary

| # | Service | Location | Layer Integration | Gaps |
|---|---------|----------|-------------------|------|
| 1 | **PromptEnhancer** | `lib/shared/components/chat/prompt-enhancer.tsx` | L4 (agents) | No L0-L3 context |
| 2 | **AgentCreationWizard** | `features/agents/components/agent-creation-wizard.tsx` | L4 (agents) | No L1 role/function mapping |
| 3 | **AIInterviewWizard** | `features/ask-expert/components/autonomous/AIInterviewWizard.tsx` | L3 (JTBD) | Partial JTBD integration |
| 4 | **generate-system-prompt API** | `api/generate-system-prompt/route.ts` | L4 (agents) | Domain detection only |
| 5 | **classify API** | `api/classify/route.ts` | L0 (domains) | Hardcoded patterns |
| 6 | **agents/recommend API** | `api/agents/recommend/route.ts` | L4 (agents) | No L1 role context |
| 7 | **PRISM API** | `api/prism/route.ts` | L2 (prompts) | Template service only |
| 8 | **CitationPromptEnhancer** | `services/citation_prompt_enhancer.py` | L0 (evidence) | Narrow scope |
| 9 | **ArtifactGenerator** | `services/artifact_generator.py` | L5 (execution) | No L7 value tracking |
| 10 | **AgentEnrichmentService** | `services/agent_enrichment_service.py` | L4, L0 | Good model selection |
| 11 | **OntologyInvestigator** | `api/routers/enterprise_ontology/ontology.py` | L1 | Data API only |
| 12 | **context_enricher** | `modules/expert/services/context_enricher.py` | L4 | Expert module specific |

### Critical Gaps Identified

1. **No L7 Integration** - None of the AI services connect to Value Drivers or ROI tracking
2. **Partial L1 Integration** - Agent recommendation doesn't consider user's role/function
3. **No JTBD Context** - Wizards don't suggest JTBDs relevant to user's role
4. **Fragmented Domain Detection** - 3 separate implementations, none using L0 tables
5. **No Cross-Layer Intelligence** - Services don't traverse the ontology hierarchy

---

## Part 3: Unified AI Companion - Ontology Integration Design

### Architecture with Ontology Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED AI COMPANION SERVICE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      AI COMPANION GATEWAY                            │  │
│  │  Orchestrates all capabilities with ontology context                 │  │
│  └───────────────────────────────┬──────────────────────────────────────┘  │
│                                  │                                         │
│  ┌───────────────────────────────┴──────────────────────────────────────┐  │
│  │                    ONTOLOGY CONTEXT MANAGER                          │  │
│  │                                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │   L0-L1     │  │   L2-L3     │  │    L4       │  │    L7       │ │  │
│  │  │  Resolver   │  │  Resolver   │  │  Resolver   │  │  Resolver   │ │  │
│  │  │             │  │             │  │             │  │             │ │  │
│  │  │ • TA/Disease│  │ • Workflows │  │ • Agents    │  │ • Value     │ │  │
│  │  │ • Products  │  │ • JTBDs     │  │ • Skills    │  │   Drivers   │ │  │
│  │  │ • Roles     │  │ • Tasks     │  │ • Caps      │  │ • ODI/VPANES│ │  │
│  │  │ • Functions │  │             │  │             │  │ • ROI       │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                  │                                         │
│  ┌───────────────────────────────┴──────────────────────────────────────┐  │
│  │                      CAPABILITY SERVICES                             │  │
│  │                                                                      │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │ Domain           │  │ Prompt           │  │ Wizard           │   │  │
│  │  │ Intelligence     │  │ Engineering      │  │ Support          │   │  │
│  │  │                  │  │                  │  │                  │   │  │
│  │  │ Uses:            │  │ Uses:            │  │ Uses:            │   │  │
│  │  │ • L0 tables      │  │ • L4 agents      │  │ • L1 roles       │   │  │
│  │  │ • L1 functions   │  │ • L0 domains     │  │ • L3 JTBDs       │   │  │
│  │  │ • L4 agents      │  │ • PRISM suites   │  │ • L7 value       │   │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │ Artifact         │  │ Value            │  │ Ontology         │   │  │
│  │  │ Generation       │  │ Intelligence     │  │ Navigator        │   │  │
│  │  │                  │  │ 🆕 NEW           │  │                  │   │  │
│  │  │ Uses:            │  │                  │  │ Uses:            │   │  │
│  │  │ • L0 evidence    │  │ Uses:            │  │ • All layers     │   │  │
│  │  │ • L5 execution   │  │ • L7 value       │  │ • Cross-layer    │   │  │
│  │  │ • L7 tracking    │  │ • L3 JTBDs       │  │   traversal      │   │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### New Capability: Ontology Context Manager

```python
# services/unified_ai_companion/core/ontology_context_manager.py
"""
Ontology Context Manager
========================

Provides unified access to all 8 ontology layers.
Enables cross-layer resolution and context building.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class OntologyContext(BaseModel):
    """Full ontology context for a user/query."""

    # L0: Domain Knowledge
    therapeutic_areas: List[Dict] = []
    diseases: List[Dict] = []
    products: List[Dict] = []
    evidence_types: List[Dict] = []
    stakeholder_types: List[Dict] = []
    jurisdictions: List[Dict] = []

    # L1: Organizational
    user_function: Optional[Dict] = None  # Medical Affairs, Commercial, etc.
    user_department: Optional[Dict] = None
    user_role: Optional[Dict] = None
    user_geography: Optional[Dict] = None

    # L2-L3: Process & Task
    relevant_workflows: List[Dict] = []
    relevant_jtbds: List[Dict] = []
    jtbd_scores: Dict[str, float] = {}  # ODI scores

    # L4: Agent
    recommended_agents: List[Dict] = []
    agent_capabilities: List[str] = []

    # L7: Value
    value_drivers: List[Dict] = []
    opportunity_score: Optional[float] = None
    vpanes_scores: Dict[str, float] = {}


class OntologyContextManager:
    """
    Manages ontology context across all 8 layers.

    Provides:
    - Layer-specific resolvers
    - Cross-layer traversal
    - Context caching
    - Hierarchy navigation
    """

    def __init__(self, supabase_client: Any):
        self._supabase = supabase_client
        self._cache = {}

    async def build_context(
        self,
        query: str,
        user_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
    ) -> OntologyContext:
        """
        Build full ontology context for a query.

        This is the main entry point that traverses all layers
        to build rich context for AI operations.
        """
        context = OntologyContext()

        # L0: Resolve domain knowledge from query
        context.therapeutic_areas = await self._resolve_therapeutic_areas(query)
        context.diseases = await self._resolve_diseases(query, context.therapeutic_areas)
        context.evidence_types = await self._resolve_evidence_types(query)
        context.jurisdictions = await self._resolve_jurisdictions(query)

        # L1: Resolve organizational context (if user known)
        if user_id:
            org_context = await self._resolve_organizational_context(user_id, tenant_id)
            context.user_function = org_context.get("function")
            context.user_department = org_context.get("department")
            context.user_role = org_context.get("role")
            context.user_geography = org_context.get("geography")

        # L2-L3: Resolve relevant workflows and JTBDs
        context.relevant_workflows = await self._resolve_workflows(
            query, context.user_function, context.therapeutic_areas
        )
        context.relevant_jtbds = await self._resolve_jtbds(
            query, context.user_role, context.user_function
        )

        # L4: Resolve agent recommendations
        context.recommended_agents = await self._resolve_agents(
            query,
            context.therapeutic_areas,
            context.user_role,
            tenant_id,
        )

        # L7: Resolve value drivers and opportunity scores
        context.value_drivers = await self._resolve_value_drivers(
            context.relevant_jtbds,
            context.user_function,
        )
        if context.relevant_jtbds:
            context.opportunity_score = self._calculate_opportunity_score(
                context.relevant_jtbds
            )

        return context

    # =========================================================================
    # L0 RESOLVERS
    # =========================================================================

    async def _resolve_therapeutic_areas(self, query: str) -> List[Dict]:
        """Resolve therapeutic areas from L0 tables."""
        # Query l0_therapeutic_areas based on keywords
        result = await self._supabase.client.table("l0_therapeutic_areas") \
            .select("id, unique_id, name, code, regulatory_complexity") \
            .eq("is_active", True) \
            .execute()

        # Score and filter based on query match
        query_lower = query.lower()
        matched = []
        for ta in result.data or []:
            if ta["name"].lower() in query_lower or query_lower in ta["name"].lower():
                matched.append(ta)
        return matched[:5]  # Top 5

    async def _resolve_diseases(
        self,
        query: str,
        therapeutic_areas: List[Dict]
    ) -> List[Dict]:
        """Resolve diseases from L0 tables."""
        ta_ids = [ta["id"] for ta in therapeutic_areas]
        if not ta_ids:
            return []

        result = await self._supabase.client.table("l0_diseases") \
            .select("id, unique_id, name, disease_category, unmet_need_level") \
            .in_("therapeutic_area_id", ta_ids) \
            .eq("is_active", True) \
            .limit(10) \
            .execute()

        return result.data or []

    async def _resolve_evidence_types(self, query: str) -> List[Dict]:
        """Resolve relevant evidence types from L0."""
        result = await self._supabase.client.table("l0_evidence_types") \
            .select("id, unique_id, name, evidence_level, payer_relevance_score") \
            .eq("is_active", True) \
            .execute()

        # Score based on query terms
        query_lower = query.lower()
        evidence_keywords = {
            "rct": ["trial", "randomized", "clinical"],
            "rwe": ["real-world", "rwe", "observational"],
            "meta": ["meta-analysis", "systematic"],
        }

        matched = []
        for ev in result.data or []:
            for ev_type, keywords in evidence_keywords.items():
                if any(kw in query_lower for kw in keywords):
                    if ev_type.lower() in ev["name"].lower():
                        matched.append(ev)
                        break

        return matched or (result.data or [])[:3]  # Default top 3

    async def _resolve_jurisdictions(self, query: str) -> List[Dict]:
        """Resolve regulatory jurisdictions from L0."""
        result = await self._supabase.client.table("l0_regulatory_jurisdictions") \
            .select("id, unique_id, name, regulatory_body_acronym, expedited_pathways") \
            .eq("is_active", True) \
            .execute()

        query_lower = query.lower()
        matched = []
        for jur in result.data or []:
            acronym = jur.get("regulatory_body_acronym", "").lower()
            if acronym and acronym in query_lower:
                matched.append(jur)

        return matched or []

    # =========================================================================
    # L1 RESOLVERS
    # =========================================================================

    async def _resolve_organizational_context(
        self,
        user_id: str,
        tenant_id: Optional[str]
    ) -> Dict:
        """Resolve user's organizational context from L1."""
        # In production, join user → role → department → function
        # Simplified for structure demonstration
        return {
            "function": None,
            "department": None,
            "role": None,
            "geography": None,
        }

    # =========================================================================
    # L2-L3 RESOLVERS
    # =========================================================================

    async def _resolve_workflows(
        self,
        query: str,
        user_function: Optional[Dict],
        therapeutic_areas: List[Dict]
    ) -> List[Dict]:
        """Resolve relevant workflows from L2."""
        # Query workflow_templates relevant to function and domain
        return []

    async def _resolve_jtbds(
        self,
        query: str,
        user_role: Optional[Dict],
        user_function: Optional[Dict]
    ) -> List[Dict]:
        """
        Resolve relevant JTBDs from L3.

        Uses JTBD-Role and JTBD-Function mappings to find
        jobs relevant to the user's context.
        """
        # If we have role/function, query jtbd_roles/jtbd_functions
        return []

    # =========================================================================
    # L4 RESOLVERS
    # =========================================================================

    async def _resolve_agents(
        self,
        query: str,
        therapeutic_areas: List[Dict],
        user_role: Optional[Dict],
        tenant_id: Optional[str]
    ) -> List[Dict]:
        """
        Resolve recommended agents from L4.

        Enhanced from current recommend API to include:
        - L0 domain alignment
        - L1 role fit
        - L3 JTBD capability match
        """
        # Current implementation + ontology enhancement
        return []

    # =========================================================================
    # L7 RESOLVERS
    # =========================================================================

    async def _resolve_value_drivers(
        self,
        jtbds: List[Dict],
        user_function: Optional[Dict]
    ) -> List[Dict]:
        """
        Resolve value drivers from L7.

        Maps JTBDs to value drivers via jtbd_value_drivers junction.
        """
        if not jtbds:
            return []

        jtbd_ids = [j["id"] for j in jtbds]
        result = await self._supabase.client.table("jtbd_value_drivers") \
            .select("*, value_driver:value_drivers(*)") \
            .in_("jtbd_id", jtbd_ids) \
            .execute()

        return [r.get("value_driver") for r in result.data or [] if r.get("value_driver")]

    def _calculate_opportunity_score(self, jtbds: List[Dict]) -> float:
        """
        Calculate aggregate opportunity score using ODI formula.

        ODI = Importance + MAX(Importance - Satisfaction, 0)
        """
        if not jtbds:
            return 0.0

        scores = []
        for jtbd in jtbds:
            importance = jtbd.get("importance_score", 5)
            satisfaction = jtbd.get("satisfaction_score", 5)
            odi = importance + max(importance - satisfaction, 0)
            scores.append(odi)

        return sum(scores) / len(scores) if scores else 0.0
```

### New Capability: Value Intelligence Service

```python
# services/unified_ai_companion/capabilities/value_intelligence.py
"""
Value Intelligence Service (L7 Integration)
==========================================

NEW capability that connects AI operations to business value.
Uses VPANES and ODI scoring from the ontology.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel


class VPANESScore(BaseModel):
    """VPANES scoring result."""
    value: float       # 0-10: Business value potential
    pain: float        # 0-10: Current pain level
    adoption: float    # 0-10: Adoption likelihood
    network: float     # 0-10: Network effects
    ease: float        # 0-10: Implementation ease
    strategic: float   # 0-10: Strategic alignment

    @property
    def total_score(self) -> float:
        """Calculate weighted total score."""
        weights = {
            "value": 0.25,
            "pain": 0.20,
            "adoption": 0.15,
            "network": 0.10,
            "ease": 0.15,
            "strategic": 0.15,
        }
        return (
            self.value * weights["value"] +
            self.pain * weights["pain"] +
            self.adoption * weights["adoption"] +
            self.network * weights["network"] +
            self.ease * weights["ease"] +
            self.strategic * weights["strategic"]
        ) * 10  # Scale to 0-100


class ValueIntelligenceResult(BaseModel):
    """Result from value intelligence analysis."""
    jtbd_id: Optional[str] = None
    jtbd_name: Optional[str] = None
    vpanes_scores: Optional[VPANESScore] = None
    odi_score: float = 0.0
    opportunity_tier: int = 2  # 1=quick win, 2=medium, 3=strategic
    value_drivers: List[Dict] = []
    estimated_roi: Optional[Dict] = None
    recommended_service_layer: str = "ASK_EXPERT"  # ASK_EXPERT, ASK_PANEL, WORKFLOWS


class ValueIntelligenceService:
    """
    Connects AI operations to business value tracking.

    Capabilities:
    - JTBD opportunity scoring (ODI + VPANES)
    - Value driver mapping
    - ROI estimation
    - Service layer recommendation
    """

    async def analyze_value(
        self,
        query: str,
        context: "OntologyContext",
    ) -> ValueIntelligenceResult:
        """
        Analyze the value potential of a query/task.

        Uses L7 ontology data to calculate:
        - ODI opportunity score
        - VPANES scores
        - Value driver alignment
        - ROI estimates
        """
        result = ValueIntelligenceResult()

        # Find most relevant JTBD from context
        if context.relevant_jtbds:
            top_jtbd = context.relevant_jtbds[0]
            result.jtbd_id = top_jtbd.get("id")
            result.jtbd_name = top_jtbd.get("name")

            # Get ODI score
            result.odi_score = self._calculate_odi(top_jtbd)

            # Get VPANES if available
            if "vpanes_scores" in top_jtbd:
                result.vpanes_scores = VPANESScore(**top_jtbd["vpanes_scores"])

            # Determine opportunity tier
            result.opportunity_tier = self._determine_tier(result.odi_score)

        # Map to value drivers
        result.value_drivers = context.value_drivers

        # Recommend service layer based on complexity
        result.recommended_service_layer = self._recommend_service_layer(
            result.odi_score,
            result.opportunity_tier,
        )

        return result

    def _calculate_odi(self, jtbd: Dict) -> float:
        """Calculate ODI score: Importance + MAX(Importance - Satisfaction, 0)"""
        importance = jtbd.get("importance_score", 5)
        satisfaction = jtbd.get("satisfaction_score", 5)
        return importance + max(importance - satisfaction, 0)

    def _determine_tier(self, odi_score: float) -> int:
        """Determine opportunity tier from ODI score."""
        if odi_score >= 15:  # Extreme opportunity
            return 1  # Quick win
        elif odi_score >= 12:  # High opportunity
            return 2  # Medium term
        else:
            return 3  # Strategic/longer term

    def _recommend_service_layer(
        self,
        odi_score: float,
        tier: int
    ) -> str:
        """Recommend VITAL service layer based on value analysis."""
        if tier == 1 and odi_score >= 15:
            return "ASK_EXPERT"  # Quick, high-value
        elif tier == 2:
            return "ASK_PANEL"  # Multi-expert for complex
        else:
            return "WORKFLOWS"  # Systematic for strategic
```

---

## Part 4: Integration Points Summary

### Current State vs Future State

| Capability | Current | Future (with Ontology) |
|------------|---------|------------------------|
| **Domain Detection** | Keyword patterns in 3 places | L0 table queries + semantic matching |
| **Agent Recommendation** | GPT-4 ranking only | L0 domain + L1 role + L4 agents |
| **Wizard Questions** | Generic questions | L1 role + L3 JTBD contextual |
| **Prompt Enhancement** | PRISM templates | L0 domain + L1 function aware |
| **Artifact Generation** | Mode 1/3 cards | L7 value tracking integration |
| **Value Tracking** | ❌ None | L7 VPANES + ODI + ROI |

### Data Flow with Ontology

```
User Query: "Help me prepare for an FDA 510k submission for our oncology SaMD"
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ONTOLOGY CONTEXT BUILD                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  L0: Therapeutic Area = Oncology (TA-ONCOLOGY)                  │
│      Jurisdiction = FDA (REG-US-FDA)                            │
│      Product Type = digital_therapeutic                         │
│      Evidence = regulatory (EVD-RCT-PIVOTAL)                    │
│                                                                 │
│  L1: Function = Regulatory Affairs (detected)                   │
│      (or from user profile if logged in)                        │
│                                                                 │
│  L3: JTBDs = ["Manage 510k submission", "Prepare predicate"]    │
│      ODI Score = 16.5 (Extreme opportunity)                     │
│                                                                 │
│  L4: Agents = [FDA Regulatory Strategist (95%), SaMD Expert (87%)]│
│                                                                 │
│  L7: Value Drivers = [VD-RSK-011: FDA Compliance]               │
│      VPANES Total = 78/100                                      │
│      Service Layer = ASK_EXPERT                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI COMPANION RESPONSE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Domain: REGULATORY + DIGITAL_HEALTH                         │
│  ✅ Recommended Agent: FDA Regulatory Strategist (Tier 3)       │
│  ✅ JTBD Context: "Manage 510k submission" (ODI: 16.5)          │
│  ✅ Value Impact: Risk Reduction (VD-RSK-011)                   │
│  ✅ Service: ASK_EXPERT (quick, high-value)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Implementation Priorities

### Priority 1: Ontology Context Manager (Foundation)
- Query L0-L7 tables efficiently
- Build context from query + user
- Cache ontology data appropriately

### Priority 2: Enhanced Domain Intelligence
- Replace keyword patterns with L0 queries
- Add L1 role/function awareness
- Connect to L4 agent capabilities

### Priority 3: Value Intelligence Service (L7)
- VPANES scoring integration
- ODI opportunity calculation
- Service layer recommendation

### Priority 4: Wizard Enhancement
- L1 role-aware questions
- L3 JTBD suggestions
- L7 value-driven prioritization

---

## Files Created

| File | Purpose |
|------|---------|
| `docs/architecture/UNIFIED_AI_COMPANION_SERVICE.md` | Main architecture design |
| `docs/architecture/UNIFIED_AI_COMPANION_BACKEND_STRUCTURE.md` | Backend code structure |
| `docs/architecture/UNIFIED_AI_COMPANION_ONTOLOGY_INTEGRATION.md` | This file - ontology integration |

---

## Conclusion

The Unified AI Companion must be deeply integrated with the Enterprise Ontology to provide truly intelligent assistance. By leveraging all 8 layers (L0-L7), the service can:

1. **Understand domain context** from L0 tables (not hardcoded patterns)
2. **Know the user's organizational context** from L1
3. **Suggest relevant workflows and JTBDs** from L2-L3
4. **Recommend the right agents** from L4 with ontology awareness
5. **Track and maximize business value** through L7 integration

This transforms the AI companion from a simple prompt enhancer into a context-aware platform intelligence layer.

---

## Part 6: Broader Backend Restructuring

This ontology integration analysis informed a broader initiative to restructure the entire backend codebase around the 8-layer ontology model.

### Full Backend Analysis

The complete backend restructuring proposal is documented in:
- **[ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md](./ONTOLOGY_DRIVEN_BACKEND_STRUCTURE.md)** - Gap analysis and proposed structure
- **[BACKEND_SERVICE_REORGANIZATION.md](./BACKEND_SERVICE_REORGANIZATION.md)** - Migration guide for 85 service files

### Key Findings from Backend Analysis

| Layer | Current Coverage | Gap |
|-------|-----------------|-----|
| L0 Domain Knowledge | 30% | GraphRAG exists but not DB-driven |
| L1 Organizational | 40% | Read-only API, no service layer |
| L2 Process/Workflow | 35% | Code-defined, not ontology-driven |
| **L3 JTBD** | **10%** | **Critical gap - almost no backend support** |
| L4 Agent Coordination | 50% | Different naming (l1-l5 vs L0-L7) |
| L5 Execution | 75% | Best aligned layer |
| L6 Analytics | 40% | Scattered across services |
| **L7 Value** | **20%** | **Critical gap - minimal implementation** |

### Recommended Implementation Order

1. **Create `ontology/l3_jtbd/` module** - Critical for JTBD integration
2. **Create `ontology/l7_value/` module** - Critical for value tracking
3. **Implement OntologyResolver** - Cross-layer context building
4. **Rename agent hierarchy** - Avoid l1-l5 vs L0-L7 confusion
5. **Migrate services** - Organize 85 files by ontology layer

---

*Last Updated: December 17, 2025*
