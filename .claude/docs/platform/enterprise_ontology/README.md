# Enterprise Ontology - Single Source of Truth

**Purpose**: Core ontology layer definitions (L0-L7) for the VITAL platform.

---

## Folder Structure

```
enterprise_ontology/
├── README.md                    # This file
├── 01-core-layers/              # L0-L7 ontology layer definitions
│   ├── 001_L0_domain_knowledge.sql
│   ├── 002_L1_organizational_structure.sql
│   ├── 005_L5_execution.sql
│   ├── 007_L7_value_transformation.sql
│   ├── 008_change_management_ld.sql
│   └── 010_knowledge_graph_views.sql
│
├── 03-migrations/               # SQL migrations
│   └── active/                  # Active migrations
│
├── 04-docs/                     # Documentation
│   ├── 01-gold-standard/        # Core ontology docs
│   │   ├── L3_schema_assessment.md
│   │   ├── NEO4J_SYNC_STRATEGY.md
│   │   ├── SCHEMA_DOCUMENTATION.md
│   │   └── ontology_gap_analysis.md
│   └── value-framework/         # Value layer SQL
│
└── 99-archive/                  # Archived duplicates
    └── data-schema/             # Legacy 250+ SQL files
```

---

## Layer Architecture

| Layer | Name | Description |
|-------|------|-------------|
| L0 | Domain Knowledge | Foundation knowledge layer |
| L1 | Organizational Structure | Org hierarchy definitions |
| L2 | Process & Workflow | (In jtbds/) |
| L3 | Task & Activity | (In jtbds/) |
| L4 | Agent Coordination | (In agents/) |
| L5 | Execution | Execution layer definitions |
| L6 | Analytics | (Distributed) |
| L7 | Value Transformation | Value impact tracking |

---

## Related Asset Folders

| Asset | Location | Relationship |
|-------|----------|--------------|
| Personas | `platform/personas/` | User archetypes |
| JTBDs | `platform/jtbds/` | L2-L3 layer content |
| Agents | `platform/agents/` | L4 layer content |
| Workflows | `platform/workflows/` | Process definitions |

---

## Archive Note

The `99-archive/` folder contains:
- **data-schema/**: Legacy 250+ SQL migration files (duplicates)
- **personas/**: Duplicate persona files (now in `platform/personas/`)
- **jtbds/**: Duplicate JTBD files (now in `platform/jtbds/`)

These are kept for historical reference but should not be modified.

---

*Last Updated: December 7, 2025*










