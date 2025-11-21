# JTBD System Documentation

**Last Updated**: 2024-11-21  
**Status**: Production Ready

---

## Overview

This directory contains all documentation, guides, and reference materials for the JTBD (Jobs to Be Done) data system following the complete 4-phase normalization.

---

## Quick Start

### For Developers

1. **Understand the Architecture**: Start with `COMPLETE_JTBD_ARCHITECTURE.md`
2. **Learn Query Patterns**: Review `QUERY_EXAMPLES.md`
3. **Understand Data Ownership**: Read `DATA_OWNERSHIP_GUIDE.md`

### For Data Analysts

1. **Use the Views**: All views are documented in `../04-views/jtbd_comprehensive_views.sql`
2. **Common Queries**: See `QUERY_EXAMPLES.md` for copy-paste ready queries
3. **Performance Tips**: Check the Performance Optimization section in `QUERY_EXAMPLES.md`

### For Product/Business

1. **System Overview**: See Executive Summary in `MIGRATION_COMPLETE_SUMMARY.md`
2. **Data Architecture**: Review the Layer Definitions in `COMPLETE_JTBD_ARCHITECTURE.md`
3. **Next Steps**: Check Recommendations in `MIGRATION_COMPLETE_SUMMARY.md`

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

