# Ontology-Aligned Backend Implementation Strategy

> **Version**: 1.0.0
> **Created**: December 17, 2025
> **Status**: Ready for Implementation
> **Owner**: AI Engineering Team

## Executive Summary

This document provides an end-to-end strategy for implementing the ontology-aligned backend structure for VITAL's AI Engine. The transformation reorganizes 709 Python files into an 8-layer semantic architecture that aligns code organization with the Enterprise Ontology model.

**Key Outcomes:**
- Resolve agent naming conflict (l1-l5 → semantic names)
- Consolidate fragmented runners (3 locations → 1)
- Create missing L3 JTBD and L7 Value layers
- Enable database-driven behavior instead of hardcoded patterns

---

## Table of Contents

1. [Current State Summary](#current-state-summary)
2. [Target State Architecture](#target-state-architecture)
3. [Implementation Phases](#implementation-phases)
4. [Phase 1: Foundation](#phase-1-foundation)
5. [Phase 2: Critical Gaps](#phase-2-critical-gaps)
6. [Phase 3: Consolidation](#phase-3-consolidation)
7. [Phase 4: Migration](#phase-4-migration)
8. [Phase 5: Integration](#phase-5-integration)
9. [Risk Mitigation](#risk-mitigation)
10. [Success Metrics](#success-metrics)
11. [Resource Requirements](#resource-requirements)

---

## Current State Summary

### File Inventory

| Directory | Files | Issue |
|-----------|-------|-------|
| `services/` | 85 | Flat structure, no organization |
| `agents/l1-l5/` | 60+ | Naming conflicts with ontology L0-L7 |
| `runners/` | 12 | Framework runners only |
| `langgraph_workflows/task_runners/` | 28 dirs | Task families, separate location |
| `langgraph_workflows/modes34/runners/` | ~10 | Mode-specific, third location |
| `modules/` | 13 | 4 empty placeholders |

### Layer Coverage Gaps

```
L0 Domain Knowledge:     ████████░░░░░░░░░░░░ 30%  (GraphRAG exists, not DB-driven)
L1 Organization:         ████████████░░░░░░░░ 40%  (Basic API, no service layer)
L2 Process/Workflow:     ███████░░░░░░░░░░░░░ 35%  (Code-defined, not DB-driven)
L3 Task/JTBD:            ██░░░░░░░░░░░░░░░░░░ 10%  ⚠️ CRITICAL GAP
L4 Agent Coordination:   ██████████░░░░░░░░░░ 50%  (Agents exist, naming conflict)
L5 Execution:            ███████████████░░░░░ 75%  (Best aligned)
L6 Analytics:            ████████░░░░░░░░░░░░ 40%  (Scattered, not consolidated)
L7 Value Transform:      ████░░░░░░░░░░░░░░░░ 20%  ⚠️ CRITICAL GAP
```

---

## Target State Architecture

### Directory Structure

```
services/ai-engine/src/
│
├── ontology/                              # NEW: 8-layer ontology modules
│   ├── __init__.py
│   ├── resolver.py                        # Cross-layer OntologyResolver
│   ├── l0_domain/                         # L0: Domain Knowledge
│   ├── l1_organization/                   # L1: Organizational Structure
│   ├── l2_process/                        # L2: Process & Workflow
│   ├── l3_jtbd/                           # L3: Task & Activity (NEW)
│   ├── l4_agents/                         # L4: Agent Coordination
│   ├── l5_execution/                      # L5: Execution (consolidated runners)
│   ├── l6_analytics/                      # L6: Analytics (consolidated)
│   └── l7_value/                          # L7: Value Transformation (NEW)
│
├── agents/                                # RENAMED: Semantic naming
│   ├── orchestrators/                     # Was l1_orchestrators
│   ├── experts/                           # Was l2_experts
│   ├── specialists/                       # Was l3_specialists
│   ├── workers/                           # Was l4_workers
│   └── tools/                             # Was l5_tools
│
├── api/routes/ontology/                   # NEW: Ontology CRUD endpoints
│   ├── l0_domain.py
│   ├── l1_organization.py
│   ├── l2_process.py
│   ├── l3_jtbd.py
│   ├── l4_agents.py
│   ├── l5_execution.py
│   ├── l6_analytics.py
│   └── l7_value.py
│
└── ...existing directories...
```

---

## Implementation Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION TIMELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Week 1-2          Week 3-4          Week 5-6          Week 7-8             │
│  ─────────         ─────────         ─────────         ─────────            │
│                                                                              │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐            │
│  │ PHASE 1 │ ──▶  │ PHASE 2 │ ──▶  │ PHASE 3 │ ──▶  │ PHASE 4 │            │
│  │Foundation│      │ Critical│      │ Consol- │      │ Migrate │            │
│  │         │      │  Gaps   │      │ idation │      │         │            │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘            │
│       │                │                │                │                   │
│       ▼                ▼                ▼                ▼                   │
│   Scaffolding      L3 JTBD          Runners         Services                │
│   + Base classes   L7 Value         Agents          + Testing               │
│                                                                              │
│                                                                              │
│  Week 9-10                                                                   │
│  ─────────                                                                   │
│                                                                              │
│  ┌─────────┐                                                                │
│  │ PHASE 5 │                                                                │
│  │Integrate│                                                                │
│  │         │                                                                │
│  └─────────┘                                                                │
│       │                                                                      │
│       ▼                                                                      │
│   OntologyResolver                                                          │
│   + Full wiring                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation

**Duration**: Week 1-2
**Goal**: Create ontology module scaffolding and base classes

### 1.1 Create Directory Structure

```bash
# Execute from services/ai-engine/src/
mkdir -p ontology/{l0_domain,l1_organization,l2_process,l3_jtbd,l4_agents,l5_execution,l6_analytics,l7_value}
mkdir -p ontology/l5_execution/runners/{framework,core,pharma,families,modes34}
mkdir -p api/routes/ontology
mkdir -p api/schemas/ontology
```

### 1.2 Create Base Classes

**File: `ontology/__init__.py`**
```python
"""
VITAL Enterprise Ontology Module

8-layer semantic architecture for AI-driven healthcare platform.

Layers:
    L0: Domain Knowledge - RAG references, therapeutic areas, evidence types
    L1: Organization - Functions, departments, roles, teams
    L2: Process - Workflow templates, stages, tasks
    L3: JTBD - Jobs-to-be-done, pain points, outcomes
    L4: Agents - Agent registry, JTBD mapping, orchestration
    L5: Execution - Mission management, task runners
    L6: Analytics - Session metrics, performance, quality
    L7: Value - VPANES scoring, ODI, ROI analysis
"""

from .resolver import OntologyResolver

__all__ = ["OntologyResolver"]
```

**File: `ontology/base.py`**
```python
"""Base classes for ontology layer services."""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional, List
from pydantic import BaseModel
from supabase import AsyncClient

T = TypeVar("T", bound=BaseModel)


class OntologyLayerService(ABC, Generic[T]):
    """Base class for all ontology layer services."""

    def __init__(self, supabase: AsyncClient, tenant_id: str):
        self.supabase = supabase
        self.tenant_id = tenant_id
        self._cache: dict = {}

    @property
    @abstractmethod
    def layer_name(self) -> str:
        """Return the layer name (e.g., 'l0_domain', 'l3_jtbd')."""
        pass

    @property
    @abstractmethod
    def primary_table(self) -> str:
        """Return the primary database table for this layer."""
        pass

    async def get_by_id(self, entity_id: str) -> Optional[T]:
        """Fetch entity by ID with tenant filtering."""
        cache_key = f"{self.layer_name}:{entity_id}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        result = await self.supabase.table(self.primary_table)\
            .select("*")\
            .eq("id", entity_id)\
            .eq("tenant_id", self.tenant_id)\
            .single()\
            .execute()

        if result.data:
            entity = self._to_model(result.data)
            self._cache[cache_key] = entity
            return entity
        return None

    async def list_all(self, limit: int = 100) -> List[T]:
        """List all entities for tenant."""
        result = await self.supabase.table(self.primary_table)\
            .select("*")\
            .eq("tenant_id", self.tenant_id)\
            .limit(limit)\
            .execute()

        return [self._to_model(row) for row in result.data]

    @abstractmethod
    def _to_model(self, data: dict) -> T:
        """Convert database row to Pydantic model."""
        pass

    def clear_cache(self):
        """Clear the service cache."""
        self._cache.clear()
```

### 1.3 Create Layer Stubs

Create `__init__.py` and service stub for each layer:

**File: `ontology/l0_domain/__init__.py`**
```python
"""L0: Domain Knowledge Layer - RAG references, therapeutic areas, evidence."""

from .service import L0DomainService

__all__ = ["L0DomainService"]
```

**File: `ontology/l0_domain/service.py`**
```python
"""L0 Domain Knowledge Service."""

from typing import Optional, List
from pydantic import BaseModel

from ..base import OntologyLayerService


class TherapeuticArea(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    rag_namespace: Optional[str] = None


class L0DomainService(OntologyLayerService[TherapeuticArea]):
    """Service for L0 Domain Knowledge layer."""

    @property
    def layer_name(self) -> str:
        return "l0_domain"

    @property
    def primary_table(self) -> str:
        return "l0_therapeutic_areas"

    def _to_model(self, data: dict) -> TherapeuticArea:
        return TherapeuticArea(**data)

    async def resolve_domain(
        self,
        query: str,
        therapeutic_area_id: Optional[str] = None
    ) -> dict:
        """Resolve domain context for a query."""
        # TODO: Implement domain resolution logic
        return {
            "therapeutic_area": therapeutic_area_id,
            "evidence_types": [],
            "rag_namespaces": []
        }

    async def get_therapeutic_areas(self) -> List[TherapeuticArea]:
        """Get all therapeutic areas."""
        return await self.list_all()
```

### 1.4 Deliverables Checklist

| Task | File(s) | Status |
|------|---------|--------|
| Create ontology directory structure | `ontology/*/` | ⬜ |
| Create base.py with OntologyLayerService | `ontology/base.py` | ⬜ |
| Create L0 Domain stub | `ontology/l0_domain/` | ⬜ |
| Create L1 Organization stub | `ontology/l1_organization/` | ⬜ |
| Create L2 Process stub | `ontology/l2_process/` | ⬜ |
| Create L3 JTBD stub | `ontology/l3_jtbd/` | ⬜ |
| Create L4 Agents stub | `ontology/l4_agents/` | ⬜ |
| Create L5 Execution stub | `ontology/l5_execution/` | ⬜ |
| Create L6 Analytics stub | `ontology/l6_analytics/` | ⬜ |
| Create L7 Value stub | `ontology/l7_value/` | ⬜ |
| Create resolver.py stub | `ontology/resolver.py` | ⬜ |

---

## Phase 2: Critical Gaps

**Duration**: Week 3-4
**Goal**: Implement L3 JTBD and L7 Value layers (10% and 20% coverage → 80%+)

### 2.1 L3 JTBD Layer Implementation

**File: `ontology/l3_jtbd/models.py`**
```python
"""L3 JTBD Models - Jobs-to-be-Done data structures."""

from typing import Optional, List
from pydantic import BaseModel
from enum import Enum


class JobType(str, Enum):
    FUNCTIONAL = "functional"
    EMOTIONAL = "emotional"
    SOCIAL = "social"


class JobComplexity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXPERT = "expert"


class JTBD(BaseModel):
    """Job-to-be-Done entity."""
    id: str
    code: str
    name: str
    job_statement: str  # "When [situation], I want to [motivation], so I can [outcome]"

    # ODI Format
    when_situation: str
    circumstance: Optional[str] = None
    desired_outcome: str

    # Classification
    job_type: JobType = JobType.FUNCTIONAL
    complexity: JobComplexity = JobComplexity.MEDIUM
    frequency: Optional[str] = None  # daily, weekly, monthly, quarterly, annual

    # Mappings (denormalized for performance)
    function_ids: List[str] = []
    department_ids: List[str] = []
    role_ids: List[str] = []

    # Value indicators
    importance_score: float = 0.0  # 0-10
    satisfaction_score: float = 0.0  # 0-10
    opportunity_score: float = 0.0  # Calculated: importance + max(importance - satisfaction, 0)


class PainPoint(BaseModel):
    """Pain point associated with a JTBD."""
    id: str
    jtbd_id: str
    description: str
    severity: str  # low, medium, high, critical
    frequency: str
    current_workaround: Optional[str] = None


class DesiredOutcome(BaseModel):
    """Desired outcome for a JTBD."""
    id: str
    jtbd_id: str
    outcome_statement: str
    importance: float  # 0-10
    current_satisfaction: float  # 0-10
    direction: str  # minimize, maximize
```

**File: `ontology/l3_jtbd/service.py`**
```python
"""L3 JTBD Service - Jobs-to-be-Done operations."""

from typing import Optional, List
from ..base import OntologyLayerService
from .models import JTBD, PainPoint, DesiredOutcome


class L3JTBDService(OntologyLayerService[JTBD]):
    """Service for L3 JTBD layer."""

    @property
    def layer_name(self) -> str:
        return "l3_jtbd"

    @property
    def primary_table(self) -> str:
        return "jtbds"

    def _to_model(self, data: dict) -> JTBD:
        return JTBD(**data)

    async def find_relevant_jtbds(
        self,
        query: str,
        role_id: Optional[str] = None,
        function_id: Optional[str] = None,
        department_id: Optional[str] = None,
        limit: int = 10
    ) -> List[JTBD]:
        """Find JTBDs relevant to query and organizational context."""

        # Build query with filters
        builder = self.supabase.table("jtbds").select("*")

        if role_id:
            # Use junction table for role filtering
            builder = self.supabase.rpc(
                "find_jtbds_by_role",
                {"p_role_id": role_id, "p_query": query, "p_limit": limit}
            )
        elif function_id:
            builder = self.supabase.rpc(
                "find_jtbds_by_function",
                {"p_function_id": function_id, "p_query": query, "p_limit": limit}
            )
        else:
            # Text search fallback
            builder = builder.text_search("job_statement", query).limit(limit)

        result = await builder.execute()
        return [self._to_model(row) for row in result.data]

    async def get_pain_points(self, jtbd_id: str) -> List[PainPoint]:
        """Get pain points for a JTBD."""
        result = await self.supabase.table("jtbd_pain_points")\
            .select("*")\
            .eq("jtbd_id", jtbd_id)\
            .execute()

        return [PainPoint(**row) for row in result.data]

    async def get_desired_outcomes(self, jtbd_id: str) -> List[DesiredOutcome]:
        """Get desired outcomes for a JTBD."""
        result = await self.supabase.table("jtbd_desired_outcomes")\
            .select("*")\
            .eq("jtbd_id", jtbd_id)\
            .execute()

        return [DesiredOutcome(**row) for row in result.data]

    async def calculate_opportunity_score(self, jtbd_id: str) -> float:
        """Calculate ODI opportunity score for a JTBD."""
        jtbd = await self.get_by_id(jtbd_id)
        if not jtbd:
            return 0.0

        # ODI Formula: Opportunity = Importance + MAX(Importance - Satisfaction, 0)
        importance = jtbd.importance_score
        satisfaction = jtbd.satisfaction_score
        opportunity = importance + max(importance - satisfaction, 0)

        return min(opportunity, 20.0)  # Cap at 20
```

### 2.2 L7 Value Layer Implementation

**File: `ontology/l7_value/models.py`**
```python
"""L7 Value Models - VPANES scoring and value transformation."""

from typing import Optional, List, Dict
from pydantic import BaseModel
from enum import Enum


class ValueCategory(str, Enum):
    SMARTER = "smarter"
    FASTER = "faster"
    BETTER = "better"
    EFFICIENT = "efficient"
    SAFER = "safer"
    SCALABLE = "scalable"


class ValueDriverType(str, Enum):
    INTERNAL = "internal"  # efficiency, quality, compliance
    EXTERNAL = "external"  # HCP, patient, market


class VPANESScore(BaseModel):
    """VPANES scoring model for AI opportunity assessment."""
    jtbd_id: str

    # V - Value (0-10)
    value_score: float = 0.0
    value_rationale: Optional[str] = None

    # P - Pain (0-10)
    pain_score: float = 0.0
    pain_rationale: Optional[str] = None

    # A - Adoption (0-10)
    adoption_score: float = 0.0
    adoption_rationale: Optional[str] = None

    # N - Network (0-10)
    network_score: float = 0.0
    network_rationale: Optional[str] = None

    # E - Ease (0-10)
    ease_score: float = 0.0
    ease_rationale: Optional[str] = None

    # S - Strategic (0-10)
    strategic_score: float = 0.0
    strategic_rationale: Optional[str] = None

    @property
    def total_score(self) -> float:
        """Calculate total VPANES score (0-60)."""
        return (
            self.value_score +
            self.pain_score +
            self.adoption_score +
            self.network_score +
            self.ease_score +
            self.strategic_score
        )

    @property
    def normalized_score(self) -> float:
        """Normalize to 0-100 scale."""
        return (self.total_score / 60) * 100


class ROIEstimate(BaseModel):
    """ROI estimation for a JTBD or workflow."""
    id: str
    jtbd_id: Optional[str] = None
    workflow_id: Optional[str] = None

    # Time savings
    time_saved_hours_per_week: float = 0.0
    time_saved_annual_hours: float = 0.0

    # Cost savings
    hourly_rate: float = 150.0  # Default pharma professional rate
    annual_cost_savings: float = 0.0

    # Quality improvements
    error_reduction_percent: float = 0.0
    quality_improvement_percent: float = 0.0

    # Calculated ROI
    implementation_cost: float = 0.0
    annual_benefit: float = 0.0
    roi_percent: float = 0.0
    payback_months: float = 0.0


class ValueRealization(BaseModel):
    """Track actual value realized from AI implementation."""
    id: str
    jtbd_id: str
    mission_id: Optional[str] = None

    # Estimated vs Actual
    estimated_time_saved: float = 0.0
    actual_time_saved: float = 0.0

    estimated_quality_improvement: float = 0.0
    actual_quality_improvement: float = 0.0

    # User feedback
    user_satisfaction: float = 0.0  # 0-10
    would_recommend: bool = False

    # Timestamps
    created_at: str
    measured_at: Optional[str] = None
```

**File: `ontology/l7_value/service.py`**
```python
"""L7 Value Service - VPANES scoring and ROI analysis."""

from typing import Optional, List
from ..base import OntologyLayerService
from .models import VPANESScore, ROIEstimate, ValueRealization, ValueCategory


class L7ValueService(OntologyLayerService[VPANESScore]):
    """Service for L7 Value Transformation layer."""

    @property
    def layer_name(self) -> str:
        return "l7_value"

    @property
    def primary_table(self) -> str:
        return "jtbd_vpanes_scores"

    def _to_model(self, data: dict) -> VPANESScore:
        return VPANESScore(**data)

    async def get_vpanes_score(self, jtbd_id: str) -> Optional[VPANESScore]:
        """Get VPANES score for a JTBD."""
        result = await self.supabase.table("jtbd_vpanes_scores")\
            .select("*")\
            .eq("jtbd_id", jtbd_id)\
            .single()\
            .execute()

        if result.data:
            return VPANESScore(**result.data)
        return None

    async def calculate_vpanes(
        self,
        jtbd_id: str,
        pain_points: List[dict],
        desired_outcomes: List[dict],
        org_context: dict
    ) -> VPANESScore:
        """Calculate VPANES score for a JTBD."""

        # V - Value: Based on desired outcomes importance
        value_score = sum(o.get("importance", 0) for o in desired_outcomes) / max(len(desired_outcomes), 1)

        # P - Pain: Based on pain point severity
        severity_map = {"low": 2.5, "medium": 5, "high": 7.5, "critical": 10}
        pain_score = sum(severity_map.get(p.get("severity", "medium"), 5) for p in pain_points) / max(len(pain_points), 1)

        # A - Adoption: Based on role/function alignment
        adoption_score = 7.0  # Default, can be enhanced with user adoption data

        # N - Network: Based on cross-functional impact
        network_score = len(org_context.get("impacted_functions", [])) * 2
        network_score = min(network_score, 10)

        # E - Ease: Based on complexity and existing tools
        ease_score = 5.0  # Default, can be enhanced with implementation analysis

        # S - Strategic: Based on strategic priority alignment
        strategic_score = org_context.get("strategic_priority_score", 5.0)

        return VPANESScore(
            jtbd_id=jtbd_id,
            value_score=value_score,
            pain_score=pain_score,
            adoption_score=adoption_score,
            network_score=network_score,
            ease_score=ease_score,
            strategic_score=strategic_score
        )

    async def estimate_roi(
        self,
        jtbd_id: str,
        time_saved_hours_per_week: float,
        hourly_rate: float = 150.0,
        implementation_cost: float = 0.0
    ) -> ROIEstimate:
        """Estimate ROI for a JTBD automation."""

        annual_hours = time_saved_hours_per_week * 52
        annual_savings = annual_hours * hourly_rate

        roi_percent = 0.0
        payback_months = 0.0

        if implementation_cost > 0:
            roi_percent = ((annual_savings - implementation_cost) / implementation_cost) * 100
            payback_months = (implementation_cost / (annual_savings / 12)) if annual_savings > 0 else 0

        return ROIEstimate(
            id=f"roi_{jtbd_id}",
            jtbd_id=jtbd_id,
            time_saved_hours_per_week=time_saved_hours_per_week,
            time_saved_annual_hours=annual_hours,
            hourly_rate=hourly_rate,
            annual_cost_savings=annual_savings,
            implementation_cost=implementation_cost,
            annual_benefit=annual_savings,
            roi_percent=roi_percent,
            payback_months=payback_months
        )

    async def get_value_context(self, jtbds: List[dict]) -> dict:
        """Get aggregated value context for multiple JTBDs."""

        total_vpanes = 0.0
        total_roi = 0.0
        value_categories = []

        for jtbd in jtbds:
            vpanes = await self.get_vpanes_score(jtbd.get("id"))
            if vpanes:
                total_vpanes += vpanes.normalized_score

        return {
            "total_vpanes_score": total_vpanes / max(len(jtbds), 1),
            "estimated_annual_roi": total_roi,
            "value_categories": value_categories,
            "jtbd_count": len(jtbds)
        }
```

### 2.3 Deliverables Checklist

| Task | File(s) | Status |
|------|---------|--------|
| L3 JTBD models | `ontology/l3_jtbd/models.py` | ⬜ |
| L3 JTBD service | `ontology/l3_jtbd/service.py` | ⬜ |
| L3 JTBD API routes | `api/routes/ontology/l3_jtbd.py` | ⬜ |
| L3 database functions | `database/postgres/functions/jtbd_*.sql` | ⬜ |
| L7 Value models | `ontology/l7_value/models.py` | ⬜ |
| L7 Value service | `ontology/l7_value/service.py` | ⬜ |
| L7 Value API routes | `api/routes/ontology/l7_value.py` | ⬜ |
| VPANES scoring function | `database/postgres/functions/vpanes_*.sql` | ⬜ |
| Unit tests for L3 | `tests/unit/ontology/test_l3_jtbd.py` | ⬜ |
| Unit tests for L7 | `tests/unit/ontology/test_l7_value.py` | ⬜ |

---

## Phase 3: Consolidation

**Duration**: Week 5-6
**Goal**: Consolidate runners (3→1 location) and rename agents (l1-l5→semantic)

### 3.1 Runners Consolidation

**Migration Script: `scripts/migrate_runners.py`**
```python
"""Script to consolidate runners from 3 locations to 1."""

import os
import shutil
from pathlib import Path

SRC_ROOT = Path("services/ai-engine/src")

# Source locations
RUNNER_SOURCES = [
    SRC_ROOT / "runners",
    SRC_ROOT / "langgraph_workflows/task_runners",
    SRC_ROOT / "langgraph_workflows/modes34/runners"
]

# Target location
RUNNER_TARGET = SRC_ROOT / "ontology/l5_execution/runners"

MIGRATION_MAP = {
    # From runners/
    "runners/base.py": "runners/framework/base.py",
    "runners/executor.py": "runners/framework/executor.py",
    "runners/assembler.py": "runners/framework/assembler.py",
    "runners/registry.py": "runners/framework/registry.py",
    "runners/core/": "runners/core/",
    "runners/pharma/": "runners/pharma/",

    # From langgraph_workflows/task_runners/
    "langgraph_workflows/task_runners/base_task_runner.py": "runners/families/base.py",
    "langgraph_workflows/task_runners/registry.py": "runners/families/registry.py",
    "langgraph_workflows/task_runners/investigate/": "runners/families/investigate/",
    "langgraph_workflows/task_runners/synthesize/": "runners/families/synthesize/",
    # ... (all 28 families)

    # From langgraph_workflows/modes34/runners/
    "langgraph_workflows/modes34/runners/": "runners/modes34/"
}


def migrate_runners():
    """Execute runner migration."""

    # Create target directories
    for subdir in ["framework", "core", "pharma", "families", "modes34"]:
        (RUNNER_TARGET / subdir).mkdir(parents=True, exist_ok=True)

    # Copy files according to migration map
    for source, target in MIGRATION_MAP.items():
        src_path = SRC_ROOT / source
        tgt_path = RUNNER_TARGET / target.replace("runners/", "")

        if src_path.is_dir():
            if tgt_path.exists():
                shutil.rmtree(tgt_path)
            shutil.copytree(src_path, tgt_path)
        elif src_path.is_file():
            tgt_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_path, tgt_path)

    # Create compatibility imports
    create_compatibility_imports()

    print("Runner migration complete!")


def create_compatibility_imports():
    """Create backward-compatible imports in old locations."""

    compat_template = '''"""
DEPRECATED: This module has moved to ontology/l5_execution/runners/
This file provides backward compatibility. Please update your imports.
"""

import warnings
warnings.warn(
    "Importing from {old_path} is deprecated. "
    "Use ontology.l5_execution.runners instead.",
    DeprecationWarning,
    stacklevel=2
)

from ontology.l5_execution.runners.{new_module} import *
'''

    # Create compatibility files
    # (implementation details...)


if __name__ == "__main__":
    migrate_runners()
```

### 3.2 Agent Directory Renaming

**Migration Script: `scripts/rename_agent_dirs.py`**
```python
"""Script to rename agent directories from l1-l5 to semantic names."""

import os
import re
from pathlib import Path

SRC_ROOT = Path("services/ai-engine/src")
AGENTS_DIR = SRC_ROOT / "agents"

RENAME_MAP = {
    "l1_orchestrators": "orchestrators",
    "l2_experts": "experts",
    "l3_specialists": "specialists",
    "l4_workers": "workers",
    "l5_tools": "tools"
}


def rename_agent_directories():
    """Rename agent directories to semantic names."""

    for old_name, new_name in RENAME_MAP.items():
        old_path = AGENTS_DIR / old_name
        new_path = AGENTS_DIR / new_name

        if old_path.exists():
            # Rename directory
            old_path.rename(new_path)
            print(f"Renamed: {old_name} -> {new_name}")

            # Create compatibility symlink (optional, for gradual migration)
            # os.symlink(new_path, old_path)


def update_imports():
    """Update all imports across the codebase."""

    import_patterns = [
        (r"from agents\.l1_orchestrators", "from agents.orchestrators"),
        (r"from agents\.l2_experts", "from agents.experts"),
        (r"from agents\.l3_specialists", "from agents.specialists"),
        (r"from agents\.l4_workers", "from agents.workers"),
        (r"from agents\.l5_tools", "from agents.tools"),
        (r"import agents\.l1_orchestrators", "import agents.orchestrators"),
        (r"import agents\.l2_experts", "import agents.experts"),
        (r"import agents\.l3_specialists", "import agents.specialists"),
        (r"import agents\.l4_workers", "import agents.workers"),
        (r"import agents\.l5_tools", "import agents.tools"),
    ]

    python_files = list(SRC_ROOT.rglob("*.py"))

    for file_path in python_files:
        content = file_path.read_text()
        original_content = content

        for pattern, replacement in import_patterns:
            content = re.sub(pattern, replacement, content)

        if content != original_content:
            file_path.write_text(content)
            print(f"Updated imports in: {file_path}")


if __name__ == "__main__":
    rename_agent_directories()
    update_imports()
```

### 3.3 Deliverables Checklist

| Task | File(s) | Status |
|------|---------|--------|
| Create runner migration script | `scripts/migrate_runners.py` | ⬜ |
| Execute runner migration | - | ⬜ |
| Create backward compatibility imports | `runners/__init__.py` | ⬜ |
| Create agent rename script | `scripts/rename_agent_dirs.py` | ⬜ |
| Execute agent rename | - | ⬜ |
| Update all imports across codebase | - | ⬜ |
| Verify no broken imports | - | ⬜ |
| Update tests | - | ⬜ |

---

## Phase 4: Migration

**Duration**: Week 7-8
**Goal**: Migrate services/ files to ontology layers and implement remaining layers

### 4.1 Service Migration Map

| Current File | Target Layer | Target Path |
|--------------|--------------|-------------|
| `services/evidence_detector.py` | L0 Domain | `ontology/l0_domain/evidence_types.py` |
| `services/graphrag_namespace_service.py` | L0 Domain | `ontology/l0_domain/rag_pointers.py` |
| `services/organization_service.py` | L1 Organization | `ontology/l1_organization/service.py` |
| `services/workflow_template_service.py` | L2 Process | `ontology/l2_process/workflow_templates.py` |
| `services/agent_service.py` | L4 Agents | `ontology/l4_agents/agent_registry.py` |
| `services/agent_orchestrator.py` | L4 Agents | `ontology/l4_agents/orchestration.py` |
| `services/mission_service.py` | L5 Execution | `ontology/l5_execution/mission_manager.py` |
| `services/mission_event_service.py` | L5 Execution | `ontology/l5_execution/event_publisher.py` |
| `services/session_analytics_service.py` | L6 Analytics | `ontology/l6_analytics/session_analytics.py` |
| `services/agent_usage_tracker.py` | L6 Analytics | `ontology/l6_analytics/usage_tracking.py` |
| `services/response_quality.py` | L6 Analytics | `ontology/l6_analytics/quality_metrics.py` |
| `services/roi_calculator_service.py` | L7 Value | `ontology/l7_value/roi_analyzer.py` |

### 4.2 Implement Remaining Layers

**L0 Domain Service (Enhanced)**
```python
# ontology/l0_domain/service.py

class L0DomainService(OntologyLayerService[TherapeuticArea]):
    """Service for L0 Domain Knowledge layer."""

    async def resolve_domain(
        self,
        query: str,
        therapeutic_area_id: Optional[str] = None
    ) -> DomainContext:
        """Resolve full domain context for a query."""

        # Get therapeutic area
        ta = None
        if therapeutic_area_id:
            ta = await self.get_by_id(therapeutic_area_id)
        else:
            # Infer from query using classification
            ta = await self._classify_therapeutic_area(query)

        # Get relevant evidence types
        evidence_types = await self._get_relevant_evidence_types(query)

        # Get RAG namespaces
        rag_namespaces = await self._get_rag_namespaces(ta)

        return DomainContext(
            therapeutic_area=ta,
            evidence_types=evidence_types,
            rag_namespaces=rag_namespaces,
            jurisdiction=await self._get_jurisdiction()
        )
```

**L4 Agents Service (Ontology-Aware)**
```python
# ontology/l4_agents/service.py

class L4AgentService(OntologyLayerService[AgentDefinition]):
    """Service for L4 Agent Coordination layer."""

    async def select_agents_for_jtbds(
        self,
        jtbds: List[JTBD],
        max_agents: int = 5
    ) -> List[AgentDefinition]:
        """Select best agents for given JTBDs."""

        # Get agent-JTBD mappings
        jtbd_ids = [j.id for j in jtbds]

        result = await self.supabase.rpc(
            "select_agents_for_jtbds",
            {"p_jtbd_ids": jtbd_ids, "p_limit": max_agents}
        ).execute()

        return [AgentDefinition(**row) for row in result.data]

    async def calculate_agent_synergy(
        self,
        agent_ids: List[str]
    ) -> float:
        """Calculate synergy score for a set of agents."""

        # Check complementary capabilities
        # Verify no redundancy
        # Score collaboration potential

        # Implementation...
        return 0.0
```

### 4.3 Deliverables Checklist

| Task | Status |
|------|--------|
| Migrate 12 identified service files | ⬜ |
| Create migration compatibility imports | ⬜ |
| Implement L0 Domain service (enhanced) | ⬜ |
| Implement L1 Organization service | ⬜ |
| Implement L2 Process service | ⬜ |
| Implement L4 Agents service (enhanced) | ⬜ |
| Implement L5 Execution service (enhanced) | ⬜ |
| Implement L6 Analytics service | ⬜ |
| Create API routes for all layers | ⬜ |
| Write integration tests | ⬜ |

---

## Phase 5: Integration

**Duration**: Week 9-10
**Goal**: Wire up OntologyResolver and integrate with Unified AI Companion

### 5.1 OntologyResolver Implementation

**File: `ontology/resolver.py`**
```python
"""Cross-layer OntologyResolver for full context resolution."""

from typing import Optional, List
from dataclasses import dataclass
from supabase import AsyncClient

from .l0_domain import L0DomainService
from .l1_organization import L1OrganizationService
from .l2_process import L2ProcessService
from .l3_jtbd import L3JTBDService
from .l4_agents import L4AgentService
from .l5_execution import L5ExecutionService
from .l6_analytics import L6AnalyticsService
from .l7_value import L7ValueService


@dataclass
class OntologyContext:
    """Full ontology context resolved across all 8 layers."""

    # L0: Domain
    therapeutic_area: Optional[dict] = None
    evidence_types: List[str] = None
    rag_namespaces: List[str] = None

    # L1: Organization
    user_function: Optional[dict] = None
    user_department: Optional[dict] = None
    user_role: Optional[dict] = None

    # L2: Process
    workflow_templates: List[dict] = None

    # L3: JTBD
    relevant_jtbds: List[dict] = None
    pain_points: List[dict] = None

    # L4: Agents
    recommended_agents: List[dict] = None
    agent_synergy_score: float = 0.0

    # L5: Execution
    execution_config: Optional[dict] = None

    # L6: Analytics
    user_history: Optional[dict] = None

    # L7: Value
    vpanes_context: Optional[dict] = None
    estimated_value: float = 0.0


class OntologyResolver:
    """Resolve full ontology context across all 8 layers."""

    def __init__(self, supabase: AsyncClient, tenant_id: str):
        self.tenant_id = tenant_id

        # Initialize all layer services
        self.l0 = L0DomainService(supabase, tenant_id)
        self.l1 = L1OrganizationService(supabase, tenant_id)
        self.l2 = L2ProcessService(supabase, tenant_id)
        self.l3 = L3JTBDService(supabase, tenant_id)
        self.l4 = L4AgentService(supabase, tenant_id)
        self.l5 = L5ExecutionService(supabase, tenant_id)
        self.l6 = L6AnalyticsService(supabase, tenant_id)
        self.l7 = L7ValueService(supabase, tenant_id)

    async def resolve_context(
        self,
        query: str,
        user_id: Optional[str] = None,
        user_role_id: Optional[str] = None,
        therapeutic_area_id: Optional[str] = None,
        include_history: bool = True
    ) -> OntologyContext:
        """Build full ontology context traversing all 8 layers."""

        context = OntologyContext()

        # L0: Domain context
        domain = await self.l0.resolve_domain(query, therapeutic_area_id)
        context.therapeutic_area = domain.therapeutic_area
        context.evidence_types = domain.evidence_types
        context.rag_namespaces = domain.rag_namespaces

        # L1: Organization context
        if user_role_id:
            org = await self.l1.resolve_organization(user_role_id)
            context.user_function = org.function
            context.user_department = org.department
            context.user_role = org.role

        # L2: Process context
        workflow_templates = await self.l2.find_relevant_templates(
            query=query,
            function_id=context.user_function.get("id") if context.user_function else None
        )
        context.workflow_templates = workflow_templates

        # L3: JTBD context
        jtbds = await self.l3.find_relevant_jtbds(
            query=query,
            role_id=user_role_id,
            function_id=context.user_function.get("id") if context.user_function else None
        )
        context.relevant_jtbds = [j.dict() for j in jtbds]

        # Get pain points for top JTBDs
        if jtbds:
            pain_points = await self.l3.get_pain_points(jtbds[0].id)
            context.pain_points = [p.dict() for p in pain_points]

        # L4: Agent context
        agents = await self.l4.select_agents_for_jtbds(jtbds)
        context.recommended_agents = [a.dict() for a in agents]

        if agents:
            agent_ids = [a.id for a in agents]
            context.agent_synergy_score = await self.l4.calculate_agent_synergy(agent_ids)

        # L5: Execution context
        context.execution_config = await self.l5.get_execution_config(
            query_complexity=self._estimate_complexity(query),
            agent_count=len(agents)
        )

        # L6: Analytics context (if history requested)
        if include_history and user_id:
            context.user_history = await self.l6.get_user_history(user_id)

        # L7: Value context
        context.vpanes_context = await self.l7.get_value_context(
            [j.dict() for j in jtbds]
        )
        context.estimated_value = context.vpanes_context.get("total_vpanes_score", 0)

        return context

    def _estimate_complexity(self, query: str) -> str:
        """Estimate query complexity for execution config."""
        word_count = len(query.split())
        if word_count < 20:
            return "simple"
        elif word_count < 50:
            return "moderate"
        else:
            return "complex"

    async def resolve_for_agent_selection(
        self,
        query: str,
        user_role_id: Optional[str] = None
    ) -> List[dict]:
        """Quick resolution focused on agent selection only."""

        # L3: Find JTBDs
        jtbds = await self.l3.find_relevant_jtbds(query=query, role_id=user_role_id)

        # L4: Select agents
        agents = await self.l4.select_agents_for_jtbds(jtbds)

        return [a.dict() for a in agents]
```

### 5.2 Integration with Unified AI Companion

**File: `modules/companion/ontology_aware_companion.py`**
```python
"""Ontology-aware Unified AI Companion."""

from typing import Optional
from ontology import OntologyResolver
from .base_companion import BaseCompanion


class OntologyAwareCompanion(BaseCompanion):
    """AI Companion that uses ontology for context resolution."""

    def __init__(self, supabase, tenant_id: str):
        super().__init__(supabase, tenant_id)
        self.ontology = OntologyResolver(supabase, tenant_id)

    async def process_request(self, request: dict) -> dict:
        """Process companion request with full ontology context."""

        # Get full ontology context
        context = await self.ontology.resolve_context(
            query=request.get("input", ""),
            user_id=request.get("user_id"),
            user_role_id=request.get("user_role_id"),
            therapeutic_area_id=request.get("therapeutic_area_id")
        )

        # Route to appropriate handler based on request type
        request_type = request.get("type", "chat")

        if request_type == "agent_recommendation":
            return await self._recommend_agents(context)
        elif request_type == "prompt_enhancement":
            return await self._enhance_prompt(request.get("input"), context)
        elif request_type == "value_estimation":
            return await self._estimate_value(context)
        elif request_type == "chat":
            return await self._process_chat(request.get("input"), context)
        else:
            raise ValueError(f"Unknown request type: {request_type}")

    async def _recommend_agents(self, context) -> dict:
        """Recommend agents based on ontology context."""
        return {
            "recommended_agents": context.recommended_agents,
            "synergy_score": context.agent_synergy_score,
            "relevant_jtbds": context.relevant_jtbds[:3],
            "estimated_value": context.estimated_value
        }

    async def _enhance_prompt(self, prompt: str, context) -> dict:
        """Enhance prompt with ontology context."""

        enhanced = prompt

        # Add domain context
        if context.therapeutic_area:
            enhanced = f"[Domain: {context.therapeutic_area.get('name')}] {enhanced}"

        # Add role context
        if context.user_role:
            enhanced = f"[Role: {context.user_role.get('name')}] {enhanced}"

        # Add JTBD context
        if context.relevant_jtbds:
            jtbd_names = [j.get("name") for j in context.relevant_jtbds[:2]]
            enhanced = f"[Tasks: {', '.join(jtbd_names)}] {enhanced}"

        return {
            "original_prompt": prompt,
            "enhanced_prompt": enhanced,
            "context_used": {
                "domain": context.therapeutic_area,
                "role": context.user_role,
                "jtbds": context.relevant_jtbds[:2]
            }
        }

    async def _estimate_value(self, context) -> dict:
        """Estimate value based on VPANES and JTBDs."""
        return {
            "vpanes_score": context.estimated_value,
            "jtbd_count": len(context.relevant_jtbds) if context.relevant_jtbds else 0,
            "vpanes_breakdown": context.vpanes_context
        }
```

### 5.3 API Integration

**File: `api/routes/ontology/resolver.py`**
```python
"""API routes for OntologyResolver."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from ontology import OntologyResolver
from api.deps import get_supabase, get_tenant_id

router = APIRouter(prefix="/ontology", tags=["ontology"])


class ResolveContextRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    user_role_id: Optional[str] = None
    therapeutic_area_id: Optional[str] = None
    include_history: bool = True


@router.post("/resolve")
async def resolve_ontology_context(
    request: ResolveContextRequest,
    supabase=Depends(get_supabase),
    tenant_id: str = Depends(get_tenant_id)
):
    """Resolve full ontology context for a query."""

    resolver = OntologyResolver(supabase, tenant_id)

    context = await resolver.resolve_context(
        query=request.query,
        user_id=request.user_id,
        user_role_id=request.user_role_id,
        therapeutic_area_id=request.therapeutic_area_id,
        include_history=request.include_history
    )

    return context


@router.post("/recommend-agents")
async def recommend_agents(
    query: str,
    user_role_id: Optional[str] = None,
    supabase=Depends(get_supabase),
    tenant_id: str = Depends(get_tenant_id)
):
    """Quick agent recommendation based on query."""

    resolver = OntologyResolver(supabase, tenant_id)
    agents = await resolver.resolve_for_agent_selection(query, user_role_id)

    return {"recommended_agents": agents}
```

### 5.4 Deliverables Checklist

| Task | File(s) | Status |
|------|---------|--------|
| Implement OntologyResolver | `ontology/resolver.py` | ⬜ |
| Implement OntologyAwareCompanion | `modules/companion/ontology_aware_companion.py` | ⬜ |
| Create resolver API routes | `api/routes/ontology/resolver.py` | ⬜ |
| Wire up OntologyResolver to Ask Expert | `modules/expert/` | ⬜ |
| Wire up OntologyResolver to Ask Panels | `modules/panels/` | ⬜ |
| End-to-end integration tests | `tests/integration/test_ontology_resolver.py` | ⬜ |
| Performance benchmarks | `tests/performance/test_resolver_perf.py` | ⬜ |
| Documentation update | `docs/` | ⬜ |

---

## Risk Mitigation

### High Risk: Breaking Existing Functionality

**Mitigation:**
1. Create backward compatibility imports for all renamed/moved modules
2. Run full test suite after each migration step
3. Keep old paths as deprecated aliases for 2 releases
4. Feature flag new ontology-aware code paths

### Medium Risk: Database Schema Changes

**Mitigation:**
1. Use additive migrations only (no destructive changes)
2. Create views for backward compatibility
3. Test migrations in staging before production

### Medium Risk: Performance Degradation

**Mitigation:**
1. Add caching layer for ontology data (Redis)
2. Use database functions for complex queries
3. Implement lazy loading for context resolution
4. Benchmark before/after each phase

### Low Risk: Developer Confusion

**Mitigation:**
1. Clear documentation for new structure
2. IDE snippets for common patterns
3. Migration guide for import changes
4. Team training sessions

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] All 8 layer directories created with stubs
- [ ] Base classes implemented and tested
- [ ] No import errors

### Phase 2 Success Criteria
- [ ] L3 JTBD coverage: 10% → 80%
- [ ] L7 Value coverage: 20% → 80%
- [ ] VPANES scoring functional
- [ ] ODI calculation functional

### Phase 3 Success Criteria
- [ ] Runners consolidated: 3 locations → 1
- [ ] Agents renamed: l1-l5 → semantic
- [ ] All imports updated
- [ ] No deprecated warnings in production

### Phase 4 Success Criteria
- [ ] 12 services migrated to ontology layers
- [ ] All layer services functional
- [ ] API routes for all layers
- [ ] Integration tests passing

### Phase 5 Success Criteria
- [ ] OntologyResolver resolves context in <500ms
- [ ] AI Companion uses ontology for all requests
- [ ] Agent selection is JTBD-aware
- [ ] Value tracking integrated

### Overall Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Layer Coverage (avg) | 38% | - | 75%+ |
| L3 JTBD Coverage | 10% | - | 80%+ |
| L7 Value Coverage | 20% | - | 80%+ |
| Runner Locations | 3 | 1 | 1 |
| Agent Naming Conflicts | Yes | No | No |
| Ontology Context Resolution | N/A | - | <500ms |

---

## Resource Requirements

### Team Allocation

| Role | Allocation | Duration |
|------|------------|----------|
| Senior Backend Engineer | 100% | 10 weeks |
| Backend Engineer | 50% | 10 weeks |
| DevOps Engineer | 25% | Week 1, 9-10 |
| QA Engineer | 50% | Week 5-10 |
| Technical Writer | 25% | Week 8-10 |

### Infrastructure

| Resource | Purpose |
|----------|---------|
| Staging Environment | Migration testing |
| Redis Cache | Ontology data caching |
| CI/CD Pipeline Updates | New test paths |
| Monitoring Dashboards | Performance tracking |

### Dependencies

| Dependency | Phase | Status |
|------------|-------|--------|
| Database schema for L3 JTBD | Phase 2 | Exists |
| Database schema for L7 Value | Phase 2 | Exists |
| Supabase async client | Phase 1 | Exists |
| Test fixtures for ontology | Phase 2 | Needs creation |

---

## Appendix A: File Migration Manifest

Full list of files to migrate: See [BACKEND_SERVICE_REORGANIZATION.md](./architecture/BACKEND_SERVICE_REORGANIZATION.md)

## Appendix B: Database Functions Required

```sql
-- L3 JTBD Functions
CREATE OR REPLACE FUNCTION find_jtbds_by_role(p_role_id UUID, p_query TEXT, p_limit INT)
CREATE OR REPLACE FUNCTION find_jtbds_by_function(p_function_id UUID, p_query TEXT, p_limit INT)
CREATE OR REPLACE FUNCTION calculate_odi_score(p_jtbd_id UUID)

-- L4 Agent Functions
CREATE OR REPLACE FUNCTION select_agents_for_jtbds(p_jtbd_ids UUID[], p_limit INT)
CREATE OR REPLACE FUNCTION calculate_agent_synergy(p_agent_ids UUID[])

-- L7 Value Functions
CREATE OR REPLACE FUNCTION calculate_vpanes(p_jtbd_id UUID)
CREATE OR REPLACE FUNCTION estimate_roi(p_jtbd_id UUID, p_time_saved FLOAT)
```

---

*Last Updated: December 17, 2025*
*Status: Ready for Implementation*
