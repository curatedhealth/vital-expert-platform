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
│
├── jtbds/                       # Jobs-To-Be-Done Framework
│   ├── jtbds/                   # JTBD definitions and mappings
│   │   ├── migrations/          # JTBD schema migrations
│   │   └── views/               # JTBD analytical views
│   ├── JTBD_GOLD_STANDARD_L3_SCHEMA.md
│   └── JTBD_WORK_PATTERN_OKR_ENRICHMENT.md
│
├── personas/                    # Role-Based Personas
│   ├── seeds/                   # Persona seed data by function
│   │   └── medical_affairs/     # Medical Affairs personas & JTBDs
│   ├── PERSONA_AND_JTBD_SCHEMA_REFINEMENT_SUMMARY.md
│   └── [48 persona definition files]
│
├── architecture/                # Architecture Documentation
│   ├── architecture/            # Implementation guides
│   │   ├── JTBD_PRIORITY_1_IMPLEMENTATION_SUMMARY.md
│   │   └── JTBD_SCHEMA_REFERENCE.md
│   └── data-schema/             # Schema documentation
│       └── vital-expert-data-schema/
│
├── pharma/                      # Pharmaceutical Industry Ontology
│   ├── PHARMA_ONTOLOGY_AUDIT.md
│   ├── ENHANCEMENT_PLAN_PHASE4.md
│   └── [remediation scripts]
│
├── value/                       # Value Layer (NEW)
│   └── VALUE_LAYER_INTEGRATION.md
│
├── sql/                         # SQL Schema & Seeds
│   ├── 014_pharma_ontology_remediation.sql
│   ├── 020_value_drivers_schema_v2.sql    # Hierarchical schema
│   ├── 021_value_drivers_seed_v2.sql      # 66 VD-* drivers
│   └── 022_jtbd_value_driver_bridge.sql   # Legacy→hierarchical bridge
│
├── migrations/                  # All Ontology Migrations
│   ├── 20251129_028_jtbd_gold_standard_phase1.sql
│   ├── 20251129_029_jtbd_gold_standard_phase2.sql
│   ├── 20251129_050_medical_affairs_jtbd_seed.sql
│   ├── 20251129_051_market_access_jtbd_seed.sql
│   ├── 20251129_052_commercial_jtbd_seed.sql
│   └── [additional migration files]
│
├── schemas/                     # Database schemas
├── seeds/                       # Reference data seeds
├── strategy/                    # Strategic documents
├── verification/                # Verification scripts
├── docs/                        # Additional documentation
├── _archive/                    # Archived files
│
├── capabilities/                # Organizational capabilities
├── change_management/           # Change and adoption
├── companions/                  # AI companion designs
├── value_framework/             # Value and ROI models
└── visualizations/              # Interactive graph designs
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

### Phase 4: Value Framework ✅ MOSTLY COMPLETE
- [x] Value drivers taxonomy (66 hierarchical drivers: VD-REV-*, VD-CST-*, VD-RSK-*)
- [x] JTBD-Value Driver mappings (2,520 mappings via bridge migration)
- [x] Value driver hierarchy views (v_value_driver_hierarchy, v_value_driver_jtbd_coverage)
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

## Current Entity Counts (2025-12-03)

| Layer | Entity | Count |
|-------|--------|-------|
| L0 | Tenants | 12 |
| L0 | Therapeutic Areas | 15 |
| L0 | Diseases | 72 |
| L0 | Products | 34 |
| L0 | Evidence Types | 11 |
| L0 | Regulatory Frameworks | 26 |
| L1 | Functions | 27 |
| L2 | Departments | 149 |
| L3 | Roles | 949 |
| L4 | Personas | 1,798 |
| L5 | JTBDs | 461 |
| L6 | JTBD-Role Mappings | 3,451 |
| L6 | JTBD-Value Driver Mappings | 2,520 |
| L7 | Agents | 972 |
| L7 | Agent-Role Mappings | 2,245 |
| - | Value Drivers | 66 |

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

All L0 domain tables are now populated with comprehensive pharmaceutical industry data:

| Table | Purpose | Count | Status |
|-------|---------|-------|--------|
| `domain_therapeutic_areas` | Disease categories | 15 | ✅ Complete |
| `domain_diseases` | Disease ontology | 72 | ✅ Complete |
| `domain_products` | Drug/product data | 34 | ✅ Complete |
| `domain_evidence_types` | Evidence hierarchy | 11 | ✅ Complete |
| `domain_regulatory_frameworks` | Regulatory bodies | 26 | ✅ Complete |
| `domain_hierarchies` | Generic hierarchies | - | ⏳ Pending |
| `domains` | Master domain list | - | ⏳ Pending |

### Therapeutic Areas (15)
Oncology, CNS/Neurology, Cardiovascular, Immunology, Respiratory, Infectious Diseases,
Metabolic Diseases, Hematology, Dermatology, Gastroenterology, Ophthalmology, Psychiatry,
Nephrology, Musculoskeletal, Rare Diseases

### Evidence Hierarchy (11 levels)
```
1a → Systematic Review of RCTs
1b → Individual RCT
2a → Systematic Review of Cohort Studies
2b → Cohort Study, RWE, PROs
3a/3b → Case-Control Studies
4 → Case Series
5 → Expert Opinion, Preclinical
```

### Regulatory Frameworks (26) - Global Coverage
- **US/FDA** (10): NDA, BLA, 505(b)(2), IND, Orphan, Priority, Accelerated, Breakthrough, ANDA
- **EU/EMA** (7): Centralized, Decentralized, PRIME, Orphan, Conditional, Clinical Trial
- **UK** (3): MHRA Marketing Auth, ILAP, NICE HTA
- **Japan/PMDA** (2): New Drug, SAKIGAKE
- **China/NMPA** (1): Drug Registration
- **Global/ICH** (2): CTD, GCP
- **Germany/G-BA** (1): AMNOG

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
| L0 Domain Tables | ✅ Complete (158 records) | 2025-12-03 |
| Intelligence Broker | ✅ Implemented | 2025-11-30 |
| Value Drivers | ✅ Complete (66 hierarchical) | 2025-12-03 |
| JTBD-Value Driver Mappings | ✅ Complete (2,520 mappings) | 2025-12-03 |
| Value Framework | ⏳ ROI/Impact models pending | 2025-12-03 |

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

## Value Drivers Framework

The Value Drivers system provides a hierarchical taxonomy for quantifying business impact:

### Hierarchy Structure
```
VD-ROOT-001 (Sustainable Business)
├── VD-REV-001 (Revenue Growth) ─ L1
│   ├── VD-REV-010 (Increase Volume) ─ L2
│   │   ├── VD-REV-011 (Increase Market Size) ─ L3
│   │   ├── VD-REV-012 (Increase Market Share) ─ L3
│   │   └── VD-REV-013 (Increase Length of Therapy) ─ L3
│   └── VD-REV-020 (Increase Product Value) ─ L2
│       ├── VD-REV-021 (Build Product Value Story) ─ L3
│       └── VD-REV-022 (Offer Additional Services) ─ L3
├── VD-CST-001 (Cost Savings) ─ L1
│   ├── VD-CST-010 (Medical Ops Efficiency) ─ L2
│   ├── VD-CST-020 (Commercial Ops Efficiency) ─ L2
│   ├── VD-CST-030 (Business Ops Efficiency) ─ L2
│   └── VD-CST-040 (IT Ops Efficiency) ─ L2
└── VD-RSK-001 (Risk Reduction) ─ L1
    ├── VD-RSK-010 (Regulatory Risks) ─ L2
    ├── VD-RSK-020 (Market Risks) ─ L2
    └── VD-RSK-030 (Operational Risks) ─ L2
```

### Value Categories
- **Revenue (VD-REV-*)**: Revenue growth, volume, product value
- **Cost (VD-CST-*)**: Operational efficiency, cost reduction
- **Risk (VD-RSK-*)**: Regulatory, market, operational risk mitigation

### JTBD Mapping Statistics
| Metric | Count |
|--------|-------|
| Total Value Drivers | 66 |
| JTBD-Value Driver Mappings | 2,520 |
| Direct Mappings (legacy) | 686 |
| Derived Mappings (hierarchical) | 1,834 |
| Bridge Mappings | 33 |

### SQL Files
- `sql/020_value_drivers_schema_v2.sql` - Schema with hierarchical columns
- `sql/021_value_drivers_seed_v2.sql` - 66 hierarchical drivers
- `sql/022_jtbd_value_driver_bridge.sql` - Legacy to hierarchical bridge

## Remaining Work

### Medium Priority
1. **Value Framework** - ROI calculator, impact model, benefit tracking
2. **Value Investigator** - AI companion for value discovery

### Low Priority
3. **Interactive Knowledge Graph** - Visual exploration UI
4. **Dashboards** - Analytics and metrics

### Completed
- ~~**Run CDC Full-Sync**~~ - ✅ DONE (2025-11-30) - Neo4j populated with 3,895 nodes
- ~~**Intelligence Broker**~~ - ✅ DONE (2025-11-30) - Unified query interface implemented
- ~~**Populate L0 Domain Tables**~~ - ✅ DONE (2025-12-03) - 158 records (TAs, diseases, products, evidence, regulatory)
- ~~**Value Drivers Hierarchy**~~ - ✅ DONE (2025-12-03) - 66 drivers with VD-* codes
- ~~**JTBD-Value Driver Mappings**~~ - ✅ DONE (2025-12-03) - 2,520 mappings via bridge migration

---

**Version**: 3.1.0
**Created**: 2025-11-28
**Updated**: 2025-12-03
**Maintained By**: Data Architecture Team

## Changelog

### v3.1.0 (2025-12-03)
- ✅ **Value Drivers Hierarchical Schema** - 66 drivers with VD-REV-*/VD-CST-*/VD-RSK-* codes
- ✅ **JTBD-Value Driver Bridge Migration** - 2,520 mappings (686 direct + 1,834 derived)
- ✅ **L0 Domain Tables Verified** - 158 records across 5 tables (TAs, diseases, products, evidence, regulatory)
- ✅ **New Views** - v_value_driver_hierarchy, v_jtbd_hierarchical_value_drivers, v_value_driver_impact_summary
- ✅ **SQL Files** - 020_value_drivers_schema_v2.sql, 021_value_drivers_seed_v2.sql, 022_jtbd_value_driver_bridge.sql

### v3.0.0 (2025-12-02)
- ✅ Consolidated all ontology materials to enterprise_ontology/
- ✅ Added Value Drivers layer (VD-REV-*, VD-CST-*, VD-RSK-*)
- ✅ Added dedicated codes for Value Drivers (like JTBD codes)
- ✅ Moved JTBDs folder from platform/jtbds
- ✅ Moved Personas folder from platform/personas
- ✅ Moved Architecture docs from docs/architecture
- ✅ Created migrations folder for all ontology migrations
