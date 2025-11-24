# JTBD System Documentation

**Last Updated**: 2025-11-21  
**Status**: ✅ Gold Standard - Production Ready  
**Version**: 2.0

---

## Overview

This directory contains all documentation, guides, and reference materials for the JTBD (Jobs to Be Done) data system following the **complete gold-standard normalization** (Phases 1-7).

**Key Achievement**: Single canonical `jtbd` table, zero arrays, zero JSONB, full normalization with ID+NAME pattern throughout.

---

## Quick Start

### For Developers

1. **Understand the Architecture**: Start with `COMPLETE_JTBD_ARCHITECTURE.md`
2. **Learn Query Patterns**: Review `QUERY_EXAMPLES.md`
3. **Understand Data Ownership**: Read `DATA_OWNERSHIP_GUIDE.md`
4. **Migration Details**: Check `../06-migrations/README.md`

### For Data Analysts

1. **Use the Views**: All views documented in `../04-views/jtbd_comprehensive_views.sql`
2. **Common Queries**: See `QUERY_EXAMPLES.md` for copy-paste ready queries
3. **Performance Tips**: Check Performance Optimization section in `QUERY_EXAMPLES.md`
4. **Verify Data**: Run queries in `../07-utilities/verification/`

### For Product/Business

1. **System Overview**: See `../GOLD_STANDARD_COMPLETE.md` Executive Summary
2. **Data Architecture**: Review Layer Definitions in `COMPLETE_JTBD_ARCHITECTURE.md`
3. **Migration Results**: Check `../06-migrations/README.md` for metrics
4. **Next Steps**: See "What's Ready Now" section below

---

## Documentation Files

### `COMPLETE_JTBD_ARCHITECTURE.md`
**Purpose**: Comprehensive system architecture documentation  
**Audience**: Developers, Data Engineers, Technical leads  
**Status**: ✅ Updated for v2.0  
**Contents**:
- 6-layer system architecture
- Single canonical `jtbd` table schema
- ID+NAME junction pattern (all mappings)
- Auto-sync trigger documentation
- Migration history (Phases 1-7)
- Data ownership boundaries
- Query optimization patterns

### `DATA_OWNERSHIP_GUIDE.md`
**Purpose**: Decision-making framework for data placement  
**Audience**: Developers, Product Managers, Data Architects  
**Status**: ✅ Updated for v2.0  
**Contents**:
- Quick decision matrix
- 6 detailed decision trees
- JTBD vs Role vs Persona vs Workflow boundaries
- Common scenarios and solutions
- Anti-patterns to avoid
- Table purpose summary

### `QUERY_EXAMPLES.md`
**Purpose**: Practical SQL query patterns  
**Audience**: Data Analysts, Developers, BI Teams  
**Status**: ✅ Updated for v2.0  
**Contents**:
- Basic queries (single table lookups)
- View usage (5 comprehensive views)
- Junction table queries (ID+NAME pattern)
- Aggregation queries
- Value & AI layer queries
- Multi-tenant patterns
- Performance optimization
- Full-text search setup

---

## System Architecture Summary

The JTBD system is organized into **6 distinct layers**:

### **1. JTBD Core** (Demand-Side)
- Single canonical `jtbd` table ✅ (was 2 tables)
- Universal job catalog
- Clean of all arrays and JSONB
- Includes `job_statement` and `when_situation` columns

### **2. Org Mappings** (Supply-Side)
- `jtbd_functions` (function_id + function_name)
- `jtbd_departments` (department_id + department_name)
- `jtbd_roles` (role_id + role_name)
- All follow ID+NAME pattern with auto-sync triggers ✅

### **3. Value Layer** (Impact-Side)
- `value_categories` - 6 reference categories
- `value_drivers` - 13 reference drivers
- `jtbd_value_categories` - Junction with relevance scores
- `jtbd_value_drivers` - Junction with impact strength

### **4. AI Layer** (Intelligence-Side)
- `ai_intervention_types` - 3 types (automation/augmentation/redesign)
- `jtbd_ai_suitability` - Readiness scores per capability
- `ai_opportunities` - Specific AI opportunities
- `ai_use_cases` - Implementation scenarios

### **5. Detail & Context**
- `jtbd_pain_points`, `jtbd_obstacles`, `jtbd_constraints`
- `jtbd_desired_outcomes`, `jtbd_outcomes` (ODI-style)
- `jtbd_kpis`, `jtbd_success_criteria`
- `jtbd_tags`, `jtbd_context`
- All normalized (no arrays) ✅

### **6. Personas** (Behavioral-Side)
- Personas inherit ALL JTBDs from roles
- Single `persona_jtbd` mapping ✅ (was 2 tables)
- Behavioral overlay (not job redefinition)
- Zero arrays ✅ (6 arrays migrated to junction tables)

---

## Key Tables

### Core
- **`jtbd`** - Single canonical table (formerly `jtbd` + `jtbd_core`)
  - Now includes: `job_statement`, `when_situation`
  - Clean of arrays and JSONB ✅

### Organizational Mappings (All with ID+NAME pattern)
- **`jtbd_functions`** - function_id, function_name (auto-synced)
- **`jtbd_departments`** - department_id, department_name (auto-synced)
- **`jtbd_roles`** - role_id, role_name (auto-synced)
- **`persona_jtbd`** - Single unified mapping ✅

### Value Layer
- `value_categories` - 6 categories
- `value_drivers` - 13 drivers  
- `jtbd_value_categories` - Relevance mappings
- `jtbd_value_drivers` - Impact mappings

### AI Layer
- `ai_intervention_types` - 3 types
- `jtbd_ai_suitability` - Scores per JTBD
- `ai_opportunities` - Identified opportunities
- `ai_use_cases` - Implementation scenarios

### Detail Tables (All Normalized)
- `jtbd_pain_points` - No arrays ✅
- `jtbd_desired_outcomes` - Normalized
- `jtbd_kpis` - From JSONB to table
- `jtbd_success_criteria` - From array to table
- `jtbd_tags` - From array to table
- `jtbd_context` - Preconditions/postconditions/triggers

---

## Views (Recommended for Queries)

### `v_jtbd_complete`
Complete JTBD with all aggregated mappings

**Use when**: You need full JTBD data with counts

```sql
SELECT * FROM v_jtbd_complete WHERE code = 'MA-001';
```

### `v_persona_jtbd_inherited`
Shows how personas inherit JTBDs from roles

**Use when**: You need persona-specific job lists

```sql
SELECT * FROM v_persona_jtbd_inherited 
WHERE persona_name = 'Senior Medical Director - Global';
```

### `v_jtbd_by_org`
Filter by organizational entity (function/department/role)

**Use when**: You need jobs for specific org units

```sql
SELECT * FROM v_jtbd_by_org 
WHERE entity_type = 'role' AND entity_name = 'Clinical Research Manager';
```

### `v_jtbd_value_ai_summary`
Value + AI quick summary with priority scoring

**Use when**: You need prioritization or AI readiness

```sql
SELECT * FROM v_jtbd_value_ai_summary 
ORDER BY priority_score DESC;
```

### `v_role_persona_jtbd_hierarchy`
Complete org hierarchy with JTBD counts

**Use when**: You need org-wide reporting

```sql
SELECT * FROM v_role_persona_jtbd_hierarchy 
WHERE tenant_name = 'Pharmaceuticals';
```

---

## Data Ownership Rules

| Data Type | Store In | Example |
|-----------|----------|---------|
| Job itself (demand) | `jtbd` | Name, complexity, desired outcome, job_statement |
| Org mapping (supply) | `jtbd_roles`, `jtbd_functions`, `jtbd_departments` | Which roles/functions perform this job |
| Role-specific context | `jtbd_roles` attributes | Importance, frequency, relevance_score |
| Business value (impact) | `jtbd_value_*` | Value categories, drivers, quantified impact |
| AI potential (intelligence) | `jtbd_ai_*`, `ai_*` | Suitability scores, opportunities, use cases |
| Job details (specifics) | `jtbd_pain_points`, `jtbd_kpis`, etc. | Pain points, KPIs, success criteria |
| Behavioral prefs (style) | `personas` | Work style, communication preferences |
| Execution (how-to) | `workflow_templates` | Steps, tasks, LangGraph components |

**Golden Rule**: Personas inherit ALL JTBDs from their role via `persona_jtbd`. Do NOT duplicate mappings.

---

## Migration Status

✅ **Phase 1**: Foundation Cleanup - COMPLETE  
✅ **Phase 2**: JSONB/Array Normalization - COMPLETE  
✅ **Phase 3**: Value & AI Layers - COMPLETE  
✅ **Phase 4**: Comprehensive Views - COMPLETE  
✅ **Phase 5**: JTBD Table Unification - COMPLETE ⭐ NEW  
✅ **Phase 6**: Capability Normalization - COMPLETE ⭐ NEW  
✅ **Phase 7**: Complete Array Cleanup - COMPLETE ⭐ NEW  

**Total Migration**: Gold Standard Achieved 🎉  
**Arrays in Core Tables**: 0 (was 10+)  
**JTBD Tables**: 1 (was 2)  
**Persona Mappings**: 1 (was 2)  
**Data Loss**: 0 rows  

---

## What's Ready Now

### ✅ **Production-Ready Systems**

1. **JTBD Management**
   - Single canonical `jtbd` table
   - Full normalization complete
   - Value & AI layers operational
   - Ready for enterprise use

2. **Persona System**
   - Clean behavioral overlay
   - Unified `persona_jtbd` mapping
   - Zero arrays (6 migrated)
   - Inherits JTBDs from roles

3. **Query & Analytics**
   - 5 comprehensive views ready
   - ID+NAME pattern for fast joins
   - Auto-sync triggers keep data current
   - Optimized for reporting

4. **Integration**
   - LangGraph-ready workflow system
   - Multi-tenant architecture
   - Backward compatible (legacy views)
   - API-friendly structure

---

## Next Steps

### Immediate Priorities

1. **Seed Fresh Data** (HIGH)
   - Use `workflow_templates` for workflows
   - Populate `jtbd_roles` mappings
   - Define value and AI assessments

2. **Build LangGraph Workflows** (MEDIUM)
   - Use `workflow_templates` → `workflow_tasks` → `task_steps`
   - Reference `lang_components` registry
   - Leverage `work_mode` classification

3. **Create Analytics** (MEDIUM)
   - Use comprehensive views
   - Build domain-specific aggregations
   - Implement AI opportunity dashboards

### Future Enhancements

- Add full-text search (see `QUERY_EXAMPLES.md`)
- Create domain-specific views
- Implement real-time workflow tracking
- Regular data quality validation

---

## Related Documentation

### In This Directory
- `COMPLETE_JTBD_ARCHITECTURE.md` - Full system architecture
- `DATA_OWNERSHIP_GUIDE.md` - Where to store what data
- `QUERY_EXAMPLES.md` - Practical SQL query patterns

### In Parent Directories
- `../GOLD_STANDARD_COMPLETE.md` - ⭐ **START HERE** - Complete summary
- `../GOLD_STANDARD_FINAL_GAPS.md` - Original detailed plan
- `../04-views/jtbd_comprehensive_views.sql` - View definitions
- `../06-migrations/README.md` - Migration guide & history
- `../workflows/WORKFLOW_ARCHITECTURE.md` - Workflow system docs

### Master Documentation
- `.vital-docs/INDEX.md` - Master index
- `.vital-docs/claude.md` - AI agent guidance
- `.vital-docs/agent.md` - Agent coordination

---

## Verification

### Quick Health Check

```sql
-- 1. Verify single JTBD table (should return 1 row)
SELECT COUNT(*) as jtbd_count,
       COUNT(job_statement) as with_job_statement,
       COUNT(when_situation) as with_when_situation
FROM jtbd;

-- 2. Check for arrays (should return 0)
SELECT COUNT(*)
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'jtbd'
  AND data_type = 'ARRAY';

-- 3. Verify junction tables have names
SELECT 
  COUNT(*) as total,
  COUNT(role_name) as with_cached_name,
  COUNT(*) - COUNT(role_name) as missing_names
FROM jtbd_roles;

-- 4. Check deprecated tables exist
SELECT table_type, table_name
FROM information_schema.tables
WHERE table_name IN ('jtbd_core', 'jtbd_core_deprecated', 
                     'jtbd_personas', 'jtbd_personas_deprecated')
ORDER BY table_name;
```

---

## Support

### For Questions
1. Check `../GOLD_STANDARD_COMPLETE.md` for overview
2. Review `QUERY_EXAMPLES.md` for practical patterns
3. Consult `DATA_OWNERSHIP_GUIDE.md` for decision framework
4. Check `../06-migrations/README.md` for migration details

### For Issues
1. Run verification queries above
2. Check `../07-utilities/verification/` for detailed checks
3. Review migration logs for any errors
4. Escalate to Data Engineering team if needed

---

**Status**: ✅ Gold Standard - Production Ready  
**Last Migration**: 2025-11-21 (Phase 7)  
**Document Version**: 2.0  
**Achievement**: 🏆 Zero arrays, Single source of truth, Full normalization


---

## Documentation Files

### `COMPLETE_JTBD_ARCHITECTURE.md`
**Purpose**: Comprehensive system architecture documentation  
**Audience**: Developers, Data Engineers, Technical leads  
**Contents**:
- System layer definitions
- Schema reference for all tables
- Junction pattern (ID + NAME) explanation
- Migration history
- Data ownership boundaries
- Query patterns

### `DATA_OWNERSHIP_GUIDE.md`
**Purpose**: Decision-making framework for data placement  
**Audience**: Developers, Product Managers, Data Architects  
**Contents**:
- Quick decision matrix
- 6 detailed decision trees
- Common scenarios and solutions
- Anti-patterns to avoid
- Table purpose summary

### `QUERY_EXAMPLES.md`
**Purpose**: Practical SQL query patterns  
**Audience**: Data Analysts, Developers, BI Teams  
**Contents**:
- Basic queries
- View usage (recommended)
- Junction table queries
- Aggregation queries
- Value & AI queries
- Multi-tenant patterns
- Performance optimization
- Full-text search setup

### `MIGRATION_COMPLETE_SUMMARY.md` (in `../06-migrations/`)
**Purpose**: Complete migration metrics and results  
**Audience**: All stakeholders  
**Contents**:
- Executive summary
- Before/after metrics
- Phase-by-phase breakdown
- Data integrity verification
- Performance impact
- Success criteria status
- Next steps & recommendations

---

## System Architecture Summary

The JTBD system is organized into **6 distinct layers**:

1. **JTBD Core** - Universal job catalog (241 jobs)
2. **Org Mappings** - Function/Department/Role associations (junction tables)
3. **Value Layer** - Business impact (6 categories, 13 drivers)
4. **AI Layer** - Automation potential (3 intervention types)
5. **Detail & Context** - Pain points, KPIs, success criteria (607 total rows)
6. **Personas** - Behavioral archetypes (inherit JTBDs from roles)

---

## Key Tables

### Core
- `jtbd` - Main job catalog (241 rows)

### Organizational Mappings
- `jtbd_functions` - JTBD → Function
- `jtbd_departments` - JTBD → Department
- `jtbd_roles` - JTBD → Role (primary mapping for personas)

### Value Layer
- `value_categories` - 6 reference categories
- `value_drivers` - 13 reference drivers
- `jtbd_value_categories` - Mappings
- `jtbd_value_drivers` - Mappings

### AI Layer
- `ai_intervention_types` - 3 reference types
- `jtbd_ai_suitability` - Readiness scores
- `ai_opportunities` - Specific opportunities
- `ai_use_cases` - Implementation scenarios

### Detail Tables
- `jtbd_pain_points` (7 rows)
- `jtbd_desired_outcomes` (91 rows)
- `jtbd_kpis` (5 rows)
- `jtbd_success_criteria` (504 rows)
- `jtbd_tags` (0 rows)
- `jtbd_context` - Preconditions/postconditions/triggers

---

## Views (Recommended for Queries)

### `v_jtbd_complete`
Complete JTBD with all aggregated mappings (241 rows)

**Use when**: You need full JTBD data with counts

```sql
SELECT * FROM v_jtbd_complete WHERE code = 'MA-001';
```

### `v_persona_jtbd_inherited`
Shows how personas inherit JTBDs from roles (0 rows - awaiting mappings)

**Use when**: You need persona-specific job lists

```sql
SELECT * FROM v_persona_jtbd_inherited 
WHERE persona_name = 'Senior Medical Director - Global';
```

### `v_jtbd_by_org`
Filter by organizational entity (0 rows - awaiting mappings)

**Use when**: You need jobs for a specific function/department/role

```sql
SELECT * FROM v_jtbd_by_org 
WHERE entity_type = 'role' AND entity_name = 'Clinical Research Manager';
```

### `v_jtbd_value_ai_summary`
Value + AI quick summary with priority scoring (241 rows)

**Use when**: You need prioritization or AI readiness data

```sql
SELECT * FROM v_jtbd_value_ai_summary 
ORDER BY priority_score DESC;
```

### `v_role_persona_jtbd_hierarchy`
Complete org hierarchy (675 rows)

**Use when**: You need org-wide reporting

```sql
SELECT * FROM v_role_persona_jtbd_hierarchy 
WHERE tenant_name = 'Pharmaceuticals';
```

---

## Data Ownership Rules

| Data Type | Store In | Example |
|-----------|----------|---------|
| Job itself | `jtbd` | Name, complexity, desired outcome |
| Org mapping | `jtbd_roles`, etc. | Which roles perform this job |
| Role-specific context | `jtbd_roles` attributes | Importance, frequency for this role |
| Business value | `jtbd_value_*` | Value categories, drivers |
| AI potential | `jtbd_ai_*`, `ai_*` | Suitability scores, opportunities |
| Job details | `jtbd_pain_points`, etc. | Pain points, KPIs, success criteria |
| Behavioral prefs | `personas` | Work style, communication preferences |

**Golden Rule**: Personas inherit ALL JTBDs from their role. Do NOT duplicate mappings.

---

## Migration Status

✅ **Phase 1**: Foundation Cleanup - COMPLETE  
✅ **Phase 2**: JSONB/Array Normalization - COMPLETE  
✅ **Phase 3**: Value & AI Layers - COMPLETE  
✅ **Phase 4**: Comprehensive Views - COMPLETE  

**Total Migration Time**: Single session  
**Data Migrated**: 607 rows across all entities  
**Data Loss**: 0 rows  

---

## Next Steps

### Immediate Priorities

1. **Populate JTBD → Role Mappings** (HIGH)
   - Use `jtbd_roles` table
   - Define importance and frequency
   - Mark primary responsibilities

2. **Assess Business Value** (MEDIUM)
   - Map to value categories via `jtbd_value_categories`
   - Identify value drivers via `jtbd_value_drivers`

3. **Score AI Readiness** (MEDIUM)
   - Assess via `jtbd_ai_suitability`
   - Define opportunities in `ai_opportunities`

### Future Enhancements

- Add full-text search (see `QUERY_EXAMPLES.md`)
- Create domain-specific views
- Implement workflow execution tracking
- Regular data quality validation

---

## Related Documentation

### In This Directory
- `COMPLETE_JTBD_ARCHITECTURE.md` - Full system docs
- `DATA_OWNERSHIP_GUIDE.md` - Where to store what
- `QUERY_EXAMPLES.md` - Practical query patterns

### In Parent Directories
- `../04-views/jtbd_comprehensive_views.sql` - View definitions
- `../06-migrations/MIGRATION_COMPLETE_SUMMARY.md` - Migration results
- `../GOLD_STANDARD_SCHEMA.md` - Overall schema standards
- `../DATABASE_SCHEMA_AND_DATA_GOLDEN_RULES.md` - Golden rules

### Master Documentation
- `.vital-docs/INDEX.md` - Master index
- `.vital-docs/claude.md` - AI agent guidance
- `.vital-docs/agent.md` - Agent coordination

---

## Support

### For Questions
1. Check relevant documentation file above
2. Review `QUERY_EXAMPLES.md` for practical patterns
3. Consult `DATA_OWNERSHIP_GUIDE.md` for decision framework
4. Contact Data Engineering team

### For Issues
1. Check verification queries in migration files
2. Review `MIGRATION_COMPLETE_SUMMARY.md` for rollback strategy
3. Escalate to technical lead if needed

---

**Status**: ✅ Production Ready  
**Last Migration**: 2024-11-21  
**Document Version**: 1.0

