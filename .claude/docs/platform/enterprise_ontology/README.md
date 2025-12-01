# Enterprise Ontology

## Purpose

The Enterprise Ontology is a comprehensive knowledge graph framework that connects:

- **Organizational Structure**: Functions, Departments, Roles, Teams
- **People**: Personas, Archetypes, Competencies, Capabilities
- **Work**: JTBDs, Activities, Workflows, Processes
- **Value**: Opportunities, Benefits, Impact, ROI
- **Change**: Readiness, Adoption, Learning, Development
- **Services**: Platform capabilities, AI companions, Tools

## Vision

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ENTERPRISE KNOWLEDGE GRAPH                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│   │ FUNCTIONS│───▶│DEPARTMENTS│───▶│  ROLES   │───▶│ PERSONAS │        │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘        │
│        │               │               │               │               │
│        ▼               ▼               ▼               ▼               │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐        │
│   │CAPABILITIES│   │ PROCESSES│    │COMPETENCIES│   │ARCHETYPES│        │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘        │
│        │               │               │               │               │
│        └───────────────┴───────┬───────┴───────────────┘               │
│                                │                                        │
│                                ▼                                        │
│                    ┌─────────────────────┐                             │
│                    │   VALUE CREATION    │                             │
│                    │  ─────────────────  │                             │
│                    │  Pain Points        │                             │
│                    │  Opportunities      │                             │
│                    │  Benefits           │                             │
│                    │  Impact             │                             │
│                    └─────────────────────┘                             │
│                                │                                        │
│                                ▼                                        │
│                    ┌─────────────────────┐                             │
│                    │  SERVICE ECOSYSTEM  │                             │
│                    │  ─────────────────  │                             │
│                    │  Value Investigator │                             │
│                    │  Workflows          │                             │
│                    │  Expert Panels      │                             │
│                    │  Solution Builder   │                             │
│                    └─────────────────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
enterprise_ontology/
├── README.md                    # This file
├── INDEX.md                     # Navigation and quick links
│
├── strategy/                    # Strategic documents
│   ├── ENTERPRISE_ONTOLOGY_STRATEGY.md
│   ├── CROSS_FUNCTIONAL_COLLABORATION.md
│   └── SCALABILITY_BLUEPRINT.md
│
├── schemas/                     # Database schemas
│   ├── 001_organizational_structure.sql
│   ├── 002_capabilities_competencies.sql
│   ├── 003_value_framework.sql
│   ├── 004_change_management.sql
│   └── 005_service_ecosystem.sql
│
├── seeds/                       # Reference data seeds
│   ├── functions/               # Business function seeds
│   ├── departments/             # Department seeds
│   ├── roles/                   # Role seeds (by function)
│   └── cross_functional/        # Cross-functional mappings
│
├── value_framework/             # Value and ROI models
│   ├── VALUE_DRIVERS.md
│   ├── IMPACT_MODEL.md
│   ├── ROI_CALCULATOR.md
│   └── BENEFIT_TRACKING.md
│
├── change_management/           # Change and adoption
│   ├── READINESS_ASSESSMENT.md
│   ├── ADOPTION_CURVES.md
│   └── RESISTANCE_FACTORS.md
│
├── capabilities/                # Organizational capabilities
│   ├── CAPABILITY_TAXONOMY.md
│   ├── MATURITY_MODEL.md
│   └── GAP_ANALYSIS.md
│
├── companions/                  # AI companion designs
│   ├── VALUE_INVESTIGATOR.md
│   └── COMPANION_ARCHITECTURE.md
│
└── visualizations/              # Interactive graph designs
    ├── GRAPH_COMPONENTS.md
    └── DASHBOARD_SPECS.md
```

## Entity Domains

### 1. Organizational Structure
| Entity | Description | Example |
|--------|-------------|---------|
| Business Function | Top-level organizational unit | Medical Affairs, Commercial, R&D |
| Department | Functional sub-unit | Field Medical, Medical Information |
| Role | Job title with responsibilities | MSL, Medical Director |
| Team | Cross-functional working group | Launch Team, Advisory Board |
| Geography | Location hierarchy | Global → Region → Country → Site |

### 2. People & Personas
| Entity | Description | Example |
|--------|-------------|---------|
| Persona | Role-based user archetype | Dr. Sarah Chen, MSL Automator |
| Archetype | MECE behavioral segment | AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC |
| Competency | Role-required skill | KOL Engagement, Clinical Knowledge |
| Capability | Organizational ability | Launch Excellence, Evidence Generation |

### 3. Work & Processes
| Entity | Description | Example |
|--------|-------------|---------|
| JTBD | Job to be Done | Pre-meeting preparation |
| Activity | Daily task | KOL meeting, Documentation |
| Workflow | Process sequence | Medical inquiry response |
| Handoff | Cross-functional transfer | Medical → Commercial approval |

### 4. Value & Impact
| Entity | Description | Example |
|--------|-------------|---------|
| Pain Point | Problem or friction | Manual CRM entry |
| Opportunity | Solution potential | AI-powered documentation |
| Value Driver | Benefit type | Time savings, Quality improvement |
| Impact Metric | Measurable outcome | Hours saved per week |

### 5. Change & Learning
| Entity | Description | Example |
|--------|-------------|---------|
| Change Readiness | Adoption likelihood | High, Medium, Low |
| Learning Path | Development journey | MSL → Senior MSL → Manager |
| Training Program | Formal learning | GxP Compliance, AI Tools |
| Adoption Stage | Implementation phase | Awareness → Trial → Adoption |

### 6. Services & Tools
| Entity | Description | Example |
|--------|-------------|---------|
| Service Layer | Platform capability | ASK_EXPERT, WORKFLOWS |
| Tool | Software used | Veeva CRM, Teams |
| Companion | AI assistant | Value Investigator |
| Integration | System connection | CRM-Safety database |

## Cross-Functional Scope

### Functions Covered
- **Medical Affairs** (Primary - detailed)
- **Commercial** (Sales, Marketing, Market Access)
- **R&D** (Clinical Development, Regulatory)
- **Corporate** (HR, Finance, Legal, IT)

### Collaboration Patterns
- Medical ↔ Commercial (Launch, Messaging)
- Medical ↔ R&D (Clinical trials, Evidence)
- Medical ↔ Market Access (HEOR, Payer engagement)
- Cross-functional teams and governance

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETE
- [x] Personas ontology (Medical Affairs, Commercial, Market Access)
- [x] Pain points taxonomy
- [x] JTBD framework (526 JTBDs, 3,451 role mappings)
- [x] Enterprise structure schema (L0-L7)
- [x] Agent-Role mappings (2,245 mappings)

### Phase 2: Data Layer Integration ✅ COMPLETE
- [x] **Pinecone Vector DB** - Semantic search for agents, personas, knowledge
- [x] **Neo4j Graph DB** - Knowledge graph for relationships
- [x] **Namespace Architecture** - 20+ specialized namespaces
- [x] **GraphRAG Implementation** - Hybrid retrieval (vector + graph)

### Phase 3: Cross-Functional ✅ COMPLETE
- [x] Commercial function mapping (209 agents, 193 roles)
- [x] Medical Affairs mapping (138 agents, 129 roles)
- [x] Market Access mapping (126 agents, 127 roles)
- [x] JTBD-Role junction tables

### Phase 4: Value Framework (In Progress)
- [x] Value drivers taxonomy
- [ ] Impact measurement model
- [ ] ROI calculation framework
- [ ] Benefit tracking system

### Phase 5: Visualization & Companions (Planned)
- [ ] Value Investigator design
- [ ] Interactive knowledge graph
- [ ] Dashboards and analytics
- [ ] User journeys

## Pinecone Namespace Architecture

```
ONTOLOGY LAYER (ont-*)                    KNOWLEDGE LAYER (knowledge-*)
├── ont-agents                            ├── knowledge-reg-fda
├── ont-personas                          ├── knowledge-reg-ema
├── ont-roles                             ├── knowledge-reg-ich
├── ont-capabilities                      ├── knowledge-dh-samd
├── ont-skills                            ├── knowledge-dh-interop
└── ont-responsibilities                  ├── knowledge-clinical-trials
                                          ├── knowledge-ma-msl
                                          ├── knowledge-ma-info
                                          ├── knowledge-heor-rwe
                                          └── knowledge-safety-pv
```

## Neo4j Knowledge Graph (IIG)

The Interaction Intelligence Graph stores:
- L0-L7 entity relationships
- Cross-layer traversal paths
- Persona-Role-Agent connections
- JTBD-Role-Agent mappings
- Domain knowledge relationships

## Related Documentation

- **Personas**: `../personas/` - Role-based personas with MECE archetypes
- **Platform**: `../` - Platform-wide documentation
- **GraphRAG**: `services/ai-engine/src/graphrag/` - Hybrid retrieval implementation
- **Namespace Config**: `services/ai-engine/src/graphrag/namespace_config.py`

## Current Entity Counts (2025-11-30)

| Layer | Entity | Count |
|-------|--------|-------|
| L0 | Tenants | 12 |
| L1 | Functions | 27 |
| L2 | Departments | 149 |
| L3 | Roles | 949 |
| L4 | Personas | 1,798 |
| L5 | JTBDs | 526 |
| L6 | JTBD-Role Mappings | 3,451 |
| L7 | Agents | 972 |
| L7 | Agent-Role Mappings | 2,245 |

## CDC Pipeline Architecture

The CDC (Change Data Capture) Pipeline syncs PostgreSQL data to Neo4j in real-time.

**Implementation**: `services/ai-engine/src/integrations/cdc_pipeline.py`

```
┌──────────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  Supabase PostgreSQL │────▶│   CDC Pipeline    │────▶│ Neo4j Knowledge  │
│  (Source of Truth)   │     │ (Realtime/Polling)│     │     Graph        │
└──────────────────────┘     └───────────────────┘     └──────────────────┘

Modes:
  1. Realtime (WebSocket) - Instant sync via Supabase Realtime
  2. Polling (Fallback)   - 60-second intervals
  3. Full-sync (Recovery) - Complete data reload

Table Mappings:
  org_functions  → Function (Neo4j Node)
  org_departments → Department (Neo4j Node)
  org_roles      → Role (Neo4j Node)
  personas       → Persona (Neo4j Node)
  agents         → Agent (Neo4j Node)
```

**Run Commands:**
```bash
python cdc_pipeline.py full-sync   # Initial data load
python cdc_pipeline.py realtime    # Real-time sync
python cdc_pipeline.py polling     # Fallback polling mode
```

## L0 Domain Knowledge Tables

Schema ready, awaiting data population:

| Table | Purpose | Status |
|-------|---------|--------|
| `domain_therapeutic_areas` | Disease categories | ⏳ Empty |
| `domain_diseases` | Disease ontology | ⏳ Empty |
| `domain_products` | Drug/product data | ⏳ Empty |
| `domain_evidence_types` | Evidence hierarchy | ⏳ Empty |
| `domain_regulatory_frameworks` | Regulatory bodies | ⏳ Empty |
| `domain_hierarchies` | Generic hierarchies | ⏳ Empty |
| `domains` | Master domain list | ⏳ Empty |

## Status

| Component | Status | Last Updated |
|-----------|--------|--------------|
| L0-L7 Schema | ✅ Complete | 2025-11-30 |
| PostgreSQL Tables | ✅ Complete | 2025-11-30 |
| Pinecone Namespaces | ✅ Configured | 2025-11-30 |
| Neo4j Client | ✅ Implemented | 2025-11-30 |
| GraphRAG Service | ✅ Implemented | 2025-11-30 |
| Agent-Role Mappings | ✅ Complete (2,245) | 2025-11-30 |
| JTBD-Role Mappings | ✅ Complete (3,451) | 2025-11-30 |
| CDC Pipeline | ✅ Operational (full-sync complete) | 2025-11-30 |
| L0 Domain Tables | ⚠️ Schema only (no data) | 2025-11-30 |
| Intelligence Broker | ✅ Implemented | 2025-11-30 |
| Value Framework | ⏳ In Progress | - |

## Intelligence Broker Architecture

The Intelligence Broker provides a unified query interface combining all retrieval modalities:

**Implementation**: `services/ai-engine/src/graphrag/intelligence_broker.py`

```
┌─────────────────────────────────────────────────────────────────────┐
│                     INTELLIGENCE BROKER                              │
├─────────────────────────────────────────────────────────────────────┤
│  Query Analysis → Strategy Selection → Multi-Modal Retrieval        │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Neo4j Graph  │  │ Pinecone     │  │ PostgreSQL   │              │
│  │ (Ontology)   │  │ (Vectors)    │  │ (Structured) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         ↓                 ↓                 ↓                       │
│  ┌─────────────────────────────────────────────────────┐           │
│  │        Reciprocal Rank Fusion (RRF)                  │           │
│  └─────────────────────────────────────────────────────┘           │
│                           ↓                                         │
│  ┌─────────────────────────────────────────────────────┐           │
│  │        Unified Context + Evidence Response           │           │
│  └─────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Query complexity analysis (SIMPLE → MODERATE → COMPLEX → REGULATORY)
- Automatic strategy selection (11 pre-configured strategies)
- L0-L7 ontology traversal via Neo4j
- Multi-namespace vector search via Pinecone
- Structured data queries via PostgreSQL
- Service mode optimization (Ask Me, Ask Expert, Ask Panel, Workflows)

**Usage:**
```python
from graphrag import get_intelligence_broker, BrokerQuery, ServiceMode

broker = await get_intelligence_broker()
result = await broker.query(BrokerQuery(
    query="What are the FDA requirements for SaMD?",
    service_mode=ServiceMode.ASK_EXPERT,
    persona_id="uuid-here",
    role_id="uuid-here"
))
```

## Remaining Work

### High Priority
1. **Populate L0 Domain Tables** - Seed therapeutic areas, diseases, products

### Medium Priority
2. **Value Framework** - ROI calculator, impact model, benefit tracking
3. **Value Investigator** - AI companion for value discovery

### Low Priority
4. **Interactive Knowledge Graph** - Visual exploration UI
5. **Dashboards** - Analytics and metrics

### Completed
- ~~**Run CDC Full-Sync**~~ - ✅ DONE (2025-11-30) - Neo4j populated with 3,895 nodes
- ~~**Intelligence Broker**~~ - ✅ DONE (2025-11-30) - Unified query interface implemented

---

**Version**: 2.2.0
**Created**: 2025-11-28
**Updated**: 2025-11-30
**Maintained By**: Data Architecture Team
