# SQL Directory Index

Quick navigation guide for all SQL files and documentation.

**Last Updated**: 2025-11-16
**Total Files**: 28 SQL files + 5 documentation files

---

## Documentation Files

| File | Purpose | Lines |
|------|---------|-------|
| [README.md](README.md) | Main documentation - comprehensive guide | 420+ |
| [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) | Quick reference for deployment | 200+ |
| [FILE_CATEGORIZATION_REPORT.md](FILE_CATEGORIZATION_REPORT.md) | Detailed file analysis | 600+ |
| [INDEX.md](INDEX.md) | This file - navigation guide | - |
| [seeds/00_MASTER_README.md](seeds/00_MASTER_README.md) | Seed templates guide | 420+ |

---

## Schema Files (10 files)

Execute in numerical order for new database setup.

| # | File | Purpose | Tables Created |
|---|------|---------|----------------|
| 01 | [01_complete_schema_part1.sql](schema/01_complete_schema_part1.sql) | Extensions, base config | Extensions, enums |
| 02 | [02_complete_schema_part2_foundation.sql](schema/02_complete_schema_part2_foundation.sql) | Foundation tables | tenants, industries |
| 03 | [03_complete_schema_part3_core.sql](schema/03_complete_schema_part3_core.sql) | Core AI tables | agents, capabilities, domains |
| 04 | [04_complete_schema_part4_content.sql](schema/04_complete_schema_part4_content.sql) | Content tables | personas, jtbds, priorities |
| 05 | [05_complete_schema_part5_services.sql](schema/05_complete_schema_part5_services.sql) | Service tables | workflows, tasks |
| 06 | [06_complete_schema_part6_execution.sql](schema/06_complete_schema_part6_execution.sql) | Execution tables | jobs, executions |
| 07 | [07_complete_schema_part7_governance.sql](schema/07_complete_schema_part7_governance.sql) | Governance tables | audit logs, permissions |
| 08 | [08_complete_schema_part8_final.sql](schema/08_complete_schema_part8_final.sql) | Final config | Final setup |
| 09 | [09_add_comprehensive_persona_jtbd_tables.sql](schema/09_add_comprehensive_persona_jtbd_tables.sql) | Persona/JTBD enhancements | Enhanced fields |
| 10 | [10_add_comprehensive_org_roles_columns.sql](schema/10_add_comprehensive_org_roles_columns.sql) | Org role enhancements | Enhanced fields |

**Total**: 10 files
**Execution Time**: ~15-20 minutes
**Use Case**: New database setup

---

## Seed Files (12 files)

Execute in phase order after schema is created.

### Phase 1: Foundation (2 files)
**Dependencies**: None (execute first)

| # | File | Purpose | Records |
|---|------|---------|---------|
| 1 | [01_foundation/01_tenants.sql](seeds/01_foundation/01_tenants.sql) | Tenant hierarchy | Varies |
| 2 | [01_foundation/02_industries.sql](seeds/01_foundation/02_industries.sql) | Industry classifications | 4+ |

### Phase 2: Organization (3 files)
**Dependencies**: Phase 1 (tenants)

| # | File | Purpose | Records |
|---|------|---------|---------|
| 3 | [02_organization/01_org_functions.sql](seeds/02_organization/01_org_functions.sql) | Functional areas | 4+ |
| 4 | [02_organization/02_org_departments.sql](seeds/02_organization/02_org_departments.sql) | Departments | 10+ |
| 5 | [02_organization/03_org_roles.sql](seeds/02_organization/03_org_roles.sql) | Organizational roles | 10+ |

### Phase 3: Content (3 files)
**Dependencies**: Phase 1 + Phase 2

| # | File | Purpose | Records |
|---|------|---------|---------|
| 6 | [03_content/01_personas.sql](seeds/03_content/01_personas.sql) | User personas | 8+ |
| 7 | [03_content/02_strategic_priorities.sql](seeds/03_content/02_strategic_priorities.sql) | Strategic priorities | Varies |
| 8 | [03_content/03_jobs_to_be_done.sql](seeds/03_content/03_jobs_to_be_done.sql) | Jobs to be done | 10+ |

### Phase 4: Operational (4 files)
**Dependencies**: Phase 1

| # | File | Purpose | Records |
|---|------|---------|---------|
| 9 | [04_operational/01_agents.sql](seeds/04_operational/01_agents.sql) | AI agents | 8+ |
| 10 | [04_operational/02_tools.sql](seeds/04_operational/02_tools.sql) | Tool registry | Varies |
| 11 | [04_operational/03_prompts.sql](seeds/04_operational/03_prompts.sql) | Prompt library | Varies |
| 12 | [04_operational/04_knowledge_domains.sql](seeds/04_operational/04_knowledge_domains.sql) | RAG domains | Varies |

**Total**: 12 files
**Execution Time**: ~10-15 minutes
**Use Case**: Initial data loading

---

## Functions (1 file)

Database functions for specialized operations.

| File | Purpose | When to Use |
|------|---------|-------------|
| [vector-search-function.sql](functions/vector-search-function.sql) | Vector similarity search for RAG | After schema, for RAG features |

**Total**: 1 file
**Execution Time**: ~1 minute

---

## Policies (1 file)

Row Level Security (RLS) policies.

| File | Purpose | When to Use |
|------|---------|-------------|
| [20240101000001_rls_policies.sql](policies/20240101000001_rls_policies.sql) | Comprehensive RLS policies | After schema, before production |

**Total**: 1 file
**Execution Time**: ~1 minute

---

## Utilities (4 files)

Setup scripts and utilities for specific features.

| File | Purpose | When to Use |
|------|---------|-------------|
| [20250919140000_llm_providers_schema.sql](utilities/20250919140000_llm_providers_schema.sql) | LLM provider schema | For AI features |
| [create-llm-providers-remote.sql](utilities/create-llm-providers-remote.sql) | Remote LLM setup | For remote AI services |
| [insert-providers-only.sql](utilities/insert-providers-only.sql) | Add LLM providers | After provider schema |
| [langchain-setup.sql](utilities/langchain-setup.sql) | LangChain integration | For RAG features |

**Total**: 4 files
**Execution Time**: ~5 minutes (optional)

---

## Execution Flow

```
Start
  ↓
Schema Files (01 → 10)
  ↓
Seed Phase 1: Foundation
  ↓
Seed Phase 2: Organization
  ↓
Seed Phase 3: Content
  ↓
Seed Phase 4: Operational
  ↓
Policies
  ↓
Functions
  ↓
Utilities (optional)
  ↓
Verify
  ↓
Complete
```

**Total Time**: ~30-45 minutes

---

## Quick Access by Purpose

### New Database Setup
1. Schema files: [schema/](schema/)
2. Foundation seeds: [seeds/01_foundation/](seeds/01_foundation/)
3. Organization seeds: [seeds/02_organization/](seeds/02_organization/)
4. Content seeds: [seeds/03_content/](seeds/03_content/)
5. Operational seeds: [seeds/04_operational/](seeds/04_operational/)
6. Policies: [policies/](policies/)
7. Functions: [functions/](functions/)

### Documentation
- Main guide: [README.md](README.md)
- Quick start: [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
- File analysis: [FILE_CATEGORIZATION_REPORT.md](FILE_CATEGORIZATION_REPORT.md)
- Seed guide: [seeds/00_MASTER_README.md](seeds/00_MASTER_README.md)

### Specific Features
- **Vector Search/RAG**: [functions/vector-search-function.sql](functions/vector-search-function.sql)
- **LLM Providers**: [utilities/](utilities/)
- **RLS/Security**: [policies/20240101000001_rls_policies.sql](policies/20240101000001_rls_policies.sql)

---

## File Count Summary

| Category | Files | Purpose |
|----------|-------|---------|
| Documentation | 5 | Guides and references |
| Schema | 10 | Database structure |
| Seeds | 12 | Initial data |
| Functions | 1 | DB functions |
| Policies | 1 | Security |
| Utilities | 4 | Setup scripts |
| **Total** | **33** | **All files** |

---

## Directory Tree

```
sql/
├── INDEX.md (this file)
├── README.md
├── QUICK_START_GUIDE.md
├── FILE_CATEGORIZATION_REPORT.md
│
├── schema/
│   ├── 01_complete_schema_part1.sql
│   ├── 02_complete_schema_part2_foundation.sql
│   ├── 03_complete_schema_part3_core.sql
│   ├── 04_complete_schema_part4_content.sql
│   ├── 05_complete_schema_part5_services.sql
│   ├── 06_complete_schema_part6_execution.sql
│   ├── 07_complete_schema_part7_governance.sql
│   ├── 08_complete_schema_part8_final.sql
│   ├── 09_add_comprehensive_persona_jtbd_tables.sql
│   └── 10_add_comprehensive_org_roles_columns.sql
│
├── seeds/
│   ├── 00_MASTER_README.md
│   ├── 01_foundation/
│   │   ├── 01_tenants.sql
│   │   └── 02_industries.sql
│   ├── 02_organization/
│   │   ├── 01_org_functions.sql
│   │   ├── 02_org_departments.sql
│   │   └── 03_org_roles.sql
│   ├── 03_content/
│   │   ├── 01_personas.sql
│   │   ├── 02_strategic_priorities.sql
│   │   └── 03_jobs_to_be_done.sql
│   └── 04_operational/
│       ├── 01_agents.sql
│       ├── 02_tools.sql
│       ├── 03_prompts.sql
│       └── 04_knowledge_domains.sql
│
├── functions/
│   └── vector-search-function.sql
│
├── policies/
│   └── 20240101000001_rls_policies.sql
│
├── utilities/
│   ├── 20250919140000_llm_providers_schema.sql
│   ├── create-llm-providers-remote.sql
│   ├── insert-providers-only.sql
│   └── langchain-setup.sql
│
└── archive/
    └── (empty - for future use)
```

---

## Navigation Tips

1. **First Time User**: Start with [README.md](README.md)
2. **Quick Deploy**: See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
3. **Understanding Files**: See [FILE_CATEGORIZATION_REPORT.md](FILE_CATEGORIZATION_REPORT.md)
4. **Seeding Data**: See [seeds/00_MASTER_README.md](seeds/00_MASTER_README.md)
5. **This Index**: Bookmark for quick file access

---

**Status**: Production Ready
**Last Updated**: 2025-11-16
**Version**: 1.0.0
